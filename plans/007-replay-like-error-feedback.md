# 007 — Make like-error feedback replayable

- **Status**: DONE
- **Commit**: 2ca3bfe
- **Severity**: LOW
- **Category**: Interruptibility
- **Estimated scope**: 1 file, small custom-element edit

## Problem

`src/components/Likes.astro:268` adds one class for two seconds:

```ts
this.likeButton.classList.add('error')
setTimeout(() => {
  this.likeButton.classList.remove('error')
}, 2000)
```

The class runs `@keyframes nudge`. A second failure while the class exists cannot replay; the first timer can clear later feedback.

## Target

Delete the class, timer, scoped keyframes, and `.error` styles. Keep one `ReturnType<typeof animate> | null` control on the custom element. On each error:

1. stop the prior control;
2. if motion is allowed, animate the full transform string through `translateX(0)`, `translateX(-2px)`, `translateX(2px)`, `translateX(0)`;
3. use 180ms and `motionEasing.out`;
4. stop the control in `disconnectedCallback`.

## Repo conventions to follow

- Reuse the existing Motion DOM `animate` import.
- Use `motionDuration.ui` and `motionEasing.out` from plan 005.
- Reduced motion returns before positional feedback.

## Steps

1. Add and initialize one error-animation control field.
2. Add `disconnectedCallback` cleanup.
3. Replace the class/timer implementation in `showError` with stop/restart animation control.
4. Remove the obsolete scoped CSS block.

## Boundaries

- Do NOT change API, optimistic state, disabled state, or error copy.
- Do NOT introduce a second animation library.

## Verification

- **Mechanical**: `npm test -- --run` and `npm run build` pass.
- **Feel check**: force consecutive request failures. Every retry produces one clean nudge; no older timer cancels it.
- With reduced motion, no nudge runs.
- **Done when**: no `@keyframes nudge` or `error` class remains and animation controls are cleaned up.
