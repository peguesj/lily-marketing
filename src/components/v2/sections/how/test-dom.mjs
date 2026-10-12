// Shared helpers for the /how-it-works and /pricing build-output tests.
// Not shipped: nothing imports this from src/pages. Builds the site (unless HP_SKIP_BUILD=1)
// and gives tiny parse5 helpers.
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'parse5';

export const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..', '..');
export const TAG = 'Illustrative · pending validation';

export function buildOnce() {
  if (process.env.HP_SKIP_BUILD === '1') return;
  const r = spawnSync('npx', ['astro', 'build'], { cwd: root, encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`astro build failed:\n${r.stdout}\n${r.stderr}`);
}

export function loadRoute(route) {
  const file = join(root, 'dist', route.replace(/^\//, ''), 'index.html');
  if (!existsSync(file)) throw new Error(`route ${route} not built (${file})`);
  return { file, html: readFileSync(file, 'utf8'), doc: parse(readFileSync(file, 'utf8')) };
}

export const attr = (n, name) => n.attrs?.find((a) => a.name === name)?.value;
export const hasAttr = (n, name) => !!n.attrs?.some((a) => a.name === name);
export const kids = (n) => n.childNodes ?? n.content?.childNodes ?? [];

export function walk(n, fn, parents = []) {
  if (n.nodeName && !n.nodeName.startsWith('#')) fn(n, parents);
  for (const c of kids(n)) walk(c, fn, [...parents, n]);
}

export function findAll(doc, pred) {
  const out = [];
  walk(doc, (n, p) => { if (pred(n, p)) out.push({ n, parents: p }); });
  return out;
}

export const byTag = (doc, tag) => findAll(doc, (n) => n.nodeName === tag).map((x) => x.n);

export function text(n) {
  if (n.nodeName === '#text') return n.value;
  if (['script', 'style', 'template'].includes(n.nodeName)) return '';
  return kids(n).map(text).join(' ');
}
export const flat = (n) => text(n).replace(/\s+/g, ' ').trim();

export function mainOf(doc) {
  const m = byTag(doc, 'main');
  return m[0];
}
