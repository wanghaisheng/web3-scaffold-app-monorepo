<!-- input: legacy spec prompts, repository context, and change-planning tasks -->
<!-- output: compatibility routing for the BMM workflow -->
<!-- pos: compatibility alias for the BMM workflow -->
# Spec Workflow

This file remains for compatibility with older `@spec` or spec-first prompts.

In this repository, spec-led work now lives in:

- `.codex/workflows/bmm.md`

## What To Do

1. Load `project-context.md` first for repository reality, command surface, and boundary rules.
2. Follow `bmm.md` as the primary workflow.
3. Use or create one durable change record:
   - prefer `openspec/changes/{change-name}/`
   - if the task already has a coherent legacy record, keep it as the single durable truth
4. Make `openspec` the live planning surface:
   - `README.md` holds current scope summary, milestone snapshot, and major limits
   - `tasks.md` holds milestone blocks, checklist execution order, and progress state
   - `proposal.md` and `design.md` hold durable framing and architecture decisions
5. Before any implementation starts, write execution-ready slices into the active record:
   - milestone name
   - goal
   - in scope and out of scope
   - touched systems
   - validation package
   - fallback or stopping point
6. Treat planning as incomplete until the next `@dev` pass can pick one task item from `tasks.md` without reconstructing context from chat.
7. When scope, validation, or sequencing changes, update `README.md` and `tasks.md` immediately rather than letting chat become the hidden source of truth.

## Execution Contract

When `@spec` is used, the workflow should behave as if these rules are mandatory:

- do not stop at proposal prose; produce execution-ready milestones
- do not leave milestone order implicit
- do not leave validation undefined for a milestone
- do not store current execution status primarily in WAL; current status belongs in `openspec`

## Compatibility Rule

Keep treating `spec.md` as an alias, not a separate user-facing mode. It inherits the same milestone-design, ADR, validation, and closeout rules as `bmm.md`.
