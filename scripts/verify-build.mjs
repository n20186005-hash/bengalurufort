import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('../', import.meta.url);
const dist = new URL('../dist/', import.meta.url);
const requiredImages = [
  'bengaluru-fort-courtyard.jpg',
  'bengaluru-fort-panorama.jpg',
  'bengaluru-fort-arch.jpg',
  'bengaluru-fort-spiked-gate.jpg'
];

const errors = [];
for (const name of requiredImages) {
  const path = new URL(`../public/images/${name}`, import.meta.url);
  if (!existsSync(path)) {
    errors.push(`missing local photo: public/images/${name}`);
    continue;
  }
  const bytes = readFileSync(path);
  if (bytes.length < 20_000 || bytes[0] !== 0xff || bytes[1] !== 0xd8) {
    errors.push(`photo is not a credible JPEG asset: public/images/${name}`);
  }
}

if (!existsSync(dist)) errors.push('dist/ was not produced');

const forbidden = ['example' + '.com', 'local' + 'host', 'chrome-' + 'extension://'];
const textExt = new Set(['.html', '.xml', '.txt', '.js', '.css', '.json']);
function walk(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}
for (const file of walk(new URL('../dist/', import.meta.url).pathname)) {
  if (![...textExt].some((ext) => file.endsWith(ext))) continue;
  const text = readFileSync(file, 'utf8');
  for (const value of forbidden) if (text.includes(value)) errors.push(`${value} found in ${file}`);
}

const config = readFileSync(new URL('../astro.config.mjs', import.meta.url), 'utf8');
const siteMatch = config.match(/const SITE = '([^']*)'/);
const configuredSite = siteMatch?.[1] || '';
const sitemapFiles = walk(new URL('../dist/', import.meta.url).pathname).filter((p) => /sitemap.*\.xml$/.test(p));
if (!configuredSite && sitemapFiles.length) errors.push('sitemap exists although SITE is empty');
if (configuredSite) {
  for (const file of sitemapFiles) {
    const xml = readFileSync(file, 'utf8');
    if (/<lastmod>/i.test(xml)) errors.push(`invented lastmod must not be emitted: ${file}`);
    if (!xml.includes(configuredSite)) errors.push(`sitemap URL does not derive from SITE: ${file}`);
  }
}

if (errors.length) {
  console.error(errors.map((e) => `- ${e}`).join('\n'));
  process.exit(1);
}
console.log('build verification passed');
