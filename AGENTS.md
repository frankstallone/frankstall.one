# Repository Guidelines

## Project Structure & Modules
- `src/pages/`: Astro routes and API (`src/pages/api`).
- `src/components/` and `src/layouts/`: UI building blocks; tests under `src/components/__tests__`.
- `src/content/blog/`: MD/MDX posts (files not starting with `_` are published).
- `src/css` and `tailwind.config.js`: styles and tokens; global utilities in `src/css-utils`.
- `public/`: static assets served as-is.
- `db/` and `migrations/`: Drizzle ORM artifacts; config in `drizzle.config.ts`.
- `dist/`: build output (generated).

## Build, Test, and Dev
- `npm run dev`: Start local dev server.
- `npm run build`: Type-check (`astro check`) then build for production.
- `npm run preview`: Serve the production build locally.
- `npm test` / `npm run test:ui`: Run Vitest (terminal/UI).
- `npm run coverage`: Generate coverage report.
- Database: `npm run db:generate`, `db:migrate`, `db:studio` (Drizzle Kit).

## Coding Style & Naming
- Formatting: Prettier with `prettier-plugin-astro` (single quotes, no semicolons, 2-space indent). Run your editor’s Prettier on save.
- TypeScript-first; keep components small and typed.
- Files: kebab-case for Astro/TS files (e.g., `post-card.astro`), PascalCase for React components.
- Content: blog files in `src/content/blog/*.mdx`; metadata must match `src/content.config.ts` schema.

## Testing Guidelines
- Framework: Vitest (`jsdom`) + Testing Library.
- Location/pattern: `src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}`.
- Write focused unit tests for components and scripts; prefer queries by role/label.
- Run before pushing: `npm test` and ensure `npm run build` succeeds.

## Commit & Pull Requests
- Use concise, conventional prefixes: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`, `remove:`.
- PRs must include: clear description, linked issues, screenshots for UI changes, and notes on testing.
- Keep diffs small and scoped; ensure checks pass (`build`, `test`). Netlify config exists; deploy previews may comment on PRs.

## Security & Configuration
- Environment: Node `>=22.12.0`.
- Secrets via `.env` (do not commit). Turso/LibSQL: `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` used in `src/turso.ts`.
- Verify env vars before running DB commands or API routes.
