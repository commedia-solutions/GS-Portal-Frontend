import React, { useState, useEffect, useRef } from 'react';
import { Box, Alert } from '@mui/material';
import { apiFetch } from '../../../api/http';
import SkeletonDashboard from './SkeletonDashboard';
import AwsMonitoringHeader from './AwsMonitoringHeader';
import AwsHealthCards from './AwsHealthCards';
import AwsChartsGrid from './AwsChartsGrid';
import AwsLatestMetricsTable from './AwsLatestMetricsTable';
import { AwsErrorBoundary } from './ErrorBoundary';

interface AwsDashboardRendererProps {
  deviceId: string | number;
}

export default function AwsDashboardRenderer({ deviceId }: AwsDashboardRendererProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hours, setHours] = useState<number>(1);
  const [autoRefresh, setAutoRefresh] = useState<number>(0);
  const refreshInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      setError(null);
      const json = await apiFetch<any>(`/api/monitoring/devices/${deviceId}/dashboard?hours=${hours}`, { signal });
      if (json && json.success) {
        setData(json.dashboard);
      } else {
        throw new Error(json?.message || 'Error fetching dashboard');
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchData(controller.signal);
    return () => controller.abort();
  }, [deviceId, hours]);

  useEffect(() => {
    if (refreshInterval.current) clearInterval(refreshInterval.current);
    if (autoRefresh > 0) {
      refreshInterval.current = setInterval(() => {
        fetchData();
      }, autoRefresh * 1000);
    }
    return () => {
      if (refreshInterval.current) clearInterval(refreshInterval.current);
    };
  }, [autoRefresh, deviceId, hours]);

  if (loading && !data) return <SkeletonDashboard />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!data) return <Alert severity="info">No data available</Alert>;

  return (
    <AwsErrorBoundary>
      <Box sx={{ 
        p: '28px', 
        bgcolor: '#111827', 
        minHeight: '100vh', 
        color: 'white',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '18px',
        boxShadow: '0 12px 32px rgba(0,0,0,.28)'
      }}>
        <AwsMonitoringHeader
          summary={data.summary}
          hours={hours}
          setHours={setHours}
          autoRefresh={autoRefresh}
          setAutoRefresh={setAutoRefresh}
          onRefresh={() => fetchData()}
          loading={loading}
        />
        <AwsHealthCards summary={data.summary} />
        <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <AwsChartsGrid charts={data.charts} />
          <AwsLatestMetricsTable charts={data.charts} />
        </Box>
      </Box>
    </AwsErrorBoundary>
  );
}
