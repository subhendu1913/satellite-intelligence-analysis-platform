import { chromium, expect } from '@playwright/test';
import { mkdir, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

export async function verifyLocalImages({ baseURL = process.env.TEST_BASE_URL || 'http://localhost:3000', artifactDirectory = resolve('artifacts/local-images') } = {}) {
 const origin = new URL(baseURL).origin;
 const manifest = JSON.parse(await readFile(new URL('../assets/satellite-demo.json', import.meta.url), 'utf8'));
 await mkdir(artifactDirectory, { recursive: true });
 const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
 const browserErrors = [];
 let activePage;
 try {
  for (const asset of manifest.assets) {
   const response = await fetch(`${origin}/images/satellite/${asset.file}`);
   if (!response.ok) throw new Error(`${asset.file}: HTTP ${response.status}`);
   const bytes = Buffer.from(await response.arrayBuffer());
   if (createHash('sha256').update(bytes).digest('hex') !== asset.sha256) throw new Error(`${asset.file}: localhost bytes differ from the bundled image`);
  }
  console.log('PASS: all five local satellite assets return the exact bundled bytes');
  const contexts = [];
  async function newPage({ failPrimary = false, failJpegFallback = false } = {}) {
   const context = await browser.newContext({ viewport: { width: 1440, height: 1050 }, serviceWorkers: 'block' }); contexts.push(context);
   await context.route('**/*', route => {
    const url = new URL(route.request().url());
    // Every request outside localhost is blocked, including real basemap tiles.
    if (url.origin !== origin) return route.abort('blockedbyclient');
    if (failPrimary && /\/images\/satellite\/(kochi|forest|urban)-satellite\.jpg$/.test(url.pathname)) return route.fulfill({ status: 404, contentType: 'text/plain', body: 'Simulated missing satellite image' });
    if (failJpegFallback && url.pathname === '/images/satellite/fallback.jpg') return route.fulfill({ status: 404, contentType: 'text/plain', body: 'Simulated missing JPEG fallback' });
    return route.continue();
   });
   const page = await context.newPage(); page.setDefaultTimeout(20000); page.setDefaultNavigationTimeout(120000);
   page.on('pageerror', error => browserErrors.push(error.message)); activePage = page;
   return page;
  }
  async function go(page, path) {
   await page.goto(`${origin}${path}`, { waitUntil: 'domcontentloaded' });
   await expect(page.locator('main:visible').first()).toBeVisible({ timeout: 60000 });
   if (!['/welcome', '/login', '/register'].includes(path)) await expect(page.locator('#workspace-content h1:visible').first()).toBeVisible({ timeout: 60000 });
  }
  async function loadedImages(page, { selector = 'img[data-satellite-image]', minimum = 1, fallback = false, expectedPath } = {}) {
   const images = page.locator(selector);
   await expect.poll(() => images.count()).toBeGreaterThanOrEqual(minimum);
   await expect.poll(() => images.evaluateAll(nodes => nodes.every(image => image.complete && image.naturalWidth > 100 && image.naturalHeight > 100))).toBe(true);
   const records = await images.evaluateAll(nodes => nodes.map(image => ({ src: image.currentSrc, fallback: image.dataset.imageFallback, width: image.naturalWidth })));
   for (const image of records) {
    const url = new URL(image.src);
    if (url.origin !== origin || !url.pathname.startsWith('/images/satellite/')) throw new Error(`Non-local image: ${image.src}`);
    if (expectedPath && url.pathname !== expectedPath) throw new Error(`Expected ${expectedPath}, received ${url.pathname}`);
    if ((image.fallback === 'true') !== fallback) throw new Error(`Unexpected fallback state for ${image.src}`);
   }
  }
  async function verifyBackground(page, selector, expectFallback = false) {
   const target = page.locator(selector).first(); await expect(target).toBeVisible();
   const css = await target.evaluate(element => getComputedStyle(element).backgroundImage);
   const urls = Array.from(css.matchAll(/url\(["']?([^"')]+)["']?\)/g), match => match[1]);
   const images = urls.filter(url => url.includes('/images/'));
   if (!images.length || !images.some(url => url.endsWith('/images/satellite/fallback.svg'))) throw new Error(`Missing local background fallback on ${selector}`);
   if (images.some(url => new URL(url).origin !== origin || !new URL(url).pathname.startsWith('/images/satellite/'))) throw new Error(`External image background on ${selector}`);
   const successes = await page.evaluate(async urls => Promise.all(urls.map(async src => { try { const image = new Image(); image.src = src; await image.decode(); return { src, loaded: image.naturalWidth > 0 }; } catch { return { src, loaded: false }; } })), images);
   if (!successes.some(image => image.loaded)) throw new Error(`All local backgrounds failed on ${selector}`);
   if (expectFallback && !successes.some(image => image.loaded && /\/fallback\.(jpg|svg)$/.test(image.src))) throw new Error('Background fallback did not decode');
  }
  async function downloadPDF(page, filename) {
   const pending = page.waitForEvent('download', { timeout: 60000 });
   await page.getByRole('button', { name: 'Download PDF', exact: true }).click();
   const download = await pending; const path = resolve(artifactDirectory, filename); await download.saveAs(path);
   const pdf = await readFile(path);
   if (pdf.toString('ascii', 0, 4) !== '%PDF' || !pdf.includes(Buffer.from('/Subtype /Image')) || pdf.length < 10000) throw new Error(`No embedded satellite imagery in ${filename}`);
   return pdf;
  }
  const page = await newPage();
  const catalog = await (await fetch(`${origin}/api/catalog`)).json();
  await go(page, '/temporal');
  for (const location of catalog.locations) {
   await page.getByLabel('Analysis location', { exact: true }).selectOption(location.id);
   await loadedImages(page, { selector: '.comparison-scenes img[data-satellite-image]', minimum: 3, expectedPath: location.image });
  }
  await page.getByLabel('Analysis location', { exact: true }).selectOption('kochi');
  for (const [stage, label] of [['before', 'Before event'], ['during', 'During event'], ['after', 'After event'], ['recovery', 'Recovery']]) {
   await page.locator('.observation-timeline').getByRole('button', { name: new RegExp(label) }).click();
   await expect(page.locator('.observation-focus .scene-visual')).toHaveAttribute('data-observation', stage);
   await loadedImages(page, { selector: '.observation-focus img[data-satellite-image]' });
  }
  await page.getByRole('button', { name: 'Swipe compare', exact: true }).click();
  await loadedImages(page, { selector: '.swipe-comparison img[data-satellite-image]', minimum: 2 });
  await page.screenshot({ path: resolve(artifactDirectory, 'local-temporal.png'), fullPage: true });
  console.log('PASS: every location and Before / During / After / Recovery / swipe view loads offline-local imagery');

  await go(page, '/search');
  while (await page.getByRole('button', { name: /Load more scenes/ }).count()) await page.getByRole('button', { name: /Load more scenes/ }).click();
  await loadedImages(page, { selector: '.scene-card img[data-satellite-image]', minimum: catalog.scenes.length });
  await page.locator('.scene-preview-trigger').first().click();
  await loadedImages(page, { selector: '.scene-preview-large img[data-satellite-image]' });
  await page.getByRole('button', { name: 'Close dialog' }).click();
  for (const path of ['/', '/missions', '/saved', '/history', '/changes', '/emergency']) { await go(page, path); await loadedImages(page); }
  console.log('PASS: semantic results, scene previews, dashboard, mission, saved, history, change and emergency images');

  await go(page, '/map?tab=imagery');
  await loadedImages(page, { selector: '.map-scene-item img[data-satellite-image]', minimum: 3 });
  await page.locator('.map-scene-item').first().click();
  await loadedImages(page, { selector: '.selected-map-scene img[data-satellite-image]' });
  await expect(page.locator('.leaflet-container')).toBeVisible();
  await verifyBackground(page, '.leaflet-container');
  await page.screenshot({ path: resolve(artifactDirectory, 'local-map-no-external-tiles.png'), fullPage: true });
  for (const [route, selector] of [['/welcome', '.landing-hero-image'], ['/login', '.auth-visual']]) { await go(page, route); await verifyBackground(page, selector); }
  await go(page, '/reports'); await page.locator('.report-card-cover').first().click();
  await loadedImages(page, { selector: '.report-document img[data-satellite-image]', minimum: 4 });
  const pdf = await downloadPDF(page, 'local-satellite-report.pdf');
  const kochi = manifest.assets.find(a => a.file === 'kochi-satellite.jpg');
  if (!pdf.includes(Buffer.from(kochi.base64, 'base64'))) throw new Error('Report PDF did not preserve the original local JPEG bytes');
  console.log('PASS: local map backgrounds, sign-in/landing backgrounds, report previews, and embedded PDF JPEGs without external requests');

  const jpegFallback = await newPage({ failPrimary: true });
  for (const path of ['/temporal', '/search', '/missions', '/saved', '/history']) {
   await go(jpegFallback, path);
   await loadedImages(jpegFallback, { fallback: true, expectedPath: '/images/satellite/fallback.jpg' });
  }
  await go(jpegFallback, '/map?tab=imagery'); await verifyBackground(jpegFallback, '.leaflet-container', true);
  await go(jpegFallback, '/reports'); await jpegFallback.locator('.report-card-cover').first().click();
  await loadedImages(jpegFallback, { selector: '.report-document img[data-satellite-image]', minimum: 4, fallback: true, expectedPath: '/images/satellite/fallback.jpg' });
  await downloadPDF(jpegFallback, 'jpeg-fallback-report.pdf');
  console.log('PASS: missing scene JPEGs fall back locally across cards, comparisons, maps and PDFs');

  const svgFallback = await newPage({ failPrimary: true, failJpegFallback: true });
  await go(svgFallback, '/temporal');
  await loadedImages(svgFallback, { minimum: 3, fallback: true, expectedPath: '/images/satellite/fallback.svg' });
  await go(svgFallback, '/missions'); await loadedImages(svgFallback, { fallback: true, expectedPath: '/images/satellite/fallback.svg' });
  await go(svgFallback, '/reports'); await svgFallback.locator('.report-card-cover').first().click();
  await loadedImages(svgFallback, { selector: '.report-document img[data-satellite-image]', minimum: 4, fallback: true, expectedPath: '/images/satellite/fallback.svg' });
  await downloadPDF(svgFallback, 'svg-fallback-report.pdf');
  console.log('PASS: final SVG fallback displays and exports correctly when every JPEG request fails');
  if (browserErrors.length) throw new Error(`Browser exceptions: ${[...new Set(browserErrors)].join(' | ')}`);
  for (const context of contexts) await context.close();
  console.log('ALL LOCAL IMAGE PORTABILITY TESTS PASSED');
 } catch (error) {
  if (activePage && !activePage.isClosed()) await activePage.screenshot({ path: resolve(artifactDirectory, 'failure.png'), fullPage: true }).catch(() => {});
  throw error;
 } finally { await browser.close(); }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
 await verifyLocalImages().catch(error => { console.error(error); process.exitCode = 1; });
}
