# Red Brixen Security

Trent Shelton's public security showcase, built with Astro, TypeScript, and Tailwind CSS. Three static pages: home, profile, and an HTML résumé with print styling. The client portal is a separate project.

## Development

Use Node 24 (`nvm use`) and npm.

```sh
npm ci
npm run dev
npm run verify
npm run preview
```

The primary domain is `https://redbrixen.com`, with `base: '/'`. Local preview runs at `http://127.0.0.1:4321/`.

Profile narrative, skills, and credentials live in `src/data/profile.ts`; résumé employment history lives independently in `src/data/resume.ts`; shared layouts and components live in `src/layouts` and `src/components`. `src/styles/global.css` contains design tokens, responsive rules, light/dark themes, and résumé print rules. Fonts are bundled locally. There is no backend, tracking, form submission, or remote font dependency.

Public pages include canonical and Open Graph metadata; only the 404 page is marked `noindex`. `npm run verify` checks types, formatting, the production build, internal links, local assets, indexing, headings, and a 500 KB individual asset budget.

## Milestones

1. Foundation and responsive visual draft, with passing checks and a milestone commit.
2. Finalized homepage, profile, résumé, project evidence, and contact/credential links.
3. Accessibility, performance, metadata, configuration, and release verification.
4. GitHub Pages deployment and production verification.

Commit after every completed milestone. See `project-docs/progress.md` for evidence and outstanding work.

## Publishing

Pages publishes `master:/docs`. Run `npm run publish:build`, commit the generated `docs/` together with source changes, and push `master`. `.nojekyll` preserves Astro asset paths. Project documentation and the optional future Actions template live in `project-docs/`. The current GitHub login cannot create workflows, so deployment uses branch publishing.
