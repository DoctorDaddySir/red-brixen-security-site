import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  output: 'static',
  trailingSlash: 'always',
  site: 'https://redbrixen.com',
  base: '/',
  vite: { plugins: [tailwindcss()] },
});
