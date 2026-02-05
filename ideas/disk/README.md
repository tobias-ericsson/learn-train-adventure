# Disk

A small CLI (written in Go) that streamlines that informs about disk space.
Uses common linux tools like du ad df under the hood.

**What it does**
`disk`:
* informs in human readable form the sized of all the harddrives and how much available disk space is left.
* gives the top 6 bigest folders
* gives the top 6 bigest files

**Usage**
`disk <path>`
* same as disk but relative to path, only care about the harddrive the path belongs to.

