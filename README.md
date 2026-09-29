# Orbital — Satellite Intelligence

A responsive Next.js App Router prototype for semantic satellite retrieval and multi-temporal change analysis.

## Run locally

1. Install Node.js 20.9 or later.
2. Run `npm install`.
3. Run `npm run dev` and open `http://localhost:3000`.
4. For a production build, run `npm run build`.

### Downloaded ZIP: satellite images are self-contained

All required demo imagery is included in **`public/images/satellite/`** and served at root-relative paths such as **`/images/satellite/kochi-satellite.jpg`**. Keep the `public`, `assets`, and `scripts` directories when extracting or copying the project. No Arena hostname, image proxy, signed/temporary URL, satellite account, API key, or environment variable is required.

- Search results, scene previews, location cards, history, mission selection, temporal comparisons, change detection, emergency views, and reports all use these bundled references.
- Before / During / After / Recovery retain the existing demo masks and visual treatments over local images. They are illustrative, not genuine separate-date acquisitions.
- Images use ordinary `<img>` elements with a shared local JPEG fallback and a self-contained SVG fallback. No remote Next.js Image configuration is needed.
- Map reference backgrounds and landing/sign-in backgrounds also have local fallback layers. Live Esri / OpenStreetMap tiles remain an optional online enhancement; the bundled reference imagery still displays when those providers are unavailable.
- PDF reports embed the same local images and also use the fallback chain.

**ZIP safety:** `assets/satellite-demo.json` contains checksummed text backups of the imagery. Before Next.js starts, `next.config.ts` verifies all five files and restores any missing or corrupted asset from those backups. This happens automatically during `npm run dev` and `npm run build`, requires no network request, and does not add image payloads to client JavaScript.

To verify the files manually, run `node scripts/verify-satellite-assets.mjs`. To repair missing files manually, run `node scripts/ensure-satellite-images.mjs` (normally unnecessary).

The localhost verification suite is `node scripts/verify-local-images.mjs` after starting the app. It checks all catalog images, Before/During/After views, PDF export, blocked external providers, and forced JPEG failures. It uses the optional Playwright test dependency; install its browser first with `npx playwright install chromium` (Linux CI may need `--with-deps`). Ordinary app use does **not** require Playwright or a browser installation command.

## Deploy to Vercel

Import the repository into Vercel, choose the Next.js preset, and deploy. No database, API key, or environment variables are needed for the application. The unused database starter files can remain in place; runtime routes do not import them.

## Recommended two-minute demonstration

1. Open `/login`, select **Enter demo workspace**.
2. Select **Disaster Management**, then **Flood Analysis** and **Kochi**. Choose **Continue to dashboard**, then **New analysis → Configure analysis** (or use **Start analysis now** from mission selection).
3. Compare Before / During / After, select timeline dates to inspect individual observations, try the swipe slider, and select **WHAT CHANGED HERE?**.
4. Inspect a change region on the impact map, read the AI-Assisted Insight, and explore **Monitor recovery**.
5. Select **Generate emergency report**, view it, and download the PDF.
6. Switch to **Environment & Forest**, choose **Deforestation Analysis**, and repeat the analysis in the Amazon Basin.

The root route opens the demo dashboard immediately. `/welcome` is the public landing page. Other routes: `/organizations`, `/missions`, `/search`, `/map`, `/temporal`, `/emergency`, `/changes`, `/reports`, `/history`, `/saved`, `/settings`, `/register`.

## Architecture

`UI → shared data service / Next.js API routes → local JSON catalog`

- Catalog files: `src/data/*.json`.
- Types and adapter: `src/lib/types.ts` and `src/lib/data-service.ts`.
- APIs: `/api/catalog`, `/api/search`, `/api/analyze`, `/api/reports`, `/api/health`.
- Browser persistence: organization-scoped saved locations/scenes and generated analyses/reports.
- Mapping: Leaflet, OpenStreetMap street tiles, Esri World Imagery satellite tiles; cached illustrative imagery provides visual reference when tiles are unavailable.
- Export: three-page reports generated with jsPDF; CSV history and JSON workspace backup.

Replace the data-service adapter with authenticated APIs and PostgreSQL/PostGIS/pgvector in a production implementation. Replace local sign-in with a production identity provider and enforce tenant access on the server before storing confidential data.

## Important prototype limitations

**DEMO DATA / PROTOTYPE ANALYSIS.** All dates, satellite-source metadata, cloud percentages, detections, confidence values, and impact statistics are simulated. Static basemaps are illustrative and must not be treated as date-verified evidence; some locations share representative imagery. Change detection and AI-assisted text are deterministic demonstrations, not trained model inference. Search uses keyword/tag matching, not vector embeddings.

The map supports location/coordinate search, markers, demo change layers, before/during/after overlays, zooming, fullscreen, and a rectangular AOI selected with two map clicks. Selecting a custom AOI does not recompute the demonstration statistics.

Sign-in/registration uses browser-local demonstration accounts, not production authentication or organizational authorization. Do not use a real or reused password. All generated work remains in the current browser, and localStorage is not suitable for confidential intelligence. Back it up from Settings when needed.

**AI-assisted interpretation — verify with authoritative sources before operational decisions.** This platform demonstrates observation and impact assessment, not disaster prediction.

## Attribution

Satellite reference imagery: Esri World Imagery, Maxar, Earthstar Geographics. Street maps: © OpenStreetMap contributors. Fonts: Inter. Interface icons: Lucide. Source attribution remains visible on maps and reports.
