import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://lilycare.co',
  integrations: [react(), sitemap()],
  vite: {
    css: {
      transformer: 'lightningcss',
    },
  },
});
