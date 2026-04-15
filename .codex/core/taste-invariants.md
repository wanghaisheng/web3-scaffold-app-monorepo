# Taste Invariants

This file captures a small set of enduring code-quality preferences.

## Preferences

- keep changes minimal and source-oriented
- avoid dead compatibility layers unless they are intentional and documented
- keep shared packages framework-neutral where possible
- prefer explicit naming over vague temporary abstractions
- update docs when public behavior or developer workflow changes

## Validation

There is no separate automated `taste:*` command wired today.

Apply these rules through normal review, `pnpm lint`, and focused code inspection.
