// Retired v1 pages and where they went. Single source for:
//   * astro.config.mjs (static build: Astro can only emit meta-refresh stubs, served as HTTP 200)
//   * scripts/host-redirects.mjs (the same list as nginx 301 rules, so crawlers and link
//     checkers see a permanent redirect at the host)
export const REDIRECTS = {
  '/how': '/how-it-works',
  '/members': '/graduates',
  '/practitioners': '/supervisors',
  '/organizations': '/programs',
};
