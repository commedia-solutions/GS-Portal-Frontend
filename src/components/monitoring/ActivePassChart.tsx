import React, { useMemo, useState, useRef, useEffect } from "react";
import { Box, Typography, IconButton, Select, MenuItem, FormControl } from "@mui/material";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { RefreshCw } from "lucide-react";
import { vars } from "../../ui/toast/themeBridge";

export interface ActivePassChartProps {
  data?: any[];
  regions?: any[];
  passes?: any[];
  duration?: string;
  timeRange?: string;
  onDurationChange?: (val: string) => void;
  onTimeRangeChange?: (val: string) => void;
  refreshInterval?: string;
  onRefreshIntervalChange?: (val: string) => void;
  statistic?: string;
  onStatisticChange?: (val: string) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const DURATION_OPTIONS = [
  { value: "1m", label: "1 minute" },
  { value: "5m", label: "5 minutes" },
  { value: "10m", label: "10 minutes" },
  { value: "15m", label: "15 minutes" },
  { value: "30m", label: "30 minutes" },
  { value: "1h", label: "1 hour" },
  { value: "3h", label: "3 hours" },
  { value: "6h", label: "6 hours" },
  { value: "12h", label: "12 hours" },
  { value: "1d", label: "1 day" },
  { value: "2d", label: "2 days" },
  { value: "3d", label: "3 days" },
  { value: "7d", label: "7 days" },
  { value: "14d", label: "14 days" },
];

const STATISTIC_OPTIONS = [
  { value: "Average", label: "Average" },
  { value: "Maximum", label: "Maximum" },
  { value: "Minimum", label: "Minimum" },
  { value: "Sum", label: "Sum" },
];

const REFRESH_OPTIONS = [
  { value: "1s", label: "1s" },
  { value: "5s", label: "5s" },
  { value: "10s", label: "10s" },
  { value: "20s", label: "20s" },
  { value: "30s", label: "30s" },
  { value: "1m", label: "1m" },
  { value: "5m", label: "5m" },
  { value: "15m", label: "15m" },
  { value: "1h", label: "1h" },
  { value: "6h", label: "6h" },
  { value: "1d", label: "1d" },
  { value: "off", label: "Off" },
];

const selectSx = {
  height: 28,
  fontSize: 11,
  color: vars.text,
  bgcolor: "rgba(255, 255, 255, 0.04)",
  borderRadius: "4px",
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: vars.accent,
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: vars.accent,
  },
  "& .MuiSelect-select": {
    py: 0.5,
    px: 1.2,
    display: "flex",
    alignItems: "center",
  },
  "& .MuiSvgIcon-root": {
    color: vars.textDim,
    fontSize: 16,
  },
};

const menuProps = {
  PaperProps: {
    sx: {
      bgcolor: "#0F172A",
      border: `1px solid ${vars.border}`,
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
      "& .MuiMenuItem-root": {
        fontSize: 11,
        color: vars.text,
        py: 0.8,
        "&:hover": {
          bgcolor: "rgba(255, 255, 255, 0.08)",
        },
        "&.Mui-selected": {
          bgcolor: "rgba(14, 165, 233, 0.15)",
          color: vars.accent,
          fontWeight: "bold",
          "&:hover": {
            bgcolor: "rgba(14, 165, 233, 0.25)",
          },
        },
      },
    },
  },
};

