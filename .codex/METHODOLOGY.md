# `.codex` Methodology

This repository uses a pragmatic local workflow layer built from:

- a small user-facing mode surface: `Quick` and `BMM`
- durable change tracking in `openspec/changes/*`
- milestone-based decomposition
- explicit validation and closeout
- lightweight historical memory through `.codex/wal/*`

## Design Intent

The goal is not to add ceremony. The goal is to reduce ambiguity and stop large tasks from turning into uncontrolled coding sessions.

## Core Model

- `Quick`: bounded implementation with one coherent milestone
- `BMM`: discovery + design + implementation for larger or unclear work
- `core/*`: the rules for sizing, packaging, validation, review, and closeout
- `gates/*`: reusable gate definitions
- `wal/*`: durable context for important completed changes

## Repository Alignment

This methodology is local to `easygo-astro-monorepo-starter`.

It must match the actual repository:

- Astro frontend
- Hono API
- pnpm workspace
- OpenSpec change records

If upstream reference material disagrees with current repo reality, repo reality wins.
