/** Portable, same-origin satellite image paths. Never request preview or blob URLs. */
export const SATELLITE_IMAGE_DIRECTORY = '/images/satellite/';
export const SATELLITE_FALLBACK_IMAGE = `${SATELLITE_IMAGE_DIRECTORY}fallback.jpg`;
export const SATELLITE_PLACEHOLDER_IMAGE = `${SATELLITE_IMAGE_DIRECTORY}fallback.svg`;
const filenames = new Set(['kochi-satellite.jpg', 'forest-satellite.jpg', 'urban-satellite.jpg', 'fallback.jpg', 'fallback.svg']);

export function satelliteImagePath(source?: string | null): string {
 if (!source || /^(blob:|data:)/i.test(source)) return SATELLITE_FALLBACK_IMAGE;
 // Migrate older root-relative or preview-hosted references by their known
 // filename. Only bundled assets are ever used as an image source.
 let filename = source.trim().replace(/\\/g, '/').split(/[?#]/, 1)[0].split('/').pop() ?? '';
 try { filename = decodeURIComponent(filename).toLowerCase(); } catch { return SATELLITE_FALLBACK_IMAGE; }
 return filenames.has(filename) ? `${SATELLITE_IMAGE_DIRECTORY}${filename}` : SATELLITE_FALLBACK_IMAGE;
}

export function satelliteImageCandidates(source?: string | null): string[] {
 return Array.from(new Set([satelliteImagePath(source), SATELLITE_FALLBACK_IMAGE, SATELLITE_PLACEHOLDER_IMAGE]));
}

/** Opaque image layers fall through to the next local file on loading failure. */
export function satelliteBackgroundImage(source?: string | null): string {
 return satelliteImageCandidates(source).map(path => `url("${path}")`).join(', ');
}
