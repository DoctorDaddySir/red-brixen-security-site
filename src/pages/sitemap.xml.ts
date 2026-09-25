import type { APIRoute } from 'astro';
import { postsFor } from '../lib/posts';
export const GET: APIRoute = ({ site }) => {
  const paths = [
    '',
    'about/',
    'resume/',
    'writeups/',
    'articles/',
    ...(['writeups', 'articles'] as const).flatMap((section) =>
      postsFor(section).map((post) => `${section}/${post.slug}/`),
    ),
  ];
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map((path) => `<url><loc>${new URL(path, site)}</loc></url>`).join('')}</urlset>`,
    { headers: { 'Content-Type': 'application/xml' } },
  );
};
