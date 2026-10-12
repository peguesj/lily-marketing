// Internal design previews for the v2 site (UI kit, product mocks, forms).
//
// Astro never routes files whose name starts with "_" under src/pages, which is what keeps
// these previews out of normal routing. They are mounted explicitly here instead, at their
// underscore paths, and each page sets noindex. The sitemap filter keeps them out of
// sitemap-*.xml (noindex alone does not remove a URL from the sitemap).
//
// A preview is only injected when its source file exists, so each wave can land alone.
import { existsSync } from 'node:fs';
import { join } from 'node:path';

export const PREVIEW_PAGES = ['/_v2-kit', '/_v2-mocks', '/_v2-forms'].map((pattern) => ({
  pattern,
  entrypoint: `./src/pages${pattern}.astro`,
}));

/** @returns {import('astro').AstroIntegration} */
export function previewRoutes({ root = process.cwd() } = {}) {
  return {
    name: 'lily-v2-preview-routes',
    hooks: {
      'astro:config:setup': ({ injectRoute }) => {
        for (const page of PREVIEW_PAGES) {
          if (existsSync(join(root, page.entrypoint))) injectRoute(page);
        }
      },
    },
  };
}

/** @astrojs/sitemap filter: drop internal previews (with or without the underscore). */
export const excludePreviewsFromSitemap = (page) => !/\/_?v2-(kit|mocks|forms)(\/|$)/.test(page);
