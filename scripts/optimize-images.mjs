// Compress the four local hero/gallery JPEGs with sharp.
// Rules (keep aspect ratio, no upscaling, EXIF rotation respected):
//   courtyard / arch   -> max width 1600, mozjpeg q80
//   panorama           -> max width 1920, mozjpeg q80
//   spiked-gate        -> keep 958 wide,  mozjpeg q78
// Optimized files replace the originals in public/images/. Safe to re-run.
// NOTE: sharp reads/writes through Buffers only (native file opens may be
// blocked in sandboxed shells).
import { readFile, writeFile, mkdir, stat, rm } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// Resolve sharp: prefer a local install, then well-known sibling node_modules.
async function loadSharp() {
  const candidates = [
    new URL('../node_modules/sharp/lib/index.js', import.meta.url),
    new URL('../../mokotowskiepark/node_modules/sharp/lib/index.js', import.meta.url)
  ];
  for (const url of candidates) {
    try {
      const mod = await import(url.href);
      if (typeof mod?.default === 'function') return mod.default;
    } catch {
      /* try next */
    }
  }
  throw new Error('sharp not found. Run: pnpm add -D sharp');
}

const here = dirname(fileURLToPath(import.meta.url));
const imagesDir = join(here, '..', 'public', 'images');
const rules = [
  { file: 'bengaluru-fort-courtyard.jpg', width: 1600, quality: 80 },
  { file: 'bengaluru-fort-arch.jpg', width: 1600, quality: 80 },
  { file: 'bengaluru-fort-panorama.jpg', width: 1920, quality: 80 },
  { file: 'bengaluru-fort-spiked-gate.jpg', width: 958, quality: 78 }
];

const sharp = await loadSharp();
const tmpDir = join(here, '..', '.image-opt');
await mkdir(tmpDir, { recursive: true });

const report = [];
for (const rule of rules) {
  const src = join(imagesDir, rule.file);
  const tmp = join(tmpDir, rule.file);
  const before = (await stat(src)).size;
  try {
    const input = await readFile(src);
    const out = await sharp(input)
      .rotate()
      .resize({ width: rule.width, withoutEnlargement: true })
      .jpeg({ quality: rule.quality, mozjpeg: true, progressive: true })
      .toBuffer();
    const after = out.length;
    if (after < 20000) throw new Error(`result too small (${after} bytes)`);
    if (after > before) throw new Error('result not smaller');
    // swap optimized file over the original
    await writeFile(tmp, out);
    await writeFile(src, out);
    report.push(`${rule.file}: ${(before / 1024 / 1024).toFixed(2)} MB -> ${(after / 1024 / 1024).toFixed(2)} MB (-${Math.round((1 - after / before) * 100)}%)`);
  } catch (e) {
    report.push(`${rule.file}: FAILED ${e.message}`);
  }
}
for (const line of report) console.log(line);
try {
  await rm(tmpDir, { recursive: true, force: true });
} catch {}
console.log('done');
