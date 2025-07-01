import React from 'react';
import { Box, Typography, List, ListItem, ListItemText } from '@mui/material';

interface Player {
  userId: string;
  socketId: string;
  name: string;
  status?: 'connected' | 'disconnected';
}

interface PlayerListProps {
  players: Player[];
  currentPlayerSocketId: string | undefined;
}

const PlayerList: React.FC<PlayerListProps> = ({ players, currentPlayerSocketId }) => (
  <Box sx={{ border: '1px solid #ccc', borderRadius: '8px', p: 2, mb: 2 }}>
    <Typography variant="h6" component="h3" gutterBottom>
      参加者 ({players.length}人)
    </Typography>
    <List>
      {players.map(p => (
        <ListItem key={p.userId} sx={{ fontWeight: p.socketId === currentPlayerSocketId ? 'bold' : 'normal' }}>
          <ListItemText primary={`${p.name} ${p.socketId === currentPlayerSocketId ? ' ← 回答中' : ''}`} />
        </ListItem>
      ))}
    </List>
  </Box>
);

export default PlayerList;