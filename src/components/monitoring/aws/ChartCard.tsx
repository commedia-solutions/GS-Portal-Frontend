import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

interface ChartCardProps {
  title: string;
  unit: string;
  current?: number;
  average?: number;
  maximum?: number;
  hasData?: boolean;
  children: React.ReactNode;
}

export default function ChartCard({ title, unit, current, average, maximum, hasData = true, children }: ChartCardProps) {
  return (
    <Card sx={{ 
      bgcolor: '#1C2432', 
      color: 'white', 
      borderRadius: '16px', 
      border: '1px solid rgba(255,255,255,.06)',
      width: '100%',
      height: '340px', 
      display: 'flex', 
      flexDirection: 'column',
      overflow: 'hidden',
      alignItems: 'stretch',
      justifyContent: 'flex-start',
      transition: '0.25s ease',
      '&:hover': {
        background: '#232C3B',
        transform: 'translateY(-2px)',
        boxShadow: '0 10px 30px rgba(0,0,0,.25)'
      }
    }}>
      <CardContent sx={{ p: '20px !important', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography sx={{ color: 'white', mb: 2, fontSize: '18px', fontWeight: 'bold' }}>{title}</Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', mb: 2 }}>
          {current !== undefined && (
            <Box>
              <Typography sx={{ color: 'white', fontSize: '11px', fontWeight: 500, opacity: 0.75 }}>Current</Typography>
              <Typography sx={{ color: 'white', fontSize: '16px', fontWeight: 700 }}>
                {current.toFixed(2)} {unit}
              </Typography>
            </Box>
          )}
          {average !== undefined && (
            <Box>
              <Typography sx={{ color: 'white', fontSize: '11px', fontWeight: 500, opacity: 0.75 }}>Average</Typography>
              <Typography sx={{ color: 'white', fontSize: '16px', fontWeight: 700 }}>
                {average.toFixed(2)} {unit}
              </Typography>
            </Box>
          )}
          {maximum !== undefined && (
            <Box>
              <Typography sx={{ color: 'white', fontSize: '11px', fontWeight: 500, opacity: 0.75 }}>Maximum</Typography>
              <Typography sx={{ color: 'white', fontSize: '16px', fontWeight: 700 }}>
                {maximum.toFixed(2)} {unit}
              </Typography>
            </Box>
          )}
        </Box>
        <Box sx={{ flexGrow: 1, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {hasData ? children : (
            <Typography variant="body2" sx={{ color: '#64748b' }}>No historical CloudWatch metrics available</Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
