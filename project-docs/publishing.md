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

Run `npm run publish:build`, review the generated output, commit source and
`docs/` together, then push `master` to publish on redbrixen.com.
