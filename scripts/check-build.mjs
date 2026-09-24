import assert from 'node:assert/strict';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
const base = '/red-brixen-security-site';
for (const file of [
  'index.html',
  'about/index.html',
  'resume/index.html',
  '404.html',
]) {
  const html = readFileSync(join('dist', file), 'utf8');
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
    assert(url.startsWith(base + '/'), `${file}: wrong base in ${url}`);
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
