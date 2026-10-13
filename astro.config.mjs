import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { fileURLToPath } from 'node:url';
import { REDIRECTS } from './src/config/redirects.mjs';
import { previewRoutes, excludePreviewsFromSitemap } from './src/config/preview-routes.mjs';

export default defineConfig({
  site: 'https://www.asklily.health',
  // Retired v1 pages. Astro emits meta-refresh stubs in dist/ (checked by scripts/check-pages.mjs).
  // Real HTTP 301s come from the host: see scripts/host-redirects.mjs.
  redirects: REDIRECTS,
  integrations: [
    react(),
    sitemap({ filter: excludePreviewsFromSitemap }),
    previewRoutes({ root: fileURLToPath(new URL('.', import.meta.url)) }),
  ],
  vite: {
    css: {
      transformer: 'lightningcss',
    },
  },
});
