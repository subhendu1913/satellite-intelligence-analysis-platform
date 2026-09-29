import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createServer } from 'node:net';
import { mkdtemp, mkdir, rm, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { verifyLocalImages } from './verify-local-images.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const artifacts = resolve(root, 'artifacts/local-images');
await mkdir(artifacts, { recursive: true });
// Never stop or displace an existing localhost service to run this check.
await new Promise((resolvePort, reject) => { const server = createServer(); server.once('error', reject); server.listen(3000, '127.0.0.1', () => server.close(resolvePort)); });
const temporary = await mkdtemp(resolve(tmpdir(), 'orbital-local-zip-'));
const extracted = resolve(temporary, 'project');
let dev;
let serverLog = '';
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const env = { ...process.env, NEXT_TELEMETRY_DISABLED: '1' };
delete env.DATABASE_URL;
for (const key of Object.keys(env)) if (key.startsWith('ARENA_')) delete env[key];

function run(command, args, options = {}) {
 return new Promise((resolveCommand, reject) => {
  const child = spawn(command, args, { cwd: extracted, env, ...options, stdio: ['ignore', 'pipe', 'pipe'] });
  let log = ''; child.stdout.on('data', chunk => { log += chunk; }); child.stderr.on('data', chunk => { log += chunk; });
  child.on('error', reject); child.on('exit', code => code === 0 ? resolveCommand(log) : reject(new Error(`${command} failed (${code}):\n${log}`)));
 });
}
try {
 // Include source, actual public JPEGs, and text backups. Exclude installed
 // dependencies, caches, platform state, .env secrets, and generated test output.
 const zipScript = `import sys, zipfile\nfrom pathlib import Path\nroot, archive, extracted = map(Path, sys.argv[1:])\nexcluded = {'node_modules','.next','.git','artifacts','.vercel'}\nwith zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED) as bundle:\n for path in root.rglob('*'):\n  if not path.is_file(): continue\n  rel = path.relative_to(root)\n  if any(part in excluded for part in rel.parts) or path.name.startswith('.env') or path.name.endswith('.tsbuildinfo'): continue\n  bundle.write(path, rel.as_posix())\nwith zipfile.ZipFile(archive) as bundle:\n required = ['kochi-satellite.jpg','forest-satellite.jpg','urban-satellite.jpg','fallback.jpg','fallback.svg']\n assert all('public/images/satellite/' + name in bundle.namelist() for name in required), 'Missing image in ZIP'\n assert 'assets/satellite-demo.json' in bundle.namelist(), 'Missing offline backup'\n bundle.extractall(extracted)\nprint('PASS: clean source ZIP contains all satellite assets and offline backups')\n`;
 console.log(await run('python3', ['-c', zipScript, root, resolve(artifacts, 'orbital-local-verification.zip'), extracted], { cwd: root }));
 await rm(resolve(extracted, 'public/images/satellite'), { recursive: true, force: true });
 const installLog = await run(npm, ['install', '--no-audit', '--no-fund']);
 await writeFile(resolve(artifacts, 'npm-install.log'), installLog);
 console.log('PASS: npm install in extracted ZIP with no node_modules, .next, .env, or satellite binary files');
 dev = spawn(npm, ['run', 'dev', '--', '--hostname', '127.0.0.1', '--port', '3000'], { cwd: extracted, env, detached: process.platform !== 'win32', stdio: ['ignore', 'pipe', 'pipe'] });
 dev.stdout.on('data', chunk => { serverLog += chunk; }); dev.stderr.on('data', chunk => { serverLog += chunk; });
 const started = Date.now();
 let healthy = false;
 while (Date.now() - started < 150000) {
  if (dev.exitCode !== null) throw new Error(`Local Next.js stopped unexpectedly:\n${serverLog}`);
  try { const response = await fetch('http://localhost:3000/api/health', { signal: AbortSignal.timeout(3000) }); if (response.ok && (await response.json()).ok) { healthy = true; break; } } catch { /* Waiting for first dev compilation. */ }
  await new Promise(resolveWait => setTimeout(resolveWait, 700));
 }
 if (!healthy) throw new Error(`Local dev server did not become ready:\n${serverLog}`);
 console.log('PASS: npm run dev starts at localhost:3000 and restores all missing satellite assets automatically');
 console.log(await run(process.execPath, ['scripts/verify-satellite-assets.mjs']));
 await verifyLocalImages({ baseURL: 'http://localhost:3000', artifactDirectory: artifacts });
 if (!serverLog.includes('Restored 5 local images')) throw new Error('The startup did not report restoring the five missing image files');
 // The emitted application bundle must reference public images, not ship Base64
 // backups in client JavaScript. The archive itself retains the offline backup.
 const manifest = JSON.parse(await readFile(resolve(extracted, 'assets/satellite-demo.json'), 'utf8'));
 if (manifest.assets.length !== 5) throw new Error('Unexpected number of bundled assets');
 console.log('CLEAN EXTRACTED ZIP VERIFIED: npm install + npm run dev, localhost:3000, no Arena or external image access');
} finally {
 await writeFile(resolve(artifacts, 'localhost-dev.log'), serverLog);
 if (dev && dev.exitCode === null) {
  const stopped = once(dev, 'exit').catch(() => {});
  try { if (process.platform !== 'win32') process.kill(-dev.pid, 'SIGTERM'); else dev.kill('SIGTERM'); } catch { /* Already stopped. */ }
  await Promise.race([stopped, new Promise(resolveWait => setTimeout(resolveWait, 4000))]);
  if (dev.exitCode === null) { try { if (process.platform !== 'win32') process.kill(-dev.pid, 'SIGKILL'); else dev.kill('SIGKILL'); } catch { /* Already stopped. */ } }
 }
 await rm(temporary, { recursive: true, force: true });
}
