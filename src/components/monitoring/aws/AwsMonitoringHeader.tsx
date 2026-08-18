import React from 'react';
import { Box, Typography, Button, Select, MenuItem, FormControl, InputLabel, CircularProgress } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

interface AwsMonitoringHeaderProps {
  summary: any;
  hours: number;
  setHours: (h: number) => void;
  autoRefresh: number;
  setAutoRefresh: (s: number) => void;
  onRefresh: () => void;
  loading: boolean;
}

export default function AwsMonitoringHeader({
  summary,
  hours,
  setHours,
  autoRefresh,
  setAutoRefresh,
  onRefresh,
  loading
}: AwsMonitoringHeaderProps) {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', mb: 4, gap: 2 }}>
      <Box>
        <Typography sx={{ fontWeight: 700, fontSize: '30px', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 1 }}>
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg" 
            alt="AWS" 
            style={{ height: '24px', filter: 'invert(1) brightness(100)' }} 
          />
          CloudWatch Dashboard
        </Typography>
        <Typography sx={{ fontSize: '14px', color: 'rgba(255,255,255,.65)', mt: 0.5 }}>
          {summary?.instanceName} ({summary?.instanceId}) • {summary?.region} • {summary?.instanceType}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography 
          key={summary?.lastUpdated}
          sx={{ 
            fontSize: '14px',
            color: '#64748b', 
            display: 'flex', 
            alignItems: 'center', 
            gap: 0.5,
            animation: 'flash 1s ease-out',
            '@keyframes flash': {
              '0%': { color: '#0ea5e9' },
              '100%': { color: '#64748b' }
            }
          }}>
          <AccessTimeIcon fontSize="small" />
          Last updated: {new Date(summary?.lastUpdated || Date.now()).toLocaleTimeString()}
        </Typography>
        
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="auto-refresh-label" sx={{ color: '#94a3b8' }}>Auto Refresh</InputLabel>
          <Select
            labelId="auto-refresh-label"
            value={autoRefresh}
            label="Auto Refresh"
            onChange={(e) => setAutoRefresh(Number(e.target.value))}
            sx={{
              color: 'white',
              '.MuiOutlinedInput-notchedOutline': { borderColor: '#334155' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#475569' },
              '.MuiSvgIcon-root': { color: '#94a3b8' },
            }}
          >
            <MenuItem value={0}>Off</MenuItem>
            <MenuItem value={30}>30 Seconds</MenuItem>
            <MenuItem value={60}>1 Minute</MenuItem>
            <MenuItem value={300}>5 Minutes</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="time-range-label" sx={{ color: '#94a3b8' }}>Time Range</InputLabel>
          <Select
            labelId="time-range-label"
            value={hours}
            label="Time Range"
            onChange={(e) => setHours(Number(e.target.value))}
            sx={{
              color: 'white',
              '.MuiOutlinedInput-notchedOutline': { borderColor: '#334155' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#475569' },
              '.MuiSvgIcon-root': { color: '#94a3b8' },
            }}
          >
            <MenuItem value={1}>Last 1 Hour</MenuItem>
            <MenuItem value={3}>Last 3 Hours</MenuItem>
            <MenuItem value={12}>Last 12 Hours</MenuItem>
            <MenuItem value={24}>Last 24 Hours</MenuItem>
            <MenuItem value={168}>Last 1 Week</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="outlined"
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <RefreshIcon />}
          onClick={onRefresh}
          disabled={loading}
          sx={{
            color: 'white',
            borderColor: '#334155',
            '&:hover': { borderColor: '#475569', bgcolor: 'rgba(255,255,255,0.05)' },
            '&.Mui-disabled': { color: '#64748b', borderColor: '#334155' }
          }}
        >
          Refresh
        </Button>
      </Box>
    </Box>
  );
}
