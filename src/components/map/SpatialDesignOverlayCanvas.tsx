"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import type L from "leaflet";
import { useEventAuthoringStore } from "@/store/eventAuthoringStore";
import type { DesignZone, DesignCCTV, SVGPoint, DesignHandleType } from "@/types/designCanvas";

interface SpatialDesignOverlayCanvasProps {
  map: L.Map | null;
  activeTool: string;
  selectedAssetType?: string;
  onSelectObject?: (id: string | null, type: "zone" | "anchor" | "route" | "asset" | null) => void;
  onToolComplete?: (tool: string) => void;
}

export const SpatialDesignOverlayCanvas: React.FC<SpatialDesignOverlayCanvasProps> = ({
  map,
  activeTool,
  onSelectObject,
  onToolComplete,
}) => {
  const storeZones = useEventAuthoringStore((state) => state.zones);
  const storeAssets = useEventAuthoringStore((state) => state.assets);
  const selectedObjectId = useEventAuthoringStore((state) => state.selectedObjectId);
  const selectedObjectType = useEventAuthoringStore((state) => state.selectedObjectType);
  const setSelectedObjectInStore = useEventAuthoringStore((state) => state.setSelectedObject);
  const applySpatialDesign = useEventAuthoringStore((state) => state.applySpatialDesign);
  const keepToolActive = useEventAuthoringStore((state) => state.keepToolActive);
  const isSetCenterMode = useEventAuthoringStore((state) => state.isSetCenterMode);
  const setCenterTargetZoneId = useEventAuthoringStore((state) => state.setCenterTargetZoneId);
  const toggleSetCenterMode = useEventAuthoringStore((state) => state.toggleSetCenterMode);
  const updateCircleCenter = useEventAuthoringStore((state) => state.updateCircleCenter);
  const deleteSelectedObject = useEventAuthoringStore((state) => state.deleteSelectedObject);
  const addRoute = useEventAuthoringStore((state) => state.addRoute);

  const containerRef = useRef<SVGSVGElement | null>(null);

  // Local transient design session state (60fps SVG manipulation)
  const [designZones, setDesignZones] = useState<DesignZone[]>([]);
  const [designCCTVs, setDesignCCTVs] = useState<DesignCCTV[]>([]);

  // Route Point A creation preview state
  const [routePointA, setRoutePointA] = useState<{ pt: SVGPoint; geo: [number, number] } | null>(null);

  // Interaction tracking state
  const [activeHandle, setActiveHandle] = useState<{
    objectId: string;
    objectType: "zone" | "cctv";
    handleType: DesignHandleType;
    vertexIndex?: number;
  } | null>(null);

  const [dragStartPt, setDragStartPt] = useState<SVGPoint | null>(null);
  const [initialObjectState, setInitialObjectState] = useState<DesignZone | DesignCCTV | null>(null);
  const [creatingShape, setCreatingShape] = useState<{
    type: "rectangle" | "circle" | "polygon" | "cctv";
    startPt: SVGPoint;
    currentPt: SVGPoint;
  } | null>(null);

  const [transformBadge, setTransformBadge] = useState<string | null>(null);

  // 1. Projection Bridge: Geographic WGS84 -> SVG Pixels
  const syncFromStore = useCallback(() => {
    if (!map) return;

    const projectedZones: DesignZone[] = storeZones.map((z) => {
      const centerGeo = z.center || z.boundary[0] || [18.9438, 72.8232];
      const centerPxPt = map.latLngToContainerPoint(centerGeo);
      const boundaryPxPts = z.boundary.map((b) => map.latLngToContainerPoint(b));

      // Calculate container bounding dimensions
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      boundaryPxPts.forEach((pt) => {
        minX = Math.min(minX, pt.x);
        maxX = Math.max(maxX, pt.x);
        minY = Math.min(minY, pt.y);
        maxY = Math.max(maxY, pt.y);
      });

      const widthPx = Math.max(40, maxX - minX);
      const heightPx = Math.max(40, maxY - minY);
      const radiusPx = Math.max(30, Math.round(widthPx / 2));

      return {
        id: z.id,
        name: z.name,
        code: z.code,
        type: z.type,
        shapeType: z.shapeType || (z.boundary.length === 4 ? "rectangle" : "polygon"),
        centerPx: { x: centerPxPt.x, y: centerPxPt.y },
        widthPx,
        heightPx,
        radiusPx,
        verticesPx: boundaryPxPts.map((p) => ({ x: p.x, y: p.y })),
        centerGeo,
        boundaryGeo: z.boundary,
        capacity: z.capacity,
        riskLevel: z.riskLevel,
        operationalState: z.operationalState,
        customColor: z.customColor,
        colorMode: z.colorMode,
        isLocked: z.isLocked,
        category: z.category,
      };
    });

    const cctvAssets = storeAssets.filter((a) => a.type === "cctv");
    const projectedCCTVs: DesignCCTV[] = cctvAssets.map((a) => {
      const posPxPt = map.latLngToContainerPoint([a.lat, a.lng]);
      const rangeMeters = a.rangeMeters || a.coverageRadiusMeters || 80;
      // Estimate pixel range from meters using map zoom level
      const rangePx = Math.max(40, Math.round(rangeMeters * 1.2));

      return {
        id: a.id,
        name: a.name,
        posPx: { x: posPxPt.x, y: posPxPt.y },
        posGeo: [a.lat, a.lng],
        zoneId: a.zoneId,
        heading: a.heading ?? 135,
        fov: a.fov ?? 90,
        rangePx,
        rangeMeters,
        coveragePercent: 82,
        status: a.status,
        isAutoGenerated: a.isAutoGenerated || a.id.startsWith("asset-cctv-auto"),
      };
    });

    setDesignZones(projectedZones);
    setDesignCCTVs(projectedCCTVs);
  }, [map, storeZones, storeAssets]);

  // Sync on mount and store updates
  useEffect(() => {
    syncFromStore();
  }, [syncFromStore]);

  // 2. Projection Bridge: SVG Pixels -> Geographic WGS84
  const pxToGeo = useCallback(
    (pt: SVGPoint): [number, number] => {
      if (!map) return [0, 0];
      const latLng = map.containerPointToLatLng([pt.x, pt.y]);
      return [latLng.lat, latLng.lng];
    },
    [map],
  );

  // Keyboard Shortcuts (Escape, Delete/Backspace)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement &&
        ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)
      ) {
        return;
      }

      if (e.key === "Escape") {
        if (routePointA) {
          setRoutePointA(null);
          setTransformBadge("ROUTE CREATION CANCELLED");
          setTimeout(() => setTransformBadge(null), 1200);
        } else if (creatingShape) {
          setCreatingShape(null);
          setTransformBadge("SHAPE CREATION CANCELLED");
          setTimeout(() => setTransformBadge(null), 1200);
        } else if (isSetCenterMode) {
          toggleSetCenterMode(null);
        } else if (activeTool !== "select") {
          if (onToolComplete) onToolComplete("select");
        } else if (selectedObjectId) {
          if (onSelectObject) onSelectObject(null, null);
          setSelectedObjectInStore(null, null);
        }
      } else if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedObjectId && selectedObjectType) {
          deleteSelectedObject(selectedObjectId, selectedObjectType);
          if (onSelectObject) onSelectObject(null, null);
          setSelectedObjectInStore(null, null);
          setTransformBadge("OBJECT DELETED");
          setTimeout(() => setTransformBadge(null), 1200);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    routePointA,
    creatingShape,
    isSetCenterMode,
    activeTool,
    selectedObjectId,
    selectedObjectType,
    onToolComplete,
    onSelectObject,
    setSelectedObjectInStore,
    toggleSetCenterMode,
    deleteSelectedObject,
  ]);

  // Helper: Get cursor point relative to SVG container
  const getSVGPoint = (e: React.PointerEvent): SVGPoint => {
    if (!containerRef.current) return { x: e.clientX, y: e.clientY };
    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  // 3. Pointer Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    const pt = getSVGPoint(e);

    // Set Circle Center Placement Mode
    if (isSetCenterMode) {
      const geo = pxToGeo(pt);
      const targetZoneId = setCenterTargetZoneId || selectedObjectId;
      if (targetZoneId) {
        updateCircleCenter(targetZoneId, geo);
        setTransformBadge(`CIRCLE CENTER UPDATED: ${geo[0].toFixed(5)}, ${geo[1].toFixed(5)}`);
        setTimeout(() => setTransformBadge(null), 1500);
      }
      return;
    }

    // Route A/B Creation Tool
    if (activeTool === "route") {
      const geo = pxToGeo(pt);
      if (!routePointA) {
        setRoutePointA({ pt, geo });
        setTransformBadge("POINT A PLACED — CLICK TO PLACE POINT B");
      } else {
        const pointBGeo = geo;
        addRoute({
          name: `Access Corridor ${storeZones.length + 1}`,
          type: "crowd_ingress",
          waypoints: [routePointA.geo, pointBGeo],
          color: "#3b82f6",
          status: "clear",
        });
        setTransformBadge("ROUTE CREATED SUCCESSFULLY");
        setRoutePointA(null);
        setTimeout(() => setTransformBadge(null), 1500);
        if (!keepToolActive && onToolComplete) {
          onToolComplete("select");
        }
      }
      return;
    }

    if (activeTool === "select") {
      if (!activeHandle) {
        // Clicked empty canvas space in SELECT mode -> Deselect
        if (onSelectObject) onSelectObject(null, null);
        setSelectedObjectInStore(null, null);
        setTransformBadge(null);
      }
      return;
    }

    // Primitive creation modes: rectangle, circle, polygon, cctv
    if (activeTool === "rectangle" || activeTool === "circle" || activeTool === "polygon" || activeTool === "cctv") {
      setCreatingShape({
        type: activeTool,
        startPt: pt,
        currentPt: pt,
      });
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const currentPt = getSVGPoint(e);

    // Creating new shape preview
    if (creatingShape) {
      setCreatingShape((prev) => (prev ? { ...prev, currentPt } : null));
      const dx = Math.abs(currentPt.x - creatingShape.startPt.x);
      const dy = Math.abs(currentPt.y - creatingShape.startPt.y);
      const dist = Math.round(Math.sqrt(dx * dx + dy * dy));
      setTransformBadge(
        creatingShape.type === "circle"
          ? `DRAW CIRCLE: RADIUS ~${dist}px (~${Math.round(dist * 0.8)}m)`
          : creatingShape.type === "rectangle"
            ? `DRAW RECTANGLE: ${dx}px × ${dy}px`
            : `PLACE ${creatingShape.type.toUpperCase()}`,
      );
      return;
    }

    // Active object transformation (dragging body or resize/rotation handle)
    if (!activeHandle || !dragStartPt || !initialObjectState) return;

    const deltaX = currentPt.x - dragStartPt.x;
    const deltaY = currentPt.y - dragStartPt.y;

    if (activeHandle.objectType === "zone") {
      const initialZone = initialObjectState as DesignZone;

      setDesignZones((prevZones) =>
        prevZones.map((z) => {
          if (z.id !== activeHandle.objectId) return z;

          if (activeHandle.handleType === "move") {
            // Direct Body Drag
            const newCenterPx = {
              x: initialZone.centerPx.x + deltaX,
              y: initialZone.centerPx.y + deltaY,
            };
            const newVerticesPx = initialZone.verticesPx.map((v) => ({
              x: v.x + deltaX,
              y: v.y + deltaY,
            }));
            const newCenterGeo = pxToGeo(newCenterPx);
            const newBoundaryGeo = newVerticesPx.map(pxToGeo);

            setTransformBadge(`MOVE ZONE: ${z.name} | LAT ${newCenterGeo[0].toFixed(4)}, LNG ${newCenterGeo[1].toFixed(4)}`);

            return {
              ...z,
              centerPx: newCenterPx,
              verticesPx: newVerticesPx,
              centerGeo: newCenterGeo,
              boundaryGeo: newBoundaryGeo,
            };
          }

          if (activeHandle.handleType === "radius") {
            // Circle Radius Handle Drag
            const radiusPx = Math.max(20, Math.round(Math.sqrt(Math.pow(currentPt.x - z.centerPx.x, 2) + Math.pow(currentPt.y - z.centerPx.y, 2))));
            const radiusMeters = Math.round(radiusPx * 0.8);
            setTransformBadge(`CIRCLE RADIUS: ${radiusMeters} m | AREA: ${Math.round(Math.PI * radiusMeters * radiusMeters)} m²`);

            return {
              ...z,
              radiusPx,
            };
          }

          if (["nw", "ne", "se", "sw", "n", "e", "s", "w"].includes(activeHandle.handleType)) {
            // 8-Point Rectangle Resize
            let newWidth = initialZone.widthPx;
            let newHeight = initialZone.heightPx;

            if (activeHandle.handleType.includes("e")) newWidth = Math.max(40, initialZone.widthPx + deltaX);
            if (activeHandle.handleType.includes("w")) newWidth = Math.max(40, initialZone.widthPx - deltaX);
            if (activeHandle.handleType.includes("s")) newHeight = Math.max(40, initialZone.heightPx + deltaY);
            if (activeHandle.handleType.includes("n")) newHeight = Math.max(40, initialZone.heightPx - deltaY);

            const halfW = newWidth / 2;
            const halfH = newHeight / 2;
            const cx = z.centerPx.x;
            const cy = z.centerPx.y;

            const newVerticesPx = [
              { x: cx - halfW, y: cy - halfH },
              { x: cx + halfW, y: cy - halfH },
              { x: cx + halfW, y: cy + halfH },
              { x: cx - halfW, y: cy + halfH },
            ];

            const approxWidthM = Math.round(newWidth * 0.8);
            const approxHeightM = Math.round(newHeight * 0.8);
            setTransformBadge(`RESIZE ZONE: ${z.name} | ${approxWidthM}m × ${approxHeightM}m (${approxWidthM * approxHeightM} m²)`);

            return {
              ...z,
              widthPx: newWidth,
              heightPx: newHeight,
              verticesPx: newVerticesPx,
              boundaryGeo: newVerticesPx.map(pxToGeo),
            };
          }

          return z;
        }),
      );
    } else if (activeHandle.objectType === "cctv") {
      const initialCCTV = initialObjectState as DesignCCTV;

      setDesignCCTVs((prevCCTVs) =>
        prevCCTVs.map((c) => {
          if (c.id !== activeHandle.objectId) return c;

          if (activeHandle.handleType === "move") {
            const newPosPx = {
              x: initialCCTV.posPx.x + deltaX,
              y: initialCCTV.posPx.y + deltaY,
            };
            const newPosGeo = pxToGeo(newPosPx);
            setTransformBadge(`MOVE CCTV: ${c.name} | LAT ${newPosGeo[0].toFixed(4)}, LNG ${newPosGeo[1].toFixed(4)}`);

            return {
              ...c,
              posPx: newPosPx,
              posGeo: newPosGeo,
            };
          }

          if (activeHandle.handleType === "heading") {
            // CCTV Heading Rotation Handle (↻)
            const dx = currentPt.x - c.posPx.x;
            const dy = currentPt.y - c.posPx.y;
            const angleRad = Math.atan2(dx, -dy); // 0 deg is top (North)
            let angleDeg = Math.round((angleRad * 180) / Math.PI);
            if (angleDeg < 0) angleDeg += 360;

            setTransformBadge(`ROTATE CCTV: ${c.name} | HEADING: ${angleDeg}°`);

            return {
              ...c,
              heading: angleDeg,
            };
          }

          if (activeHandle.handleType === "range") {
            // CCTV Range Adjustment Handle (↔)
            const dx = currentPt.x - c.posPx.x;
            const dy = currentPt.y - c.posPx.y;
            const rangePx = Math.max(30, Math.round(Math.sqrt(dx * dx + dy * dy)));
            const rangeMeters = Math.round(rangePx * 0.8);

            setTransformBadge(`CCTV RANGE: ${c.name} | RANGE: ${rangeMeters} m`);

            return {
              ...c,
              rangePx,
              rangeMeters,
            };
          }

          return c;
        }),
      );
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    // 1. Creation Mode Commit
    if (creatingShape) {
      const endPt = getSVGPoint(e);
      const startPt = creatingShape.startPt;
      const dx = Math.abs(endPt.x - startPt.x);
      const dy = Math.abs(endPt.y - startPt.y);

      if (creatingShape.type === "cctv") {
        const newId = `asset-cctv-${Date.now()}`;
        const posGeo = pxToGeo(endPt);
        const newCCTV: DesignCCTV = {
          id: newId,
          name: `CCTV Cam ${designCCTVs.length + 1}`,
          posPx: endPt,
          posGeo,
          zoneId: designZones[0]?.id || "",
          heading: 135,
          fov: 90,
          rangePx: 80,
          rangeMeters: 80,
          coveragePercent: 85,
          status: "active",
        };
        const updatedCCTVs = [...designCCTVs, newCCTV];
        setDesignCCTVs(updatedCCTVs);

        if (onSelectObject) onSelectObject(newId, "asset");
        setSelectedObjectInStore(newId, "asset");
        // Automatically compile to canonical store
        applySpatialDesign(designZones, updatedCCTVs);
      } else {
        const newId = `zone-${creatingShape.type}-${Date.now()}`;
        const centerPt = { x: (startPt.x + endPt.x) / 2, y: (startPt.y + endPt.y) / 2 };
        const centerGeo = pxToGeo(centerPt);
        const widthPx = Math.max(80, dx);
        const heightPx = Math.max(80, dy);
        const radiusPx = Math.max(50, Math.round(widthPx / 2));

        const halfW = widthPx / 2;
        const halfH = heightPx / 2;
        const verticesPx = [
          { x: centerPt.x - halfW, y: centerPt.y - halfH },
          { x: centerPt.x + halfW, y: centerPt.y - halfH },
          { x: centerPt.x + halfW, y: centerPt.y + halfH },
          { x: centerPt.x - halfW, y: centerPt.y + halfH },
        ];

        const newZone: DesignZone = {
          id: newId,
          name: `Zone ${String.fromCharCode(65 + (designZones.length % 26))}`,
          code: `ZONE-${String.fromCharCode(65 + (designZones.length % 26))}`,
          type: "venue",
          shapeType: creatingShape.type,
          centerPx: centerPt,
          widthPx,
          heightPx,
          radiusPx,
          verticesPx,
          centerGeo,
          boundaryGeo: verticesPx.map(pxToGeo),
          capacity: 150000,
          riskLevel: "low",
        };

        const updatedZones = [...designZones, newZone];
        setDesignZones(updatedZones);

        if (onSelectObject) onSelectObject(newId, "zone");
        setSelectedObjectInStore(newId, "zone");
        // Automatically compile to canonical store
        applySpatialDesign(updatedZones, designCCTVs);
      }

      setCreatingShape(null);
      setTransformBadge(null);
      if (onToolComplete) onToolComplete("select");
      return;
    }

    // 2. Transformation Handle Release -> Auto Sync to Canonical Store
    if (activeHandle) {
      applySpatialDesign(designZones, designCCTVs);
    }

    setActiveHandle(null);
    setDragStartPt(null);
    setInitialObjectState(null);
    setTransformBadge(null);
  };

  // Helper to start dragging a specific object/handle
  const startObjectDrag = (
    e: React.PointerEvent,
    objectId: string,
    objectType: "zone" | "cctv",
    handleType: DesignHandleType,
    vertexIndex?: number,
  ) => {
    e.stopPropagation();
    const pt = getSVGPoint(e);

    const targetObj =
      objectType === "zone"
        ? designZones.find((z) => z.id === objectId)
        : designCCTVs.find((c) => c.id === objectId);

    if (!targetObj) return;

    setActiveHandle({ objectId, objectType, handleType, vertexIndex });
    setDragStartPt(pt);
    setInitialObjectState(targetObj);

    if (onSelectObject) onSelectObject(objectId, objectType === "zone" ? "zone" : "asset");
    setSelectedObjectInStore(objectId, objectType === "zone" ? "zone" : "asset");
  };

  // CCTV Sector Cone SVG Arc Path Generator
  const generateFOVSectorPath = (posPx: SVGPoint, heading: number, fov: number, rangePx: number) => {
    const halfFOV = fov / 2;
    const startAngleRad = ((heading - halfFOV - 90) * Math.PI) / 180;
    const endAngleRad = ((heading + halfFOV - 90) * Math.PI) / 180;

    const x1 = posPx.x + rangePx * Math.cos(startAngleRad);
    const y1 = posPx.y + rangePx * Math.sin(startAngleRad);
    const x2 = posPx.x + rangePx * Math.cos(endAngleRad);
    const y2 = posPx.y + rangePx * Math.sin(endAngleRad);

    const largeArcFlag = fov > 180 ? 1 : 0;

    return {
      pathD: `M ${posPx.x},${posPx.y} L ${x1},${y1} A ${rangePx},${rangePx} 0 ${largeArcFlag},1 ${x2},${y2} Z`,
      rotationHandlePt: {
        x: posPx.x + (rangePx + 24) * Math.cos(((heading - 90) * Math.PI) / 180),
        y: posPx.y + (rangePx + 24) * Math.sin(((heading - 90) * Math.PI) / 180),
      },
      rangeHandlePt: {
        x: posPx.x + rangePx * Math.cos(((heading - 90) * Math.PI) / 180),
        y: posPx.y + rangePx * Math.sin(((heading - 90) * Math.PI) / 180),
      },
    };
  };

  return (
    <svg
      ref={containerRef}
      className="absolute inset-0 z-50 h-full w-full pointer-events-auto select-none touch-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <defs>
        {/* Pattern / Filter styles */}
        <filter id="glow-selected" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* 1. ZONES LAYER */}
      {designZones.map((zone) => {
        const isSelected = selectedObjectId === zone.id;
        const color = zone.customColor || (zone.riskLevel === "high" ? "#ef4444" : zone.riskLevel === "medium" ? "#eab308" : "#06b6d4");

        return (
          <g key={zone.id} className="cursor-pointer">
            {/* Zone Shape Geometry */}
            {zone.shapeType === "circle" ? (
              <circle
                cx={zone.centerPx.x}
                cy={zone.centerPx.y}
                r={zone.radiusPx}
                fill={color}
                fillOpacity={isSelected ? 0.25 : 0.15}
                stroke={color}
                strokeWidth={isSelected ? 3 : 2}
                strokeDasharray={isSelected ? "6,4" : undefined}
                onPointerDown={(e) => startObjectDrag(e, zone.id, "zone", "move")}
              />
            ) : (
              <polygon
                points={zone.verticesPx.map((v) => `${v.x},${v.y}`).join(" ")}
                fill={color}
                fillOpacity={isSelected ? 0.25 : 0.15}
                stroke={color}
                strokeWidth={isSelected ? 3 : 2}
                strokeDasharray={isSelected ? "6,4" : undefined}
                onPointerDown={(e) => startObjectDrag(e, zone.id, "zone", "move")}
              />
            )}

            {/* Zone Name Label */}
            <text
              x={zone.centerPx.x}
              y={zone.centerPx.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-white text-[11px] font-mono font-black drop-shadow-md pointer-events-none"
            >
              {zone.code || zone.name}
            </text>

            {/* Selected Zone Editing Handles */}
            {isSelected && (
              <g>
                {/* Center Move Handle (❖) */}
                <circle
                  cx={zone.centerPx.x}
                  cy={zone.centerPx.y}
                  r={14}
                  fill="#0284c7"
                  stroke="#ffffff"
                  strokeWidth={2}
                  className="cursor-grab hover:scale-125 transition-transform"
                  onPointerDown={(e) => startObjectDrag(e, zone.id, "zone", "move")}
                />
                <text
                  x={zone.centerPx.x}
                  y={zone.centerPx.y + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-white text-xs font-black pointer-events-none"
                >
                  ❖
                </text>

                {/* Circle Radius Handle */}
                {zone.shapeType === "circle" && (
                  <g>
                    <circle
                      cx={zone.centerPx.x + zone.radiusPx}
                      cy={zone.centerPx.y}
                      r={10}
                      fill="#eab308"
                      stroke="#ffffff"
                      strokeWidth={2}
                      className="cursor-ew-resize hover:scale-125 transition-transform"
                      onPointerDown={(e) => startObjectDrag(e, zone.id, "zone", "radius")}
                    />
                    <text
                      x={zone.centerPx.x + zone.radiusPx}
                      y={zone.centerPx.y + 1}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-slate-950 text-[10px] font-black pointer-events-none"
                    >
                      ↔
                    </text>
                  </g>
                )}

                {/* 8-Point Rectangle Resize Handles with Expanded Hit Targets */}
                {zone.shapeType !== "circle" && zone.verticesPx.length === 4 && (
                  <g>
                    {[
                      { type: "nw", pt: zone.verticesPx[0], cursor: "nwse-resize" },
                      { type: "ne", pt: zone.verticesPx[1], cursor: "nesw-resize" },
                      { type: "se", pt: zone.verticesPx[2], cursor: "nwse-resize" },
                      { type: "sw", pt: zone.verticesPx[3], cursor: "nesw-resize" },
                      {
                        type: "n",
                        pt: { x: (zone.verticesPx[0].x + zone.verticesPx[1].x) / 2, y: zone.verticesPx[0].y },
                        cursor: "ns-resize",
                      },
                      {
                        type: "e",
                        pt: { x: zone.verticesPx[1].x, y: (zone.verticesPx[1].y + zone.verticesPx[2].y) / 2 },
                        cursor: "ew-resize",
                      },
                      {
                        type: "s",
                        pt: { x: (zone.verticesPx[2].x + zone.verticesPx[3].x) / 2, y: zone.verticesPx[2].y },
                        cursor: "ns-resize",
                      },
                      {
                        type: "w",
                        pt: { x: zone.verticesPx[0].x, y: (zone.verticesPx[0].y + zone.verticesPx[3].y) / 2 },
                        cursor: "ew-resize",
                      },
                    ].map((handle) => (
                      <g key={handle.type}>
                        {/* 20px Transparent Hit Target */}
                        <rect
                          x={handle.pt.x - 10}
                          y={handle.pt.y - 10}
                          width={20}
                          height={20}
                          fill="transparent"
                          className={`cursor-${handle.cursor}`}
                          onPointerDown={(e) => startObjectDrag(e, zone.id, "zone", handle.type as DesignHandleType)}
                        />
                        {/* 10px Visual Handle Indicator */}
                        <rect
                          x={handle.pt.x - 5}
                          y={handle.pt.y - 5}
                          width={10}
                          height={10}
                          rx={2}
                          fill="#0ea5e9"
                          stroke="#ffffff"
                          strokeWidth={2}
                          className={`cursor-${handle.cursor} pointer-events-none`}
                        />
                      </g>
                    ))}
                  </g>
                )}
              </g>
            )}
          </g>
        );
      })}

      {/* 2. CCTV SENSORS & FOV CONES LAYER */}
      {designCCTVs.map((cctv) => {
        const isSelected = selectedObjectId === cctv.id;
        const fovData = generateFOVSectorPath(cctv.posPx, cctv.heading, cctv.fov, cctv.rangePx);

        return (
          <g key={cctv.id} className="cursor-pointer">
            {/* CCTV FOV Sector Cone Polygon */}
            <path
              d={fovData.pathD}
              fill={isSelected ? "#a855f7" : "#8b5cf6"}
              fillOpacity={isSelected ? 0.35 : 0.2}
              stroke={isSelected ? "#c084fc" : "#a855f7"}
              strokeWidth={isSelected ? 2 : 1.5}
              strokeDasharray={isSelected ? "4,4" : undefined}
              onPointerDown={(e) => startObjectDrag(e, cctv.id, "cctv", "move")}
            />

            {/* Camera Position Icon */}
            <g onPointerDown={(e) => startObjectDrag(e, cctv.id, "cctv", "move")}>
              <circle
                cx={cctv.posPx.x}
                cy={cctv.posPx.y}
                r={14}
                fill={isSelected ? "#9333ea" : "#581c87"}
                stroke="#c084fc"
                strokeWidth={2}
                className="hover:scale-110 transition-transform"
              />
              <text
                x={cctv.posPx.x}
                y={cctv.posPx.y + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-white text-xs pointer-events-none"
              >
                📷
              </text>
            </g>

            {/* Camera Label */}
            <text
              x={cctv.posPx.x + 18}
              y={cctv.posPx.y + 4}
              className="fill-purple-200 text-[10px] font-mono font-bold drop-shadow-md pointer-events-none"
            >
              {cctv.name} ({cctv.heading}°)
            </text>

            {/* Selected CCTV Interactive Rotation & Range Handles */}
            {isSelected && (
              <g>
                {/* Heading Rotation Handle (↻) */}
                <line
                  x1={cctv.posPx.x}
                  y1={cctv.posPx.y}
                  x2={fovData.rotationHandlePt.x}
                  y2={fovData.rotationHandlePt.y}
                  stroke="#c084fc"
                  strokeWidth={1.5}
                  strokeDasharray="3,3"
                />
                <circle
                  cx={fovData.rotationHandlePt.x}
                  cy={fovData.rotationHandlePt.y}
                  r={11}
                  fill="#c084fc"
                  stroke="#ffffff"
                  strokeWidth={2}
                  className="cursor-grab hover:scale-125 transition-transform"
                  onPointerDown={(e) => startObjectDrag(e, cctv.id, "cctv", "heading")}
                />
                <text
                  x={fovData.rotationHandlePt.x}
                  y={fovData.rotationHandlePt.y + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-slate-950 text-xs font-black pointer-events-none"
                >
                  ↻
                </text>

                {/* Range Handle (↔) */}
                <circle
                  cx={fovData.rangeHandlePt.x}
                  cy={fovData.rangeHandlePt.y}
                  r={9}
                  fill="#eab308"
                  stroke="#ffffff"
                  strokeWidth={2}
                  className="cursor-ns-resize hover:scale-125 transition-transform"
                  onPointerDown={(e) => startObjectDrag(e, cctv.id, "cctv", "range")}
                />
                <text
                  x={fovData.rangeHandlePt.x}
                  y={fovData.rangeHandlePt.y + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-slate-950 text-[9px] font-black pointer-events-none"
                >
                  ↔
                </text>
              </g>
            )}
          </g>
        );
      })}

      {/* 3. ROUTE CREATION PREVIEW LAYER (POINT A -> POINTER) */}
      {routePointA && (
        <g className="pointer-events-none">
          {/* Point A Circle Marker */}
          <circle
            cx={routePointA.pt.x}
            cy={routePointA.pt.y}
            r={12}
            fill="#3b82f6"
            stroke="#ffffff"
            strokeWidth={2}
            className="animate-pulse"
          />
          <text
            x={routePointA.pt.x}
            y={routePointA.pt.y + 1}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-white text-[10px] font-mono font-black"
          >
            A
          </text>
        </g>
      )}

      {/* 4. SHAPE CREATION PREVIEW LAYER */}
      {creatingShape && (
        <g>
          {creatingShape.type === "circle" ? (
            <circle
              cx={creatingShape.startPt.x}
              cy={creatingShape.startPt.y}
              r={Math.max(10, Math.round(Math.sqrt(Math.pow(creatingShape.currentPt.x - creatingShape.startPt.x, 2) + Math.pow(creatingShape.currentPt.y - creatingShape.startPt.y, 2))))}
              fill="#06b6d4"
              fillOpacity={0.2}
              stroke="#22d3ee"
              strokeWidth={2}
              strokeDasharray="4,4"
            />
          ) : creatingShape.type === "rectangle" ? (
            <rect
              x={Math.min(creatingShape.startPt.x, creatingShape.currentPt.x)}
              y={Math.min(creatingShape.startPt.y, creatingShape.currentPt.y)}
              width={Math.abs(creatingShape.currentPt.x - creatingShape.startPt.x)}
              height={Math.abs(creatingShape.currentPt.y - creatingShape.startPt.y)}
              fill="#06b6d4"
              fillOpacity={0.2}
              stroke="#22d3ee"
              strokeWidth={2}
              strokeDasharray="4,4"
            />
          ) : null}
        </g>
      )}

      {/* 4. REALTIME HUD TRANSFORM BADGE OVERLAY */}
      {transformBadge && (
        <foreignObject x="0" y="12" width="100%" height="45" className="pointer-events-none">
          <div className="flex justify-center">
            <div className="flex items-center gap-2 rounded-xl border border-cyan-400 bg-slate-950/95 px-4 py-2 text-xs font-mono font-black text-cyan-300 shadow-2xl animate-pulse">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
              <span>{transformBadge}</span>
            </div>
          </div>
        </foreignObject>
      )}
    </svg>
  );
};
