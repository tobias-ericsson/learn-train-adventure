package main

import (
	"os"
	"path/filepath"
	"testing"
)

func TestFindFilesCollectsSizes(t *testing.T) {
	root := t.TempDir()

	dir := filepath.Join(root, "sub")
	if err := os.MkdirAll(dir, 0o755); err != nil {
		t.Fatalf("mkdir: %v", err)
	}

	fileA := filepath.Join(root, "a.txt")
	fileB := filepath.Join(dir, "b.bin")

	if err := os.WriteFile(fileA, []byte("hello"), 0o644); err != nil {
		t.Fatalf("write a: %v", err)
	}
	if err := os.WriteFile(fileB, []byte("abcdef"), 0o644); err != nil {
		t.Fatalf("write b: %v", err)
	}

	entries, err := findFiles(root)
	if err != nil {
		t.Fatalf("findFiles: %v", err)
	}

	got := map[string]int64{}
	for _, entry := range entries {
		got[entry.path] = entry.size
	}

	if size, ok := got[fileA]; !ok || size != int64(len("hello")) {
		t.Fatalf("missing or wrong size for %s: %v", fileA, size)
	}
	if size, ok := got[fileB]; !ok || size != int64(len("abcdef")) {
		t.Fatalf("missing or wrong size for %s: %v", fileB, size)
	}
}

