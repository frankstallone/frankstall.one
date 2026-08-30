# 005 — Centralize JavaScript motion values

- **Status**: DONE
- **Commit**: 2ca3bfe
- **Severity**: LOW
- **Category**: Cohesion & tokens
- **Estimated scope**: 5 files, small refactor

## Problem

The canonical CSS values in `src/css/global/variables.css:4` do not govern JavaScript. The same curve and near-identical durations are repeated:

```ts
// MotionOrchestrator.astro:38
const easeOut: Easing = [0.22, 1, 0.36, 1]

// Likes.astro:234
duration: 0.18,
ease: [0.22, 1, 0.36, 1],

// CraftWorkflowIllustration.tsx:40
const easeOut = [0.22, 1, 0.36, 1] as const
```

## Target

Create `src/lib/motion.ts`:

```ts
export const motionEasing = {
  out: [0.23, 1, 0.32, 1],
  inOut: [0.77, 0, 0.175, 1],
} as const

export const motionDuration = {
  micro: 0.12,
  ui: 0.18,
  reveal: 0.26,
} as const
```

Align `--motion-ease-out` to `cubic-bezier(0.23, 1, 0.32, 1)` and add `--motion-ease-in-out` with `cubic-bezier(0.77, 0, 0.175, 1)`. Replace copied values in the orchestrator, Likes, and Craft illustration. Plans 002 and 003 own the Taste and Leverage consumers.

Use full `transform` strings in Likes success feedback while replacing its literals.

## Repo conventions to follow

- Shared TypeScript helpers live in `src/lib/`.
- CSS variables remain the CSS source; this module is the typed JavaScript mirror.
- Existing import alias `@lib/*` is established.

## Steps

1. Add the typed module with the exact values above.
2. Align the two CSS easing tokens in `src/css/global/variables.css`.
3. Update `MotionOrchestrator.astro` to import the shared values for standard reveals and nav motion. Keep the deliberate 1.2s hero presets unchanged.
4. Update Likes success/count feedback to shared 180ms ease-out and full `transform` strings.
5. Update Craft’s local ease constant/usages to the shared values without changing behavior owned by plans 002–004.

## Boundaries

- Do NOT change the hero’s selected 1.2s marketing configuration.
- Do NOT add a runtime CSS-variable reader or dependency.
- Do NOT edit Taste or Leverage behavior here.

## Verification

- **Mechanical**: `npm test -- --run` and `npm run build` pass.
- Search for `[0.22, 1, 0.36, 1]`; no active JS copy remains after dependent plans.
- **Feel check**: standard reveals, Like feedback, and Craft panels retain their existing speed with a slightly stronger finish.
- **Done when**: JS consumers import one typed motion contract and CSS uses matching exact curves.
