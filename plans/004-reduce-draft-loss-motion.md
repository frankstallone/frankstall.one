# 004 — Honor reduced motion for draft-loss feedback

- **Status**: DONE
- **Commit**: 2ca3bfe
- **Severity**: MEDIUM
- **Category**: Accessibility; cohesion
- **Estimated scope**: 1 file, small React edit

## Problem

`src/components/article-workbench/CraftWorkflowIllustration.tsx:190` always moves the draft-loss alert:

```tsx
<motion.div
  initial={{ opacity: 0, y: -4 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0 }}
>
```

The adjacent failure alert already uses `useReducedMotion`. This one does not and also relies on Motion defaults.

## Target

Read `useReducedMotion()` in `RoughWorkflowFragment`. Use full transform strings:

```tsx
initial={reducedMotion ? {
  opacity: 0,
  transform: 'translateY(0)',
} : {
  opacity: 0,
  transform: 'translateY(-4px)',
}}
animate={{ opacity: 1, transform: 'translateY(0)' }}
transition={{
  duration: motionDuration.ui,
  ease: motionEasing.out,
}}
```

Reduced motion keeps the final transform and allows only the opacity cue.

## Repo conventions to follow

- Shared values come from `src/lib/motion.ts` after plan 005.
- The failure alert near `CraftWorkflowIllustration.tsx:255` is the local accessibility exemplar.

## Steps

1. Add `useReducedMotion` inside `RoughWorkflowFragment`.
2. Replace `y` shorthand with full transform strings.
3. Add the explicit 180ms strong ease-out transition.
4. Keep the reduced-motion transform at zero while fading the alert in.

## Boundaries

- Do NOT alter lost-draft behavior, copy, or alert markup.
- Do NOT add new dependencies.

## Verification

- **Mechanical**: `npm test -- --run` and `npm run build` pass.
- **Feel check**: type a workflow name, close the dialog, and inspect the alert at 10% playback.
- Toggle reduced motion and repeat: no vertical movement occurs.
- **Done when**: the alert uses shared timing, full transform, and a reduced-motion branch.
