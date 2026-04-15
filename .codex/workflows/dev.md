<!-- input: legacy quick-dev prompts, repository context, and implementation tasks -->
<!-- output: compatibility routing for implementation work -->
<!-- pos: compatibility alias for the Quick workflow -->
# Dev Workflow

This file remains for compatibility with older `@dev` or quick-dev prompts.

In this repository, direct implementation work now lives in:

- `.codex/workflows/quick.md`

## What To Do

1. Load `project-context.md` first for repository reality, command surface, and boundary rules.
2. Follow `quick.md` as the primary implementation workflow.
3. Anchor the work to one active change record:
   - prefer `openspec/changes/{change-name}/`
   - if the task already has a coherent legacy record, keep that record as the single durable truth
4. Before coding, identify exactly one execution target from the active record:
   - one milestone block in `README.md`, or
   - one concrete checklist item or grouped task block in `tasks.md`
5. Restate the implementation packet before expanding work:
   - current change
   - current milestone or task item
   - in scope for this pass
   - validation package
   - stopping point if blocked
6. Implement only that one packet.
7. Write execution state back to the active record instead of keeping it only in chat:
   - update `tasks.md` checklist state
   - update `README.md` status summary when milestone progress materially changed
   - add validation evidence or residual risk in the closeout section when relevant
8. If the task outgrows one coherent milestone, stop treating it as `Quick` and switch to `.codex/workflows/bmm.md`.

## Execution Contract

When `@dev` is used, the workflow should behave as if these rules are mandatory:

- do not implement work that is not mapped to a visible task or milestone
- do not close a task item without naming the validation used
- do not advance to the next task item until the current one is in a coherent state
- do not use WAL as the primary live status surface; current status belongs in `openspec`

## Compatibility Rule

Keep treating `dev.md` as an alias, not a separate user-facing mode. It inherits the same decomposition, validation, and closeout rules as `quick.md`.
