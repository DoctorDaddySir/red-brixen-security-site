import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  output: 'static',
  trailingSlash: 'always',
  site: 'https://redbrixen.com',
  base: '/',
  redirects: {
    '/research/cisco-ise-cve-2026-76460/':
      '/articles/cisco-ise-cve-2026-76460/',
    '/research/cisco-secure-email-cve-2026-76461/':
      '/articles/cisco-secure-email-cve-2026-76461/',
    '/research/f5-big-ip-apm-cve-2026-94127/':
      '/articles/f5-big-ip-apm-cve-2026-94127/',
    '/research/mikrotik-routeros-mikrotrick-2026/':
      '/articles/mikrotik-routeros-mikrotrick-2026/',
    '/research/edge-infrastructure-exploitation-2026/':
      '/articles/edge-infrastructure-exploitation-2026/',
  },
  vite: { plugins: [tailwindcss()] },
});
