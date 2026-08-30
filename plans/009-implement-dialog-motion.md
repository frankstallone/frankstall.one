# 009 — Implement the dialog motion contract

- **Status**: DONE
- **Commit**: 2ca3bfe
- **Severity**: LOW
- **Category**: Missed opportunity; physicality
- **Estimated scope**: 5 files, new small CSS block and close-lifecycle wiring

## Problem

`src/components/ui/dialog.tsx:40` and `:66` declare `animate-in`, `animate-out`, fade, and zoom utilities. No matching source or built CSS rule exists, so the dialog teleports.

## Target

Create `src/css/blocks/dialog.css` and import it from `src/css/global.css`. Use Radix `data-state`, CSS transitions, `@starting-style`, and a short closing lifecycle for exit keyframes:

- overlay: opacity 0 ↔ 1, 160ms strong ease-out;
- centered modal: opacity 0 ↔ 1 and `scale: 0.95` ↔ 1, 200ms strong ease-out;
- a `data-motion-state="closing"` phase keeps Radix open for 200ms while exit keyframes finish;
- starting style supplies the entrance;
- reduced motion keeps the 160ms opacity transition but fixes scale at 1.

Modals stay centered; center origin is correct.

## Repo conventions to follow

- Block CSS lives in `src/css/blocks/` and is explicitly imported by `global.css`.
- Use `--motion-ease-out` and exact property lists.
- Use `[data-slot='dialog-overlay']` and `[data-slot='dialog-content']` selectors already emitted by the component.

## Steps

1. Remove dead animation/fade/zoom and `duration-200` classes from `dialog.tsx`.
2. Let the Dialog root delay its final close for 200ms, expose the closing phase to overlay/content, and keep rapid reopen requests interruptible.
3. Add overlay/content entry transitions, `@starting-style`, and closing exit keyframes in the new CSS block.
4. Forward the overlay and composed button refs required by Radix.
5. Add a reduced-motion rule that removes scale movement but keeps opacity.
6. Import the block beside the other component blocks.

## Boundaries

- Do NOT change focus behavior, portal containment, z-index, or modal semantics.
- Do NOT add an animation package or multi-stage decorative keyframes.

## Verification

- **Mechanical**: `npm test -- --run` and `npm run build` pass.
- **Feel check**: open, close, and rapidly reverse the workflow dialog at 10% playback. It scales from 0.95 at the center and transitions retarget cleanly.
- Reduced motion shows only the opacity change.
- **Done when**: no dead `animate-in/out` classes remain and both Radix states have real CSS.
