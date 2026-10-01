import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import { Plus, Minus, RotateCcw, Maximize2, Target } from "lucide-react";
import { vars } from "../../ui/toast/themeBridge";
import type { GroundStation, AwsRegion, AwsHub, IstracNode, TopologyEntity } from "../../types/topologyTypes";
import type { ActivePass } from "../../types/monitoring/dashboard";
import { GroundStationMarker } from "./GroundStationMarker";
import { AwsHubMarker } from "./AwsHubMarker";
import { IstracMarker } from "./IstracMarker";
import { geoEquirectangular, geoPath } from "d3-geo";
import { feature } from "topojson-client";

// Centralized Topology Camera Configuration for customizable viewport, zoom, padding, and animations
export const TOPOLOGY_CAMERA_CONFIG = {
  // SVG virtual canvas dimensions
  mapWidth: 1000,
  mapHeight: 500,

  // Manual zoom limits and steps
  minZoom: 0.8,
  maxZoom: 3.5,
  zoomStep: 0.25,

  // Network overview fitting constraints (fits all nodes with no empty Pacific gap)
  defaultMinZoom: 1.12,
  defaultMaxZoom: 1.38,
  defaultWidthRatio: 0.90,
  defaultHeightRatio: 0.82,

  // Active pass corridor fitting constraints (targets 75-85% width, 65-80% height)
  activeRouteWidthRatio: 0.80,
  activeRouteHeightRatio: 0.72,
  activeMinZoom: 1.25,
  activeMaxZoom: 2.20,

  // Smooth camera animation easing
  transitionDuration: "0.65s cubic-bezier(0.2, 0.8, 0.25, 1)",

  // Safe visual margins (accounting for marker rings, labels, and bottom legend)
  legendHeightCompensation: 18,

  // Dynamic Satellite Pacing & Animation
  animDurationSec: 7.0,
  mumbaiBangaloreTimeFraction: 0.32, // 32% of total travel time allocated to Mumbai -> Bangalore arc (~2.24s)
  eastwardArcOffset: 34, // Pixel offset for the pronounced, visible Mumbai -> Bangalore curved arc
};

/**
 * Accurately calculate arc length of a quadratic Bezier curve
 */
export function approxQuadBezierLength(
  x0: number,
  y0: number,
  cx: number,
  cy: number,
  x1: number,
  y1: number
): number {
  let len = 0;
  let prevX = x0;
  let prevY = y0;
  const steps = 10;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const it = 1 - t;
    const curX = it * it * x0 + 2 * it * t * cx + t * t * x1;
    const curY = it * it * y0 + 2 * it * t * cy + t * t * y1;
    const dx = curX - prevX;
    const dy = curY - prevY;
    len += Math.sqrt(dx * dx + dy * dy);
    prevX = curX;
    prevY = curY;
  }
  return len;
}

/**
 * Calculates a dynamic, eastward-bowing quadratic Bezier arc between Mumbai and Bangalore
 * without altering geographic coordinates, providing extended path length and high animation visibility.
 */
export function calculateHubToIstracArc(
  hubCoords: [number, number],
  blrCoords: [number, number],
  eastwardOffset: number = TOPOLOGY_CAMERA_CONFIG.eastwardArcOffset
): {
  controlX: number;
  controlY: number;
  pathD: string;
} {
  const [hubX, hubY] = hubCoords;
  const [blrX, blrY] = blrCoords;

  const dx = blrX - hubX;
  const dy = blrY - hubY;
  const dist = Math.sqrt(dx * dx + dy * dy);

  const midX = (hubX + blrX) / 2;
  const midY = (hubY + blrY) / 2;

  // Normal vector pointing eastward / outward into the Indian Ocean / Bay of Bengal space
  const nx = dist > 0 ? dy / dist : 1;
  const ny = dist > 0 ? -dx / dist : 0;

  const controlX = Number((midX + nx * eastwardOffset + 6).toFixed(2));
  const controlY = Number((midY + ny * (eastwardOffset * 0.45)).toFixed(2));

  return {
    controlX,
    controlY,
    pathD: `M ${hubX} ${hubY} Q ${controlX} ${controlY} ${blrX} ${blrY}`,
  };
}

type CameraMode = "DEFAULT" | "FIT_NETWORK" | "ACTIVE_PASS" | "MANUAL";

interface BoundingPoint {
  x: number;
  y: number;
  padTop?: number;
  padBottom?: number;
  padLeft?: number;
  padRight?: number;
}

interface TopologyMapProps {
  stations: GroundStation[];
  regions: AwsRegion[];
  hubs?: AwsHub[];
  istracNode?: IstracNode | null;
  activePasses?: ActivePass[];
  selectedEntity: TopologyEntity | null;
  onSelectEntity: (entity: TopologyEntity | null) => void;
}

