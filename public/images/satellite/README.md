# Bundled satellite imagery

These files are regular local project assets. Next.js serves them at `/images/satellite/<filename>` without an image proxy, signed URL, external fetch, or special `images.remotePatterns` configuration.

- `kochi-satellite.jpg`: original coastal reference used by the existing flood demonstration.
- `forest-satellite.jpg`: original forest/agricultural reference.
- `urban-satellite.jpg`: original urban/infrastructure reference.
- `fallback.jpg`: clearly labeled local satellite fallback.
- `fallback.svg`: self-contained last-resort placeholder if JPEG loading fails.

Before, during, after, and recovery views continue to use these references with the existing simulated masks and visual treatments. They are not verified multi-date satellite acquisitions.

Reference basemaps: © Esri, Maxar, Earthstar Geographics. Keep source attribution in the UI and reports.

For ZIP portability, exact file contents also have text backups in `assets/satellite-demo.json`. They are automatically checked/restored when Next.js starts. No Arena access is needed.
