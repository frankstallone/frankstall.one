# Styling and design tokens

## Canonical CSS variables

- Use canonical token-backed variables only:
  - colors: `--color-*`
  - spacing: `--spacing-*`
  - text sizes: `--text-*`
  - font families: `--font-*`
  - font weights: `--font-weight-*`
  - line heights: `--leading-*`
  - breakpoints: `--breakpoint-*`
- Do not introduce compatibility aliases like `--space-*`, `--size-step-*`, `--gray-*`, or `--font-bold`.

## Tailwind 4 usage

- Tailwind classes are driven by the generated `@theme` file in `src/css/generated/tailwind-theme.css`.
- Prefer token-backed Tailwind utilities such as `bg-gray-100`, `text-step-3`, `font-display`, `font-bold`, `gap-s`, and `px-l`.
- Generated custom utilities live in `src/css/generated/tailwind-utilities.css`:
  - `flow-space-*`
  - `region-space-*`
  - `gutter-*`

## Reset and compatibility constraints

- Do not reintroduce `tailwind.config.js`, `@config`, JS theme plugins, or CSS variable compatibility layers.
- Keep the current reset strategy in `src/css/global.css`; do not enable Tailwind Preflight.
