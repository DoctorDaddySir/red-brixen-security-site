import assert from 'node:assert/strict';
import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
const base = '/';
const pages = readdirSync('dist', { recursive: true }).filter((file) =>
  String(file).endsWith('.html'),
);
for (const required of [
  'index.html',
  'about/index.html',
  'resume/index.html',
  'writeups/index.html',
  'articles/index.html',
  '404.html',
])
  assert(pages.includes(required), `Missing page: ${required}`);
for (const file of pages) {
  const html = readFileSync(join('dist', file), 'utf8');
  if (file.startsWith('research/')) {
    assert.match(html, /http-equiv="refresh"/);
    continue;
  }
  assert.match(html, /<main[^>]*id="main"/);
  assert.match(html, /rel="canonical"/);
  assert.equal(
    (html.match(/<h1[ >]/g) || []).length,
    1,
    `${file}: one page heading`,
  );
  assert.equal(
    html.includes('noindex'),
    file === '404.html',
    `${file}: indexing`,
  );
  assert(
    !html.includes('github.com/DoctorDaddySir/pentai'),
    'Private repository must not be linked',
  );
  for (const [, url] of html.matchAll(/(?:href|src)="([^"#]+)"/g)) {
    if (!url.startsWith('/')) continue;
    assert(url.startsWith(base), `${file}: wrong base in ${url}`);
    const pathname = decodeURIComponent(
      url.split(/[?#]/)[0].slice(base.length),
    );
    const target = join(
      'dist',
      pathname,
      pathname.endsWith('/') ? 'index.html' : '',
    );
    assert(existsSync(target), `${file}: missing ${url}`);
    assert(
      statSync(target).size < 500_000,
      `${url}: asset exceeds 500 KB budget`,
    );
  }
}
assert(existsSync('dist/sitemap.xml'));
console.log(
  'Built pages: navigation, local assets, indexing, headings, and size checks passed.',
);
