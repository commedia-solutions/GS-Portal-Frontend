import React from 'react';
import { Box, Typography } from '@mui/material';
import AwsDashboardRenderer from './aws/AwsDashboardRenderer';
import { AwsErrorBoundary } from './aws/ErrorBoundary';

interface MonitoringDashboardProps {
  deviceId: string | number;
  provider: string;
}

export default function MonitoringDashboard({ deviceId, provider }: MonitoringDashboardProps) {
  if (provider?.toLowerCase() === 'aws') {
    return (
      <AwsErrorBoundary>
        <AwsDashboardRenderer deviceId={deviceId} />
      </AwsErrorBoundary>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h6">Monitoring not supported for provider: {provider}</Typography>
    </Box>
  );
}
