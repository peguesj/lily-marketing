// Prints the retired-page redirects as nginx rules (HTTP 301), for the host in front of
// the static build. Astro's static output can only emit meta-refresh stubs, which are served
// as HTTP 200, so the host must answer the real redirect.
//
//   node scripts/host-redirects.mjs            # print the rules
//   node scripts/host-redirects.mjs --check    # exit 1 when a redirect has no rule (CI)
//
// Paste the output into the site's server block (Plesk: Apache & nginx Settings, "Additional
// nginx directives").
import { fileURLToPath } from 'node:url';
import { REDIRECTS } from '../src/config/redirects.mjs';

/** One exact-match 301 rule per redirect, with and without a trailing slash. */
export function nginxRules(redirects = REDIRECTS) {
  return Object.entries(redirects)
    .map(([from, to]) => `location ~ ^${from}/?$ { return 301 ${to}; }`)
    .join('\n');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log(nginxRules());
}
