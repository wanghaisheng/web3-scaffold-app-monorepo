<!-- input: touched subsystems, changed code paths, and available local commands -->
<!-- output: repo-specific validation requirements by change type -->
<!-- pos: shared validation matrix for Quick and BMM -->
# Validation Matrix

Choose the smallest validation package that credibly proves the change, then add broader gates when the touched area requires it.

For every package below, report:

- what commands ran
- whether they passed
- what could not be verified locally

## Baseline Package

Use when the change is local and does not affect shipped integrated behavior.

Minimum:

- `pnpm lint`
- `pnpm format:check`
- one targeted package test when a local test exists

Ship gate:

- all selected commands green

If fail:

- read the failure output first
- fix the cause or call out the remaining gap explicitly

## Routing, SSR, Or Head Package

Use when routing, SSR output, head tags, navigation semantics, middleware, or entrypoints change.

Minimum:

- `pnpm --filter site-astro build`

Ship gate:

- `pnpm build`

Add when relevant:

- targeted Astro or Playwright tests when they exist

If fail:

- inspect SSR output or build tail before patching broadly

## I18n Or Language-Selection Package

Use when locale detection, language switching, route locale behavior, or translated output changes.

Minimum:

- targeted package tests for the changed i18n surface when they exist
- `pnpm --filter site-astro build` when translated routes or rendered content changed

Ship gate:

- `pnpm build` when routing, navigation, or SSR output changed

If fail:

- separate text issues from navigation-history or SSR issues before fixing

## SEO, Metadata, Sitemap, Or Audit Package

Use when metadata generation, locale SEO files, sitemap coverage, or audit behavior changes.

Minimum:

- `pnpm --filter site-astro build`
- targeted link or content checks when the repository exposes them

Ship gate:

- `pnpm build` when the change affects shipped output or integrated audits

If fail:

- read the latest report in `reports/` or the command tail
- determine whether the failure is new or pre-existing

## Content Pipeline Or Generated-Asset Package

Use when content, routes, sitemap generation, or prerender inputs change.

Minimum:

- `pnpm --filter site-astro build`
- targeted content tests when they exist

Ship gate:

- `pnpm build` when runtime output depends on generated results

If fail:

- identify the first broken generator rather than only fixing the final build symptom

## Full Gate

Use `pnpm build` when the change touches more than one major system, or when a narrower package would not prove the shipped behavior.
