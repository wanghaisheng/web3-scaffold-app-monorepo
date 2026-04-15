# Strict Architecture Boundaries

This note defines the current repository boundary rule at a practical level.

## Current Boundary Model

- `apps/site-astro`: Astro frontend runtime and page composition
- `apps/api-hono`: Hono API runtime
- `packages/*`: shared logic, config, UI, i18n, and extensions
- `openspec/changes/*`: durable change planning and status, not runtime code

## Dependency Direction

- apps may depend on packages
- packages must not depend on app-local code
- generated or built output must not become the primary edit surface

## Validation

Use:

- `pnpm check:boundaries`
- `pnpm build` when the change crosses package or app boundaries

If stronger automated boundary checks are added later, document the real command here.
