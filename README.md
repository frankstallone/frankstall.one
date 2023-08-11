# Minimal BJJ Starter Kit

Minimal Brazilian Jui Jitsu website starter kit built with [Astro](https://astro.build).

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```
/
├── public/
│   ├── media/
│   └── favicon.svg
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── Benefits.astro
│   │   ├── Contact.astro
│   │   ├── Difference.astro
│   │   ├── Footer.astro
│   │   ├── Header.astro
│   │   ├── Hero.astro
│   │   ├── Instructor.astro
│   │   └── Schedule.astro
│   ├── css/
│   │   ├── blocks/
│   │   ├── utilities/
│   ├── layouts/
│   │   └── Layout.astro
│   └── pages/
│       └── index.astro
├── .gitignore
├── .prettierrc
├── astro.config.mjs
├── netlify.toml
├── package-lock.json
├── package.json
├── README.md
└── tsconfig.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static image assets get put in the `src/assets/` directiory and should use the `Picture` component to render.

All other assets live directly in the `public/` directory. This is where you'll find your `favicon.svg` etc.

We're using [Every Layout](https://every-layout.dev/rudiments/units/#utility-classes) to help with layout, [CubeCSS](https://cube.fyi/) for organization, and [TailwindCSS](https://tailwindcss.com/) utility classes (manually add what is needed).

PurgeCSS is used to remove unused CSS classes from the final build.

## ⚙️ Components

- `<HeroTallVideo>` is for 9:16 videos
- `<HeroWideVideo>` is for 16:9 videos

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:3000`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more about Astro?

Feel free to check [the documentation](https://docs.astro.build) or jump into their [Discord server](https://astro.build/chat).
