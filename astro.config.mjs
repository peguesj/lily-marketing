import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { v2KitRoute, excludeKitFromSitemap } from './src/components/v2/ui/kit-route.mjs';

export default defineConfig({
  site: 'https://lilycare.co',
  integrations: [react(), sitemap({ filter: excludeKitFromSitemap }), v2KitRoute()],
  vite: {
    css: {
      transformer: 'lightningcss',
    },
  },
});
