package main

import (
	"errors"
	"flag"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
)

type options struct {
	message string
	amend   bool
	paths   []string
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
	fs := flag.NewFlagSet("save", flag.ContinueOnError)
	fs.SetOutput(os.Stderr)
	fs.StringVar(&opts.message, "m", "", "commit message")
	fs.BoolVar(&opts.amend, "amend", false, "amend the last commit")
	fs.Usage = func() {
		fmt.Fprintln(os.Stderr, "Usage: save [-m \"message\"] [--amend] [path ...]")
		fmt.Fprintln(os.Stderr, "")
		fmt.Fprintln(os.Stderr, "Examples:")
		fmt.Fprintln(os.Stderr, "  save")
		fmt.Fprintln(os.Stderr, "  save path/to/file")
		fmt.Fprintln(os.Stderr, "  save -m \"commit message\"")
		fmt.Fprintln(os.Stderr, "  save -m \"commit message\" path/to/file")
		fmt.Fprintln(os.Stderr, "  save --amend")
	}

	if err := fs.Parse(args); err != nil {
		return opts, err
	}

	opts.paths = fs.Args()
	return opts, nil
}

func run(opts options) error {
	if err := ensureGitRepo(); err != nil {
		return err
	}

	if err := gitAdd(opts.paths); err != nil {
		return err
	}

	commitArgs, err := buildCommitArgs(opts)
	if err != nil {
		return err
	}

	if len(commitArgs) > 0 {
		if err := runGit(commitArgs...); err != nil {
			return err
		}
	}

	if opts.amend {
		return runGit("push", "--force-with-lease")
	}

	return runGit("push")
}

func ensureGitRepo() error {
	cmd := exec.Command("git", "rev-parse", "--show-toplevel")
	if err := cmd.Run(); err != nil {
		return errors.New("not inside a git repository")
	}
	return nil
}

func gitAdd(paths []string) error {
	if len(paths) == 0 {
		return runGit("add", "-A")
	}

	args := append([]string{"add", "--"}, paths...)
	return runGit(args...)
}

func buildCommitArgs(opts options) ([]string, error) {
	if opts.amend {
		if opts.message != "" {
			return []string{"commit", "--amend", "-m", opts.message}, nil
		}
		return []string{"commit", "--amend", "--no-edit"}, nil
	}

	msg := opts.message
	if msg == "" {
		var err error
		msg, err = suggestedMessage()
		if err != nil {
			return nil, err
		}
	}

	if msg == "" {
		return nil, errors.New("no changes to commit")
	}

	return []string{"commit", "-m", msg}, nil
}

func suggestedMessage() (string, error) {
	files, err := stagedFiles()
	if err != nil {
		return "", err
	}
	if len(files) == 0 {
		return "", nil
	}

	base := "Update "
	if len(files) == 1 {
		return base + files[0], nil
	}

	max := 3
	shown := files
	if len(files) > max {
		shown = files[:max]
	}

	msg := base + strings.Join(shown, ", ")
	if len(files) > max {
		msg = fmt.Sprintf("%s (+%d more)", msg, len(files)-max)
	}

	return msg, nil
}

func stagedFiles() ([]string, error) {
	out, err := exec.Command("git", "diff", "--name-only", "--cached").Output()
	if err != nil {
		return nil, fmt.Errorf("git diff --name-only --cached failed: %w", err)
	}

	lines := strings.Fields(string(out))
	for i, name := range lines {
		lines[i] = filepath.ToSlash(name)
	}
	return lines, nil
}

func runGit(args ...string) error {
	cmd := exec.Command("git", args...)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	cmd.Stdin = os.Stdin
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("git %s failed: %w", strings.Join(args, " "), err)
	}
	return nil
}
