# 001 — Make button press timing asymmetric

- **Status**: DONE
- **Commit**: 2ca3bfe
- **Severity**: MEDIUM
- **Category**: Easing & duration; interruptibility
- **Estimated scope**: 7 files, small CSS/class edits

## Problem

`src/css/blocks/button.css:3` gives press and release the same 120ms generic curve:

```css
:where(button, .button, .faq-button, [data-slot='button']) {
  scale: 1;
  transition: scale var(--motion-duration-micro) var(--motion-ease-standard);
}
/* :active */ { scale: 0.98; }
```

The deliberate press and the system response are symmetric. Tailwind control classes in `src/components/ui/button.tsx:8`, `switch.tsx:18`, `tabs.tsx:65`, and `dialog.tsx:78` also force the same duration and curve.

## Target

Use `scale: 0.97`. Press down over 160ms; release over 100ms. Both use the strong UI curve `cubic-bezier(0.23, 1, 0.32, 1)`.

```css
--motion-duration-press: 160ms;
--motion-duration-release: 100ms;

:where(button, .button, .faq-button, [data-slot='button']) {
  scale: 1;
  transition: scale var(--motion-duration-release) var(--motion-ease-out);
}

:where(...):active:not(:focus-visible) {
  scale: 0.97;
  transition-duration: var(--motion-duration-press);
}
```

Tailwind control transition lists retain `scale` and use the release duration/ease by default plus `active:duration-[var(--motion-duration-press)]`.

## Repo conventions to follow

- Motion tokens live in `src/css/global/variables.css`.
- Reduced-motion press handling already lives in `src/css/blocks/button.css:33`.
- Keep explicit transition-property lists; never restore `transition-all`.

## Steps

1. Add press/release duration tokens to `src/css/global/variables.css`. Ensure `--motion-ease-out` is the exact target curve.
2. Update the global button scale and asymmetric durations in `src/css/blocks/button.css`.
3. Update the four React control class lists to use the release token/ease-out and the active press duration.
4. Preserve the existing reduced-motion rule that fixes scale at 1.

## Boundaries

- Do NOT change control size, color, radius, or markup.
- Do NOT add JavaScript or dependencies.
- Do NOT animate properties outside the existing explicit lists.

## Verification

- **Mechanical**: `npm test -- --run` and `npm run build` pass.
- **Feel check**: hold a button, then release it. At 10% DevTools playback, compression takes longer than recovery. Rapid presses retarget without snapping.
- Toggle reduced motion: scale stays at 1 while color feedback remains.
- **Done when**: every button surface uses 160ms press, 100ms release, scale 0.97, and the strong ease-out.
