// Astro ignores underscore-prefixed files under src/pages, so the design-system preview
// is mounted explicitly. Underscore keeps it out of navigation; the sitemap filter and
// the page's noindex meta keep it out of search.
export const KIT_PATTERN = '/_v2-kit';

/** @returns {import('astro').AstroIntegration} */
export function v2KitRoute() {
  return {
    name: 'lily-v2-kit-route',
    hooks: {
      'astro:config:setup': ({ injectRoute }) => {
        injectRoute({ pattern: KIT_PATTERN, entrypoint: './src/pages/_v2-kit.astro' });
      },
    },
  };
}

/** Sitemap filter: keep the kit out of sitemap-*.xml. */
export const excludeKitFromSitemap = (page) => !page.includes('_v2-kit');
