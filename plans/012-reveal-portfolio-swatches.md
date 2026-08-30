# 012 — Reveal portfolio mosaic swatches

- **Status**: DONE
- **Commit**: 2ca3bfe
- **Severity**: LOW
- **Category**: Missed opportunity; cohesion
- **Estimated scope**: 4 files, small orchestration hook

## Problem

`src/components/LoumarcGrid.astro:14`, `BTCPortfolioGrid.astro:14`, and `RollPortfolioGrid.astro:14` mark 27 decorative swatches with `animate-in`. No CSS utility defines that class, and the motion orchestrator does not target them.

## Target

Replace the dead class with explicit data hooks:

```html
<article data-motion-mosaic>
  <div data-motion-swatch ...></div>
</article>
```

In `MotionOrchestrator.astro`, reveal each mosaic once in view:

- opacity 0 → 1;
- full transform `scale(0.95)` → `scale(1)`;
- 260ms with `motionEasing.out`;
- `stagger(0.05)`, within the 30–80ms group range.

The existing top-level reduced-motion guard leaves swatches static and fully visible.

## Repo conventions to follow

- Reuse `revealInView`/`inView` and shared values from plan 005.
- Keep animation orchestration in `MotionOrchestrator.astro`.
- Data attributes carry behavior; styling classes remain styling-only.

## Steps

1. Add `data-motion-mosaic` to each portfolio grid article.
2. Replace all 27 dead `animate-in` classes with `data-motion-swatch`.
3. Add one transform/opacity mosaic reveal helper in the orchestrator.
4. Register every mosaic with a 50ms stagger and once-only in-view behavior.

## Boundaries

- Do NOT change mosaic layout, colors, pictures, or mobile visibility.
- Do NOT add initial CSS that hides content when JavaScript fails.
- Do NOT animate width, height, position, or blur.

## Verification

- **Mechanical**: `npm run build` passes.
- **Feel check**: visit portfolio index and case pages at desktop width. Each swatch group reveals once, in visual order, without blocking links.
- At 10% playback, every swatch starts at 0.95, never zero. Reduced motion shows static swatches.
- Search built CSS/source: no dead `animate-in` hook remains.
- **Done when**: all three mosaics use one shared 260ms/50ms transform-opacity reveal.
