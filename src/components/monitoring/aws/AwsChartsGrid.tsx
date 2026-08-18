import React from 'react';
import { Grid, Box } from '@mui/material';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import ChartCard from './ChartCard';
import { format } from 'date-fns';

interface AwsChartsGridProps {
  charts: any;
}

const CustomTooltip = ({ active, payload, label, unit }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ backgroundColor: '#1e293b', padding: '10px', border: '1px solid #334155', borderRadius: '4px', color: 'white' }}>
        <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>
          {new Date(label).toLocaleString()}
        </p>
        <p style={{ margin: '4px 0 0', fontWeight: 'bold', color: payload[0].color }}>
          {payload[0].name}: {payload[0].value.toFixed(2)} {unit}
        </p>
      </div>
    );
  }
  return null;
};

export default function AwsChartsGrid({ charts }: AwsChartsGridProps) {
  const getStats = (data: any[]) => {
    if (!data || data.length === 0) return { current: undefined, average: undefined, maximum: undefined };
    const values = data.map((d: any) => d.value);
    return {
      current: values[values.length - 1],
      average: values.reduce((a, b) => a + b, 0) / values.length,
      maximum: Math.max(...values)
    };
  };

  const formatDate = (tickItem: string) => {
    return format(new Date(tickItem), 'HH:mm');
  };

  const renderChart = (title: string, dataKey: string, data: any[], color: string, unit: string, isStep = false, yAxisFormatter?: (v: any) => string) => {
    const stats = getStats(data);
    const formatter = yAxisFormatter || ((value: any) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value);

    return (
      <Box>
        <ChartCard
          title={title}
          unit={unit}
          current={stats.current}
          average={stats.average}
          maximum={stats.maximum}
          hasData={data && data.length > 0}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data || []} margin={{ top: 10, right: 16, bottom: 10, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis 
                dataKey="timestamp" 
                stroke="#64748b" 
                tickFormatter={formatDate}
                tick={{ fontSize: 11, fill: '#64748b' }}
                minTickGap={30}
              />
              <YAxis 
                stroke="#64748b" 
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickFormatter={formatter}
                domain={isStep ? [0, 1] : ['auto', 'auto']}
                ticks={isStep ? [0, 1] : undefined}
                width={40}
              />
              <Tooltip content={<CustomTooltip unit={unit} />} />
              <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 500, paddingTop: '10px' }} align="center" verticalAlign="bottom" />
              <Line 
                type={isStep ? "stepAfter" : "monotone"} 
                dataKey="value" 
                name={title}
                stroke={color} 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
                isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </Box>
    );
  };

  return (
    <Box sx={{ 
      display: 'grid', 
      gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))' }, 
      gap: '24px',
      mb: 3
    }}>
      {renderChart('CPU Utilization', 'cpu', charts.cpu, '#00B5FF', '%')}
      {renderChart('Network In', 'networkIn', charts.networkIn, '#00E676', 'Bytes')}
      {renderChart('Network Out', 'networkOut', charts.networkOut, '#FF9800', 'Bytes')}
      {renderChart('Network Packets In', 'networkPacketsIn', charts.networkPacketsIn, '#00E676', 'Count')}
      {renderChart('Network Packets Out', 'networkPacketsOut', charts.networkPacketsOut, '#FF9800', 'Count')}
      {renderChart('CPU Credit Usage', 'cpuCreditUsage', charts.cpuCreditUsage, '#26C6DA', 'Credits')}
      {renderChart('CPU Credit Balance', 'cpuCreditBalance', charts.cpuCreditBalance, '#29B6F6', 'Credits')}
      {renderChart('Metadata No Token', 'metadataNoToken', charts.metadataNoToken, '#AB47BC', 'Requests')}
      {renderChart('Status Check Failed', 'statusChecks', charts.statusChecks, '#F44336', 'Count', true)}
    </Box>
  );
}
