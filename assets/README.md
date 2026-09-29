# Offline satellite image bundle

`public/images/satellite/` contains the actual images served by Next.js. Keep that directory in source archives and deployments.

`satellite-demo.json` is a text-only backup of exactly those files, with their byte lengths, dimensions, MIME types, SHA-256 hashes, and Base64-encoded contents. It exists because some project/ZIP exporters omit binary assets while retaining source text.

`next.config.ts` calls `scripts/ensure-satellite-images.mjs` before Next.js discovers public files. Missing or corrupted images are restored from this bundle automatically during `npm run dev` and `npm run build`. Valid images are never rewritten. Restoration uses only Node built-ins and does not download anything, depend on Arena, or require an API key or database. The backup is not imported into client components or sent in the browser JavaScript bundle.

Manual verification/repair: `node scripts/ensure-satellite-images.mjs`.

Catalog/source audit: `node scripts/verify-satellite-assets.mjs`.

If replacing demo imagery, update both the files and their backup entries (Base64 payload, SHA-256 hash, and byte length). The integrity check intentionally restores files that do not match this committed bundle.

Reference imagery attribution: Esri World Imagery, Maxar, Earthstar Geographics. Dates, source metadata, and detection overlays remain simulated. The fallback JPEG is a labeled, resized reference; `fallback.svg` is a local placeholder, not satellite evidence.
