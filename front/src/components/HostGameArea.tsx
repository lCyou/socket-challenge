import React, { useState } from 'react';
import { Box, Typography, TextField, Button, List, ListItem, ListItemText, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Player, Answer, Vote, Room } from '../socket';

interface HostGameAreaProps {
  room: Room;
  onStartGame: () => void;
  onQuestionSubmit: (question: string) => void;
  onNextAnswer: () => void;
  onNextRound: () => void;
}

const HostGameArea: React.FC<HostGameAreaProps> = ({ room, onStartGame, onQuestionSubmit, onNextAnswer, onNextRound }) => {
  const [questionInput, setQuestionInput] = useState<string>('');

  const handleQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (questionInput.trim()) {
      onQuestionSubmit(questionInput);
      setQuestionInput('');
    }
  };

  const getVoteCounts = (votes: Vote[]) => {
    const counts: { [userId: string]: number } = {};
    votes.forEach(vote => {
      counts[vote.guessedUserId] = (counts[vote.guessedUserId] || 0) + 1;
    });
    return counts;
  };

  const getPlayerName = (userId: string) => {
    const player = room.players.find(p => p.userId === userId);
    return player ? player.name : '不明なプレイヤー';
  };

  const currentAnswer = room.answers[room.currentAnswerIndex];

  switch (room.gameState) {
    case 'waiting':
      return (
        <Box sx={{ p: 2, border: '1px solid #eee', borderRadius: '8px' }}>
          <Typography variant="body1" paragraph>
            参加者が集まったらゲームを開始してください。
          </Typography>
          <Button variant="contained" onClick={onStartGame} disabled={room.players.length === 0}>
            ゲーム開始
          </Button>
        </Box>
      );

    case 'question':
      return (
        <Box component="form" onSubmit={handleQuestionSubmit} sx={{ p: 2, border: '1px solid #eee', borderRadius: '8px' }}>
          <TextField
            fullWidth
            variant="outlined"
            label="問題を入力してください"
            value={questionInput}
            onChange={(e) => setQuestionInput(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button type="submit" variant="contained">
            問題を出題
          </Button>
        </Box>
      );

    case 'answering':
      return (
        <Box sx={{ p: 2, border: '1px solid #eee', borderRadius: '8px' }}>
          <Typography variant="h6" component="h3" gutterBottom>
            お題: {room.currentQuestion}
          </Typography>
          <Typography variant="body1" paragraph>
            参加者の回答を待っています...
          </Typography>
        </Box>
      );

    case 'perAnswerVoting':
      if (!currentAnswer) return null;
      return (
        <Box sx={{ p: 2, border: '1px solid #eee', borderRadius: '8px' }}>
          <Typography variant="h6" component="h3" gutterBottom>
            お題: {room.currentQuestion}
          </Typography>
          <Typography variant="body1" paragraph>
            参加者が投票するのを待っています...
          </Typography>
          <Typography variant="h5" sx={{ mb: 2 }}>
            「{currentAnswer.answer}」
          </Typography>
        </Box>
      );

    case 'perAnswerRevealing':
      if (!currentAnswer) return null;
      const voteCounts = getVoteCounts(room.currentAnswerVotes);
      return (
        <Box sx={{ p: 2, border: '1px solid #eee', borderRadius: '8px' }}>
          <Typography variant="h6" component="h3" gutterBottom>
            答え合わせ！
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>お題:</strong> {room.currentQuestion}
          </Typography>
          <Typography variant="h5" sx={{ mb: 2 }}>
            回答: 「{currentAnswer.answer}」
          </Typography>
          <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
            正解は... {currentAnswer.user}さん！
          </Typography>
          <Typography variant="body1" paragraph>
            みんなの予想:
          </Typography>
          <List>
            {Object.keys(voteCounts).length > 0 ? (
              Object.entries(voteCounts).map(([userId, count]) => (
                <ListItem key={userId} disablePadding>
                  <ListItemText primary={`${getPlayerName(userId)}: ${count}票`} />
                </ListItem>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">投票はありませんでした。</Typography>
            )}
          </List>
          <Button variant="contained" onClick={onNextAnswer} sx={{ mt: 2 }}>
            {room.currentAnswerIndex < room.answers.length - 1 ? '次の回答へ' : '結果発表へ'}
          </Button>
        </Box>
      );

    case 'finished':
      return (
        <Box sx={{ p: 2, border: '1px solid #eee', borderRadius: '8px' }}>
          <Typography variant="h6" component="h3" gutterBottom>
            ゲーム終了
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>お題:</strong> {room.currentQuestion}
          </Typography>
          <List>
            {room.answers.map((ans, index) => (
              <ListItem key={index} disablePadding>
                <ListItemText primary={<><strong>{ans.user}:</strong> {ans.answer}</>} />
              </ListItem>
            ))}
          </List>
          <Button variant="contained" onClick={onNextRound} sx={{ mt: 2 }}>
            次のゲームへ
          </Button>
        </Box>
      );

    default:
      return null;
  }
};

export default HostGameArea;
