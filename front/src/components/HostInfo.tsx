import React from 'react';
import { Box, Typography } from '@mui/material';

interface Player {
  userId: string;
  socketId: string;
  name: string;
  status?: 'connected' | 'disconnected';
}

interface HostInfoProps {
  host: Player;
}

const HostInfo: React.FC<HostInfoProps> = ({ host }) => (
  <Box sx={{ border: '1px solid #ccc', borderRadius: '8px', p: 2, mb: 2 }}>
    <Typography variant="h6" component="h3" gutterBottom>
      ホスト
    </Typography>
    <Typography variant="body1">
      {host.name} {host.status === 'disconnected' && '(切断中...)'}
    </Typography>
  </Box>
);

export default HostInfo;