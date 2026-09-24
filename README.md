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

With `base: '/red-brixen-security-site'` set for GitHub Pages, the dev and preview servers run under the `/red-brixen-security-site/` subpath — open `http://127.0.0.1:4321/red-brixen-security-site/` for local preview.

Content lives in `src/data/profile.ts`; shared layouts and components live in `src/layouts` and `src/components`. `src/styles/global.css` contains design tokens, responsive rules, light/dark themes, and résumé print rules. Fonts are bundled locally. There is no backend, tracking, form submission, or remote font dependency.

Public pages include canonical and Open Graph metadata; only the 404 page is marked `noindex`. `npm run verify` checks types, formatting, the production build, internal links, local assets, indexing, headings, and a 500 KB individual asset budget.

## Milestones

1. Foundation and responsive visual draft, with passing checks and a milestone commit.
2. Finalized homepage, profile, résumé, project evidence, and contact/credential links.
3. Accessibility, performance, metadata, configuration, and release verification.
4. GitHub Pages deployment and production verification.

Commit after every completed milestone. See `docs/progress.md` for evidence and outstanding work.
