# Development progress

## Milestone 1 — foundation and visual draft

Complete. Astro static site, TypeScript content, Tailwind integration, local fonts, shared navigation/footer, custom visual assets, three responsive page drafts + 404, theme switch, and résumé print layout.

Design direction: charcoal and warm neutral surfaces, restrained brick-red accent, Manrope typography, IBM Plex Mono labels, generous whitespace, and practical security narratives. No fabricated portrait or customer proof.

### Verification evidence

- `npm run verify` (check + lint + build) passes: `astro check` 0 errors / 0 warnings / 0 hints; Prettier clean; `astro build` emits 4 static pages.
- Browser review: built HTML verified directly from `dist/` — distinct titles per page; viewport, description, color-scheme, theme-color, and `noindex, nofollow` meta present; bundled CSS and responsive WebP assets with `srcset`; no external fonts/CDN/URL references.
- ⚠️ Note: the Astro preview server could not be run live in this sandbox because network-interface binding is blocked (same restriction prevents `astro preview` from starting); the generated static output was verified directly instead.

## Milestone 3 — project-path-safe URLs

Complete. GitHub Pages serves this repo under the `/red-brixen-security-site/` subpath, so the site is configured for subdirectory deployment:

- `astro.config.mjs` sets `base: '/red-brixen-security-site'` and `site: 'https://DoctorDaddySir.github.io'`. Astro auto-prefixes `astro:assets` (CSS, Images) with the base.
- Internal `<a href>` links and the favicon reference are made base-aware via a typed `src/lib/base.ts` helper (`import.meta.env.BASE_URL`); remaining same-page `#fragment` anchors are intentionally relative.
- Verified in `dist/`: every internal `href`/`src`/`srcset` resolves to `/red-brixen-security-site/...`, `aria-current="page"` still works on the About nav link, and `dist/favicon.svg` is reached at `/red-brixen-security-site/favicon.svg`.
- Dev servers now run under the base subpath (`npm run dev` → `http://127.0.0.1:4321/red-brixen-security-site/`).

## Milestone 4 — GitHub Pages deployment

Workflow added (`.github/workflows/deploy.yml`): builds on push to `master`, then uses `actions/configure-pages` + `upload-pages-artifact` + `deploy-pages` to publish `dist/` to GitHub Pages. `permissions: pages: write` + `id-token: write` let the workflow configure Pages on first run — no manual repo-settings step. Production verification is pending the first successful push/deploy.

## Confirmed inputs

- GitHub Pages hosting.
- Public contact: trent.shelton.primary@gmail.com.
- User authorized public project references and employer names from supplied résumés.
- OSCP+ credential link supplied by the user; integrate in milestone 2.

## Pending

- Confirm intended LinkedIn URL before including it.
- Complete content, credentials, and approved contact path in milestone 2 (OSCP+ link, email contact link).
- Final metadata/accessibility/performance audit in milestone 3 (sitemap, OpenGraph, perf budget, `noindex` → indexable).

The supplied résumé files are source material, not public assets. No résumé phone number or job-search email is included.
