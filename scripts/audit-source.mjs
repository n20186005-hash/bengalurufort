import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('../', import.meta.url).pathname;
const ignored = new Set(['node_modules', 'dist', '.git']);
const forbidden = ['https://example' + '.com', 'http://example' + '.com', 'local' + 'host', 'chrome-' + 'extension://'];
const errors = [];

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    if (ignored.has(name)) return [];
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}
for (const file of walk(root)) {
  if (!/\.(astro|ts|js|mjs|json|jsonc|md|txt|css|svg)$/.test(file)) continue;
  const text = readFileSync(file, 'utf8');
  for (const token of forbidden) if (text.includes(token)) errors.push(`${token} found in ${file.replace(root, '')}`);
}
const workspace = join(root, 'pnpm-workspace.yaml');
if (existsSync(workspace)) {
  const text = readFileSync(workspace, 'utf8');
  if (!/packages:\s*\n\s*-\s*['\"]?\.['\"]?/m.test(text)) errors.push('pnpm-workspace.yaml exists without packages: [\'.\']');
}
if (errors.length) {
  console.error(errors.map((e) => `- ${e}`).join('\n'));
  process.exit(1);
}
console.log('source audit passed');
