import React from 'react';
import { Box, Skeleton, Grid } from '@mui/material';

export default function SkeletonDashboard() {
  return (
    <Box sx={{ p: 3, bgcolor: '#0f172a', minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Skeleton variant="text" width={300} height={60} sx={{ bgcolor: '#1e293b' }} />
        <Skeleton variant="rectangular" width={250} height={40} sx={{ bgcolor: '#1e293b', borderRadius: 1 }} />
      </Box>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Grid item xs={12} sm={4} md={2} key={i}>
            <Skeleton variant="rectangular" height={100} sx={{ bgcolor: '#1e293b', borderRadius: 2 }} />
          </Grid>
        ))}
      </Grid>
      <Skeleton variant="rectangular" height={300} sx={{ mb: 3, bgcolor: '#1e293b', borderRadius: 2 }} />
      <Grid container spacing={3}>
        {[1, 2, 3, 4].map((i) => (
          <Grid item xs={12} md={6} key={i}>
            <Skeleton variant="rectangular" height={300} sx={{ bgcolor: '#1e293b', borderRadius: 2 }} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
