# HARNESS.md

This file is a compatibility shim.

The active harness rules live in:

- `.codex/core/harness.md`
- `.codex/core/validation-matrix.md`
- `.codex/core/task-packaging.md`
- `.codex/core/milestone-design.md`
- `.codex/core/work-breakdown.md`

If this file conflicts with those docs, follow the core docs.

## Non-Negotiable Rules

- Inspect local code and docs before editing
- Use `Quick` or `BMM`; do not invent extra user-facing modes
- Prefer `openspec/changes/*` for non-trivial durable work
- Use repository commands that actually exist in `package.json`
- Do not claim completion without validation evidence
- Do not let implementation, docs, and change records drift apart

## Repository-Specific Constraints

- Frontend lives under `apps/site-astro`
- API lives under `apps/api-hono`
- Shared packages live under `packages/*`
- Root runtime is Astro + Hono, not Next.js

## Minimum Quality Gate

Choose the smallest package that proves the change, typically from:

- `pnpm lint`
- `pnpm format:check`
- `pnpm check:boundaries`
- `pnpm build`
- targeted package tests

If a narrower test is enough, use it. If routing, build output, or shared contracts changed, include `pnpm build`.

## Documentation Rule

When behavior, structure, or process changes:

- update the relevant `openspec` record if one exists
- update repo docs when the change affects developer behavior
- update `.codex` only when the workflow itself changed
