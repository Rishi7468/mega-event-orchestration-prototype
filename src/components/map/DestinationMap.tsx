"use client";

import dynamic from "next/dynamic";
import type { GeoMapProps } from "./GeoMap";

/**
 * Leaflet measures and mutates real DOM, so it cannot run during server
 * rendering. Loading it client-side only keeps the pages themselves free of
 * that concern, and keeps the mapping code out of the first paint of screens
 * that never show a map.
 *
 * The placeholder is given the same height as the map, so nothing shifts when
 * the real map arrives.
 */
const GeoMap = dynamic(() => import("./GeoMap"), { ssr: false });

export function DestinationMap(props: GeoMapProps) {
  // Reserving the height up front means the surrounding card never resizes
  // when the map chunk finishes loading.
  return (
    <div style={{ minHeight: props.height }} className="bg-surface-muted">
      <GeoMap {...props} />
    </div>
  );
}
