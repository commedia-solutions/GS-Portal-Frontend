import React from 'react';
import { Box, Skeleton } from '@mui/material';

export default function SkeletonDashboard() {
  return (
    <Box sx={{ p: 3, bgcolor: '#0f172a', minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Skeleton variant="text" width={300} height={60} sx={{ bgcolor: '#1e293b' }} />
        <Skeleton variant="rectangular" width={250} height={40} sx={{ bgcolor: '#1e293b', borderRadius: 1 }} />
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)', md: 'repeat(6, 1fr)' }, gap: 2, mb: 4 }}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Box key={i}>
            <Skeleton variant="rectangular" height={100} sx={{ bgcolor: '#1e293b', borderRadius: 2 }} />
          </Box>
        ))}
      </Box>
      <Skeleton variant="rectangular" height={300} sx={{ mb: 3, bgcolor: '#1e293b', borderRadius: 2 }} />
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
        {[1, 2, 3, 4].map((i) => (
          <Box key={i}>
            <Skeleton variant="rectangular" height={300} sx={{ bgcolor: '#1e293b', borderRadius: 2 }} />
          </Box>
        ))}
      </Box>
    </Box>
  );
}
