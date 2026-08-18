import React from 'react';
import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import SettingsOverscanIcon from '@mui/icons-material/SettingsOverscan';
import LanguageIcon from '@mui/icons-material/Language';
import DnsIcon from '@mui/icons-material/Dns';
import TerminalIcon from '@mui/icons-material/Terminal';
import StorageIcon from '@mui/icons-material/Storage';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

interface AwsHealthCardsProps {
  summary: any;
}

export default function AwsHealthCards({ summary }: AwsHealthCardsProps) {
  const getHealthColor = (health: number) => {
    if (health >= 90) return '#4ade80';
    if (health >= 70) return '#facc15';
    return '#f87171';
  };

  const getStateColor = (state: string) => {
    switch (state?.toLowerCase()) {
      case 'running': return '#4ade80';
      case 'stopped': return '#f87171';
      case 'pending': return '#facc15';
      default: return '#94a3b8';
    }
  };

  const renderCard = (title: string, value: string | number | undefined, icon: React.ReactNode, fallback: string = 'N/A') => (
    <Box>
      <Card sx={{ 
        bgcolor: '#1C2432', 
        color: 'white', 
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,.06)',
        height: '100%',
        transition: '0.25s ease',
        '&:hover': {
          background: '#232C3B',
          transform: 'translateY(-2px)',
          boxShadow: '0 10px 30px rgba(0,0,0,.25)'
        }
      }}>
        <CardContent sx={{ p: '20px !important' }}>
          <Typography variant="body2" sx={{ color: '#94a3b8', mb: 1, fontSize: '11px', fontWeight: 500 }}>{title}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {icon}
            <Typography variant="h6" sx={{ fontSize: '16px', fontWeight: 700, textTransform: title === 'Running State' ? 'capitalize' : 'none' }}>
              {value || fallback}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );

  return (
    <Box sx={{ 
      display: 'grid', 
      gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(4, minmax(0, 1fr))', md: 'repeat(8, minmax(140px, 1fr))' }, 
      gap: '16px',
      mb: 3
    }}>
      {renderCard(
        'Running State', 
        summary?.state, 
        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: getStateColor(summary?.state) }} />, 
        'Unknown'
      )}
      {renderCard(
        'System Health', 
        summary?.health ? `${summary.health}%` : undefined,
        summary?.health >= 90 ? <CheckCircleIcon sx={{ color: '#4ade80', fontSize: '18px' }} /> : <ErrorIcon sx={{ color: getHealthColor(summary?.health), fontSize: '18px' }} />,
        '0%'
      )}
      {renderCard(
        'Availability', 
        summary?.availability ? `${summary.availability}%` : undefined,
        <SettingsOverscanIcon sx={{ color: '#00B5FF', fontSize: '18px' }} />,
        '0%'
      )}
      {renderCard(
        'Region', 
        summary?.region,
        <LanguageIcon sx={{ color: '#FF9800', fontSize: '18px' }} />
      )}
      {renderCard(
        'Availability Zone', 
        summary?.availabilityZone,
        <DnsIcon sx={{ color: '#26C6DA', fontSize: '18px' }} />
      )}
      {renderCard(
        'Platform', 
        summary?.platform || (summary?.cloudMetadata?.PlatformDetails ? summary?.cloudMetadata?.PlatformDetails : 'Linux/UNIX'),
        <TerminalIcon sx={{ color: '#AB47BC', fontSize: '18px' }} />
      )}
      {renderCard(
        'Instance Type', 
        summary?.instanceType,
        <StorageIcon sx={{ color: '#00E676', fontSize: '18px' }} />
      )}
      {renderCard(
        'Monitoring Level', 
        summary?.monitoring,
        <VerifiedUserIcon sx={{ color: '#29B6F6', fontSize: '18px' }} />,
        'Standard'
      )}
    </Box>
  );
}
