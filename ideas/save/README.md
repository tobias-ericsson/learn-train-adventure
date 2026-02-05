# Save

A small CLI (written in Go) that streamlines the common `git add → commit → push` flow.

**What it does**
`save`:
* stages all changes (`git add -A`)
* generates a suggested commit message from the list of changed files (no diff content, plain list of file changes)
* creates the commit
* pushes to the current branch

**Usage**
`save <path>`
* stages only the given file or path

`save -m "commit message"`
* uses the provided message instead of a suggested one

`save -m "commit message" <path>`
* combines `-m` with a specific path

`save --amend`
* amends the last commit
* pushes with `--force-with-lease` by default
