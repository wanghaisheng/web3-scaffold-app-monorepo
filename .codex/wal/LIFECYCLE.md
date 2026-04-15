# WAL Lifecycle Rules

This file defines the WAL lifecycle convention only.

New WAL output belongs under `openspec/changes/<change>/wal/` or `openspec/changes/archive/<change>/wal/`.

## Create

Create or update a WAL entry when:

- a non-trivial `openspec` change starts
- a significant architecture or workflow decision is made
- validation evidence needs to be preserved

Write the entry into the active change packet, for example:

- `openspec/changes/<change>/wal/entries/YYYY-MM-DD_<change-id>.json`

## Checkpoint

Treat an entry as checkpointed when the related change is archived or otherwise closed.

After checkpoint:

- avoid growing the old entry
- create a new entry for follow-on work
- keep archived WAL output with the archived change packet under `openspec/changes/archive/...`

## Compression

- keep entries concise
- store references, not transcripts
- prefer `<= 50KB` per entry

## Indexes

Indexes are optional. Keep them lightweight and do not block delivery on perfect freshness.

If indexes are used, prefer:

- `openspec/changes/<change>/wal/index/`
- `openspec/changes/archive/<change>/wal/index/`
