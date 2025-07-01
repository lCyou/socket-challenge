import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../socket';
import { useUser } from '../providers/UserProvider'; 

import { Container, Box, Typography, TextField, Button } from '@mui/material';
import highmiTouka from '../assets/highmi_touka.png'; // 画像をインポート

export default function HomePage() {
  const [roomName, setRoomName] = useState<string>('');
  const { userId, userName, setUserName } = useUser(); 
  const navigate = useNavigate();

  useEffect(() => {
    const handleRoomCreated = ({ roomId }: { roomId: string }) => {
      navigate(`/room/${roomId}`);
    };

    socket.on('room:created', handleRoomCreated);

    return () => {
      socket.off('room:created', handleRoomCreated);
    };
  }, [navigate]);

  const handleCreateRoom = () => {
    if (roomName.trim() && userName.trim()) {
      socket.emit('room:create', { roomName, userName, userId }); 
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4, textAlign: 'center' }}>
      <Box sx={{ my: 4 }}>
        <img src="../assets/highmi_touka.png" alt="Highmi Touka" style={{ maxWidth: '100%', height: 'auto', marginBottom: '20px' }} />
        <Typography variant="h4" component="h1" gutterBottom>
          ゲームへようこそ！
        </Typography>
        <Typography variant="body1" >
          ルームを作成して、友達を招待しよう。
        </Typography>
      </Box>
      <Box component="form" sx={{ '& .MuiTextField-root': { m: 1, width: '25ch' } }} noValidate autoComplete="off">
        <TextField
          label="あなたの名前"
          variant="outlined"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder="あなたの名前"
          fullWidth
          margin="normal"
        />
        <TextField
          label="ルーム名を入力"
          variant="outlined"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          placeholder="ルーム名を入力"
          fullWidth
          margin="normal"
        />

        <Button
          variant="contained"
          color="primary"
          onClick={handleCreateRoom}
          disabled={!roomName.trim() || !userName.trim()}
          sx={{ mt: 2 }}
        >
          ルームを作成
        </Button>
      </Box>
    </Container>
  );
}
