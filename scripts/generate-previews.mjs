/**
 * Generates LinkedIn/rich-link preview images (1200x630 PNG) for each
 * article and writeup slug.
 *
 * Output: public/images/previews/<slug>.png
 *
 * Run with: `npm run previews` (or `node scripts/generate-previews.mjs`).
 * Re-run whenever a title/date changes to regenerate the PNGs.
 */
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const OUT_DIR = join(ROOT, 'public', 'images', 'previews');

// Site color tokens (mirrors src/styles/global.css).
const BG = '#17191a';
const ACCENT = '#e96b53';
const TEXT = '#f0eee7';
const MUTED = '#adb0ab';
const LINE = '#393c3b';

const W = 1200;
const H = 630;
const MARGIN = 80;

const manrope = readFile(
  '@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2',
);
const ibmPlex = readFile(
  '@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2',
);

const FONT_CSS = `
@font-face {
  font-family: 'Manrope';
  src: url('data:font/woff2;base64,${manrope}') format('woff2');
  font-weight: 100 900;
  font-style: normal;
}
@font-face {
  font-family: 'PlexMono';
  src: url('data:font/woff2;base64,${ibmPlex}') format('woff2');
  font-weight: 400;
  font-style: normal;
}
`;

/** Per-slug source data. Titles/dates mirror src/content/*.md frontmatter. */
const ITEMS = [
  {
    slug: 'cisco-ise-cve-2026-76460',
    eyebrow: 'SECURITY + ENGINEERING',
    title:
      'Cisco ISE CVE-2026-76460: When an Authentication Bypass Reaches the Identity Control Plane',
    platform: 'Cisco ISE',
    date: '2026-09-17',
    alt: 'Red Brixen Security article preview: Cisco ISE authentication bypass reaches the identity control plane',
  },
  {
    slug: 'cisco-secure-email-cve-2026-76461',
    eyebrow: 'SECURITY + ENGINEERING',
    title:
      'CVE-2026-76461: When the Email Security Gateway Becomes the Initial Access Vector',
    platform: 'Cisco Secure Email',
    date: '2026-09-15',
    alt: 'Red Brixen Security article preview: an email security gateway SQL injection as an initial access vector',
  },
  {
    slug: 'edge-infrastructure-exploitation-2026',
    eyebrow: 'SECURITY + ENGINEERING',
    title: 'The Edge Is Becoming the New Endpoint',
    platform: 'Edge Security',
    date: '2026-09-23',
    alt: 'Red Brixen Security article preview: edge infrastructure becoming the new attack endpoint',
  },
  {
    slug: 'f5-big-ip-apm-cve-2026-94127',
    eyebrow: 'SECURITY + ENGINEERING',
    title: 'CVE-2026-94127: Memory Corruption at the Access Boundary',
    platform: 'F5 BIG-IP',
    date: '2026-09-23',
    alt: 'Red Brixen Security article preview: F5 BIG-IP APM memory corruption heap overflow',
  },
  {
    slug: 'mikrotik-routeros-mikrotrick-2026',
    eyebrow: 'SECURITY + ENGINEERING',
    title:
      "MikroTrick and RouterOS: Why the Router Is Becoming an Attacker's Foothold",
    platform: 'MikroTik',
    date: '2026-09-06',
    alt: 'Red Brixen Security article preview: MikroTik RouterOS attacks via MikroTrick',
  },
  {
    slug: 'mock-example-writeup',
    eyebrow: 'LAB WRITEUP',
    title: 'MockBox HTB — From Unvalidated Redirect to Shell and Beyond',
    platform: 'Hack The Box',
    date: '2026-09-28',
    alt: 'Red Brixen Security writeup preview: MockBox HTB lab walkthrough from redirect to privilege escalation',
  },
];

function readFile(rel) {
  return readFileBase(join(ROOT, 'node_modules', rel)).toString('base64');
}

async function readFileBase(file) {
  const { readFileSync } = await import('node:fs');
  return readFileSync(file);
}

function escapeXml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function formatDate(input) {
  const d = new Date(input);
  const m = new Intl.DateTimeFormat('en', { month: 'short' }).format(d);
  return `${m} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

function wrapWords(text, maxChars) {
  const words = text.split(' ');
  const lines = [];
  let current = '';
  for (const word of words) {
    if (!current) {
      current = word;
    } else if ((current + ' ' + word).length <= maxChars) {
      current += ' ' + word;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines.length === 0 ? [''] : lines;
}

function buildSvg(item) {
  const { eyebrow, title, platform, date } = item;
  const maxChars = 38;
  let lines = wrapWords(title, maxChars);
  let fontSize = lines.length > 2 ? 46 : 50;
  // Recompute wrap with a tighter limit if still too many lines at small size.
  if (lines.length > 3) {
    lines = wrapWords(title, 32);
    fontSize = 44;
  }
  const capped = lines.slice(0, 3);
  const lineHeight = fontSize * 1.1;
  const blockHeight = (capped.length - 1) * lineHeight;
  const baseY = 290 - blockHeight / 2;
  const ruleY = baseY - 32;

  const tspans = capped
    .map(
      (line, i) =>
        `    <tspan x="${W / 2}" dy="${i === 0 ? 0 : lineHeight}">${escapeXml(line)}</tspan>`,
    )
    .join('\n');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<style>${FONT_CSS}</style>
<defs>
  <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse" opacity="0.18">
    <circle cx="15" cy="15" r="1" fill="${LINE}" />
  </pattern>
</defs>
<rect width="${W}" height="${H}" fill="${BG}" />
<rect width="${W}" height="${H}" fill="url(#grid)" />
<rect x="0" y="0" width="6" height="${H}" fill="${ACCENT}" />
<g font-family="PlexMono, 'DejaVu Sans Mono', monospace" font-size="10" fill="${MUTED}" letter-spacing="0.07em" text-transform="uppercase">
  <circle cx="62" cy="62" r="3" fill="${ACCENT}" />
  <text x="76" y="66">${escapeXml(eyebrow)}</text>
  <text x="${W - MARGIN}" y="66" text-anchor="end">${escapeXml(formatDate(date))}</text>
</g>
<rect x="${W / 2 - 60}" y="${ruleY}" width="120" height="3" fill="${ACCENT}" />
<text x="${W / 2}" y="${baseY}" text-anchor="middle" font-family="'Manrope', Cantarell, sans-serif" font-weight="700" font-size="${fontSize}" fill="${TEXT}" letter-spacing="-0.02em">${tspans}</text>
<g font-family="PlexMono, 'DejaVu Sans Mono', monospace" font-size="11" fill="${MUTED}" letter-spacing="0.07em">
  <text x="${MARGIN}" y="${H - 30}">RED BRIXEN / SECURITY</text>
  <text x="${W - MARGIN}" y="${H - 30}" text-anchor="end">${escapeXml(platform)} · ${escapeXml(formatDate(date))}</text>
</g>
</svg>`;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  for (const item of ITEMS) {
    const svg = buildSvg(item);
    const png = await sharp(Buffer.from(svg))
      .resize(W, H)
      .png({ quality: 90, compressionLevel: 9 })
      .toBuffer();
    const file = join(OUT_DIR, `${item.slug}.png`);
    await writeFile(file, png);
    const url = `/images/previews/${item.slug}.png`;
    console.log(`${url}\t${item.alt}`);
  }
  console.log(`\nGenerated ${ITEMS.length} preview images in ${OUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
