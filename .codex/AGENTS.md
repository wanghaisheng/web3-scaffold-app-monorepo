# `.codex` Agent Guide

This file is a thin compatibility guide for repository-local agents.

The active workflow source of truth is:

1. `.codex/README.md`
2. `.codex/workflows/router.md`
3. `.codex/workflows/quick.md` or `.codex/workflows/bmm.md`
4. `.codex/core/*`
5. `.codex/gates/*`

If this file conflicts with the docs above, follow the docs above.

## Repository Reality

This repository is `easygo-astro-monorepo-starter`.

- Frontend: `apps/site-astro` using Astro
- API: `apps/api-hono` using Hono
- Shared code: `packages/*`
- Durable change records: `openspec/changes/*`

Do not assume any older framework, hosting, or backend stack unless the current code explicitly proves it.

## Agent Roles

The workflow does not require a large agent taxonomy.

Use these practical roles:

- `Planning`: scope, milestones, acceptance criteria, validation package
- `Execution`: implementation and focused refactors
- `Review`: findings-first review, risk, validation gaps
- `Documentation`: change record sync, architecture notes, README updates

These are responsibilities, not separate framework-specific systems.

## Execution Rules

- Route every task through `.codex/workflows/router.md`
- Use `Quick` for clear bounded work
- Use `BMM` for unclear or cross-cutting work
- Prefer existing `openspec/changes/*` records over ad hoc planning notes
- Use repo commands from the root `package.json`
- Validate with the smallest credible package, then broaden when needed

## Command Surface

Use the actual repository commands. Current primary commands include:

- `pnpm dev`
- `pnpm dev:site-astro`
- `pnpm dev:api-hono`
- `pnpm build`
- `pnpm lint`
- `pnpm format:check`
- `pnpm check:boundaries`
- `pnpm test:platform-foundation`

If a document mentions commands outside this surface, verify they exist before treating them as policy.

## Documentation Sync

For non-trivial work, keep these aligned:

- implementation
- `openspec/changes/{change-name}/tasks.md`
- `openspec/changes/{change-name}/proposal.md` or `design.md` when scope or architecture changes
- relevant README or architecture docs when public behavior changes

## What This File Does Not Do

This file does not define:

- a separate agent discovery platform
- auto-scan commands that do not exist in this repository
- an alternate architecture model

Those older concepts belong in `.codex/reference/` only if kept at all.
