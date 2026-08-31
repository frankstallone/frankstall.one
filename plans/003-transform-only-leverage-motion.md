# 003 — Keep leverage motion off layout properties

- **Status**: DONE
- **Commit**: 2ca3bfe
- **Severity**: MEDIUM
- **Category**: Performance; physicality
- **Estimated scope**: 1 file, moderate animation-prop edit

## Problem

`src/components/article-workbench/LeverageTasteIllustration.tsx:30` animates three rows with layout, `width`, and `scale: 0.8`:

```tsx
<motion.div layout={!reducedMotion}>
  <motion.span
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1, width: 28 }}
    exit={{ opacity: 0, scale: 0.8, width: 0 }}
  />
```

Width animation forces layout on every frame. Scale 0.8 collapses farther than the physical 0.9–0.97 range.

## Target

Animate only `opacity` and the full `transform` string. Use `scale(0.95)` ↔ `scale(1)`. Remove every animated `width`. Retain `layout="position"` only on the row so Motion can FLIP the final position change after an item unmounts.

Use `motionDuration.ui` (0.18s) and `motionEasing.out` (`[0.23, 1, 0.32, 1]`) from `src/lib/motion.ts`.

## Repo conventions to follow

- `src/lib/motion.ts` is created by plan 005.
- `useReducedMotion` must disable transforms and layout animation.
- Use full transform strings, not Motion `scale` shorthand.

## Steps

1. Import the shared motion values.
2. Replace the local duration-only transition with duration plus strong ease-out.
3. Change row layout to `layout={reducedMotion ? false : 'position'}`.
4. Replace icon and count scale shorthand with full `transform` strings using 0.95.
5. Remove all animated `width` values, including the count inside the button.

## Boundaries

- Do NOT change the three-row content, final resolved state, or button semantics.
- Do NOT animate width, height, margin, padding, top, or left.

## Verification

- **Mechanical**: `npm test -- --run` and `npm run build` pass.
- **Feel check**: toggle Repeated/Encoded at 10% playback. Icons stay physical, rows settle without width tweening, and no content clips.
- With reduced motion, state changes immediately with no scale or positional movement.
- **Done when**: animation props contain only opacity/full transform; scale never drops below 0.95.
