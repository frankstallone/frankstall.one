# 010 — Reveal FAQ answers without layout tweening

- **Status**: DONE
- **Commit**: 2ca3bfe
- **Severity**: LOW
- **Category**: Missed opportunity; accessibility
- **Estimated scope**: 1 file, small markup/CSS edit

## Problem

`src/components/FAQ.astro:12` uses native `details`. The body appears instantly, while plus/minus icons swap through `display`:

```css
.plus-icon {
  display: inline-block;
}
.minus-icon {
  display: none;
}
details[open] .plus-icon {
  display: none;
}
details[open] .minus-icon {
  display: inline-block;
}
```

The disclosure has no spatial explanation.

## Target

Keep native `details/summary`. Do not animate height or another layout property. Add:

- one fixed-size `.faq-icon` wrapper with both icons stacked;
- 160ms opacity/full-transform crossfade between icons, with hidden icons at `scale(0.95)`;
- answer entry using opacity, `transform: translateY(-4px)`, and `clip-path: inset(0 0 100% 0)` to final values over 180ms strong ease-out;
- `@starting-style` for the newly-open answer;
- reduced motion: no transform/clip movement, 160ms opacity only.

## Repo conventions to follow

- Preserve native disclosure semantics and keyboard behavior.
- Use `--motion-duration-ui` and `--motion-ease-out`.
- Clip-path is preferred over height animation for reveals.

## Steps

1. Wrap the two icons in one `aria-hidden` span and remove duplicated accessibility attributes from the SVGs.
2. Stack both icons in the wrapper and replace `display` swaps with opacity/transform transitions.
3. Add the answer transition and starting style.
4. Add reduced-motion overrides.

## Boundaries

- Do NOT replace native `details` with custom JavaScript.
- Do NOT animate height, max-height, grid tracks, margin, or padding.
- Do NOT change questions, answers, or default-open behavior.

## Verification

- **Mechanical**: `npm run build` passes.
- **Feel check**: open the FAQ with pointer and keyboard at 10% playback. The icon morph and answer reveal read as one action; page layout never tweens.
- Reduced motion keeps a gentle opacity change only.
- **Done when**: no `display` icon swap remains and only opacity/transform/clip-path animate.
