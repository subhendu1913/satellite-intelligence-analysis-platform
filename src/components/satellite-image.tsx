'use client';
import { useState, type ImgHTMLAttributes } from 'react';
import { satelliteImageCandidates, satelliteImagePath } from '@/lib/satellite-assets';

type SatelliteImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'onError' | 'alt'> & { src?: string | null; alt: string };

function LocalSatelliteImage({ source, alt, ...props }: Omit<SatelliteImageProps, 'src'> & { source: string }) {
 const candidates = satelliteImageCandidates(source);
 const [attempt, setAttempt] = useState(0);
 const isFallback = attempt > 0 || source.endsWith('/fallback.jpg') || source.endsWith('/fallback.svg');
 return <img {...props} src={candidates[attempt]} alt={isFallback ? `${alt}. Local fallback reference; the original preview is unavailable.` : alt} decoding="async" data-satellite-image="true" data-image-fallback={isFallback ? 'true' : 'false'} onError={() => setAttempt(previous => Math.min(previous + 1, candidates.length - 1))}/>;
}

/** Native img uses Next.js public files directly; no remote optimizer configuration is needed. */
export function SatelliteImage({ src, ...props }: SatelliteImageProps) {
 const source = satelliteImagePath(src);
 // A changed location starts a new load instead of retaining another scene's failure state.
 return <LocalSatelliteImage key={source} {...props} source={source}/>;
}
