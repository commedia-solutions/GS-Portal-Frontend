import React, { useState, useEffect, useMemo, useRef } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import { Plus, Minus, RotateCcw } from "lucide-react";
import { vars } from "../../ui/toast/themeBridge";
import type { GroundStation, AwsRegion, AwsHub, TopologyEntity } from "../../types/topologyTypes";
import type { ActivePass } from "../../types/monitoring/dashboard";
import { GroundStationMarker } from "./GroundStationMarker";
import { AwsHubMarker } from "./AwsHubMarker";
import { geoEquirectangular, geoPath } from "d3-geo";
import { feature } from "topojson-client";

const MIN_ZOOM = 0.8;
const MAX_ZOOM = 3.0;
const ZOOM_STEP = 0.25;

interface TopologyMapProps {
  stations: GroundStation[];
  regions: AwsRegion[];
  hubs?: AwsHub[];
  activePasses?: ActivePass[];
  selectedEntity: TopologyEntity | null;
  onSelectEntity: (entity: TopologyEntity | null) => void;
}

export const TopologyMap: React.FC<TopologyMapProps> = ({
  stations,
  regions,
  hubs = [],
  activePasses = [],
  selectedEntity,
  onSelectEntity,
}) => {
  const [worldData, setWorldData] = useState<any>(null);
  const [zoom, setZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hasMovedRef = useRef<boolean>(false);

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoom((prev) => Math.min(MAX_ZOOM, Number((prev + ZOOM_STEP).toFixed(2))));
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoom((prev) => Math.max(MIN_ZOOM, Number((prev - ZOOM_STEP).toFixed(2))));
  };

  const handleResetZoom = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
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
    }
    const maxPanX = 500 * (zoom - 0.5);
    const maxPanY = 300 * (zoom - 0.5);
    setPan({
      x: Math.max(-Math.max(250, maxPanX), Math.min(Math.max(250, maxPanX), newX)),
      y: Math.max(-Math.max(200, maxPanY), Math.min(Math.max(200, maxPanY), newY)),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };


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
  const mapWidth = 1000;
  const mapHeight = 500;

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

  // Structured logging for map active routes
  useEffect(() => {
    console.log(`[MAP ACTIVE ROUTES]`);
    if (activePasses && activePasses.length > 0) {
      activePasses.forEach((p) => {
        console.log(`${p.stationName || p.stationId} → Mumbai (AWS Central Hub)`);
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

  // Compute curved SVG topology lines from each ground station to the central AWS Hub (Mumbai)
  const topologyLines = useMemo(() => {
    const hubCoords = projection([primaryHub.longitude, primaryHub.latitude]);
    if (!hubCoords) return [];

    const [hubX, hubY] = hubCoords;

    return regions.map((region) => {
      const stCoords = projection([region.longitude, region.latitude]);
      if (!stCoords) return null;

      const [stX, stY] = stCoords;

      // Calculate control point for smooth quadratic curve
      const midX = (stX + hubX) / 2;
      // Slight vertical arc towards northern hemisphere or proportional curvature
      const midY = Math.min(stY, hubY) - 30;

      const pathD = `M ${stX} ${stY} Q ${midX} ${midY} ${hubX} ${hubY}`;

      const isStationSelected =
        selectedEntity?.id === region.id ||
        (selectedEntity?.type === "station" && region.linkedStations.includes(selectedEntity.id));
      const isHubSelected = selectedEntity?.type === "AWS_HUB";
      const isHighlighted = isStationSelected || isHubSelected;

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
          color: "#3B82F6",       // Blue
          lightColor: "#60A5FA",
          darkColor: "#1D4ED8",
          windowColor: "#1E3A8A",
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

      return {
        id: region.id,
        regionName: region.name,
        pathD,
        isHighlighted,
        isPassActive,
        activeSatellites,
      };
    }).filter(Boolean);
  }, [regions, primaryHub, projection, selectedEntity, activePasses]);

  return (
    <Box
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
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
      {/* Zoom / Map Controls in Top Right */}
      <Box
        sx={{
          position: "absolute",
          top: 14,
          right: 14,
          zIndex: 35,
          display: "flex",
          flexDirection: "column",
          bgcolor: "rgba(11, 18, 24, 0.9)",
          backdropFilter: "blur(8px)",
          border: `1px solid rgba(255, 255, 255, 0.12)`,
          borderRadius: "6px",
          overflow: "hidden",
          boxShadow: "0 4px 14px rgba(0, 0, 0, 0.6)",
        }}
      >
        <IconButton
          size="small"
          onClick={handleZoomIn}
          disabled={zoom >= MAX_ZOOM}
          title="Zoom In (+)"
          sx={{
            color: zoom >= MAX_ZOOM ? "rgba(255,255,255,0.25)" : vars.text,
            p: 0.8,
            borderRadius: 0,
            "&:hover": {
              bgcolor: "rgba(56, 189, 248, 0.15)",
              color: "#38bdf8",
            },
          }}
        >
          <Plus size={16} />
        </IconButton>

        <Box sx={{ height: "1px", bgcolor: "rgba(255, 255, 255, 0.1)" }} />

        <IconButton
          size="small"
          onClick={handleZoomOut}
          disabled={zoom <= MIN_ZOOM}
          title="Zoom Out (−)"
          sx={{
            color: zoom <= MIN_ZOOM ? "rgba(255,255,255,0.25)" : vars.text,
            p: 0.8,
            borderRadius: 0,
            "&:hover": {
              bgcolor: "rgba(56, 189, 248, 0.15)",
              color: "#38bdf8",
            },
          }}
        >
          <Minus size={16} />
        </IconButton>

        <Box sx={{ height: "1px", bgcolor: "rgba(255, 255, 255, 0.1)" }} />

        <IconButton
          size="small"
          onClick={handleResetZoom}
          title="Reset View (⌂)"
          sx={{
            color: zoom === 1.0 && pan.x === 0 && pan.y === 0 ? "rgba(255,255,255,0.3)" : "#38bdf8",
            p: 0.8,
            borderRadius: 0,
            "&:hover": {
              bgcolor: "rgba(56, 189, 248, 0.15)",
              color: "#38bdf8",
            },
          }}
        >
          <RotateCcw size={14} />
        </IconButton>
      </Box>

      {/* Map Container */}
      <Box
        onClick={(e) => {
          if (!hasMovedRef.current && e.target === e.currentTarget) {
            onSelectEntity(null);
          }
        }}
        sx={{
          position: "relative",
          width: "96%",
          maxWidth: 1400,
          aspectRatio: "2/1",
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: "center center",
          transition: isDragging ? "none" : "transform 0.25s cubic-bezier(0.2, 0, 0, 1)",
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
                    {/* Animated moving neon green data-flow line (Ground Station -> Mumbai) */}
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

          {/* SATELLITE LIVE DATA-FLOW ANIMATIONS (Ground Station -> Mumbai) */}
          <g>
            {topologyLines.map((line) => {
              if (!line || !line.isPassActive || !line.activeSatellites || line.activeSatellites.length === 0) return null;

              const totalActive = line.activeSatellites.length;
              const animDuration = 5.5;

              // Render active satellites on the same route with spacing offset
              return line.activeSatellites.map((sat, index) => {
                // When both satellites are active, space them 50% apart along the route cycle
                const animBegin = totalActive > 1 && index === 1 ? `${(animDuration / 2).toFixed(2)}s` : "0s";

                return (
                  <g key={`sat-${line.id}-${sat.passType}`}>
                    {/* Leading energy pulse particle */}
                    <circle r="3" fill={sat.lightColor} filter="url(#satelliteGlow)">
                      <animateMotion
                        dur={`${animDuration}s`}
                        begin={animBegin}
                        repeatCount="indefinite"
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
                        path={line.pathD}
                      />

                      {/* Satellite Aura Halo */}
                      <circle cx="0" cy="0" r="10" fill={sat.color} opacity="0.25" filter="url(#satelliteGlow)" />

                      {/* Trailing Data Glow Particles Behind Satellite */}
                      <circle cx="-14" cy="0" r="1.5" fill={sat.lightColor} opacity="0.4" />
                      <circle cx="-9" cy="0" r="2.2" fill={sat.lightColor} opacity="0.7" />
                      <circle cx="-4" cy="0" r="2.8" fill={sat.lightColor} opacity="0.9" />

                      {/* Solar Panel Wings (Upper & Lower) */}
                      <rect x="-3" y="-8.5" width="6" height="4" rx="0.5" fill={sat.darkColor} stroke={sat.lightColor} strokeWidth="0.6" />
                      <line x1="-3" y1="-6.5" x2="3" y2="-6.5" stroke={sat.lightColor} strokeWidth="0.5" />
                      <line x1="0" y1="-8.5" x2="0" y2="-4.5" stroke={sat.lightColor} strokeWidth="0.5" />

                      <rect x="-3" y="4.5" width="6" height="4" rx="0.5" fill={sat.darkColor} stroke={sat.lightColor} strokeWidth="0.6" />
                      <line x1="-3" y1="6.5" x2="3" y2="6.5" stroke={sat.lightColor} strokeWidth="0.5" />
                      <line x1="0" y1="4.5" x2="0" y2="8.5" stroke={sat.lightColor} strokeWidth="0.5" />

                      {/* Satellite Central Chassis */}
                      <rect x="-4.5" y="-3.5" width="9" height="7" rx="1.5" fill="#f8fafc" stroke={sat.darkColor} strokeWidth="0.8" />
                      <rect x="-2.5" y="-2" width="5" height="4" rx="0.5" fill={sat.windowColor} />

                      {/* Forward Transceiver Antenna pointing towards Mumbai */}
                      <path d="M 4.5 0 L 7.5 -2.5 M 4.5 0 L 7.5 2.5 M 4.5 0 L 8.5 0" stroke={sat.lightColor} strokeWidth="0.8" strokeLinecap="round" />

                      {/* Live Data Active Blinking Beacon */}
                      <circle cx="1" cy="0" r="1.3" fill={sat.color} />
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

        {/* Global satellite color mapping & AWS Central Hub in ONE clean line */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2.5, flexWrap: "nowrap" }}>
          {/* SD1 : BLUE */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                bgcolor: "#3B82F6",
                boxShadow: "0 0 5px #3B82F6",
              }}
            />
            <Typography sx={{ fontSize: 10, fontWeight: 700, color: "#60A5FA", letterSpacing: 0.4 }}>
              SD1 : BLUE
            </Typography>
          </Box>

          {/* SD2 : YELLOW */}
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
              SD2 : YELLOW
            </Typography>
          </Box>

          {/* AWS CENTRAL HUB */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.7,
              pl: 1.5,
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
        </Box>
      </Box>
    </Box>
  );
};
