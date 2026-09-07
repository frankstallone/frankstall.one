# Repository guidance

## Project conventions

- Blog files in `src/content/blog/` publish unless their names start with `_`.
  Keep metadata aligned with `src/content.config.ts`.
- Use kebab-case for Astro/TS files and PascalCase for React components.
- `src/design-tokens/*.json` owns design tokens. Generate `src/css/generated/*`
  with `npm run tokens:build`; edit the token source or generator, not its output.
- After changing token JSON or `src/css-utils/tailwind-token-generator.js`,
  regenerate the CSS.

## Task references

- When changing styles, tokens, or the CSS pipeline, read
  [styling guidance](docs/agents/styling.md) for canonical variables, generated
  utilities, and reset constraints.
- When adding or editing `RailDigression` in MDX, read
  [digression guidance](docs/agents/mdx-digressions.md) for its required `note`
  prop and viewport checks.
- Use `package.json` for scripts and runtime requirements, and the existing
  formatter and test configuration for their settings.

## Verification and delivery

- Verify the affected behavior and fix failures caused by the change before
  returning. Keep checks proportional to the change.
- For runtime changes, run focused tests while working; before pushing, run
  `npm run test:run` and `npm run build`. The build includes Astro validation.
- Use conventional commit prefixes such as `feat:`, `fix:`, `docs:`, or `refactor:`.
- PRs explain the change, link any related issue, report checks, and include
  screenshots when the UI changes.

## Database configuration

- Keep secrets in ignored environment files. Turso/LibSQL uses
  `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` in `src/turso.ts`.
- Verify the intended environment before running database commands or API routes;
  do not print secret values.
