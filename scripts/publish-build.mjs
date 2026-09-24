import { cpSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
// docs is exclusively generated Pages output; project documentation lives in project-docs.
mkdirSync('docs', { recursive: true });
for (const entry of readdirSync('docs'))
  rmSync(`docs/${entry}`, { recursive: true, force: true });
cpSync('dist', 'docs', { recursive: true });
writeFileSync('docs/.nojekyll', '');
console.log('Verified static build copied to docs for GitHub Pages.');
