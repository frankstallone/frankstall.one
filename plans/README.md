# Animation improvement plans

- **Audit commit**: `2ca3bfe`
- **Scope**: findings 4–11 plus all four missed opportunities

| Plan | Title                                        | Severity | Status | Depends on    |
| ---- | -------------------------------------------- | -------- | ------ | ------------- |
| 001  | Make button press timing asymmetric          | MEDIUM   | DONE   | 005           |
| 002  | Remove serialized tab motion                 | MEDIUM   | DONE   | —             |
| 003  | Keep leverage motion off layout properties   | MEDIUM   | DONE   | 005           |
| 004  | Honor reduced motion for draft-loss feedback | MEDIUM   | DONE   | 005           |
| 005  | Centralize JavaScript motion values          | LOW      | DONE   | —             |
| 006  | Remove hover movement under reduced motion   | LOW      | DONE   | —             |
| 007  | Make like-error feedback replayable          | LOW      | DONE   | 005           |
| 008  | Remove per-frame TOC layout scans            | LOW      | DONE   | —             |
| 009  | Implement the dialog motion contract         | LOW      | DONE   | 005           |
| 010  | Reveal FAQ answers without layout tweening   | LOW      | DONE   | 005           |
| 011  | Transition the like state colors             | LOW      | DONE   | 001, 005, 007 |
| 012  | Reveal portfolio mosaic swatches             | LOW      | DONE   | 005           |

## Recommended execution order

1. 005 establishes the shared JavaScript easing and duration values.
2. 001 establishes press/release timing.
3. 002, 003, and 004 settle article illustration behavior.
4. 006, 008, 009, and 010 are independent CSS/component fixes.
5. 007 then 011 update the same Likes component.
6. 012 adds the rare portfolio reveal after the orchestrator uses shared values.

All plans are motion-only. Do not add dependencies or change product copy.
