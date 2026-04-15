<!-- input: task type, touched systems, and repo-level command gates -->
<!-- output: hard command-based guardrails that must be satisfied before closeout -->
<!-- pos: executable validation and release guardrails for the repo-local harness -->
# Executable Guardrails

These are hard gates, not soft advice.

A task is not ready to close if a required guardrail was skipped or is red.

## Baseline Guardrails

Run these when the task changes code:

- `pnpm lint` when the touched files are covered by the lint surface
- `pnpm format:check` when the changed files are part of the formatted surface
- targeted tests from `validation-matrix.md`

## Integration Guardrails

These become mandatory when the touched area demands them:

- `pnpm build` for cross-system, SSR, SEO, routing, or generated-output changes
- `pnpm check:boundaries` when shared package boundaries are part of the risk
- targeted package tests when the touched area already has them

## Skip Rule

Do not skip a required guardrail just because a narrower test passed.

If the shipped behavior depends on an integrated path, the integrated path must run.

## Failure Rule

When a guardrail fails:

1. inspect the first failing command or latest relevant report
2. decide whether the failure is caused by the current change or is pre-existing
3. either fix it or carry it forward explicitly as a known gap

## Evidence Rule

At closeout, name the commands that were used as proof.

Do not summarize with vague phrases like "validated locally" without the command package.
