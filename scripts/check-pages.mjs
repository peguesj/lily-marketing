#!/usr/bin/env node
// Static page checker for the Lily v2 marketing site. Runs against the built dist/.
//
//   node scripts/check-pages.mjs                       # all 13 routes + redirects
//   node scripts/check-pages.mjs --only=/,/pricing     # only these routes (redirects always checked)
//   node scripts/check-pages.mjs --dist=path --app-url=https://app.example
//
// Rules (rule ids are what the unit tests assert on):
//   exists             route dist/<route>/index.html exists
//   h1                 exactly one <h1>
//   illustrative       visible text mentioning verif|licens|eligib|threshold|3,000 needs a
//                      [data-illustrative] element reading "Illustrative · pending validation"
//   app-url-allowlist  anchors to APP_URL may only use allowlisted paths
//   dead-href          no href="#" and no empty href
//   internal-link      internal anchors resolve to a known route, redirect or dist file
//   form-action        every <form> is method=post action=/api/submit
//   honeypot           every <form> has a hidden _h honeypot input
//   redirect           the 4 retired-page redirects are emitted

import { existsSync, readFileSync, statSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROUTES = [
  '/',
  '/supervisors',
  '/graduates',
  '/programs',
  '/how-it-works',
  '/pricing',
  '/research',
  '/trust',
  '/about',
  '/contact',
  '/waitlist',
  '/privacy',
  '/terms',
];

export const REDIRECTS = {
  '/how': '/how-it-works',
  '/members': '/graduates',
  '/practitioners': '/supervisors',
  '/organizations': '/programs',
};

export const DEFAULT_APP_URL = 'https://app.asklily.health';

// Mirrors appLinks in src/config/app.ts.
export const APP_PATH_ALLOWLIST = [
  '/app',
  '/app/sign-in',
  '/app/signup/supervisor',
  '/app/signup/graduate',
  '/beta/join',
];
const APP_SEARCH_ALLOWLIST = /^(\?audience=(sponsor|supervisor|graduate))?$/;

const ILLUSTRATIVE_TRIGGER = /verif|licens|eligib|threshold|3,000/i;
const ILLUSTRATIVE_TEXT = 'Illustrative · pending validation';

const ENTITIES = { '&middot;': '·', '&#183;': '·', '&#xb7;': '·', '&nbsp;': ' ', '&amp;': '&', '&#x27;': "'", '&#39;': "'", '&quot;': '"', '&lt;': '<', '&gt;': '>' };

function decode(s) {
  return s.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (m) => ENTITIES[m.toLowerCase()] ?? m);
}

