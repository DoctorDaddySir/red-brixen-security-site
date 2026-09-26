# Red Brixen Security

Trent Shelton's public security showcase, built with Astro, TypeScript, and Tailwind CSS. Static pages include home, profile, résumé, research, and contact. The client portal is a separate project.

## Development

Use Node 24 (`nvm use`) and npm.

```sh
npm ci
npm run dev
npm run verify
npm run preview
```

The primary domain is `https://redbrixen.com`, with `base: '/'`. Local preview runs at `http://127.0.0.1:4321/`.

Profile narrative, skills, and credentials live in `src/data/profile.ts`; résumé employment history lives independently in `src/data/resume.ts`; shared layouts and components live in `src/layouts` and `src/components`. `src/styles/global.css` contains design tokens, responsive rules, light/dark themes, and résumé print rules. Fonts are bundled locally. The website is static; contact submissions go to the separate Railway API. Fonts are local and there is no tracking.

Public pages include canonical and Open Graph metadata; only the 404 page is marked `noindex`. `npm run verify` checks types, formatting, the production build, internal links, local assets, indexing, headings, and a 500 KB individual asset budget.

## Milestones

1. Foundation and responsive visual draft, with passing checks and a milestone commit.
2. Finalized homepage, profile, résumé, project evidence, and contact/credential links.
3. Accessibility, performance, metadata, configuration, and release verification.
4. GitHub Pages deployment and production verification.

Commit after every completed milestone. See `project-docs/progress.md` for evidence and outstanding work.

## Publishing

Pages publishes `master:/docs`. Run `npm run publish:build`, commit the generated `docs/` together with source changes, and push `master`. `.nojekyll` preserves Astro asset paths. Project documentation and the optional future Actions template live in `project-docs/`. The current GitHub login cannot create workflows, so deployment uses branch publishing.

### Contact deployment

`src/pages/contact.astro` generates `/contact/index.html`. The default public
submission URL is `https://api.redbrixen.com/contact`. `PUBLIC_CONTACT_ENDPOINT`
can override it **when Astro builds** (for example, in a local `.env` file).
Setting this variable only on Railway does not change the static site. Production
verification requires the Railway URL to prevent publishing a broken endpoint.
For local API development, use `PUBLIC_CONTACT_ENDPOINT=http://localhost:3000/contact`
with `npm run dev`, and run `npm run start:api` separately.

The site keeps `output: 'static'`, `site: 'https://redbrixen.com'`, and `base: '/'`.
The deleted `src/pages/api/contact.js` was an API route, not the contact page;
do not restore it for Pages. Railway runs `src/api/contact.js` and should allow
`CONTACT_ALLOWED_ORIGIN=https://redbrixen.com`. Mail credentials belong only on Railway.

The workflow in `project-docs/deploy-workflow.yml` is an inactive future template.
The active branch deployment does not build Astro: every site change must include
fresh `docs/` output from `npm run publish:build`. Confirm that `docs/contact/index.html`
exists before committing and that `/contact/` returns HTTP 200 after deployment.
