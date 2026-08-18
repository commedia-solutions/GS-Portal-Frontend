import React from 'react';
import { Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

interface AwsLatestMetricsTableProps {
  charts: any;
}

export default function AwsLatestMetricsTable({ charts }: AwsLatestMetricsTableProps) {
  if (!charts) return null;

  const getStats = (data: any[]) => {
    if (!data || data.length === 0) return { current: '-', average: '-', maximum: '-', lastUpdated: '-' };
    const values = data.map((d: any) => d.value);
    const lastTimestamp = data[data.length - 1].timestamp;
    return {
      current: values[values.length - 1].toFixed(2),
      average: (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2),
      maximum: Math.max(...values).toFixed(2),
      lastUpdated: new Date(lastTimestamp).toLocaleString()
    };
  };

  const metrics = [
    { name: 'CPU Utilization', key: 'cpu', unit: '%' },
    { name: 'Network In', key: 'networkIn', unit: 'Bytes' },
    { name: 'Network Out', key: 'networkOut', unit: 'Bytes' },
    { name: 'Network Packets In', key: 'networkPacketsIn', unit: 'Count' },
    { name: 'Network Packets Out', key: 'networkPacketsOut', unit: 'Count' },
    { name: 'CPU Credit Usage', key: 'cpuCreditUsage', unit: 'Credits' },
    { name: 'CPU Credit Balance', key: 'cpuCreditBalance', unit: 'Credits' },
    { name: 'Metadata No Token', key: 'metadataNoToken', unit: 'Requests' },
    { name: 'Status Check Failed', key: 'statusChecks', unit: 'Count' },
  ];

  return (
    <Card sx={{ 
      bgcolor: '#1C2432', 
      color: 'white', 
      borderRadius: '16px',
      border: '1px solid rgba(255,255,255,.06)' 
    }}>
      <CardContent sx={{ p: '20px !important' }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Latest Metrics
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: '#94a3b8', borderBottom: '1px solid #334155', fontSize: '13px' }}>Metric</TableCell>
                <TableCell sx={{ color: '#94a3b8', borderBottom: '1px solid #334155', fontSize: '13px' }} align="right">Current</TableCell>
                <TableCell sx={{ color: '#94a3b8', borderBottom: '1px solid #334155', fontSize: '13px' }} align="right">Average</TableCell>
                <TableCell sx={{ color: '#94a3b8', borderBottom: '1px solid #334155', fontSize: '13px' }} align="right">Maximum</TableCell>
                <TableCell sx={{ color: '#94a3b8', borderBottom: '1px solid #334155', fontSize: '13px' }} align="right">Unit</TableCell>
                <TableCell sx={{ color: '#94a3b8', borderBottom: '1px solid #334155', fontSize: '13px' }} align="right">Last Updated</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {metrics.map((metric) => {
                const stats = getStats(charts[metric.key]);
                return (
                  <TableRow key={metric.name}>
                    <TableCell sx={{ color: '#cbd5e1', borderBottom: '1px solid #334155', fontSize: '13px' }}>
                      {metric.name}
                    </TableCell>
                    <TableCell sx={{ color: 'white', borderBottom: '1px solid #334155', fontSize: '13px' }} align="right">
                      {stats.current}
                    </TableCell>
                    <TableCell sx={{ color: 'white', borderBottom: '1px solid #334155', fontSize: '13px' }} align="right">
                      {stats.average}
                    </TableCell>
                    <TableCell sx={{ color: 'white', borderBottom: '1px solid #334155', fontSize: '13px' }} align="right">
                      {stats.maximum}
                    </TableCell>
                    <TableCell sx={{ color: '#94a3b8', borderBottom: '1px solid #334155', fontSize: '13px' }} align="right">
                      {metric.unit}
                    </TableCell>
                    <TableCell sx={{ color: '#94a3b8', borderBottom: '1px solid #334155', fontSize: '13px' }} align="right">
                      {stats.lastUpdated}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}
