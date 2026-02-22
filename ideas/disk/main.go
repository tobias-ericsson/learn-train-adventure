package main

import (
	"bufio"
	"bytes"
	"container/heap"
	"errors"
	"flag"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"syscall"
)

const defaultTop = 6

type options struct {
	path    string
	depth   int
	top     int
	ignores multiFlag
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

	fs.IntVar(&opts.depth, "depth", 1, "folder depth for top folders")
	fs.IntVar(&opts.top, "top", defaultTop, "number of results to show")
	fs.Var(&opts.ignores, "ignore", "ignore pattern (glob), repeatable")

	fs.Usage = func() {
		fmt.Fprintln(os.Stderr, "Usage: disk [path] [flags]")
		fmt.Fprintln(os.Stderr)
		fmt.Fprintln(os.Stderr, "Examples:")
		fmt.Fprintln(os.Stderr, "  disk")
		fmt.Fprintln(os.Stderr, "  disk ~/projects")
		fmt.Fprintln(os.Stderr, "  disk . --depth 3")
		fmt.Fprintln(os.Stderr, "  disk . --top 25 --ignore .git --ignore node_modules")
		fmt.Fprintln(os.Stderr)
		fs.PrintDefaults()
	}

	if err := fs.Parse(args); err != nil {
		return opts, err
	}

	if opts.top <= 0 {
		return opts, errors.New("--top must be > 0")
	}

	remaining := fs.Args()
	if len(remaining) > 1 {
		return opts, errors.New("too many arguments")
	}
	if len(remaining) == 1 {
		opts.path = remaining[0]
	}

	if opts.path == "" {
		opts.path = "."
	}

	return opts, nil
}

func run(opts options) error {
	absPath, err := filepath.Abs(opts.path)
	if err != nil {
		return fmt.Errorf("resolve path: %w", err)
	}
	if _, err := os.Stat(absPath); err != nil {
		return fmt.Errorf("path not found: %s", absPath)
	}

	fmt.Printf("Disk Space (filesystem for %s)\n", absPath)
	if err := printDf(absPath); err != nil {
		return err
	}
	fmt.Println()

	fmt.Printf("Top %d Folders (under %s)\n", opts.top, absPath)
	if err := printTopFolders(absPath, opts.depth, opts.top, opts.ignores); err != nil {
		return err
	}
	fmt.Println()

	fmt.Printf("Top %d Files (under %s)\n", opts.top, absPath)
	if err := printTopFiles(absPath, opts.top, opts.ignores); err != nil {
		return err
	}

	return nil
}

func printDf(path string) error {
	cmd := exec.Command("df", "-h", path)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	return cmd.Run()
}

func printTopFolders(root string, depth, top int, ignores []string) error {
	entries, err := duDepth(root, depth)
	if err != nil {
		return err
	}
	entries = filterIgnored(entries, ignores)
	entries = topN(entries, top)

	if len(entries) == 0 {
		fmt.Println("(no folders found)")
		return nil
	}

	for i, e := range entries {
		fmt.Printf("%2d. %8s  %s\n", i+1, humanSize(e.size), e.path)
	}
	return nil
}

func printTopFiles(root string, top int, ignores []string) error {
	entries, err := findFiles(root, ignores)
	if err != nil {
		return err
	}
	entries = topN(entries, top)

	if len(entries) == 0 {
		fmt.Println("(no files found)")
		return nil
	}

	for i, e := range entries {
		fmt.Printf("%2d. %8s  %s\n", i+1, humanSize(e.size), e.path)
	}
	return nil
}

func duDepth(root string, depth int) ([]sizedPath, error) {
	cmd := exec.Command("du", "-x", "-d", strconv.Itoa(depth), "-k", root)
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
		p := strings.TrimSpace(fields[1])
		if p == root {
			continue
		}
		entries = append(entries, sizedPath{size: sizeKB * 1024, path: p})
	}
	return entries, scanner.Err()
}

func findFiles(root string, ignores []string) ([]sizedPath, error) {
	rootInfo, err := os.Stat(root)
	if err != nil {
		return nil, err
	}
	rootDev, ok := deviceID(rootInfo)

	var entries []sizedPath
	err = filepath.WalkDir(root, func(path string, d os.DirEntry, err error) error {
		if err != nil {
			return nil
		}
		if shouldIgnore(path, ignores) {
			if d.IsDir() {
				return filepath.SkipDir
			}
			return nil
		}
		if d.IsDir() {
			if ok {
				info, err := d.Info()
				if err == nil {
					if dev, ok2 := deviceID(info); ok2 && dev != rootDev {
						return filepath.SkipDir
					}
				}
			}
			return nil
		}
		info, err := d.Info()
		if err != nil {
			return nil
		}
		entries = append(entries, sizedPath{size: info.Size(), path: path})
		return nil
	})
	return entries, err
}

func topN(entries []sizedPath, n int) []sizedPath {
	if n >= len(entries) {
		sort.Slice(entries, func(i, j int) bool {
			if entries[i].size == entries[j].size {
				return entries[i].path < entries[j].path
			}
			return entries[i].size > entries[j].size
		})
		return entries
	}

	h := &sizeHeap{}
	heap.Init(h)

	for _, e := range entries {
		if h.Len() < n {
			heap.Push(h, e)
		} else if e.size > (*h)[0].size {
			heap.Pop(h)
			heap.Push(h, e)
		}
	}

	result := make([]sizedPath, h.Len())
	for i := range result {
		result[i] = heap.Pop(h).(sizedPath)
	}

	sort.Slice(result, func(i, j int) bool {
		if result[i].size == result[j].size {
			return result[i].path < result[j].path
		}
		return result[i].size > result[j].size
	})
	return result
}

type sizeHeap []sizedPath

func (h sizeHeap) Len() int            { return len(h) }
func (h sizeHeap) Less(i, j int) bool  { return h[i].size < h[j].size }
func (h sizeHeap) Swap(i, j int)       { h[i], h[j] = h[j], h[i] }
func (h *sizeHeap) Push(x interface{}) { *h = append(*h, x.(sizedPath)) }
func (h *sizeHeap) Pop() interface{} {
	old := *h
	n := len(old)
	x := old[n-1]
	*h = old[:n-1]
	return x
}

type multiFlag []string

func (m *multiFlag) String() string { return strings.Join(*m, ",") }
func (m *multiFlag) Set(v string) error {
	*m = append(*m, v)
	return nil
}

func shouldIgnore(path string, patterns []string) bool {
	base := filepath.Base(path)
	for _, p := range patterns {
		if ok, _ := filepath.Match(p, base); ok {
			return true
		}
	}
	return false
}

func filterIgnored(entries []sizedPath, patterns []string) []sizedPath {
	if len(patterns) == 0 {
		return entries
	}
	var out []sizedPath
	for _, e := range entries {
		if !shouldIgnore(e.path, patterns) {
			out = append(out, e)
		}
	}
	return out
}

func deviceID(info os.FileInfo) (uint64, bool) {
	stat, ok := info.Sys().(*syscall.Stat_t)
	if !ok {
		return 0, false
	}
	return uint64(stat.Dev), true
}

func humanSize(b int64) string {
	units := []string{"B", "K", "M", "G", "T", "P"}
	if b < 1024 {
		return fmt.Sprintf("%dB", b)
	}
	val := float64(b)
	i := 0
	for val >= 1024 && i < len(units)-1 {
		val /= 1024
		i++
	}
	if val >= 10 {
		return fmt.Sprintf("%.0f%s", val, units[i])
	}
	return fmt.Sprintf("%.1f%s", val, units[i])
}
