# Command Standards

This file defines the current command policy for the repository.

## Preferred Order

1. root `pnpm` scripts from `package.json`
2. `pnpm --filter <package> ...` for package-scoped work
3. existing `node scripts/...` helpers when they already exist
4. shell one-liners when no repo command exists

## Rules

- prefer non-interactive commands
- prefer commands with clear exit codes
- do not invent repository scripts in documentation
- do not document helper scripts that are not present on disk

## Common Commands

- `pnpm dev`
- `pnpm dev:site-astro`
- `pnpm dev:api-hono`
- `pnpm build`
- `pnpm lint`
- `pnpm format:check`
- `pnpm check:boundaries`
