"use client";

import { useEventAuthoringStore } from "@/store/eventAuthoringStore";
import { Trash2, Copy, RefreshCw, X, MapPin, Navigation, Layers, Paintbrush, Sparkles } from "lucide-react";

type ObjectInspectorPanelProps = {
  selectedObjectType: "asset" | "zone" | "route" | "paint" | "anchor" | "region" | null;
  selectedObjectId: string | null;
  onClose: () => void;
};

export function ObjectInspectorPanel({
  selectedObjectType,
  selectedObjectId,
  onClose,
}: ObjectInspectorPanelProps) {
  const {
    assets,
    zones,
    routes,
    paintedAreas,
    anchors,
    updateAsset,
    updateAssetPosition,
    duplicateAsset,
    deleteAsset,
    updateZone,
    updateZoneGeometry,
    splitZone,
    duplicateZone,
    toggleZoneLock,
    deleteZone,
    updateRoute,
    reverseRoute,
    deleteRoute,
    convertPaintToZone,
    deletePaintedArea,
    updateAnchor,
    deleteAnchor,
    removeAutoCameras,
    isSetCenterMode,
    toggleSetCenterMode,
    updateCircleCenter,
  } = useEventAuthoringStore();

  if (!selectedObjectType || !selectedObjectId) return null;

  const targetAsset = selectedObjectType === "asset" ? assets.find((a) => a.id === selectedObjectId) : null;
  const targetZone = selectedObjectType === "zone" ? zones.find((z) => z.id === selectedObjectId) : null;
  const targetRoute = selectedObjectType === "route" ? routes.find((r) => r.id === selectedObjectId) : null;
  const targetPaint = selectedObjectType === "paint" ? (paintedAreas || []).find((p) => p.id === selectedObjectId) : null;
  const targetAnchor = selectedObjectType === "anchor" ? (anchors || []).find((a) => a.id === selectedObjectId) : null;

  if (!targetAsset && !targetZone && !targetRoute && !targetPaint && !targetAnchor) return null;

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-md space-y-3 text-xs">
      <div className="flex items-center justify-between border-b border-border pb-2">
        <div className="flex items-center gap-1.5">
          {selectedObjectType === "asset" && <MapPin className="h-4 w-4 text-accent" />}
          {selectedObjectType === "zone" && <Layers className="h-4 w-4 text-accent" />}
          {selectedObjectType === "route" && <Navigation className="h-4 w-4 text-accent" />}
          {selectedObjectType === "paint" && <Paintbrush className="h-4 w-4 text-cyan-400" />}
          <h3 className="font-extrabold text-foreground uppercase tracking-wider font-mono">
            OBJECT INSPECTOR — {selectedObjectType.toUpperCase()}
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded p-1 text-foreground-muted hover:bg-surface-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* INSPECT PAINTED MASK AREA */}
      {targetPaint && (
        <div className="space-y-3 font-mono">
          <div>
            <label className="text-[10px] font-bold text-foreground-muted block mb-1">Painted Area Label</label>
            <input
              type="text"
              value={targetPaint.name}
              readOnly
              className="w-full rounded-lg border border-border bg-surface-muted/60 px-2.5 py-1 text-xs font-bold text-cyan-300"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold text-foreground-muted block mb-1">Category</label>
              <span className="text-xs font-bold text-foreground uppercase block pt-0.5">{targetPaint.category}</span>
            </div>
            <div>
              <label className="text-[10px] font-bold text-foreground-muted block mb-1">Calculated Area</label>
              <span className="text-xs font-bold text-foreground block pt-0.5">
                {targetPaint.areaSqMeters ? `${targetPaint.areaSqMeters.toLocaleString()} sq m` : "Vector Polygon"}
              </span>
            </div>
          </div>

          <div className="flex justify-between pt-2 border-t border-border">
            <button
              type="button"
              onClick={() => {
                const res = convertPaintToZone(targetPaint.id);
                if (res.success) {
                  onClose();
                } else {
                  alert(res.error);
                }
              }}
              className="flex items-center gap-1 rounded-xl bg-emerald-500 px-3 py-1.5 font-bold text-white hover:bg-emerald-600"
            >
              <Sparkles className="h-3.5 w-3.5" /> [ Convert To Zone ]
            </button>

            <button
              type="button"
              onClick={() => {
                deletePaintedArea(targetPaint.id);
                onClose();
              }}
              className="flex items-center gap-1 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-1.5 font-bold text-red-400 hover:bg-red-500/20"
            >
              <Trash2 className="h-3.5 w-3.5" /> [ Delete Paint ]
            </button>
          </div>
        </div>
      )}

      {/* INSPECT PLACED ASSET / MARKER */}
      {targetAsset && (
        <div className="space-y-3 font-mono">
          <div>
            <label className="text-[10px] font-bold text-foreground-muted block mb-1">Resource Name</label>
            <input
              type="text"
              value={targetAsset.name}
              onChange={(e) => updateAsset(targetAsset.id, { name: e.target.value })}
              className="w-full rounded-lg border border-border bg-surface-muted/60 px-2.5 py-1 text-xs font-bold text-foreground"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold text-foreground-muted block mb-1">Latitude</label>
              <input
                type="text"
                value={targetAsset.lat.toFixed(4)}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (!isNaN(val)) updateAssetPosition(targetAsset.id, val, targetAsset.lng);
                }}
                className="w-full rounded-lg border border-border bg-surface-muted/60 px-2.5 py-1 text-xs text-foreground"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-foreground-muted block mb-1">Longitude</label>
              <input
                type="text"
                value={targetAsset.lng.toFixed(4)}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (!isNaN(val)) updateAssetPosition(targetAsset.id, targetAsset.lat, val);
                }}
                className="w-full rounded-lg border border-border bg-surface-muted/60 px-2.5 py-1 text-xs text-foreground"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold text-foreground-muted block mb-1">Status</label>
              <select
                value={targetAsset.status}
                onChange={(e) => updateAsset(targetAsset.id, { status: e.target.value as "active" | "standby" | "maintenance" })}
                className="w-full rounded-lg border border-border bg-surface-muted/60 px-2 py-1 text-xs text-foreground font-bold"
              >
                <option value="active">Active</option>
                <option value="standby">Standby</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-foreground-muted block mb-1">Assigned Zone</label>
              <select
                value={targetAsset.zoneId}
                onChange={(e) => updateAsset(targetAsset.id, { zoneId: e.target.value })}
                className="w-full rounded-lg border border-border bg-surface-muted/60 px-2 py-1 text-xs text-foreground font-bold"
              >
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.code} — {z.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* CCTV FIELD OF VIEW (FOV) & ORIENTATION CONTROLS */}
          {targetAsset.type === "cctv" && (
            <div className="space-y-2 rounded-xl bg-purple-500/10 p-3 border border-purple-500/30">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-purple-300 uppercase text-[10px] tracking-wider flex items-center gap-1">
                  📹 CCTV FOV & COVERAGE CONE
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const assignedZoneDef = zones.find((z) => z.id === targetAsset.zoneId) || zones[0];
                    if (assignedZoneDef) {
                      const zoneCenterLat = assignedZoneDef.center ? assignedZoneDef.center[0] : assignedZoneDef.boundary.reduce((a, b) => a + b[0], 0) / assignedZoneDef.boundary.length;
                      const zoneCenterLng = assignedZoneDef.center ? assignedZoneDef.center[1] : assignedZoneDef.boundary.reduce((a, b) => a + b[1], 0) / assignedZoneDef.boundary.length;
                      const dx = zoneCenterLng - targetAsset.lng;
                      const dy = zoneCenterLat - targetAsset.lat;
                      let angle = Math.atan2(dx, dy) * (180 / Math.PI);
                      if (angle < 0) angle += 360;
                      updateAsset(targetAsset.id, { heading: Math.round(angle) });
                    }
                  }}
                  className="rounded-lg bg-purple-600 px-2 py-0.5 text-[10px] font-bold text-white hover:bg-purple-500 transition-colors"
                >
                  🎯 AUTO ORIENT TO ZONE
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-foreground-muted block mb-1">Heading (°)</label>
                  <input
                    type="number"
                    min={0}
                    max={360}
                    value={targetAsset.heading ?? 135}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (!isNaN(val)) updateAsset(targetAsset.id, { heading: (val + 360) % 360 });
                    }}
                    className="w-full rounded-lg border border-purple-500/40 bg-surface-muted px-2 py-1 text-xs text-purple-300 font-extrabold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-foreground-muted block mb-1">FOV Angle (°)</label>
                  <input
                    type="number"
                    min={20}
                    max={180}
                    value={targetAsset.fov ?? 90}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (!isNaN(val)) updateAsset(targetAsset.id, { fov: Math.max(20, Math.min(180, val)) });
                    }}
                    className="w-full rounded-lg border border-purple-500/40 bg-surface-muted px-2 py-1 text-xs text-purple-300 font-extrabold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-foreground-muted block mb-1">Range (m)</label>
                  <input
                    type="number"
                    min={10}
                    max={500}
                    value={targetAsset.rangeMeters ?? targetAsset.coverageRadiusMeters ?? 80}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (!isNaN(val)) updateAsset(targetAsset.id, { rangeMeters: val, coverageRadiusMeters: val });
                    }}
                    className="w-full rounded-lg border border-purple-500/40 bg-surface-muted px-2 py-1 text-xs text-purple-300 font-extrabold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-purple-200 font-bold pt-1">
                <span>Cone Arc: {(targetAsset.fov ?? 90)}° Span</span>
                <span>Max Reach: {(targetAsset.rangeMeters ?? targetAsset.coverageRadiusMeters ?? 80)} meters</span>
              </div>

              <div className="pt-2 border-t border-purple-500/20">
                <button
                  type="button"
                  onClick={() => {
                    removeAutoCameras();
                    onClose();
                  }}
                  className="w-full rounded-lg border border-red-400/40 bg-red-500/20 px-2.5 py-1 text-[11px] font-bold text-red-300 hover:bg-red-500/30 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="h-3 w-3" /> Remove All Auto-Generated Cameras
                </button>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-2 border-t border-border">
            <button
              type="button"
              onClick={() => duplicateAsset(targetAsset.id)}
              className="flex items-center gap-1 rounded-xl border border-border bg-surface-muted px-3 py-1.5 font-bold text-foreground hover:bg-surface-muted/80"
            >
              <Copy className="h-3.5 w-3.5 text-accent" /> [ Duplicate ]
            </button>

            <button
              type="button"
              onClick={() => {
                deleteAsset(targetAsset.id);
                onClose();
              }}
              className="flex items-center gap-1 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-1.5 font-bold text-red-400 hover:bg-red-500/20"
            >
              <Trash2 className="h-3.5 w-3.5" /> [ Delete ]
            </button>
          </div>
        </div>
      )}

      {/* INSPECT OPERATIONAL ZONE */}
      {targetZone && (
        <div className="space-y-3 font-mono">
          <div>
            <label className="text-[10px] font-bold text-foreground-muted block mb-1">Zone Name & Code</label>
            <div className="grid grid-cols-[80px_1fr] gap-1.5">
              <input
                type="text"
                value={targetZone.code}
                onChange={(e) => updateZone(targetZone.id, { code: e.target.value })}
                className="rounded-lg border border-border bg-surface-muted/60 px-2 py-1 text-xs font-extrabold text-accent"
              />
              <input
                type="text"
                value={targetZone.name}
                onChange={(e) => updateZone(targetZone.id, { name: e.target.value })}
                className="rounded-lg border border-border bg-surface-muted/60 px-2 py-1 text-xs font-bold text-foreground"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-foreground-muted block mb-1">Description / Notes</label>
            <input
              type="text"
              placeholder="e.g. Primary entry gate queue buffer"
              value={targetZone.description || ""}
              onChange={(e) => updateZone(targetZone.id, { description: e.target.value })}
              className="w-full rounded-lg border border-border bg-surface-muted/60 px-2 py-1 text-xs text-foreground font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold text-foreground-muted block mb-1">Category</label>
              <select
                value={targetZone.category || "crowd"}
                onChange={(e) => updateZone(targetZone.id, { category: e.target.value as NonNullable<typeof targetZone.category> })}
                className="w-full rounded-lg border border-border bg-surface-muted/60 px-2 py-1 text-xs text-foreground font-bold capitalize"
              >
                <option value="crowd">Crowd Zone</option>
                <option value="entry">Entry Gate</option>
                <option value="exit">Exit Gate</option>
                <option value="queue">Queue Line</option>
                <option value="transit">Transit Hub</option>
                <option value="parking">Parking Area</option>
                <option value="medical">Medical Station</option>
                <option value="security">Security Command</option>
                <option value="vip">VIP Enclosure</option>
                <option value="staff">Staff Corridor</option>
                <option value="restricted">Restricted Area</option>
                <option value="emergency">Emergency Route</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-foreground-muted block mb-1">Expected Capacity</label>
              <input
                type="number"
                value={targetZone.capacity}
                onChange={(e) => updateZone(targetZone.id, { capacity: parseInt(e.target.value) || 0 })}
                className="w-full rounded-lg border border-border bg-surface-muted/60 px-2.5 py-1 text-xs text-foreground font-bold"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-foreground-muted block mb-1">Zone Visual Color System</label>
            <div className="grid grid-cols-2 gap-1 mb-2">
              <button
                type="button"
                onClick={() => updateZone(targetZone.id, { colorMode: "operational" })}
                className={`px-2 py-1 text-[11px] font-bold rounded-lg border ${
                  (targetZone.colorMode || "operational") === "operational"
                    ? "border-accent bg-accent/20 text-accent"
                    : "border-border bg-surface-muted text-foreground-muted"
                }`}
              >
                ⚡ Operational State
              </button>
              <button
                type="button"
                onClick={() => updateZone(targetZone.id, { colorMode: "custom" })}
                className={`px-2 py-1 text-[11px] font-bold rounded-lg border ${
                  targetZone.colorMode === "custom"
                    ? "border-accent bg-accent/20 text-accent"
                    : "border-border bg-surface-muted text-foreground-muted"
                }`}
              >
                🎨 Custom Palette
              </button>
            </div>

            {targetZone.colorMode === "custom" && (
              <div className="flex items-center gap-1.5 pt-1">
                {["#10b981", "#f59e0b", "#ef4444", "#6366f1", "#06b6d4", "#ec4899", "#8b5cf6", "#64748b"].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => updateZone(targetZone.id, { customColor: c })}
                    style={{ backgroundColor: c }}
                    className={`h-5 w-5 rounded-full border-2 transition-transform hover:scale-110 ${
                      targetZone.customColor === c ? "border-white scale-110 shadow-sm" : "border-transparent"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold text-foreground-muted block mb-1">Width (meters)</label>
              <input
                type="number"
                value={targetZone.widthMeters || 120}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val) && val > 0) {
                    updateZoneGeometry(targetZone.id, { widthMeters: val });
                  }
                }}
                className="w-full rounded-lg border border-border bg-surface-muted/60 px-2.5 py-1 text-xs text-foreground font-bold"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-foreground-muted block mb-1">Height / Radius (meters)</label>
              <input
                type="number"
                value={targetZone.shapeType === "circle" ? (targetZone.radiusMeters || 100) : (targetZone.heightMeters || 80)}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val) && val > 0) {
                    if (targetZone.shapeType === "circle") {
                      updateZoneGeometry(targetZone.id, { radiusMeters: val });
                    } else {
                      updateZoneGeometry(targetZone.id, { heightMeters: val });
                    }
                  }
                }}
                className="w-full rounded-lg border border-border bg-surface-muted/60 px-2.5 py-1 text-xs text-foreground font-bold"
              />
            </div>
          </div>

          {/* CIRCLE SPECIFIC CENTER POSITION & RADIUS CONTROLS */}
          {targetZone.shapeType === "circle" && (
            <div className="space-y-2 rounded-xl bg-cyan-500/10 p-3 border border-cyan-500/30">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-cyan-300 uppercase text-[10px] tracking-wider flex items-center gap-1">
                  ⭕ CIRCLE CENTER & GEOMETRY
                </span>
                <button
                  type="button"
                  onClick={() => toggleSetCenterMode(targetZone.id)}
                  className={`rounded-lg px-2 py-0.5 text-[10px] font-bold transition-colors ${
                    isSetCenterMode
                      ? "bg-amber-500 text-black font-black animate-pulse"
                      : "bg-cyan-600 text-white hover:bg-cyan-500"
                  }`}
                >
                  {isSetCenterMode ? "🎯 CLICK MAP TO PLACE CENTER" : "📍 SET CENTER ON MAP"}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-foreground-muted block mb-1">Center Lat</label>
                  <input
                    type="number"
                    step="0.00001"
                    value={targetZone.center ? targetZone.center[0] : 0}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val)) {
                        const currentLng = targetZone.center ? targetZone.center[1] : 0;
                        updateCircleCenter(targetZone.id, [val, currentLng]);
                      }
                    }}
                    className="w-full rounded-lg border border-cyan-500/40 bg-surface-muted px-2 py-1 text-xs text-cyan-300 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-foreground-muted block mb-1">Center Lng</label>
                  <input
                    type="number"
                    step="0.00001"
                    value={targetZone.center ? targetZone.center[1] : 0}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val)) {
                        const currentLat = targetZone.center ? targetZone.center[0] : 0;
                        updateCircleCenter(targetZone.id, [currentLat, val]);
                      }
                    }}
                    className="w-full rounded-lg border border-cyan-500/40 bg-surface-muted px-2 py-1 text-xs text-cyan-300 font-mono font-bold"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold text-foreground-muted block mb-1">Risk Level</label>
              <select
                value={targetZone.riskLevel}
                onChange={(e) => updateZone(targetZone.id, { riskLevel: e.target.value as "low" | "medium" | "high" | "critical" })}
                className="w-full rounded-lg border border-border bg-surface-muted/60 px-2 py-1 text-xs text-foreground font-bold"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-foreground-muted block mb-1">Zone Type</label>
              <select
                value={targetZone.type}
                onChange={(e) => updateZone(targetZone.id, { type: e.target.value as "venue" | "transit" | "accommodation" | "emergency" | "mixed" })}
                className="w-full rounded-lg border border-border bg-surface-muted/60 px-2 py-1 text-xs text-foreground font-bold"
              >
                <option value="venue">Venue</option>
                <option value="transit">Transit</option>
                <option value="accommodation">Accommodation</option>
                <option value="emergency">Emergency</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between gap-1.5 pt-3 border-t border-border">
            <button
              type="button"
              onClick={() => toggleZoneLock(targetZone.id)}
              className={`flex items-center gap-1 text-[11px] font-bold rounded-lg border px-2.5 py-1.5 ${
                targetZone.isLocked
                  ? "border-amber-500/50 bg-amber-500/20 text-amber-300"
                  : "border-border bg-surface-muted text-foreground-muted hover:text-foreground"
              }`}
            >
              {targetZone.isLocked ? "🔒 Locked" : "🔓 Lock"}
            </button>

            <button
              type="button"
              onClick={() => duplicateZone(targetZone.id)}
              className="flex items-center gap-1 text-[11px] font-bold rounded-lg border border-border bg-surface-muted px-2.5 py-1.5 text-foreground hover:bg-surface-muted/80"
            >
              <Copy className="h-3 w-3" /> Duplicate
            </button>

            <button
              type="button"
              onClick={() => splitZone(targetZone.id)}
              className="flex items-center gap-1 text-[11px] font-bold rounded-lg border border-border bg-surface-muted px-2.5 py-1.5 text-foreground hover:bg-surface-muted/80"
            >
              Split
            </button>

            <button
              type="button"
              onClick={() => {
                deleteZone(targetZone.id);
                onClose();
              }}
              className="flex items-center gap-1 text-[11px] font-bold rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-1.5 text-red-400 hover:bg-red-500/20"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

      {/* INSPECT OPERATIONAL ROUTE */}
      {targetRoute && (
        <div className="space-y-3 font-mono">
          <div>
            <label className="text-[10px] font-bold text-foreground-muted block mb-1">Route Name</label>
            <input
              type="text"
              value={targetRoute.name}
              onChange={(e) => updateRoute(targetRoute.id, { name: e.target.value })}
              className="w-full rounded-lg border border-border bg-surface-muted/60 px-2.5 py-1 text-xs font-bold text-foreground"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold text-foreground-muted block mb-1">Route Status</label>
              <select
                value={targetRoute.status}
                onChange={(e) => updateRoute(targetRoute.id, { status: e.target.value as "clear" | "congested" | "blocked" })}
                className="w-full rounded-lg border border-border bg-surface-muted/60 px-2 py-1 text-xs text-foreground font-bold"
              >
                <option value="clear font-bold">Clear</option>
                <option value="congested">Congested</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-foreground-muted block mb-1">Provider & Length</label>
              <span className="text-xs font-bold text-cyan-300 block pt-1 truncate">
                {targetRoute.routingProvider || "OSRM API"} • {((targetRoute.distanceMeters || 0) / 1000).toFixed(2)} km
              </span>
            </div>
          </div>

          <div className="flex justify-between pt-2 border-t border-border">
            <button
              type="button"
              onClick={() => reverseRoute(targetRoute.id)}
              className="flex items-center gap-1 rounded-xl border border-border bg-surface-muted px-3 py-1.5 font-bold text-foreground hover:bg-surface-muted/80"
            >
              <RefreshCw className="h-3.5 w-3.5 text-accent" /> [ Reverse Direction ]
            </button>

            <button
              type="button"
              onClick={() => {
                deleteRoute(targetRoute.id);
                onClose();
              }}
              className="flex items-center gap-1 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-1.5 font-bold text-red-400 hover:bg-red-500/20"
            >
              <Trash2 className="h-3.5 w-3.5" /> [ Delete ]
            </button>
          </div>
        </div>
      )}
      {/* INSPECT OPERATIONAL ANCHOR */}
      {targetAnchor && (
        <div className="space-y-3 font-mono">
          <div>
            <label className="text-[10px] font-bold text-foreground-muted block mb-1">Anchor Label & Type</label>
            <input
              type="text"
              value={targetAnchor.name}
              onChange={(e) => updateAnchor(targetAnchor.id, { name: e.target.value })}
              className="w-full rounded-lg border border-border bg-surface-muted/60 px-2.5 py-1 text-xs font-bold text-foreground"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold text-foreground-muted block mb-1">Throughput (p/min)</label>
              <input
                type="number"
                value={targetAnchor.expectedThroughputPerMin || 1000}
                onChange={(e) => updateAnchor(targetAnchor.id, { expectedThroughputPerMin: parseInt(e.target.value) || 0 })}
                className="w-full rounded-lg border border-border bg-surface-muted/60 px-2.5 py-1 text-xs text-foreground font-bold"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-foreground-muted block mb-1">Coordinates</label>
              <span className="text-xs font-bold text-cyan-300 block pt-1 truncate">
                {targetAnchor.lat.toFixed(4)}, {targetAnchor.lng.toFixed(4)}
              </span>
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-border">
            <button
              type="button"
              onClick={() => {
                deleteAnchor(targetAnchor.id);
                onClose();
              }}
              className="flex items-center gap-1 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-1.5 font-bold text-red-400 hover:bg-red-500/20"
            >
              <Trash2 className="h-3.5 w-3.5" /> [ Delete Anchor ]
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