export const TopologyMap: React.FC<TopologyMapProps> = ({
  stations,
  regions,
  hubs = [],
  istracNode,
  activePasses = [],
  selectedEntity,
  onSelectEntity,
}) => {
  const [worldData, setWorldData] = useState<any>(null);
  // Default centered network view (fits all stations with zero excessive Pacific space on left)
  const [zoom, setZoom] = useState<number>(1.20);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: -132, y: -24 });
  const [cameraMode, setCameraMode] = useState<CameraMode>("DEFAULT");
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hasMovedRef = useRef<boolean>(false);
  const lastActivePassKeyRef = useRef<string>("");

  useEffect(() => {
    fetch("/world-110m.json")
      .then((res) => res.json())
      .then((data) => {
        const geoData = feature(data, data.objects.countries);
        setWorldData(geoData);
      })
      .catch((err) => console.error("Could not load world map", err));
  }, []);

  // Map configuration
  const mapWidth = TOPOLOGY_CAMERA_CONFIG.mapWidth;
  const mapHeight = TOPOLOGY_CAMERA_CONFIG.mapHeight;

  const projection = useMemo(() => {
    return geoEquirectangular()
      .scale(160)
      .translate([mapWidth / 2, mapHeight / 2]);
  }, [mapWidth, mapHeight]);

  const pathGenerator = useMemo(() => geoPath().projection(projection), [projection]);

  const mapLongitudeToX = (lon: number, lat: number) => {
    const [x] = projection([lon, lat]) || [0, 0];
    return (x / mapWidth) * 100;
  };

  const mapLatitudeToY = (lon: number, lat: number) => {
    const [, y] = projection([lon, lat]) || [0, 0];
    return (y / mapHeight) * 100;
  };

  // Primary central hub (Mumbai)
  const primaryHub = hubs[0] || {
    type: "AWS_HUB" as const,
    id: "hub-mumbai",
    name: "AWS CENTRAL HUB",
    locationName: "Mumbai, India",
    city: "Mumbai",
    country: "India",
    regionCode: "ap-south-1",
    latitude: 19.076,
    longitude: 72.8777,
    status: "ONLINE" as const,
  };

  // Primary ISTRAC Node (Bangalore)
  const primaryIstrac: IstracNode = istracNode || {
    type: "ISTRAC",
    id: "node-istrac-bangalore",
    name: "ISTRAC BANGALORE",
    locationName: "Bangalore, India",
    city: "Bangalore",
    country: "India",
    latitude: 12.9716,
    longitude: 77.5946,
    status: "ONLINE",
    connectedHub: "AWS Central Hub (Mumbai)",
    hubRegionCode: "ap-south-1",
    role: "Mission Operations Complex (MOX) / Ground Station Network Operations",
  };

  // Mathematical screen-space bounding box and camera centering helper
  const fitBounds = useCallback(
    (
      items: BoundingPoint[],
      targetWidthRatio: number = TOPOLOGY_CAMERA_CONFIG.activeRouteWidthRatio,
      targetHeightRatio: number = TOPOLOGY_CAMERA_CONFIG.activeRouteHeightRatio,
      minZ: number = TOPOLOGY_CAMERA_CONFIG.activeMinZoom,
      maxZ: number = TOPOLOGY_CAMERA_CONFIG.activeMaxZoom,
      targetViewportCenterY: number = TOPOLOGY_CAMERA_CONFIG.mapHeight / 2 - TOPOLOGY_CAMERA_CONFIG.legendHeightCompensation
    ) => {
      if (items.length === 0) {
        return { zoom: 1.20, pan: { x: -132, y: -24 } };
      }

      let minX = Infinity;
      let maxX = -Infinity;
      let minY = Infinity;
      let maxY = -Infinity;

      items.forEach((pt) => {
        const pL = pt.padLeft ?? 25;
        const pR = pt.padRight ?? 25;
        const pT = pt.padTop ?? 25;
        const pB = pt.padBottom ?? 25;

        minX = Math.min(minX, pt.x - pL);
        maxX = Math.max(maxX, pt.x + pR);
        minY = Math.min(minY, pt.y - pT);
        maxY = Math.max(maxY, pt.y + pB);
      });

      const spanX = Math.max(120, maxX - minX);
      const spanY = Math.max(90, maxY - minY);
      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;

      const mapW = TOPOLOGY_CAMERA_CONFIG.mapWidth;
      const mapH = TOPOLOGY_CAMERA_CONFIG.mapHeight;

      const zoomX = (mapW * targetWidthRatio) / spanX;
      const zoomY = (mapH * targetHeightRatio) / spanY;
      const calculatedZoom = Math.min(zoomX, zoomY);
      const targetZoom = Math.max(minZ, Math.min(maxZ, Number(calculatedZoom.toFixed(2))));

      // Center the bounding box around targetViewportCenter (mapW / 2, targetViewportCenterY)
      const targetPanX = (mapW / 2 - centerX) * targetZoom;
      const targetPanY = (targetViewportCenterY - mapH / 2) + (mapH / 2 - centerY) * targetZoom;

      return {
        zoom: targetZoom,
        pan: {
          x: Number(targetPanX.toFixed(1)),
          y: Number(targetPanY.toFixed(1)),
        },
      };
    },
    []
  );

  // Fit All configured network stations (eliminates empty left Pacific space and centers network)
  const fitNetwork = useCallback(() => {
    const points: BoundingPoint[] = [];

    regions.forEach((r) => {
      const p = projection([r.longitude, r.latitude]);
      if (p) {
        points.push({
          x: p[0],
          y: p[1],
          padTop: 30,
          padBottom: 48,
          padLeft: 45,
          padRight: 45,
        });
      }
    });

    const hubP = projection([primaryHub.longitude, primaryHub.latitude]);
    const istracP = projection([primaryIstrac.longitude, primaryIstrac.latitude]);
    if (hubP) {
      points.push({
        x: hubP[0],
        y: hubP[1],
        padTop: 45,
        padBottom: 25,
        padLeft: 40,
        padRight: 40,
      });
    }

    if (istracP) {
      points.push({
        x: istracP[0],
        y: istracP[1],
        padTop: 25,
        padBottom: 45,
        padLeft: 35,
        padRight: 45,
      });
    }

    if (hubP && istracP) {
      const arc = calculateHubToIstracArc(
        [hubP[0], hubP[1]],
        [istracP[0], istracP[1]],
        TOPOLOGY_CAMERA_CONFIG.eastwardArcOffset
      );
      points.push({
        x: arc.controlX,
        y: arc.controlY,
        padTop: 15,
        padBottom: 15,
        padLeft: 15,
        padRight: 35,
      });
    }

    const fit = fitBounds(
      points,
      TOPOLOGY_CAMERA_CONFIG.defaultWidthRatio,
      TOPOLOGY_CAMERA_CONFIG.defaultHeightRatio,
      TOPOLOGY_CAMERA_CONFIG.defaultMinZoom,
      TOPOLOGY_CAMERA_CONFIG.defaultMaxZoom,
      TOPOLOGY_CAMERA_CONFIG.mapHeight / 2 - 14
    );
    setZoom(fit.zoom);
    setPan(fit.pan);
  }, [regions, primaryHub, primaryIstrac, projection, fitBounds]);

  // Focus active pass route (Station -> Mumbai -> Bangalore)
  const focusActiveRoute = useCallback(
    (targetStationId?: string) => {
      const activeRegions = regions.filter((r) => {
        if (targetStationId) {
          return r.id === targetStationId || r.linkedStations?.includes(targetStationId);
        }
        return activePasses.some(
          (p) => r.linkedStations?.includes(p.stationId) || p.stationId === r.id
        );
      });

      if (activeRegions.length === 0) {
        fitNetwork();
        return;
      }

      const points: BoundingPoint[] = [];
      const hubP = projection([primaryHub.longitude, primaryHub.latitude]);
      const istracP = projection([primaryIstrac.longitude, primaryIstrac.latitude]);

      if (hubP) {
        points.push({
          x: hubP[0],
          y: hubP[1],
          padTop: 48, // Mumbai label is above marker
          padBottom: 25,
          padLeft: 40,
          padRight: 40,
        });
      }

      if (istracP) {
        points.push({
          x: istracP[0],
          y: istracP[1],
          padTop: 25,
          padBottom: 48, // Bangalore label is below marker
          padLeft: 30,
          padRight: 55,  // Eastward arc and satellite clearance
        });
      }

      if (hubP && istracP) {
        const arc = calculateHubToIstracArc(
          [hubP[0], hubP[1]],
          [istracP[0], istracP[1]],
          TOPOLOGY_CAMERA_CONFIG.eastwardArcOffset
        );
        points.push({
          x: arc.controlX,
          y: arc.controlY,
          padTop: 20,
          padBottom: 20,
          padLeft: 20,
          padRight: 45, // Generous clearance for eastward curve trajectory
        });
      }

      activeRegions.forEach((r) => {
        const stP = projection([r.longitude, r.latitude]);
        if (stP) {
          points.push({
            x: stP[0],
            y: stP[1],
            padTop: 30,
            padBottom: 55, // Cape Town / station label below
            padLeft: 55,   // Left safety margin
            padRight: 50,
          });

          if (hubP) {
            // Include quadratic curve apex
            const midX = (stP[0] + hubP[0]) / 2;
            const midY = Math.min(stP[1], hubP[1]) - 30;
            points.push({
              x: midX,
              y: midY,
              padTop: 25,
              padBottom: 15,
              padLeft: 20,
              padRight: 20,
            });
          }
        }
      });

      const fit = fitBounds(
        points,
        TOPOLOGY_CAMERA_CONFIG.activeRouteWidthRatio,
        TOPOLOGY_CAMERA_CONFIG.activeRouteHeightRatio,
        TOPOLOGY_CAMERA_CONFIG.activeMinZoom,
        TOPOLOGY_CAMERA_CONFIG.activeMaxZoom,
        TOPOLOGY_CAMERA_CONFIG.mapHeight / 2 - TOPOLOGY_CAMERA_CONFIG.legendHeightCompensation
      );
      setZoom(fit.zoom);
      setPan(fit.pan);
    },
    [regions, primaryHub, primaryIstrac, activePasses, projection, fitBounds, fitNetwork]
  );

  // Auto-focus on active pass startup / change without disrupting user manual pan during regular polling
  useEffect(() => {
    const currentKey = activePasses
      .map((p) => p.stationId || p.satellite)
      .sort()
      .join(",");

    if (currentKey !== lastActivePassKeyRef.current) {
      const wasEmpty = lastActivePassKeyRef.current === "";
      lastActivePassKeyRef.current = currentKey;

      if (activePasses.length > 0) {
        setCameraMode("ACTIVE_PASS");
        focusActiveRoute();
      } else if (!wasEmpty && cameraMode === "ACTIVE_PASS") {
        setCameraMode("DEFAULT");
        fitNetwork();
      }
    }
  }, [activePasses, focusActiveRoute, fitNetwork, cameraMode]);

  // Initial network fit on mount
  useEffect(() => {
    if (activePasses.length > 0) {
      focusActiveRoute();
    } else {
      fitNetwork();
    }
  }, []);

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCameraMode("MANUAL");
    setZoom((prev) => Math.min(TOPOLOGY_CAMERA_CONFIG.maxZoom, Number((prev + TOPOLOGY_CAMERA_CONFIG.zoomStep).toFixed(2))));
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCameraMode("MANUAL");
    setZoom((prev) => Math.max(TOPOLOGY_CAMERA_CONFIG.minZoom, Number((prev - TOPOLOGY_CAMERA_CONFIG.zoomStep).toFixed(2))));
  };

  const handleFitNetwork = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCameraMode("FIT_NETWORK");
    fitNetwork();
  };

  const handleFocusActive = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activePasses.length > 0) {
      setCameraMode("ACTIVE_PASS");
      focusActiveRoute();
    }
  };

  const handleResetZoom = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCameraMode("DEFAULT");
    fitNetwork();
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
    setCameraMode("MANUAL");
    const delta = e.deltaY < 0 ? 0.15 : -0.15;
    setZoom((prev) => Math.min(TOPOLOGY_CAMERA_CONFIG.maxZoom, Math.max(TOPOLOGY_CAMERA_CONFIG.minZoom, Number((prev + delta).toFixed(2)))));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    hasMovedRef.current = false;
    dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStartRef.current.x;
    const newY = e.clientY - dragStartRef.current.y;
    if (Math.abs(newX - pan.x) > 3 || Math.abs(newY - pan.y) > 3) {
      hasMovedRef.current = true;
      setCameraMode("MANUAL");
    }
    const maxPanX = 800 * (zoom - 0.2);
    const maxPanY = 500 * (zoom - 0.2);
    setPan({
      x: Math.max(-Math.max(350, maxPanX), Math.min(Math.max(350, maxPanX), newX)),
      y: Math.max(-Math.max(300, maxPanY), Math.min(Math.max(300, maxPanY), newY)),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Structured logging for map active routes
  useEffect(() => {
    console.log(`[MAP ACTIVE ROUTES]`);
    if (activePasses && activePasses.length > 0) {
      activePasses.forEach((p) => {
        console.log(`${p.stationName || p.stationId} → Mumbai (AWS Central Hub) → ISTRAC Bangalore`);
      });
    } else {
      console.log(`No active routes (all connections static)`);
    }
  }, [activePasses]);

  const locationMarkers = useMemo(() => {
    return regions.map((region) => {
      const regionStations = stations.filter(
        (s) => s.awsRegion === region.regionCode || s.awsRegion === region.id || region.linkedStations?.includes(s.id)
      );

      // Station has active status ONLY if an active pass is running for this region
      const hasActivePass = activePasses.some(
        (p) => region.linkedStations.includes(p.stationId) || p.stationId === region.id
      );
      const hasWarning = regionStations.some((s) => s.status === "WARNING");
      const isAllOffline =
        regionStations.length > 0 && regionStations.every((s) => s.status === "OFFLINE" || s.status === "UNKNOWN");
      const isAnyOnline = regionStations.some((s) => s.status === "ONLINE" || s.status === "ACTIVE");

      const overallStatus = hasActivePass
        ? "ACTIVE"
        : isAnyOnline
        ? "ONLINE"
        : isAllOffline
        ? "OFFLINE"
        : hasWarning
        ? "WARNING"
        : "OFFLINE";

      const mockStation: GroundStation = {
        type: "station",
        id: region.id,
        name: region.name,
        awsRegion: region.regionCode,
        latitude: region.latitude,
        longitude: region.longitude,
        status: overallStatus,
        lastUpdate: "Just now",
        infrastructure: {
          receiverEc2: "RUNNING",
          sdrEc2: "RUNNING",
          rxStatus: "OFF",
          txStatus: "OFF",
        },
        system: { connection: "CONNECTED", health: "HEALTHY" },
      };

      return { region, mockStation };
    });
  }, [regions, stations, activePasses]);

  // Static / Active Backbone line from Mumbai AWS Hub to ISTRAC Bangalore
  const hubToBlrLine = useMemo(() => {
    const hubCoords = projection([primaryHub.longitude, primaryHub.latitude]);
    const blrCoords = projection([primaryIstrac.longitude, primaryIstrac.latitude]);
    if (!hubCoords || !blrCoords) return null;

    const arc = calculateHubToIstracArc(
      [hubCoords[0], hubCoords[1]],
      [blrCoords[0], blrCoords[1]],
      TOPOLOGY_CAMERA_CONFIG.eastwardArcOffset
    );

    const isHighlighted =
      selectedEntity?.id === primaryIstrac.id ||
      selectedEntity?.type === "ISTRAC" ||
      selectedEntity?.id === primaryHub.id ||
      selectedEntity?.type === "AWS_HUB";

    return { pathD: arc.pathD, isHighlighted, controlX: arc.controlX, controlY: arc.controlY };
  }, [primaryHub, primaryIstrac, projection, selectedEntity]);

  // Compute curved SVG topology lines from each ground station to Mumbai AWS Hub and extending to ISTRAC Bangalore on active pass
  const topologyLines = useMemo(() => {
    const hubCoords = projection([primaryHub.longitude, primaryHub.latitude]);
    const blrCoords = projection([primaryIstrac.longitude, primaryIstrac.latitude]);
    if (!hubCoords) return [];

    const [hubX, hubY] = hubCoords;
    const [blrX, blrY] = blrCoords || [hubX + 10, hubY + 15];

    const arc = calculateHubToIstracArc(
      [hubX, hubY],
      [blrX, blrY],
      TOPOLOGY_CAMERA_CONFIG.eastwardArcOffset
    );
    const { controlX: ctrlHubBlrX, controlY: ctrlHubBlrY } = arc;

    return regions.map((region) => {
      const stCoords = projection([region.longitude, region.latitude]);
      if (!stCoords) return null;

      const [stX, stY] = stCoords;

      // Calculate control point for smooth quadratic curve between Ground Station and Mumbai Hub
      const midX = (stX + hubX) / 2;
      const midY = Math.min(stY, hubY) - 30;

      const isStationSelected =
        selectedEntity?.id === region.id ||
        (selectedEntity?.type === "station" && region.linkedStations.includes(selectedEntity.id));
      const isHubSelected = selectedEntity?.type === "AWS_HUB";
      const isIstracSelected = selectedEntity?.type === "ISTRAC";
      const isHighlighted = isStationSelected || isHubSelected || isIstracSelected;

      // Identify SD1 and SD2 passes independently for this station
      const linked = region.linkedStations || [];
      const st1Id = linked[0]; // e.g. CP1, DU1, PA1, DB1
      const st2Id = linked[1]; // e.g. CP2, DU2, PA2, DB2

      const pass1 = activePasses.find(
        (p) => p.stationId === st1Id || p.stationName?.includes(st1Id)
      );
      const pass2 = activePasses.find(
        (p) => p.stationId === st2Id || p.stationName?.includes(st2Id)
      );

      const activeSatellites: {
        pass: ActivePass;
        passType: "SD1" | "SD2";
        name: string;
        color: string;
        lightColor: string;
        darkColor: string;
        windowColor: string;
      }[] = [];

      if (pass1) {
        activeSatellites.push({
          pass: pass1,
          passType: "SD1",
          name: `${region.name} (${st1Id})`,
          color: "#A855F7",       // Purple
          lightColor: "#C084FC",
          darkColor: "#7E22CE",
          windowColor: "#3B0764",
        });
      }

      if (pass2) {
        activeSatellites.push({
          pass: pass2,
          passType: "SD2",
          name: `${region.name} (${st2Id})`,
          color: "#EAB308",       // Yellow
          lightColor: "#FACC15",
          darkColor: "#CA8A04",
          windowColor: "#422006",
        });
      }

      const isPassActive = activeSatellites.length > 0;

      // Full active pass flow: Ground Station -> Mumbai AWS Hub -> ISTRAC Bangalore
      // Inactive/Idle route: Ground Station -> Mumbai AWS Hub
      const pathD = isPassActive
        ? `M ${stX} ${stY} Q ${midX} ${midY} ${hubX} ${hubY} Q ${ctrlHubBlrX} ${ctrlHubBlrY} ${blrX} ${blrY}`
        : `M ${stX} ${stY} Q ${midX} ${midY} ${hubX} ${hubY}`;

      // Accurately calculate arc lengths so animation keyPoints and keyTimes are dynamically paced
      const len1 = approxQuadBezierLength(stX, stY, midX, midY, hubX, hubY);
      const len2 = isPassActive
        ? approxQuadBezierLength(hubX, hubY, ctrlHubBlrX, ctrlHubBlrY, blrX, blrY)
        : 0;
      const totalLen = len1 + len2;
      const waypointPoint = totalLen > 0 ? len1 / totalLen : 0.72;
      const waypointTime = 1 - TOPOLOGY_CAMERA_CONFIG.mumbaiBangaloreTimeFraction;

      return {
        id: region.id,
        regionName: region.name,
        pathD,
        waypointTime,
        waypointPoint,
        isHighlighted,
        isPassActive,
        activeSatellites,
      };
    }).filter(Boolean);
  }, [regions, primaryHub, primaryIstrac, projection, selectedEntity, activePasses]);

  return (
    <Box
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onDoubleClick={handleResetZoom}
      onClick={() => {
        if (!hasMovedRef.current) {
          onSelectEntity(null);
        }
      }}
      sx={{
        flex: 1,
        position: "relative",
        bgcolor: "#0b1218",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: isDragging ? "grabbing" : "grab",
        userSelect: "none",
      }}
    >
      {/* Zoom / Map Smart Camera Controls in Top Right */}
      <Box
        sx={{
          position: "absolute",
          top: 14,
          right: 14,
          zIndex: 35,
          display: "flex",
          flexDirection: "column",
          bgcolor: "rgba(11, 18, 24, 0.92)",
          backdropFilter: "blur(8px)",
          border: `1px solid rgba(255, 255, 255, 0.12)`,
          borderRadius: "6px",
          overflow: "hidden",
          boxShadow: "0 4px 14px rgba(0, 0, 0, 0.6)",
        }}
      >
        {/* Zoom In */}
        <IconButton
          size="small"
          onClick={handleZoomIn}
          disabled={zoom >= TOPOLOGY_CAMERA_CONFIG.maxZoom}
          title="Zoom In (+)"
          sx={{
            color: zoom >= TOPOLOGY_CAMERA_CONFIG.maxZoom ? "rgba(255,255,255,0.25)" : vars.text,
            p: 0.8,
            borderRadius: 0,
            "&:hover": {
              bgcolor: "rgba(56, 189, 248, 0.15)",
              color: "#38bdf8",
            },
          }}
        >
          <Plus size={15} />
        </IconButton>

        <Box sx={{ height: "1px", bgcolor: "rgba(255, 255, 255, 0.08)" }} />

        {/* Zoom Out */}
        <IconButton
          size="small"
          onClick={handleZoomOut}
          disabled={zoom <= TOPOLOGY_CAMERA_CONFIG.minZoom}
          title="Zoom Out (−)"
          sx={{
            color: zoom <= TOPOLOGY_CAMERA_CONFIG.minZoom ? "rgba(255,255,255,0.25)" : vars.text,
            p: 0.8,
            borderRadius: 0,
            "&:hover": {
              bgcolor: "rgba(56, 189, 248, 0.15)",
              color: "#38bdf8",
            },
          }}
        >
          <Minus size={15} />
        </IconButton>

        <Box sx={{ height: "1px", bgcolor: "rgba(255, 255, 255, 0.08)" }} />

        {/* Fit Network (⛶) */}
        <IconButton
          size="small"
          onClick={handleFitNetwork}
          title="Fit Network (⛶)"
          sx={{
            color: cameraMode === "FIT_NETWORK" || cameraMode === "DEFAULT" ? "#38bdf8" : vars.text,
            bgcolor: cameraMode === "FIT_NETWORK" ? "rgba(56, 189, 248, 0.12)" : "transparent",
            p: 0.8,
            borderRadius: 0,
            "&:hover": {
              bgcolor: "rgba(56, 189, 248, 0.15)",
              color: "#38bdf8",
            },
          }}
        >
          <Maximize2 size={13} />
        </IconButton>

        <Box sx={{ height: "1px", bgcolor: "rgba(255, 255, 255, 0.08)" }} />

        {/* Focus Active Pass (🎯) */}
        <IconButton
          size="small"
          onClick={handleFocusActive}
          disabled={activePasses.length === 0}
          title={activePasses.length > 0 ? "Focus Active Pass (🎯)" : "No Active Pass to Focus"}
          sx={{
            color:
              activePasses.length === 0
                ? "rgba(255,255,255,0.2)"
                : cameraMode === "ACTIVE_PASS"
                ? "#00FF66"
                : "#10B981",
            bgcolor:
              activePasses.length > 0 && cameraMode === "ACTIVE_PASS"
                ? "rgba(0, 255, 102, 0.12)"
                : "transparent",
            p: 0.8,
            borderRadius: 0,
            "&:hover": {
              bgcolor: activePasses.length > 0 ? "rgba(0, 255, 102, 0.18)" : "transparent",
              color: "#00FF66",
            },
          }}
        >
          <Target size={14} />
        </IconButton>

        <Box sx={{ height: "1px", bgcolor: "rgba(255, 255, 255, 0.08)" }} />

        {/* Reset View (↻) */}
        <IconButton
          size="small"
          onClick={handleResetZoom}
          title="Reset View (↻)"
          sx={{
            color: vars.textDim,
            p: 0.8,
            borderRadius: 0,
            "&:hover": {
              bgcolor: "rgba(56, 189, 248, 0.15)",
              color: "#38bdf8",
            },
          }}
        >
          <RotateCcw size={13} />
        </IconButton>
      </Box>

      {/* Map Scalable Surface */}
      <Box
        onClick={(e) => {
          if (!hasMovedRef.current && e.target === e.currentTarget) {
            onSelectEntity(null);
          }
        }}
        sx={{
          position: "relative",
          width: "100%",
          maxWidth: 1600,
          aspectRatio: "2/1",
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: "center center",
          transition: isDragging ? "none" : `transform ${TOPOLOGY_CAMERA_CONFIG.transitionDuration}`,
          willChange: "transform",
        }}
      >
        {/* SVG World Map & Topology Interconnect Lines */}
        <svg
          viewBox={`0 0 ${mapWidth} ${mapHeight}`}
          style={{
            width: "100%",
            height: "100%",
            position: "absolute",
            top: 0,
            left: 0,
            pointerEvents: "none",
          }}
        >
          <defs>
            <style>
              {`
                @keyframes dataFlowForward {
                  from { stroke-dashoffset: 24; }
                  to { stroke-dashoffset: 0; }
                }
                .active-flow-path {
                  animation: dataFlowForward 1.2s linear infinite;
                }
              `}
            </style>
            <pattern id="dot-pattern" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.8" fill="#1e293b" />
            </pattern>
            {worldData && (
              <clipPath id="world-clip">
                <path d={pathGenerator(worldData) || ""} />
              </clipPath>
            )}
            <linearGradient id="hubLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#FF9900" stopOpacity="0.7" />
            </linearGradient>
            <linearGradient id="hubLineGradActive" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#FF9900" stopOpacity="1" />
            </linearGradient>
            <linearGradient id="activeDataFlowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00FF66" />
              <stop offset="40%" stopColor="#00FF66" />
              <stop offset="75%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#FF9900" />
            </linearGradient>

            {/* Glowing filters */}
            <filter id="activeLineGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="satelliteGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {worldData && (
            <g>
              {/* Solid subtle slate background for continents */}
              <path
                d={pathGenerator(worldData) || ""}
                fill="#0f172a"
                stroke="#1e293b"
                strokeWidth="0.5"
              />
              {/* Dotted texture clipped to continents */}
              <rect
                x="0"
                y="0"
                width="100%"
                height="100%"
                fill="url(#dot-pattern)"
                clipPath="url(#world-clip)"
              />
            </g>
          )}

          {/* Central Hub Interconnect Topology Lines (ONE route per station) */}
          <g>
            {/* Static / Active Backbone Connection: Mumbai AWS Hub ─── ISTRAC Bangalore */}
            {hubToBlrLine && (
              <g>
                {topologyLines.some((l) => l?.isPassActive) ? (
                  <>
                    {/* Glowing outer neon green aura path */}
                    <path
                      d={hubToBlrLine.pathD}
                      fill="none"
                      stroke="#00FF66"
                      strokeWidth="4.5"
                      opacity="0.45"
                      filter="url(#activeLineGlow)"
                    />
                    {/* Core neon green line */}
                    <path
                      d={hubToBlrLine.pathD}
                      fill="none"
                      stroke="#00FF66"
                      strokeWidth="1.5"
                      opacity="0.75"
                    />
                    {/* Animated moving neon green data-flow line (Mumbai -> Bangalore) */}
                    <path
                      d={hubToBlrLine.pathD}
                      fill="none"
                      stroke="url(#activeDataFlowGrad)"
                      strokeWidth="2.5"
                      strokeDasharray="8 5"
                      className="active-flow-path"
                      filter="url(#activeLineGlow)"
                    />
                  </>
                ) : (
                  <path
                    d={hubToBlrLine.pathD}
                    fill="none"
                    stroke={hubToBlrLine.isHighlighted ? "url(#hubLineGradActive)" : "url(#hubLineGrad)"}
                    strokeWidth={hubToBlrLine.isHighlighted ? 2 : 1.2}
                    strokeDasharray={hubToBlrLine.isHighlighted ? "none" : "4 3"}
                    opacity={hubToBlrLine.isHighlighted ? 0.95 : 0.45}
                    style={{ transition: "all 0.3s ease" }}
                  />
                )}
              </g>
            )}

            {topologyLines.map((line) => {
              if (!line) return null;

              if (line.isPassActive) {
                // ACTIVE LIVE PASS: Render single glowing animated data-flow connection in neon green
                return (
                  <g key={line.id}>
                    {/* Glowing outer neon green aura path */}
                    <path
                      d={line.pathD}
                      fill="none"
                      stroke="#00FF66"
                      strokeWidth="4.5"
                      opacity="0.45"
                      filter="url(#activeLineGlow)"
                    />
                    {/* Core neon green line */}
                    <path
                      d={line.pathD}
                      fill="none"
                      stroke="#00FF66"
                      strokeWidth="1.5"
                      opacity="0.75"
                    />
                    {/* Animated moving neon green data-flow line (Ground Station -> Mumbai -> Bangalore) */}
                    <path
                      d={line.pathD}
                      fill="none"
                      stroke="url(#activeDataFlowGrad)"
                      strokeWidth="2.5"
                      strokeDasharray="8 5"
                      className="active-flow-path"
                      filter="url(#activeLineGlow)"
                    />
                  </g>
                );
              }

              // INACTIVE / NORMAL: Render static dotted connection
              return (
                <path
                  key={line.id}
                  d={line.pathD}
                  fill="none"
                  stroke={line.isHighlighted ? "url(#hubLineGradActive)" : "url(#hubLineGrad)"}
                  strokeWidth={line.isHighlighted ? 2 : 1.2}
                  strokeDasharray={line.isHighlighted ? "none" : "4 3"}
                  opacity={line.isHighlighted ? 0.95 : 0.45}
                  style={{ transition: "all 0.3s ease" }}
                />
              );
            })}
          </g>

          {/* SATELLITE LIVE DATA-FLOW ANIMATIONS (Ground Station -> Mumbai -> ISTRAC Bangalore) */}
          <g>
            {topologyLines.map((line) => {
              if (!line || !line.isPassActive || !line.activeSatellites || line.activeSatellites.length === 0) return null;

              const totalActive = line.activeSatellites.length;
              const animDuration = TOPOLOGY_CAMERA_CONFIG.animDurationSec;
              const waypointTimeStr = (line.waypointTime ?? 0.68).toFixed(3);
              const waypointPointStr = (line.waypointPoint ?? 0.75).toFixed(3);

              // Render active satellites on the same route with spacing offset
              return line.activeSatellites.map((sat, index) => {
                // When both satellites are active, space them 50% apart along the route cycle
                const animBegin = totalActive > 1 && index === 1 ? `${(animDuration / 2).toFixed(2)}s` : "0s";
                // Perpendicular offset for concurrent passes to prevent collision
                const offsetTransform = totalActive > 1
                  ? (sat.passType === "SD1" ? "translate(0, -5)" : "translate(0, 5)")
                  : undefined;

                return (
                  <g key={`sat-${line.id}-${sat.passType}`}>
                    {/* Leading energy pulse particle */}
                    <circle r="4" fill={sat.lightColor} filter="url(#satelliteGlow)">
                      <animateMotion
                        dur={`${animDuration}s`}
                        begin={animBegin}
                        repeatCount="indefinite"
                        calcMode="linear"
                        keyTimes={`0; ${waypointTimeStr}; 1`}
                        keyPoints={`0; ${waypointPointStr}; 1`}
                        path={line.pathD}
                      />
                    </circle>

                    {/* High-Tech Traveling Satellite Icon */}
                    <g>
                      <animateMotion
                        dur={`${animDuration}s`}
                        begin={animBegin}
                        repeatCount="indefinite"
                        rotate="auto"
                        calcMode="linear"
                        keyTimes={`0; ${waypointTimeStr}; 1`}
                        keyPoints={`0; ${waypointPointStr}; 1`}
                        path={line.pathD}
                      />

                      <g transform={offsetTransform}>
                        {/* Satellite Aura Halo */}
                        <circle cx="0" cy="0" r="14" fill={sat.color} opacity="0.45" filter="url(#satelliteGlow)" />

                        {/* Trailing Data Glow Particles Behind Satellite */}
                        <circle cx="-20" cy="0" r="1.8" fill={sat.lightColor} opacity="0.3" />
                        <circle cx="-15" cy="0" r="2.5" fill={sat.lightColor} opacity="0.55" />
                        <circle cx="-10" cy="0" r="3.2" fill={sat.lightColor} opacity="0.8" />
                        <circle cx="-5" cy="0" r="3.8" fill={sat.lightColor} opacity="0.95" />

                        {/* Solar Panel Wings (Upper & Lower) */}
                        <rect x="-4" y="-12" width="8" height="5.5" rx="0.6" fill={sat.darkColor} stroke={sat.lightColor} strokeWidth="0.8" />
                        <line x1="-4" y1="-9.2" x2="4" y2="-9.2" stroke={sat.lightColor} strokeWidth="0.7" />
                        <line x1="0" y1="-12" x2="0" y2="-6.5" stroke={sat.lightColor} strokeWidth="0.7" />

                        <rect x="-4" y="6.5" width="8" height="5.5" rx="0.6" fill={sat.darkColor} stroke={sat.lightColor} strokeWidth="0.8" />
                        <line x1="-4" y1="9.2" x2="4" y2="9.2" stroke={sat.lightColor} strokeWidth="0.7" />
                        <line x1="0" y1="6.5" x2="0" y2="12" stroke={sat.lightColor} strokeWidth="0.7" />

                        {/* Satellite Central Chassis */}
                        <rect x="-6" y="-5" width="12" height="10" rx="1.8" fill="#f8fafc" stroke={sat.darkColor} strokeWidth="1.1" />
                        <rect x="-4" y="-3.2" width="8" height="6.4" rx="0.6" fill={sat.windowColor} />

                        {/* Forward Transceiver Antenna pointing towards movement vector */}
                        <path d="M 6 0 L 10 -3.5 M 6 0 L 10 3.5 M 6 0 L 11 0" stroke={sat.lightColor} strokeWidth="1.1" strokeLinecap="round" />

                        {/* Live Data Active Blinking Beacon */}
                        <circle cx="1.5" cy="0" r="2" fill={sat.color} />
                      </g>
                    </g>
                  </g>
                );
              });
            })}
          </g>
        </svg>

        {/* Unified Ground Station Location Markers with Permanent Labels */}
        {locationMarkers.map(({ region, mockStation }) => {
          const isSelected =
            selectedEntity?.id === region.id ||
            (selectedEntity?.type === "station" && region.linkedStations.includes(selectedEntity.id));
          return (
            <GroundStationMarker
              key={region.id}
              station={mockStation}
              isSelected={isSelected}
              onSelect={() => onSelectEntity(region)}
              x={mapLongitudeToX(region.longitude, region.latitude)}
              y={mapLatitudeToY(region.longitude, region.latitude)}
            />
          );
        })}

        {/* AWS Central Hub Markers (Mumbai & extensible future hubs) */}
        {(hubs.length > 0 ? hubs : [primaryHub]).map((hub) => {
          const isSelected = selectedEntity?.id === hub.id;
          return (
            <AwsHubMarker
              key={hub.id}
              hub={hub}
              isSelected={isSelected}
              onSelect={() => onSelectEntity(hub)}
              x={mapLongitudeToX(hub.longitude, hub.latitude)}
              y={mapLatitudeToY(hub.longitude, hub.latitude)}
            />
          );
        })}

        {/* Permanent ISTRAC Bangalore Node Marker */}
        <IstracMarker
          node={primaryIstrac}
          isSelected={selectedEntity?.id === primaryIstrac.id || selectedEntity?.type === "ISTRAC"}
          isReceiving={topologyLines.some((l) => l?.isPassActive)}
          onSelect={() => onSelectEntity(primaryIstrac)}
          x={mapLongitudeToX(primaryIstrac.longitude, primaryIstrac.latitude)}
          y={mapLatitudeToY(primaryIstrac.longitude, primaryIstrac.latitude)}
        />
      </Box>

      {/* Footer Info / Legend: Clean single line */}
      <Box
        sx={{
          position: "absolute",
          bottom: 10,
          left: 10,
          right: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "nowrap",
          gap: 2,
          zIndex: 2,
          pointerEvents: "none",
          bgcolor: "rgba(11, 18, 24, 0.85)",
          px: 1.5,
          py: 0.6,
          borderRadius: 1,
          border: `1px solid rgba(255, 255, 255, 0.08)`,
          backdropFilter: "blur(6px)",
        }}
      >
        <Typography
          sx={{
            fontSize: 10.5,
            fontWeight: "bold",
            color: vars.textDim,
            textTransform: "uppercase",
            letterSpacing: 0.8,
          }}
        >
          AWS Global Infrastructure Topology
        </Typography>

        {/* Global satellite color mapping & AWS Central Hub & ISTRAC Bangalore in ONE clean line */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "nowrap" }}>
          {/* GS1 : PURPLE */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                bgcolor: "#A855F7",
                boxShadow: "0 0 5px #A855F7",
              }}
            />
            <Typography sx={{ fontSize: 10, fontWeight: 700, color: "#C084FC", letterSpacing: 0.4 }}>
              GS1 : PURPLE
            </Typography>
          </Box>

          {/* GS2 : YELLOW */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                bgcolor: "#EAB308",
                boxShadow: "0 0 5px #EAB308",
              }}
            />
            <Typography sx={{ fontSize: 10, fontWeight: 700, color: "#FACC15", letterSpacing: 0.4 }}>
              GS2 : YELLOW
            </Typography>
          </Box>

          {/* AWS CENTRAL HUB */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.7,
              pl: 1.2,
              borderLeft: `1px solid rgba(255, 255, 255, 0.12)`,
            }}
          >
            <Box
              sx={{
                width: 7,
                height: 7,
                transform: "rotate(45deg)",
                bgcolor: "#FF9900",
                boxShadow: "0 0 6px #FF9900",
                borderRadius: "1px",
              }}
            />
            <Typography sx={{ fontSize: 10, color: "#FF9900", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4 }}>
              AWS Central Hub
            </Typography>
          </Box>

          {/* ISTRAC BANGALORE */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.7,
              pl: 1.2,
              borderLeft: `1px solid rgba(255, 255, 255, 0.12)`,
            }}
          >
            <Box
              sx={{
                width: 7,
                height: 7,
                bgcolor: "#06B6D4",
                boxShadow: "0 0 6px #22D3EE",
                borderRadius: "2px",
              }}
            />
            <Typography sx={{ fontSize: 10, color: "#22D3EE", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4 }}>
              ISTRAC Bangalore
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
