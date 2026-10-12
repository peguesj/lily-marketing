import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.asklily.health',
  // Retired v1 pages. Astro emits meta-refresh stubs in dist/ (checked by scripts/check-pages.mjs).
  redirects: {
    '/how': '/how-it-works',
    '/members': '/graduates',
    '/practitioners': '/supervisors',
    '/organizations': '/programs',
  },
  integrations: [react(), sitemap()],
  vite: {
    css: {
      transformer: 'lightningcss',
    },
  },
});
