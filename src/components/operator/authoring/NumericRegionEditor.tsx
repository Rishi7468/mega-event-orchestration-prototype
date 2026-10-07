"use client";

import { useState } from "react";
import { useEventAuthoringStore } from "@/store/eventAuthoringStore";
import { calculatePolygonAreaMeters, calculatePolygonPerimeterMeters } from "@/lib/spatial/measurement";
import { Sliders, Plus, Trash2, MapPin, Compass, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";

export function NumericRegionEditor() {
  const {
    regionMode,
    regionPolygon,
    boundingBox,
    circleRadiusMeters,
    setBoundingBox,
    setCircleRadius,
    updateVertex,
    addVertex,
    deleteVertex,
    centerCoordinates,
    setCenterCoordinates,
  } = useEventAuthoringStore();

  const [boxN, setBoxN] = useState<string>(boundingBox.north.toFixed(4));
  const [boxS, setBoxS] = useState<string>(boundingBox.south.toFixed(4));
  const [boxE, setBoxE] = useState<string>(boundingBox.east.toFixed(4));
  const [boxW, setBoxW] = useState<string>(boundingBox.west.toFixed(4));

  const [radiusInput, setRadiusInput] = useState<string>(circleRadiusMeters.toString());

  const areaKm2 = (calculatePolygonAreaMeters(regionPolygon) / 1000000).toFixed(2);
  const perimeterKm = (calculatePolygonPerimeterMeters(regionPolygon) / 1000).toFixed(2);

  const handleApplyBox = (e: React.FormEvent) => {
    e.preventDefault();
    const north = parseFloat(boxN);
    const south = parseFloat(boxS);
    const east = parseFloat(boxE);
    const west = parseFloat(boxW);

    if (!isNaN(north) && !isNaN(south) && !isNaN(east) && !isNaN(west)) {
      setBoundingBox({ north, south, east, west });
    }
  };

  const handleApplyRadius = (e: React.FormEvent) => {
    e.preventDefault();
    const r = parseFloat(radiusInput);
    if (!isNaN(r) && r > 0) {
      setCircleRadius(r);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm space-y-4 text-xs">
      <div className="flex items-center justify-between border-b border-border/60 pb-2">
        <h3 className="font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Sliders className="h-4 w-4 text-accent" /> NUMERIC REGION EDITOR
        </h3>
        <span className="font-mono text-[11px] font-bold text-accent uppercase bg-accent/10 px-2 py-0.5 rounded border border-accent/30">
          {regionMode.toUpperCase()} MODE
        </span>
      </div>

      {/* Calculated Spatial Metrics Badge */}
      <div className="grid grid-cols-3 gap-2 font-mono">
        <div className="rounded-xl border border-border bg-surface-muted/40 p-2 text-center">
          <span className="text-[10px] text-foreground-muted uppercase block">Calculated Area</span>
          <span className="text-xs font-bold text-accent">{areaKm2} km²</span>
        </div>
        <div className="rounded-xl border border-border bg-surface-muted/40 p-2 text-center">
          <span className="text-[10px] text-foreground-muted uppercase block">Perimeter</span>
          <span className="text-xs font-bold text-foreground">{perimeterKm} km</span>
        </div>
        <div className="rounded-xl border border-border bg-surface-muted/40 p-2 text-center">
          <span className="text-[10px] text-foreground-muted uppercase block">Vertices</span>
          <span className="text-xs font-bold text-foreground">{regionPolygon.length}</span>
        </div>
      </div>

      {/* RECTANGLE BOUNDING BOX NUMERIC EDITOR */}
      {regionMode === "rectangle" && (
        <form onSubmit={handleApplyBox} className="space-y-3">
          <span className="font-bold text-foreground block text-[11px] uppercase">
            Exact Bounding Box Coordinates (Degrees)
          </span>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold text-foreground-muted flex items-center gap-1 mb-1">
                <ArrowUp className="h-3 w-3 text-accent" /> NORTH (LAT)
              </label>
              <input
                type="text"
                value={boxN}
                onChange={(e) => setBoxN(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface-muted/60 px-2.5 py-1 font-mono text-xs font-bold text-foreground focus:border-accent"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-foreground-muted flex items-center gap-1 mb-1">
                <ArrowDown className="h-3 w-3 text-accent" /> SOUTH (LAT)
              </label>
              <input
                type="text"
                value={boxS}
                onChange={(e) => setBoxS(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface-muted/60 px-2.5 py-1 font-mono text-xs font-bold text-foreground focus:border-accent"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-foreground-muted flex items-center gap-1 mb-1">
                <ArrowRight className="h-3 w-3 text-accent" /> EAST (LNG)
              </label>
              <input
                type="text"
                value={boxE}
                onChange={(e) => setBoxE(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface-muted/60 px-2.5 py-1 font-mono text-xs font-bold text-foreground focus:border-accent"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-foreground-muted flex items-center gap-1 mb-1">
                <ArrowLeft className="h-3 w-3 text-accent" /> WEST (LNG)
              </label>
              <input
                type="text"
                value={boxW}
                onChange={(e) => setBoxW(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface-muted/60 px-2.5 py-1 font-mono text-xs font-bold text-foreground focus:border-accent"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-accent py-2 text-xs font-bold text-accent-foreground hover:bg-accent/90 transition-all shadow-xs"
          >
            [ UPDATE BOUNDING BOX ON MAP ]
          </button>
        </form>
      )}

      {/* CIRCLE RADIUS NUMERIC EDITOR */}
      {regionMode === "circle" && (
        <form onSubmit={handleApplyRadius} className="space-y-3">
          <span className="font-bold text-foreground block text-[11px] uppercase">
            Circle Radius & Center Geometry
          </span>

          <div className="space-y-2 font-mono">
            <div>
              <label className="text-[10px] font-bold text-foreground-muted block mb-1">
                Center Location Anchor
              </label>
              <span className="text-xs font-bold text-foreground block">
                {centerCoordinates[0].toFixed(4)}, {centerCoordinates[1].toFixed(4)}
              </span>
            </div>

            <div>
              <label className="text-[10px] font-bold text-foreground-muted block mb-1">
                Security Perimeter Radius (Meters)
              </label>
              <input
                type="text"
                value={radiusInput}
                onChange={(e) => setRadiusInput(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface-muted/60 px-2.5 py-1.5 font-mono text-xs font-bold text-foreground focus:border-accent"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-accent py-2 text-xs font-bold text-accent-foreground hover:bg-accent/90 transition-all shadow-xs"
          >
            [ UPDATE CIRCLE RADIUS ON MAP ]
          </button>
        </form>
      )}

      {/* POLYGON VERTEX INSPECTOR */}
      {regionMode === "polygon" && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-foreground text-[11px] uppercase">
              Polygon Vertices (Numeric Lat/Lng)
            </span>
            <button
              type="button"
              onClick={() => {
                const last = regionPolygon[regionPolygon.length - 1] ?? centerCoordinates;
                addVertex(regionPolygon.length - 1, last[0] + 0.001, last[1] + 0.001);
              }}
              className="flex items-center gap-1 rounded-lg border border-border bg-surface-muted px-2 py-0.5 text-[10px] font-bold text-foreground hover:bg-surface-muted/80"
            >
              <Plus className="h-3 w-3" /> Add Vertex
            </button>
          </div>

          {regionPolygon.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-3 text-center text-foreground-muted text-[11px]">
              No vertices drawn yet. Click map points or switch to Rectangle / Circle mode.
            </div>
          ) : (
            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 font-mono">
              {regionPolygon.map((pt, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-border/70 bg-surface-muted/40 p-2 flex items-center justify-between gap-2"
                >
                  <span className="font-bold text-accent text-[10px] w-12 shrink-0">
                    V-{String(idx + 1).padStart(2, "0")}
                  </span>
                  <div className="grid grid-cols-2 gap-1 flex-1">
                    <input
                      type="text"
                      value={pt[0].toFixed(4)}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val)) updateVertex(idx, val, pt[1]);
                      }}
                      className="rounded border border-border bg-surface px-1.5 py-0.5 text-[11px] text-foreground"
                    />
                    <input
                      type="text"
                      value={pt[1].toFixed(4)}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val)) updateVertex(idx, pt[0], val);
                      }}
                      className="rounded border border-border bg-surface px-1.5 py-0.5 text-[11px] text-foreground"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteVertex(idx)}
                    className="text-foreground-muted hover:text-red-400 p-0.5"
                    title="Delete Vertex"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
