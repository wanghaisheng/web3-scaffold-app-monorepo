# Starter discussion notes

This file captures the stable conclusions from earlier discussion threads. It replaces the noisy root-level `discussion.md` dump.

## Current repo shape

- `apps/site-astro` is the Astro frontend entrypoint.
- `apps/api-hono` is the Hono API entrypoint.
- `packages/*` contains shared runtime, UI, config, i18n, and extension layers.
- `shipany/` remains historical migration reference, not the default implementation target.

## Architecture direction

- The starter is `Astro + Hono`, not `Next.js`.
- Shared packages should stay framework-neutral where possible.
- Framework-specific behavior should live in thin adapter layers, not in `packages/core`.
- Runtime state belongs in `openspec/changes/<change>/README.md` and `tasks.md`.
- Historical execution evidence belongs in `openspec/changes/<change>/wal/`.
- Stable repository reality belongs in root `project-context.md`.

## Product shape

- `apps/site-astro` currently behaves like a full product shell.
- The long-term target is a reusable starter base with configuration-first variation.
- Landing, docs, auth, and shared shells are good starter candidates.
- Heavy product-specific surfaces should be modular and optional.

## Workflow direction

- `@spec` should produce executable `openspec` milestones and task cards.
- `@dev` should bind to one concrete task item and write status back to `openspec`.
- `.codex` holds workflow conventions and templates, not project output artifacts.
- WAL output must be stored under `openspec`, not under `.codex`.

## Practical rule

- Prefer config/content/runtime boundaries over site-specific code forks.
- Prefer one active source of truth for status, one for history, and one for stable repo context.
