import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const defaultRoot = fileURLToPath(new URL('../', import.meta.url));
const files = ['kochi-satellite.jpg', 'forest-satellite.jpg', 'urban-satellite.jpg', 'fallback.jpg', 'fallback.svg'];
const digest = bytes => createHash('sha256').update(bytes).digest('hex');

/**
 * Run before Next.js discovers public assets. The ordinary JPEG files ship in
 * public/images/satellite, and this source-controlled text bundle repairs ZIPs
 * that dropped or corrupted binary files. No downloads, credentials, database,
 * Arena URL, or additional npm lifecycle command are used.
 */
export function ensureSatelliteImages(projectRoot = defaultRoot) {
 const manifestPath = resolve(projectRoot, 'assets/satellite-demo.json');
 if (!existsSync(manifestPath)) {
  throw new Error('The local satellite asset bundle is missing. Extract the complete project ZIP, including assets/satellite-demo.json.');
 }
 const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
 if (manifest.version !== 1 || !Array.isArray(manifest.assets)) throw new Error('Invalid local satellite asset bundle.');
 const restored = [];
 for (const name of files) {
  const asset = manifest.assets.find(entry => entry.file === name);
  if (!asset || typeof asset.base64 !== 'string' || typeof asset.sha256 !== 'string') throw new Error(`Missing bundled satellite image: ${name}`);
  const destination = resolve(projectRoot, 'public/images/satellite', name);
  const valid = existsSync(destination) && digest(readFileSync(destination)) === asset.sha256;
  if (valid) continue;
  const bytes = Buffer.from(asset.base64, 'base64');
  if (bytes.length !== asset.bytes || digest(bytes) !== asset.sha256) throw new Error(`Satellite image backup failed its checksum: ${name}`);
  if (name.endsWith('.jpg') && (bytes[0] !== 0xff || bytes[1] !== 0xd8 || bytes[2] !== 0xff)) throw new Error(`Satellite image is not a JPEG: ${name}`);
  mkdirSync(dirname(destination), { recursive: true });
  writeFileSync(destination, bytes);
  restored.push(name);
 }
 if (restored.length) console.info(`[satellite assets] Restored ${restored.length} local image${restored.length === 1 ? '' : 's'} from the bundled offline backup.`);
 return { checked: files.length, restored };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
 const result = ensureSatelliteImages();
 console.info(`[satellite assets] Verified ${result.checked} images in public/images/satellite/.`);
}
