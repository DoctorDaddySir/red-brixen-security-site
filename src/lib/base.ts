/**
 * Base URL path for this project site (subpath deployed to GitHub Pages,
 * e.g. `/red-brixen-security-site`).
 *
 * Read from `import.meta.env.BASE_URL`, which Astro sets from the `base`
 * config option. With `trailingSlash: 'always'` this value includes a
 * trailing slash, so strip it once to allow uniform segment appending
 * (`BASE + '/about/'`) without double slashes, matching astro:assets.
 */
export const BASE = (import.meta.env.BASE_URL ?? '').replace(/\/$/, '');
