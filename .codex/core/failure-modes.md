# Failure Modes

These are the common delivery failures the local workflow is trying to prevent.

## Main Failure Modes

- unclear scope entering implementation
- validation smaller than the shipped behavior
- speculative fixes without reading failure evidence
- documentation and implementation drifting apart
- cross-session context loss on non-trivial work

## Countermeasures

- route through `Quick` or `BMM`
- package the task before implementation expands
- choose a real validation package
- use `observability.md` before broad fixes
- keep `openspec/changes/*` current for non-trivial work
