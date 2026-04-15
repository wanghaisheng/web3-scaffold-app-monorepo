# Pilot Promotion

Use this note when a change is risky enough that you should validate a smaller slice before expanding it.

## When To Use It

- broad refactors
- repeated changes across many files
- shared package boundary changes
- architecture changes with rollback risk

## Pattern

1. choose a small representative slice
2. implement and validate it
3. confirm the method works
4. expand only after the pilot is stable

## Rule

Do not describe a pilot system as automated unless the repo actually ships the commands and reports.
