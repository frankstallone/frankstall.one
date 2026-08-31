# 008 — Remove per-frame TOC layout scans

- **Status**: DONE
- **Commit**: 2ca3bfe
- **Severity**: LOW
- **Category**: Performance
- **Estimated scope**: 1 file, small event-handler refactor

## Problem

`src/components/FloatingTableOfContents.astro:175` installs IntersectionObserver, then also listens to every scroll:

```ts
window.addEventListener('scroll', this.onScroll, { passive: true })

this.frameRequest = window.requestAnimationFrame(() => {
  this.updateActiveHeadingByPosition()
})
```

`getActiveHeadingByPosition` reads every heading’s `getBoundingClientRect()`. This duplicates observer work and can force layout during scrolling.

## Target

IntersectionObserver owns live scroll tracking. Keep the rAF-throttled position scan for resize and one 120ms debounced reconciliation scan after scrolling settles so large keyboard or programmatic jumps cannot skip the observer band. Initialization, hash changes, and panel opening may still scan once.

## Repo conventions to follow

- Preserve the existing observer and active-heading fallback.
- Preserve rAF throttling for resize and use a separate debounced scroll handler.

## Steps

1. Rename the existing per-frame handler to `onResize`.
2. Keep resize registration/cleanup and its rAF callback.
3. Add a passive scroll listener that resets one 120ms timer and scans only after scrolling settles.
4. Cancel both rAF and debounce work in `disconnectedCallback`.

## Boundaries

- Do NOT change activation offset, observer root margin, focus, or open/close motion.
- Do NOT add a new observer or library.

## Verification

- **Mechanical**: `npm run build` passes.
- **Feel check**: scroll a long post, resize, follow hash links, and open the panel. Active heading remains correct.
- In DevTools performance recording, scrolling no longer calls `getBoundingClientRect()` every frame.
- **Done when**: continuous scrolling causes observer updates plus one final scan, not one layout scan per frame; resize remains rAF-throttled.
