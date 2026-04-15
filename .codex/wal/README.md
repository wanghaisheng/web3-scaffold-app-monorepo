# AI Development WAL

This repository uses a lightweight write-ahead log convention to preserve:

- the decision chain
- the action chain
- the validation evidence for important changes

The WAL is intentionally small and points back to the real source artifacts.

`.codex/wal/` is the convention layer only.

Actual WAL output must live under `openspec/`, not under `.codex/`.

## Relationship To Other Artifacts

- `openspec/changes/<change>/`: primary change packet
- `openspec/changes/archive/<change>/`: closed or frozen change packet
- `CHANGELOG.md`: high-level release story

## Output Location Rule

Write new WAL artifacts under one of these paths:

- `openspec/changes/<change>/wal/`
- `openspec/changes/archive/<change>/wal/`

Do not create new WAL output under:

- `.codex/wal/entries/`
- `.codex/wal/index/`

Those `.codex/wal/*` paths should be treated as workflow assets, templates, schema, or legacy examples only.

## Structure

- `schema/`: JSON schema for WAL entries
- `README.md` and `LIFECYCLE.md`: convention docs
- no change-specific output should be written back into `.codex/wal/`

Recommended output structure under `openspec`:

- `openspec/changes/<change>/wal/entries/`
- `openspec/changes/<change>/wal/index/`

## Rules

- prefer links and file paths over embedding large diffs
- keep one WAL entry small, ideally `<= 50KB`
- use WAL to complement `openspec`, not replace it
- keep the live execution state in `openspec/changes/<change>/README.md` and `tasks.md`
