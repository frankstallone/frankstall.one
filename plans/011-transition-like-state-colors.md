# 011 — Transition the like state colors

- **Status**: DONE
- **Commit**: 2ca3bfe
- **Severity**: LOW
- **Category**: Missed opportunity; feedback
- **Estimated scope**: 1 file, small scoped-style edit

## Problem

`src/components/Likes.astro:204` swaps the positive state colors synchronously while scale and count animate:

```ts
this.likeButton.classList.add('bg-gray-1400', 'text-gray-100')
this.likeButton.classList.remove('bg-transparent', 'text-gray-1400')
```

The rare feedback moment contains one visible teleport.

## Target

Add `post-likes__button` to the button. Its scoped transition must coordinate:

```css
.post-likes__button {
  transition:
    background-color var(--motion-duration-ui) var(--motion-ease-out),
    color var(--motion-duration-ui) var(--motion-ease-out),
    scale var(--motion-duration-release) var(--motion-ease-out);
}

.post-likes__button:active {
  transition:
    background-color var(--motion-duration-ui) var(--motion-ease-out),
    color var(--motion-duration-ui) var(--motion-ease-out),
    scale var(--motion-duration-press) var(--motion-ease-out);
}
```

Reduced motion retains background/color transition and drops scale movement.

## Repo conventions to follow

- Press tokens come from plan 001.
- Success feedback and error control come from plans 005 and 007.
- Explicit property transitions only.

## Steps

1. Add the component class to the button.
2. Add the coordinated transition rules to the scoped style.
3. Add a reduced-motion override with background/color only.
4. Keep class-based liked/unliked state and optimistic behavior unchanged.

## Boundaries

- Do NOT change API calls, counts, labels, or color values.
- Do NOT add a second state variable.

## Verification

- **Mechanical**: `npm test -- --run` and `npm run build` pass.
- **Feel check**: like and unlike at 10% playback. Color, button feedback, and count read as one response.
- Reduced motion keeps the color crossfade but removes positional/scale movement.
- **Done when**: the color state no longer teleports and press timing remains asymmetric.
