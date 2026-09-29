'use client';
import dynamic from 'next/dynamic';
import type { Change, GeoLocation } from '@/lib/types';
export type MapViewProps = { location: GeoLocation; changes?: Change[]; onLocationChange?: (location: GeoLocation) => void; onChangeSelect?: (change: Change) => void; focusChange?: Change | null; onAreaChange?: (aoi: [number, number][]) => void; aoi?: [number, number][]; className?: string; expanded?: boolean; observationStage?: string; onStageChange?: (stage: string) => void };
const LeafletMap = dynamic(() => import('./leaflet-map'), { ssr: false, loading: () => <div className="map-loading" role="status"><div className="map-loading-label"><span className="loading-dot"/>Preparing satellite map…</div></div> });
export function MapView(props: MapViewProps) { return <LeafletMap {...props}/>; }
