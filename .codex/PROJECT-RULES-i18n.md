# Project Rules: i18n

This file defines repository-local i18n guardrails for `easygo-astro-monorepo-starter`.

## Scope

These rules apply when changing:

- locale-prefixed routes in `apps/site-astro`
- shared i18n catalogs in `packages/i18n`
- shared locale helpers in `packages/core` or `packages/ui`

## Core Rules

- locale behavior must be driven by the URL and route context, not by hidden client-only state
- user-facing copy must come from the shared i18n system, not hard-coded strings
- route or middleware changes that affect locale behavior must be validated with a build
- changes must preserve the current default-locale redirect behavior unless the task explicitly changes it

## Preferred Validation

- targeted tests for the touched i18n surface when they exist
- `pnpm --filter site-astro build` for route/render behavior changes
- `pnpm build` when shared packages or multiple apps are affected

## Documentation Rule

If locale behavior changes materially, update:

- the active `openspec/changes/*` record when one exists
- any relevant system map under `docs/system-maps/`
