# disk

`disk` is a small CLI tool to inspect disk usage for a directory.

It shows:

- Filesystem usage (`df -h <path>`)
- Top N largest folders (using `du`)
- Top N largest files (streamed, O(n log k))

## Install

From the `disk` directory:

```
go build -o disk
```

Or install globally:

```
go install
```

## Usage

```
disk [path] [flags]
```

If no path is provided, it defaults to the current directory (`.`).

## Flags

- `--depth N`   Folder depth for `du` (default: 1)
- `--top N`     Number of results to show (default: 6)
- `--ignore P`  Ignore glob pattern (repeatable)

## Examples

Basic:

```
disk
```

Specific directory:

```
disk ~/projects
```

Deep folder analysis:

```
disk . --depth 3
```

Large repo with ignores:

```
disk . --top 25 --ignore .git --ignore node_modules
```

Combined example:

```
disk ~/projects --depth 2 --top 20 --ignore .git --ignore dist
```

## Performance

- Folder sizes use native `du` for speed.
- File sizes are streamed with a min-heap (O(n log k)).
- Memory usage scales with `--top`, not total file count.
