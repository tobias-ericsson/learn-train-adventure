package main

import (
	"bufio"
	"bytes"
	"errors"
	"flag"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
)

const (
	topCount = 6
)

type options struct {
	path string
}

type sizedPath struct {
	size int64
	path string
}

func main() {
	opts, err := parseArgs(os.Args[1:])
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(2)
	}

	if err := run(opts); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}

func parseArgs(args []string) (options, error) {
	var opts options
	fs := flag.NewFlagSet("disk", flag.ContinueOnError)
	fs.SetOutput(os.Stderr)
	fs.Usage = func() {
		fmt.Fprintln(os.Stderr, "Usage: disk [path]")
		fmt.Fprintln(os.Stderr, "")
		fmt.Fprintln(os.Stderr, "Examples:")
		fmt.Fprintln(os.Stderr, "  disk")
		fmt.Fprintln(os.Stderr, "  disk /var")
	}

	if err := fs.Parse(args); err != nil {
		return opts, err
	}

	remaining := fs.Args()
	if len(remaining) > 1 {
		return opts, errors.New("too many arguments")
	}
	if len(remaining) == 1 {
		opts.path = remaining[0]
	}
	return opts, nil
}

func run(opts options) error {
	path := opts.path
	if path == "" {
		path = "/"
	}

	absPath, err := filepath.Abs(path)
	if err != nil {
		return fmt.Errorf("resolve path: %w", err)
	}

	if _, err := os.Stat(absPath); err != nil {
		return fmt.Errorf("path not found: %s", absPath)
	}

	if opts.path == "" {
		fmt.Println("Disk Space (all filesystems)")
		if err := printDfAll(); err != nil {
			return err
		}
		fmt.Println("")
	} else {
		fmt.Printf("Disk Space (filesystem for %s)\n", absPath)
		if err := printDfPath(absPath); err != nil {
			return err
		}
		fmt.Println("")
	}

	fmt.Printf("Top %d Folders (under %s)\n", topCount, absPath)
	if err := printTopFolders(absPath, topCount); err != nil {
		return err
	}
	fmt.Println("")

	fmt.Printf("Top %d Files (under %s)\n", topCount, absPath)
	if err := printTopFiles(absPath, topCount); err != nil {
		return err
	}

	return nil
}

func printDfAll() error {
	cmd := exec.Command("df", "-h")
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	return cmd.Run()
}

func printDfPath(path string) error {
	cmd := exec.Command("df", "-h", path)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	return cmd.Run()
}

func printTopFolders(root string, count int) error {
	entries, err := duDepth(root)
	if err != nil {
		return err
	}

	if len(entries) == 0 {
		fmt.Println("(no folders found)")
		return nil
	}

	sort.Slice(entries, func(i, j int) bool {
		if entries[i].size == entries[j].size {
			return entries[i].path < entries[j].path
		}
		return entries[i].size > entries[j].size
	})

	limit := min(count, len(entries))
	for i := 0; i < limit; i++ {
		fmt.Printf("%2d. %8s  %s\n", i+1, humanSize(entries[i].size), entries[i].path)
	}
	return nil
}

func printTopFiles(root string, count int) error {
	entries, err := findFiles(root)
	if err != nil {
		return err
	}

	if len(entries) == 0 {
		fmt.Println("(no files found)")
		return nil
	}

	sort.Slice(entries, func(i, j int) bool {
		if entries[i].size == entries[j].size {
			return entries[i].path < entries[j].path
		}
		return entries[i].size > entries[j].size
	})

	limit := min(count, len(entries))
	for i := 0; i < limit; i++ {
		fmt.Printf("%2d. %8s  %s\n", i+1, humanSize(entries[i].size), entries[i].path)
	}
	return nil
}

func duDepth(root string) ([]sizedPath, error) {
	cmd := exec.Command("du", "-x", "-d", "1", "-k", root)
	var out bytes.Buffer
	cmd.Stdout = &out
	cmd.Stderr = os.Stderr
	if err := cmd.Run(); err != nil {
		return nil, fmt.Errorf("du failed: %w", err)
	}

	scanner := bufio.NewScanner(&out)
	var entries []sizedPath
	for scanner.Scan() {
		line := scanner.Text()
		fields := strings.SplitN(line, "\t", 2)
		if len(fields) != 2 {
			continue
		}
		sizeKB, err := strconv.ParseInt(strings.TrimSpace(fields[0]), 10, 64)
		if err != nil {
			continue
		}
		path := strings.TrimSpace(fields[1])
		if path == root {
			continue
		}
		entries = append(entries, sizedPath{size: sizeKB * 1024, path: path})
	}
	if err := scanner.Err(); err != nil {
		return nil, fmt.Errorf("du output read failed: %w", err)
	}
	return entries, nil
}

func findFiles(root string) ([]sizedPath, error) {
	cmd := exec.Command("find", root, "-xdev", "-type", "f", "-printf", "%s\t%p\000")
	var out bytes.Buffer
	cmd.Stdout = &out
	cmd.Stderr = os.Stderr
	if err := cmd.Run(); err != nil {
		return nil, fmt.Errorf("find failed: %w", err)
	}

	parts := bytes.Split(out.Bytes(), []byte{0})
	entries := make([]sizedPath, 0, len(parts))
	for _, part := range parts {
		if len(part) == 0 {
			continue
		}
		fields := bytes.SplitN(part, []byte{'\t'}, 2)
		if len(fields) != 2 {
			continue
		}
		sizeBytes, err := strconv.ParseInt(string(bytes.TrimSpace(fields[0])), 10, 64)
		if err != nil {
			continue
		}
		path := string(bytes.TrimSpace(fields[1]))
		entries = append(entries, sizedPath{size: sizeBytes, path: path})
	}
	return entries, nil
}

func humanSize(bytes int64) string {
	units := []string{"B", "K", "M", "G", "T", "P"}
	if bytes < 1024 {
		return fmt.Sprintf("%dB", bytes)
	}
	value := float64(bytes)
	idx := 0
	for value >= 1024 && idx < len(units)-1 {
		value /= 1024
		idx++
	}
	if value >= 10 {
		return fmt.Sprintf("%.0f%s", value, units[idx])
	}
	return fmt.Sprintf("%.1f%s", value, units[idx])
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
