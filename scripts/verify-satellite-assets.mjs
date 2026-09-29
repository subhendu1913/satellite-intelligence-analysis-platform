import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const errors = [];
const manifest = JSON.parse(readFileSync(resolve(root, 'assets/satellite-demo.json'), 'utf8'));
for (const asset of manifest.assets) {
 const path = resolve(root, 'public/images/satellite', asset.file);
 if (!existsSync(path)) { errors.push(`Missing public image: ${asset.file}`); continue; }
 const bytes = readFileSync(path);
 if (bytes.length !== asset.bytes || createHash('sha256').update(bytes).digest('hex') !== asset.sha256) errors.push(`Image checksum mismatch: ${asset.file}`);
 if (!Buffer.from(asset.base64, 'base64').equals(bytes)) errors.push(`Offline backup differs from ${asset.file}`);
 if (asset.file.endsWith('.jpg') && (bytes[0] !== 255 || bytes[1] !== 216 || bytes[2] !== 255)) errors.push(`Invalid JPEG header: ${asset.file}`);
}
let references = 0;
for (const file of ['locations.json', 'satelliteScenes.json']) {
 const records = JSON.parse(readFileSync(resolve(root, 'src/data', file), 'utf8'));
 for (const record of records) {
  if (typeof record.image !== 'string' || !/^\/images\/satellite\/[a-z0-9-]+\.(jpg|svg)$/.test(record.image)) errors.push(`Nonportable image reference in ${file}: ${record.id}`);
  else if (!existsSync(resolve(root, 'public', record.image.slice(1)))) errors.push(`Missing catalog image: ${record.image}`);
  references += 1;
 }
}
function inspect(directory) {
 for (const name of readdirSync(directory)) {
  const file = resolve(directory, name);
  if (statSync(file).isDirectory()) { inspect(file); continue; }
  if (!/\.(tsx?|css|json)$/.test(file)) continue;
  const text = readFileSync(file, 'utf8');
  if (/\/images\/(?:kochi|forest|urban)-satellite\.jpg/.test(text)) errors.push(`Obsolete satellite image path: ${file}`);
  for (const match of text.matchAll(/url\(['"]?(\/images\/[^'"\s)]+)['"]?\)/g)) {
   if (!existsSync(resolve(root, 'public', match[1].slice(1)))) errors.push(`Missing CSS/background image: ${match[1]}`);
  }
  if (/<img\b/.test(text) && !file.endsWith('satellite-image.tsx')) errors.push(`Satellite image bypasses the shared local fallback: ${file}`);
  if (/https?:\/\/[^\s'"<>]*(?:e2b\.app|arena[^/]*\.|blob\.core)[^\s'"<>]*\.(?:jpg|jpeg|png|webp)/i.test(text)) errors.push(`Preview-only image URL: ${file}`);
 }
}
inspect(resolve(root, 'src'));
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else console.log(`PASS: ${manifest.assets.length} bundled images, ${references} catalog image references, CSS backgrounds, shared renderer, and offline checksums are portable.`);
