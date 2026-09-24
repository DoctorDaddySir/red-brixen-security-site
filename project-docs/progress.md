# Development progress

## Milestone 1 — foundation and visual draft

Complete: Astro static site, TypeScript content, Tailwind, local fonts, responsive layouts, original artwork, theme switch, and résumé print styling. Commit: `21d84fe`.

## Milestone 2 — approved content

Complete: homepage, Trent profile, online résumé, approved public email, employer history, and verified OSCP+ credential link. Pentai remains private and uses an email discussion link; the Field Guide links to its public repository. Source résumés are not published.

Validation: Astro diagnostics, formatting, and static production build pass.

## Milestone 3 — release readiness

Complete: canonical and Open Graph metadata, sitemap, and automated checks for deployment paths, navigation, headings, indexing, and published assets. `npm run verify` passes. Live browser verification follows deployment. Project subpath support was added in `0e95d14`.

## Milestone 4 — deployment

GitHub rejected workflow creation because the OAuth login lacks workflow scope. Deployment therefore uses supported branch publishing (`master:/docs`). `npm run publish:build` verifies and copies the production output into `docs/`, including `.nojekyll`. The Actions template remains in `project-docs/` for future use. Live verification is pending.

## Content choices

Java 25 is the showcased development baseline; this static site uses Node 24 to build. Contact: trent.shelton.primary@gmail.com. LinkedIn is omitted pending confirmation. No résumé phone number or old job-search email is published.
