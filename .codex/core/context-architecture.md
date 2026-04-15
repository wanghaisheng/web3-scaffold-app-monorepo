# Context Architecture

This repository keeps context management intentionally simple.

## Active Context Layers

- live code and docs in the repo
- active workflow docs under `.codex/workflows/*`
- active execution rules under `.codex/core/*`
- durable change state under `openspec/changes/*`
- optional historical memory under `.codex/wal/*`

## Rule

Do not assume a larger automated context platform exists unless the repository actually ships it.

When context is missing:

- inspect the relevant code path
- inspect the active `openspec` record
- update or create a system map when the same area will be revisited
