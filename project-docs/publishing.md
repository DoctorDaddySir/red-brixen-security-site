# Publishing writeups and articles

Add Markdown files to `src/content/writeups/` or `src/content/articles/`.
The filename becomes the URL: `my-lab.md` becomes `/writeups/my-lab/`.
Use lowercase hyphenated filenames.

```yaml
---
title: 'Your post title'
description: 'A short summary for the index and search previews.'
date: '2026-09-25'
draft: true
platform: 'HTB'
category: 'Lab Writeup'
preview_image: '/images/previews/my-lab.png'
preview_image_alt: 'A short, accessible label for the preview image.'
preview_in_article: true
tags: ['Web security', 'Enumeration']
---
```

`platform` must be `HTB` or `THM` for writeups; omit it for articles.
Quote dates. Posts publish only when `draft: false` is explicitly set.
The date is a display/sort date, not a publication scheduler.

Start the body with an introduction; use `##` for sections because the page
already supplies the title as its main heading. Markdown supports code blocks,
images, lists, and links. Place images in `public/images/` and reference them as
`/images/filename.webp`. Do not put private draft attachments in `public/`:
every file there is published, even when its associated post is a draft.

Both indexes list published posts newest first. Published URLs are included
in the sitemap automatically. Drafts have no generated page or listing.
Check the relevant platform's publication rules before releasing a lab writeup.

## Organizing posts by category

Both the articles and writeups indexes group posts by `category` and render a
heading for each group. The heading is shown only when a section contains more
than one category, so a section with a single category reads as a flat list.
On individual cards the category also appears in the eyebrow, replacing the
generic `SECURITY ARTICLE` label for articles.

`category` is a typed field declared in `src/lib/posts.ts` (type `Category`).
The current values are `Vulnerability Analysis`, `Threat Research`, and
`Lab Writeup`. Add a new literal to that union before using it, so typos are
caught at build time. Posts without a `category` fall back to an `Uncategorized`
group.

## Preview images (Open Graph / LinkedIn)

Each post may set a `preview_image` (a `/images/...` path) and a short
`preview_image_alt` description. When present, these are emitted as the
`og:image` / `twitter:image` meta tags in `Base.astro` so links shared on
LinkedIn (and other social platforms) render a rich preview. The preview PNG is
1200x630 to match LinkedIn's recommended Open Graph image ratio.

`npm run previews` regenerates the preview PNGs from
`scripts/generate-previews.mjs`; re-run it whenever a title or date changes.

### Toggling the inline preview image

`preview_image` is always set as the Open Graph preview for link unfurls. It is
**also** rendered as an inline image at the very top of the post body (below the
hero, before the first paragraph) when `preview_in_article` is `true` or omitted.
Set `preview_in_article: false` to suppress just the inline copy while keeping
the Open Graph preview:

```yaml
---
preview_image: '/images/previews/example.png'
preview_image_alt: 'A one to two sentence description of the image.'
preview_in_article: false
---
```

Run `npm run publish:build`, review the generated output, commit source and
`docs/` together, then push `master` to publish on redbrixen.com.
