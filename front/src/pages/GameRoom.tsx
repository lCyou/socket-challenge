import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { useUser } from '../providers/UserProvider';
import { socket } from '../socket';
import { Room, Message, Player } from '../socket';

// インポートしたコンポーネント
import PlayerList from '../components/PlayerList.tsx';
import GameArea from '../components/GameArea.tsx';

import { Container, Box, Typography, TextField, Button, CircularProgress, Grid, Modal, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import QRCode from 'qrcode'; 

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  textAlign: 'center',
};

const GameRoom: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { userId, userName, setUserName } = useUser();
  const navigate = useNavigate();
  const [room, setRoom] = useState<Room | null>(null);
  const [isJoining, setIsJoining] = useState<boolean>(true);
  const [openQrModal, setOpenQrModal] = useState<boolean>(false);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null); // canvas要素への参照

  useEffect(() => {
    const handleGameUpdate = (updatedRoom: Room) => {
      setRoom(updatedRoom);
      setIsJoining(false);
    };

    const handleRoomError = (errorMessage: string) => {
      alert(errorMessage);
      navigate('/');
    };

    socket.on('game:update', handleGameUpdate);
    socket.on('room:error', handleRoomError);

    if (userName && userId) {
      socket.emit('room:join', { roomId: roomId!, userName, userId });
    } else {
      setIsJoining(false);
    }

    return () => {
      socket.off('game:update', handleGameUpdate);
      socket.off('room:error', handleRoomError);
    };
  }, [roomId, userName, userId, navigate]);

  // コールバックRefを定義
  const setQrCanvasRef = useCallback((node: HTMLCanvasElement | null) => {
    console.log('setQrCanvasRef called. node:', node, 'openQrModal:', openQrModal);
    if (node && openQrModal) {
      const roomUrl = `${window.location.origin}/room/${roomId}`; // 明示的にURLを生成
      console.log('QR Code Value (from callback ref):', roomUrl);
      QRCode.toCanvas(node, roomUrl, { scale: 8 }, function (error) {
        if (error) {
          console.error('QR code drawing error (from callback ref):', error);
        } else {
          console.log('QR code drawn successfully (from callback ref)!');
        }
      });
    }
  }, [openQrModal, roomId]); // openQrModalとroomIdを依存配列に追加

  const handleSetUsername = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUserName = userName.trim();
    if (trimmedUserName) {
      setUserName(trimmedUserName);
      setIsJoining(true);
      socket.emit('room:join', { roomId: roomId!, userName: trimmedUserName, userId });
    }
  };

  const handleStartGame = () => socket.emit('game:start', { roomId: roomId!, userId });
  const handleQuestionSubmit = (question: string) => socket.emit('question:submit', { roomId: roomId!, question, userId });
  const handleAnswerSubmit = (answer: string) => socket.emit('answer:submit', { roomId: roomId!, answer, userId });
  const handleVoteSubmit = (answerId: string, guessedUserId: string) => socket.emit('vote:submit', { roomId: roomId!, answerId, guessedUserId, voterUserId: userId });
  const handleNextAnswer = () => socket.emit('game:nextAnswer', { roomId: roomId!, userId });
  const handleNextRound = () => socket.emit('game:nextRound', { roomId: roomId!, userId });
  const handleDisbandRoom = () => {
    if (window.confirm('本当にこの部屋を解散しますか？')) {
      socket.emit('room:disband', { roomId: roomId!, userId });
    }
  };

  const copyLinkToClipboard = () => {
    navigator.clipboard.writeText(`${window.location.origin}/room/${roomId}`)
      .then(() => alert('招待リンクをコピーしました！'))
      .catch(err => console.error('Could not copy text: ', err));
  };

  const handleOpenQrModal = () => {
    console.log('handleOpenQrModal called. Setting openQrModal to true.');
    setOpenQrModal(true);
  };
  const handleCloseQrModal = () => setOpenQrModal(false);

  if (!isJoining && !userName) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4, textAlign: 'center' }}>
        <Box sx={{ my: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            ユーザー名を入力してください
          </Typography>
          <Box component="form" onSubmit={handleSetUsername} sx={{ '& .MuiTextField-root': { m: 1, width: '25ch' } }} noValidate autoComplete="off">
            <TextField
              label="あなたの名前"
              variant="outlined"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="あなたの名前"
              fullWidth
              margin="normal"
            />
            <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
              ルームに参加
            </Button>
          </Box>
        </Box>
      </Container>
    );
  }

  if (isJoining || !room || !room.host) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>ルーム情報を読み込んでいます...</Typography>
      </Container>
    );
  }

  const isHost = room.host.userId === userId;
  // const currentPlayer = room.players[room.currentPlayerIndex]; // 削除
  // const isMyTurn = !isHost && currentPlayer && currentPlayer.userId === userId; // 削除

  return (
    <Container maxWidth="lg" sx={{ mt: 4}}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" component="h2" gutterBottom>
              {room.name}
            </Typography>
            <Button variant="outlined" onClick={copyLinkToClipboard}>
              招待リンクをコピー
            </Button>
            <Button variant="outlined" onClick={handleOpenQrModal} sx={{ ml: 2 }}>
              QRコードを表示
            </Button>
            {isHost && (
              <Button variant="outlined" color="error" onClick={handleDisbandRoom} sx={{ ml: 2 }}>
                部屋を解散する
              </Button>
            )}
          </Box>
          <GameArea
            room={room}
            isHost={isHost}
            // isMyTurn={isMyTurn} // 削除
            onStartGame={handleStartGame}
            onQuestionSubmit={handleQuestionSubmit}
            onAnswerSubmit={handleAnswerSubmit}
            onVoteSubmit={handleVoteSubmit}
            onNextAnswer={handleNextAnswer}
            onNextRound={handleNextRound}
            currentUserId={userId}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Box sx={{ mb: 3 }}>
            <PlayerList players={room.players} currentPlayerSocketId={undefined} /> {/* currentPlayerSocketIdをundefinedに設定 */}
          </Box>
        </Grid>
      </Grid>

      <Modal
        open={openQrModal}
        onClose={handleCloseQrModal}
        aria-labelledby="qr-code-modal-title"
        aria-describedby="qr-code-modal-description"
      >
        <Box sx={style}>
          <IconButton
            aria-label="close"
            onClick={handleCloseQrModal}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
          <Typography id="qr-code-modal-title" variant="h6" component="h2" sx={{ mb: 2 }}>
            ルーム招待QRコード
          </Typography>
          <canvas ref={setQrCanvasRef} width="256" height="256" />
          <Typography id="qr-code-modal-description" sx={{ mt: 2 }}>
            このQRコードをスキャンしてルームに参加してください。
          </Typography>
        </Box>
      </Modal>
    </Container>
  );
}

export default GameRoom;
