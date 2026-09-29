import type { NextConfig } from 'next';
import { ensureSatelliteImages } from './scripts/ensure-satellite-images.mjs';

// Verify/restore bundled public images before Next.js discovers static assets.
// This is fully offline and runs with both `npm run dev` and `npm run build`.
ensureSatelliteImages();

const nextConfig: NextConfig = {};
export default nextConfig;
