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
  'contact/index.html',
  'resume/index.html',
  'writeups/index.html',
  'articles/index.html',
  '404.html',
])
  assert(pages.includes(required), `Missing page: ${required}`);
for (const file of pages) {
  const html = readFileSync(join('dist', file), 'utf8');
  // No rendered page should leak a mailto: contact link; all CTAs use /contact/.
  assert(!html.includes('mailto:'), `${file}: must not contain mailto: links`);
  if (file.startsWith('research/')) {
    assert.match(html, /http-equiv="refresh"/);
    continue;
  }
  // API routes serve JSON, not HTML documents; structural HTML assertions
  // below do not apply to them.
  if (file.startsWith('api/')) continue;
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
const contact = readFileSync('dist/contact/index.html', 'utf8');
assert.match(contact, /<form[^>]*id="contact-form"/);
assert.match(contact, /data-endpoint="https:\/\/api\.redbrixen\.com\/contact"/);
assert.match(contact, /action="https:\/\/api\.redbrixen\.com\/contact"/);
assert(
  !contact.includes('../lib/contact/form.js'),
  'Contact script must be bundled',
);
assert(
  !contact.includes("console.log('[contact]"),
  'No debug text in contact HTML',
);
assert(!existsSync('dist/api/contact'), 'The contact API belongs on Railway');
assert.equal(readFileSync('dist/CNAME', 'utf8').trim(), 'redbrixen.com');
assert(existsSync('dist/.nojekyll'));
assert(existsSync('dist/sitemap.xml'));
console.log(
  'Built pages: navigation, local assets, indexing, headings, and size checks passed.',
);
