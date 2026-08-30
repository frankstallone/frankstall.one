# 006 — Remove hover movement under reduced motion

- **Status**: DONE
- **Commit**: 2ca3bfe
- **Severity**: LOW
- **Category**: Accessibility
- **Estimated scope**: 3 CSS files, tiny edit

## Problem

Reduced-motion rules remove transitions but not transform targets:

```css
/* src/css/blocks/home.css:87 */
.home-post-item:hover {
  transform: translateY(-2px);
}
@media (prefers-reduced-motion: reduce) {
  .home-post-item {
    transition: none;
  }
}
```

The same pattern exists in `post-card.css:6` and `header-links.css:30`. Users still see a 1–2px jump.

## Target

Inside each existing reduced-motion block, set `transform: none` on the moved hover/active selector at equal specificity. Keep color, underline, focus, and immediate state feedback.

## Repo conventions to follow

- Hover movement remains gated by `(hover: hover) and (pointer: fine)`.
- Extend the existing reduced-motion blocks; do not add a second policy.

## Steps

1. Set `transform: none` for `.home-post-item:hover` under reduced motion.
2. Set `transform: none` for `.post-card:hover` under reduced motion.
3. Set `transform: none` for `.header-link a:hover` and `:active` under reduced motion.

## Boundaries

- Do NOT remove hover movement for users without the preference.
- Do NOT suppress underline or color feedback.

## Verification

- **Mechanical**: `npm run build` passes.
- **Feel check**: emulate reduced motion and hover each target. Nothing changes position; visual state remains clear.
- **Done when**: all three transforms resolve to `none` under reduced motion.
