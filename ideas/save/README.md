# Save

A small CLI (written in Go) that streamlines the common `git add → commit → push` flow.

**Goal**
Reduce friction for frequent commits while staying explicit and safe.

**Default behavior**
`save` should:
* stage all changes (`git add -A`)
* generate a suggested commit message from the list of changed files (no diff content, plain list of file changes)
* create the commit
* push to the current branch

**Usage**
`save <path>`
* stage only the given file or path

`save -m "commit message"`
* use the provided message instead of a suggested one

`save -m "commit message" <path>`
* combine `-m` with a specific path

`save --amend`
* amend the last commit
* push with `--force-with-lease` by default
