# 002 — Remove serialized tab motion

- **Status**: DONE
- **Commit**: 2ca3bfe
- **Severity**: MEDIUM
- **Category**: Interruptibility; purpose & frequency
- **Estimated scope**: 1 file, small simplification

## Problem

`src/components/article-workbench/TasteJudgmentIllustration.tsx:86` serializes every tab switch:

```tsx
<AnimatePresence mode="wait" initial={false}>
  <motion.div
    key={mode}
    initial={reducedMotion ? false : { opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -4 }}
    transition={{ duration: reducedMotion ? 0 : 0.2, ease: easeOut }}
  >
```

A quick reversal must finish the 200ms exit before the 200ms entrance. Tabs are repeated controls; this delay has no spatial job.

## Target

Delete the content-swap animation. Keep the stable minimum-height shell and render the selected content in a plain `div`. The tab control’s color/state feedback remains.

## Repo conventions to follow

- Prefer deleting frequent motion when state remains clear.
- Preserve the current `Tabs`, labels, content, and minimum-height shell.

## Steps

1. Remove `AnimatePresence`, `motion`, and `useReducedMotion` imports from the file.
2. Remove the local `easeOut` constant and reduced-motion variable.
3. Replace the keyed `motion.div` wrapper with a plain `div className="w-full"`.
4. Keep the existing conditional content unchanged.

## Boundaries

- Do NOT change tab semantics, copy, layout, or visual styling.
- Do NOT add a replacement animation.

## Verification

- **Mechanical**: `npm test -- --run` and `npm run build` pass.
- **Feel check**: alternate tabs rapidly with pointer and keyboard. Content changes immediately; no queued exit remains.
- **Done when**: the illustration contains no Motion import and no content-swap animation.