export function visibleText(html) {
  const body = html.match(/<body[\s\S]*<\/body>/i)?.[0] ?? html;
  return decode(
    body
      .replace(/<(script|style|template|noscript)\b[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/<[^>]+>/g, ' '),
  )
    .replace(/\s+/g, ' ')
    .trim();
}

export function parseAttrs(tag) {
  const attrs = {};
  const re = /([^\s"'<>\/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  const inner = tag.replace(/^<[^\s>\/]+/, '').replace(/\/?>$/, '');
  let m;
  while ((m = re.exec(inner))) attrs[m[1].toLowerCase()] = decode(m[2] ?? m[3] ?? m[4] ?? '');
  return attrs;
}

function tags(html, name) {
  return [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, 'gi'))].map((m) => m[0]);
}

function routeFile(dist, route) {
  return route === '/' ? join(dist, 'index.html') : join(dist, route.replace(/^\//, ''), 'index.html');
}

function normalizePath(p) {
  return p.length > 1 ? p.replace(/\/+$/, '') : p;
}

export function checkPage(html, route, ctx) {
  const failures = [];
  const fail = (rule, message) => failures.push({ route, rule, message });
  const body = html.replace(/<head[\s\S]*?<\/head>/i, '');

  const h1s = (body.match(/<h1\b/gi) ?? []).length;
  if (h1s !== 1) fail('h1', `expected exactly one <h1>, found ${h1s}`);

  const text = visibleText(html);
  if (ILLUSTRATIVE_TRIGGER.test(text)) {
    const hasAttr = /\sdata-illustrative(\s|=|>)/i.test(body);
    if (!hasAttr || !text.includes(ILLUSTRATIVE_TEXT)) {
      fail('illustrative', `copy matches /verif|licens|eligib|threshold|3,000/i but page lacks a [data-illustrative] element reading "${ILLUSTRATIVE_TEXT}"`);
    }
  }

  const appOrigin = new URL(ctx.appUrl).origin;
  const known = new Set([...ROUTES, ...Object.keys(REDIRECTS)]);
  for (const tag of tags(body, 'a')) {
    const attrs = parseAttrs(tag);
    if (!('href' in attrs)) continue;
    const href = attrs.href.trim();
    if (href === '' || href === '#') {
      fail('dead-href', `anchor has ${href === '' ? 'an empty' : 'a bare "#"'} href: ${tag}`);
      continue;
    }
    if (/^(mailto:|tel:|javascript:)/i.test(href)) {
      if (/^javascript:/i.test(href)) fail('dead-href', `javascript: href: ${tag}`);
      continue;
    }
    let url;
    try {
      url = new URL(href, 'https://www.asklily.health' + (route === '/' ? '/' : route + '/'));
    } catch {
      fail('dead-href', `unparseable href "${href}"`);
      continue;
    }
    if (url.origin === appOrigin) {
      const path = normalizePath(url.pathname);
      if (!APP_PATH_ALLOWLIST.includes(path) || !APP_SEARCH_ALLOWLIST.test(url.search) || url.hash) {
        fail('app-url-allowlist', `APP_URL anchor not allowlisted: ${href}`);
      }
      continue;
    }
    if (url.origin !== 'https://www.asklily.health') continue; // external
    const path = normalizePath(url.pathname);
    if (/\.[a-z0-9]+$/i.test(path)) continue; // static asset
    if (!known.has(path) && !existsSync(routeFile(ctx.dist, path))) {
      fail('internal-link', `internal link to unknown page ${href}`);
    }
  }

  for (const tag of tags(body, 'form')) {
    const attrs = parseAttrs(tag);
    if (attrs.action !== '/api/submit' || (attrs.method ?? '').toLowerCase() !== 'post') {
      fail('form-action', `form must be method=post action=/api/submit: ${tag}`);
    }
  }
  const forms = [...body.matchAll(/<form\b[^>]*>[\s\S]*?<\/form>/gi)].map((m) => m[0]);
  for (const form of forms) {
    const honeypot = tags(form, 'input').some((t) => {
      const a = parseAttrs(t);
      return a.name === '_h' && (a.type ?? '').toLowerCase() === 'hidden';
    });
    if (!honeypot) fail('honeypot', 'form lacks <input type="hidden" name="_h">');
  }

  return failures;
}

export function checkRedirects(dist) {
  const failures = [];
  for (const [from, to] of Object.entries(REDIRECTS)) {
    const file = routeFile(dist, from);
    if (!existsSync(file)) {
      failures.push({ route: from, rule: 'redirect', message: `redirect ${from} -> ${to} not emitted (${file})` });
      continue;
    }
    const html = readFileSync(file, 'utf8');
    const target = html.match(/http-equiv=["']refresh["'][^>]*content=["'][^"']*url=([^"']+)["']/i)?.[1];
    if (!target || normalizePath(new URL(target, 'https://www.asklily.health').pathname) !== to) {
      failures.push({ route: from, rule: 'redirect', message: `redirect ${from} does not point at ${to} (refresh target: ${target ?? 'none'})` });
    }
  }
  return failures;
}

export function runChecks({ dist, only, appUrl = DEFAULT_APP_URL }) {
  const root = resolve(dist);
  const failures = [];
  const routes = only && only.length ? only : ROUTES;
  const checked = [];
  if (!existsSync(root) || !statSync(root).isDirectory()) {
    return { checked, failures: [{ route: '*', rule: 'exists', message: `dist directory not found: ${root} (run astro build first)` }] };
  }
  for (const route of routes) {
    const file = routeFile(root, route);
    if (!existsSync(file)) {
      failures.push({ route, rule: 'exists', message: `missing ${file}` });
      continue;
    }
    checked.push(route);
    failures.push(...checkPage(readFileSync(file, 'utf8'), route, { dist: root, appUrl }));
  }
  failures.push(...checkRedirects(root));
  return { checked, failures };
}

function main() {
  const args = process.argv.slice(2);
  const opt = (name) => args.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);
  const only = opt('only')?.split(',').map((s) => s.trim()).filter(Boolean);
  const here = dirname(fileURLToPath(import.meta.url));
  const dist = opt('dist') ?? join(here, '..', 'dist');
  const appUrl = opt('app-url') ?? process.env.PUBLIC_LILY_APP_URL ?? DEFAULT_APP_URL;
  const { checked, failures } = runChecks({ dist, only, appUrl });
  for (const r of checked) console.log(`checked ${r}`);
  if (failures.length) {
    for (const f of failures) console.error(`FAIL [${f.rule}] ${f.route}: ${f.message}`);
    console.error(`\n${failures.length} failure(s)`);
    process.exit(1);
  }
  console.log(`\ncheck-pages: ${checked.length} page(s) + ${Object.keys(REDIRECTS).length} redirects OK`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