export const ActivePassChart: React.FC<ActivePassChartProps> = ({ 
  data, 
  regions = [],
  passes = [], 
  duration,
  timeRange, 
  onDurationChange,
  onTimeRangeChange,
  refreshInterval = "5s",
  onRefreshIntervalChange,
  statistic = "Average",
  onStatisticChange,
  onRefresh,
  isRefreshing = false
}) => {
  const activeDuration = duration || timeRange || "15m";
  const [localSpinning, setLocalSpinning] = useState(false);
  const [selectedStationId, setSelectedStationId] = useState<string>("CP1");

  // Dynamically derive Station / Pass dropdown options from regions with real satellite names
  const stationOptions = useMemo(() => {
    if (regions && regions.length > 0) {
      return regions.flatMap((region: any) => 
        (region.stations || []).map((st: any) => {
          const isSD1 = String(st.id).includes("1");
          const pass = st.id;
          const sd = isSD1 ? "SD1" : "SD2";
          const sat = (st.satellite && st.satellite !== "CP1" && st.satellite !== "CP2") 
            ? st.satellite 
            : (st.currentPass?.satellite && st.currentPass.satellite !== "CP1" && st.currentPass.satellite !== "CP2" 
                ? st.currentPass.satellite 
                : (isSD1 ? "SPADEX-SD1" : "SPADEX-SD2"));

          return {
            id: st.id,
            label: `${region.name || region.city} - ${st.id}`,
            stationName: region.name || region.city,
            satelliteName: sat,
            pass,
            sd,
          };
        })
      );
    }
    // Standard dynamic fallback for known regions
    return [
      { id: "CP1", label: "Cape Town - CP1", stationName: "Cape Town", satelliteName: "SPADEX-SD1", pass: "CP1", sd: "SD1" },
      { id: "CP2", label: "Cape Town - CP2", stationName: "Cape Town", satelliteName: "SPADEX-SD2", pass: "CP2", sd: "SD2" },
      { id: "DU1", label: "Dublin - DU1", stationName: "Dublin", satelliteName: "SPADEX-SD1", pass: "DU1", sd: "SD1" },
      { id: "DU2", label: "Dublin - DU2", stationName: "Dublin", satelliteName: "SPADEX-SD2", pass: "DU2", sd: "SD2" },
      { id: "PA1", label: "Punta Arenas - PA1", stationName: "Punta Arenas", satelliteName: "SPADEX-SD1", pass: "PA1", sd: "SD1" },
      { id: "PA2", label: "Punta Arenas - PA2", stationName: "Punta Arenas", satelliteName: "SPADEX-SD2", pass: "PA2", sd: "SD2" },
      { id: "DB1", label: "Dubbo - DB1", stationName: "Dubbo", satelliteName: "SPADEX-SD1", pass: "DB1", sd: "SD1" },
      { id: "DB2", label: "Dubbo - DB2", stationName: "Dubbo", satelliteName: "SPADEX-SD2", pass: "DB2", sd: "SD2" },
    ];
  }, [regions]);

  const selectedOption = useMemo(() => {
    return stationOptions.find(opt => opt.id === selectedStationId) || stationOptions[0];
  }, [stationOptions, selectedStationId]);

  // Keep selectedStationId valid when regions list dynamically updates
  useEffect(() => {
    if (stationOptions.length > 0 && !stationOptions.some(opt => opt.id === selectedStationId)) {
      setSelectedStationId(stationOptions[0].id);
    }
  }, [stationOptions, selectedStationId]);

  // Persistent accumulation per station to completely isolate data streams
  const stationMapCacheRef = useRef<Map<string, Map<number, any>>>(new Map());

  const handleDurationChange = (val: string) => {
    if (onDurationChange) onDurationChange(val);
    else if (onTimeRangeChange) onTimeRangeChange(val);
  };

  const handleManualRefresh = () => {
    setLocalSpinning(true);
    if (onRefresh) onRefresh();
    setTimeout(() => setLocalSpinning(false), 800);
  };

  // Extract raw telemetry points specifically for the selected station
  const stationRawPoints = useMemo(() => {
    if (regions && regions.length > 0) {
      for (const r of regions) {
        const st = (r.stations || []).find((s: any) => s.id === selectedStationId);
        if (st && st.passMetrics && st.passMetrics.length > 0) {
          return st.passMetrics;
        }
      }
    }
    if (data && data.length > 0) {
      return data.filter((d: any) => d.stationId === selectedStationId);
    }
    return [];
  }, [regions, data, selectedStationId]);

  const durationMsMap: Record<string, number> = useMemo(() => ({
    "1m": 60 * 1000,
    "5m": 5 * 60 * 1000,
    "10m": 10 * 60 * 1000,
    "15m": 15 * 60 * 1000,
    "30m": 30 * 60 * 1000,
    "1h": 60 * 60 * 1000,
    "3h": 3 * 60 * 60 * 1000,
    "6h": 6 * 60 * 60 * 1000,
    "12h": 12 * 60 * 60 * 1000,
    "1d": 24 * 60 * 60 * 1000,
    "24h": 24 * 60 * 60 * 1000,
    "2d": 2 * 24 * 60 * 60 * 1000,
    "3d": 3 * 24 * 60 * 60 * 1000,
    "7d": 7 * 24 * 60 * 60 * 1000,
    "14d": 14 * 24 * 60 * 60 * 1000,
  }), []);

  const durationMs = durationMsMap[activeDuration] || 900000;
  const nowMs = Date.now();
  const windowEnd = nowMs;
  const windowStart = nowMs - durationMs;

  const { pivotedData, latestTimestampStr } = useMemo(() => {
    if (!stationMapCacheRef.current.has(selectedStationId)) {
      stationMapCacheRef.current.set(selectedStationId, new Map());
    }
    const map = stationMapCacheRef.current.get(selectedStationId)!;

    if (stationRawPoints && stationRawPoints.length > 0) {
      stationRawPoints.forEach((d: any) => {
        const time = new Date(d.timestamp).getTime();
        if (!isNaN(time)) {
          const existing = map.get(time) || { timestamp: time };
          const updated = {
            ...existing,
            timestamp: time,
            ...(d.ebNo !== undefined && d.ebNo !== null ? { 'Eb/No': d.ebNo } : {}),
            ...(d.ifLevel !== undefined && d.ifLevel !== null ? { 'IF Level': d.ifLevel } : {})
          };
          map.set(time, updated);
        }
      });
    }

    // Purge old points that are well outside the maximum retention window
    for (const [time] of map) {
      if (time < windowStart - (durationMs * 0.2)) {
        map.delete(time);
      }
    }

    let sortedData = Array.from(map.values()).sort((a, b) => a.timestamp - b.timestamp);
    
    // Filter visible dataset to the strictly calculated Duration window [windowStart, windowEnd]
    sortedData = sortedData.filter(d => d.timestamp >= windowStart && d.timestamp <= windowEnd);
    
    // Calculate dynamic gap threshold based on duration window / CW Period
    let gapThreshold = 3000; // 3 seconds for 1m-30m (1s period)
    if (activeDuration === "1h") gapThreshold = 15000; // 5s period
    else if (activeDuration === "3h") gapThreshold = 30000; // 10s period
    else if (activeDuration === "6h" || activeDuration === "12h" || activeDuration === "1d" || activeDuration === "24h") gapThreshold = 180000; // 60s period
    else if (activeDuration === "2d" || activeDuration === "3d") gapThreshold = 900000; // 300s period
    else if (activeDuration === "7d" || activeDuration === "14d") gapThreshold = 2700000; // 900s period

    const nullEntries = { 'Eb/No': null, 'IF Level': null };
    const finalData: any[] = [];

    // Anchor at window start (invisible point with null metrics)
    finalData.push({
      timestamp: windowStart,
      ...nullEntries
    });

    for (let i = 0; i < sortedData.length; i++) {
      const current = sortedData[i];
      finalData.push(current);

      if (i < sortedData.length - 1) {
        const next = sortedData[i + 1];
        if (next.timestamp - current.timestamp > gapThreshold) {
          finalData.push({
            timestamp: current.timestamp + Math.floor((next.timestamp - current.timestamp) / 2),
            ...nullEntries
          });
        }
      }
    }

    // Anchor at window end (invisible point with null metrics)
    finalData.push({
      timestamp: windowEnd,
      ...nullEntries
    });
    
    const realPoints = sortedData.filter(d => d['Eb/No'] != null || d['IF Level'] != null);
    const visibleMax = realPoints.length > 0 ? realPoints[realPoints.length - 1].timestamp : 0;
    const latestStr = visibleMax ? new Date(visibleMax).toISOString().replace("T", " ").substring(0, 19) + " UTC" : "";

    return { 
      pivotedData: finalData, 
      latestTimestampStr: latestStr
    };
  }, [stationRawPoints, activeDuration, selectedStationId, windowStart, windowEnd, durationMs]);

  // Generate intelligent X-axis ticks spanning the entire windowStart -> windowEnd timeline
  const xAxisTicks = useMemo(() => {
    const ticks: number[] = [];
    let stepMs = 60000;

    if (activeDuration === "14d" || activeDuration === "7d") {
      stepMs = 24 * 60 * 60 * 1000; // 1 day
    } else if (activeDuration === "3d") {
      stepMs = 12 * 60 * 60 * 1000; // 12 hours
    } else if (activeDuration === "2d") {
      stepMs = 8 * 60 * 60 * 1000; // 8 hours
    } else if (activeDuration === "1d" || activeDuration === "24h") {
      stepMs = 4 * 60 * 60 * 1000; // 4 hours
    } else if (activeDuration === "12h") {
      stepMs = 2 * 60 * 60 * 1000; // 2 hours
    } else if (activeDuration === "6h") {
      stepMs = 60 * 60 * 1000; // 1 hour
    } else if (activeDuration === "3h") {
      stepMs = 30 * 60 * 1000; // 30 min
    } else if (activeDuration === "1h") {
      stepMs = 10 * 60 * 1000; // 10 min
    } else if (activeDuration === "30m") {
      stepMs = 5 * 60 * 1000; // 5 min
    } else if (activeDuration === "15m") {
      stepMs = 3 * 60 * 1000; // 3 min
    } else if (activeDuration === "10m") {
      stepMs = 2 * 60 * 1000; // 2 min
    } else if (activeDuration === "5m") {
      stepMs = 60 * 1000; // 1 min
    } else if (activeDuration === "1m") {
      stepMs = 15 * 1000; // 15 sec
    }

    const firstTick = Math.ceil(windowStart / stepMs) * stepMs;
    for (let t = firstTick; t <= windowEnd; t += stepMs) {
      ticks.push(t);
    }
    if (ticks.length === 0 || ticks[0] > windowStart + (stepMs * 0.4)) {
      ticks.unshift(windowStart);
    }
    if (ticks[ticks.length - 1] < windowEnd - (stepMs * 0.4)) {
      ticks.push(windowEnd);
    }
    return ticks;
  }, [windowStart, windowEnd, activeDuration]);

  const formatTimeUTC = (time: number) => {
    const d = new Date(time);
    if (isNaN(d.getTime())) return "";

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthStr = months[d.getUTCMonth()];
    const dayStr = d.getUTCDate().toString().padStart(2, '0');
    const hoursStr = d.getUTCHours().toString().padStart(2, '0');
    const minutesStr = d.getUTCMinutes().toString().padStart(2, '0');
    const secondsStr = d.getUTCSeconds().toString().padStart(2, '0');

    if (activeDuration === "14d" || activeDuration === "7d") {
      return `${monthStr} ${dayStr}`;
    }
    if (activeDuration === "3d" || activeDuration === "2d") {
      return `${monthStr} ${dayStr} ${hoursStr}:${minutesStr}`;
    }
    if (activeDuration === "1d" || activeDuration === "24h" || activeDuration === "12h") {
      const monthNum = (d.getUTCMonth() + 1).toString().padStart(2, '0');
      return `${monthNum}/${dayStr} ${hoursStr}:${minutesStr}`;
    }
    if (activeDuration === "1m" || activeDuration === "5m" || activeDuration === "10m") {
      return `${hoursStr}:${minutesStr}:${secondsStr}`;
    }
    return `${hoursStr}:${minutesStr}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // Only render tooltip if at least one metric at this point is genuinely present
      const hasRealMetric = payload.some((p: any) => p.value !== null && p.value !== undefined);
      if (!hasRealMetric) return null;

      const d = new Date(label);
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const day = d.getUTCDate().toString().padStart(2, '0');
      const month = months[d.getUTCMonth()];
      const year = d.getUTCFullYear();
      const hours = d.getUTCHours().toString().padStart(2, '0');
      const minutes = d.getUTCMinutes().toString().padStart(2, '0');
      const seconds = d.getUTCSeconds().toString().padStart(2, '0');
      const formattedTs = `${day} ${month} ${year} ${hours}:${minutes}:${seconds} UTC`;

      const satName = selectedOption?.satelliteName || (String(selectedStationId).includes("1") ? "SPADEX-SD1" : "SPADEX-SD2");

      return (
        <Box sx={{ bgcolor: "#0F172A", border: `1px solid ${vars.border}`, p: 1.5, borderRadius: 1, minWidth: 220, boxShadow: "0 10px 25px -5px rgba(0,0,0,0.5)" }}>
          <Box sx={{ pb: 0.8, mb: 0.8, borderBottom: `1px solid rgba(255,255,255,0.1)` }}>
            <Typography sx={{ fontSize: 12, fontWeight: "bold", color: vars.text }}>
              {selectedOption?.stationName} - {selectedOption?.pass}
            </Typography>
            <Typography sx={{ fontSize: 11, color: "#38BDF8", fontWeight: 600, mt: 0.2 }}>
              Satellite: <span style={{ color: vars.text }}>{satName}</span>
            </Typography>
            <Typography sx={{ fontSize: 10, color: vars.textDim, fontFamily: "monospace", mt: 0.3 }}>
              Timestamp: {formattedTs}
            </Typography>
          </Box>
          {payload.map((entry: any) => {
            if (entry.value == null) return null;
            return (
              <Typography key={entry.name} sx={{ fontSize: 11, color: entry.color, display: "flex", justifyContent: "space-between", gap: 3, py: 0.2 }}>
                <span>{entry.name}:</span>
                <span style={{ fontWeight: "bold", fontFamily: "monospace" }}>
                  {typeof entry.value === "number" ? `${entry.value.toFixed(2)} ${entry.name.includes("Eb/No") ? "dB" : "dBm"}` : entry.value}
                </span>
              </Typography>
            );
          })}
        </Box>
      );
    }
    return null;
  };

  // Color convention: CP1/SD1 -> Purple (#A855F7), CP2/SD2 -> Yellow (#EAB308), IF Level -> Sky Blue (#0EA5E9)
  const isSD1 = String(selectedStationId).includes("1");
  const ebNoColor = isSD1 ? "#A855F7" : "#EAB308";
  const ifLevelColor = "#0EA5E9";

  return (
    <Box sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
      
      {/* AWS CloudWatch-style Control Bar */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 1.5, py: 1, borderBottom: `1px solid rgba(255,255,255,0.05)`, bgcolor: "rgba(0,0,0,0.15)", flexWrap: "wrap", gap: 1 }}>
        
        {/* Left Side: Dropdowns & Actions */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          
          {/* 1. Station / Pass Selector */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
            <Typography sx={{ fontSize: 11, color: vars.textDim, fontWeight: 500 }}>
              Station / Pass:
            </Typography>
            <FormControl size="small">
              <Select
                value={selectedStationId}
                onChange={(e) => setSelectedStationId(e.target.value)}
                sx={{ ...selectSx, minWidth: 140 }}
                MenuProps={menuProps}
              >
                {stationOptions.map(opt => (
                  <MenuItem key={opt.id} value={opt.id}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* 2. Duration Dropdown */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
            <Typography sx={{ fontSize: 11, color: vars.textDim, fontWeight: 500 }}>
              Duration:
            </Typography>
            <FormControl size="small">
              <Select
                value={activeDuration}
                onChange={(e) => handleDurationChange(e.target.value)}
                sx={selectSx}
                MenuProps={menuProps}
              >
                {DURATION_OPTIONS.map(opt => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* 3. Statistic Dropdown */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
            <Typography sx={{ fontSize: 11, color: vars.textDim, fontWeight: 500 }}>
              Stat:
            </Typography>
            <FormControl size="small">
              <Select
                value={statistic}
                onChange={(e) => onStatisticChange?.(e.target.value)}
                sx={selectSx}
                MenuProps={menuProps}
              >
                {STATISTIC_OPTIONS.map(opt => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* 4. Refresh Range Dropdown */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
            <Typography sx={{ fontSize: 11, color: vars.textDim, fontWeight: 500 }}>
              Refresh:
            </Typography>
            <FormControl size="small">
              <Select
                value={refreshInterval}
                onChange={(e) => onRefreshIntervalChange?.(e.target.value)}
                sx={selectSx}
                MenuProps={menuProps}
              >
                {REFRESH_OPTIONS.map(opt => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* 5. Manual Refresh Button */}
          <IconButton 
            size="small" 
            onClick={handleManualRefresh} 
            title="Refresh metric graph"
            sx={{ 
              color: (isRefreshing || localSpinning) ? vars.accent : vars.textDim, 
              border: `1px solid rgba(255,255,255,0.1)`, 
              borderRadius: "4px",
              p: 0.6,
              bgcolor: "rgba(255, 255, 255, 0.04)",
              "&:hover": { color: vars.accent, bgcolor: "rgba(255,255,255,0.08)" } 
            }}
          >
            <RefreshCw 
              size={13} 
              style={{
                animation: (isRefreshing || localSpinning) ? "spin 0.8s linear infinite" : "none",
                transformOrigin: "center"
              }} 
            />
          </IconButton>

          {/* 6. UTC Indicator */}
          <Typography sx={{ fontSize: 11, color: vars.textDim, fontWeight: "bold", bgcolor: "rgba(255,255,255,0.05)", px: 0.8, py: 0.3, borderRadius: 0.5, border: "1px solid rgba(255,255,255,0.08)" }}>
            UTC
          </Typography>
        </Box>
        
        {/* Right Side: Latest update */}
        {latestTimestampStr && (
          <Typography sx={{ fontSize: 11, color: vars.textDim }}>
            Latest update: <span style={{ color: vars.text, fontFamily: "monospace" }}>{latestTimestampStr}</span>
          </Typography>
        )}
      </Box>

      {/* Chart Area */}
      <Box sx={{ flex: 1, minHeight: 0, px: 2, pb: 1, pt: 1 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={pivotedData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            
            <XAxis 
              dataKey="timestamp" 
              type="number"
              scale="time"
              domain={[windowStart, windowEnd]}
              ticks={xAxisTicks}
              tickFormatter={formatTimeUTC}
              stroke={vars.textDim} 
              fontSize={10} 
              tickMargin={10}
            />
            
            <YAxis 
              yAxisId="left" 
              stroke={vars.textDim} 
              fontSize={10} 
              tickMargin={8} 
              domain={[(min: number) => isFinite(min) ? min - 1 : 'auto', (max: number) => isFinite(max) ? max + 1 : 'auto']}
              tickFormatter={(val: number) => val.toFixed(2)}
              label={{ value: 'Eb/No (dB) / IF Level (dBm)', angle: -90, position: 'insideLeft', style: { fill: vars.textDim, fontSize: 11 } }}
            />
            
            <Tooltip content={<CustomTooltip />} isAnimationActive={false} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
            
            <Legend 
              verticalAlign="bottom" 
              align="center" 
              wrapperStyle={{ fontSize: 11, paddingTop: 10 }} 
              iconType="circle"
              iconSize={8}
            />
            
            <Line 
              yAxisId="left"
              type="linear" 
              dataKey="Eb/No" 
              name="Eb/No (dB)"
              stroke={ebNoColor} 
              strokeWidth={2} 
              strokeDasharray="none"
              dot={pivotedData.length <= 300 ? { r: 2, fill: ebNoColor, strokeWidth: 0 } : false} 
              activeDot={{ r: 5, stroke: vars.bgCard, strokeWidth: 2 }} 
              connectNulls={false}
              isAnimationActive={false}
            />

            <Line 
              yAxisId="left"
              type="linear" 
              dataKey="IF Level" 
              name="IF Level (dBm)"
              stroke={ifLevelColor} 
              strokeWidth={2} 
              strokeDasharray="none"
              dot={pivotedData.length <= 300 ? { r: 2, fill: ifLevelColor, strokeWidth: 0 } : false} 
              activeDot={{ r: 5, stroke: vars.bgCard, strokeWidth: 2 }} 
              connectNulls={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

