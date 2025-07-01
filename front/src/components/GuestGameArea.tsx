import React, { useState } from 'react';
import { Box, Typography, TextField, Button, List, ListItem, ListItemText, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Player, Answer, Vote, Room } from '../socket';

interface GuestGameAreaProps {
  room: Room;
  onAnswerSubmit: (answer: string) => void;
  onVoteSubmit: (answerId: string, guessedUserId: string) => void;
  currentUserId: string;
}

const GuestGameArea: React.FC<GuestGameAreaProps> = ({ room, onAnswerSubmit, onVoteSubmit, currentUserId }) => {
  const [answerInput, setAnswerInput] = useState<string>('');
  const [selectedVote, setSelectedVote] = useState<string>('');

  const handleAnswerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (answerInput.trim()) {
      onAnswerSubmit(answerInput);
      setAnswerInput('');
    }
  };

  const handleVoteChange = (e: any) => {
    setSelectedVote(e.target.value as string);
  };

  const handleSubmitVote = () => {
    const currentAnswer = room.answers[room.currentAnswerIndex];
    if (currentAnswer && selectedVote) {
      onVoteSubmit(currentAnswer.id, selectedVote);
      setSelectedVote('');
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

  const hasPlayerVotedForCurrentAnswer = (voterUserId: string) => {
    return room.currentAnswerVotes.some(vote => vote.voterUserId === voterUserId);
  };

  const currentPlayerHasAnswered = room.players.find(p => p.userId === currentUserId)?.hasAnswered || false;
  const currentAnswer = room.answers[room.currentAnswerIndex];

  switch (room.gameState) {
    case 'waiting':
      return (
        <Box sx={{ p: 2, border: '1px solid #eee', borderRadius: '8px' }}>
          <Typography variant="body1" paragraph>
            ホストがゲームを開始するのを待っています...
          </Typography>
        </Box>
      );

    case 'question':
      return (
        <Box sx={{ p: 2, border: '1px solid #eee', borderRadius: '8px' }}>
          <Typography variant="body1" paragraph>
            ホストが問題を出題するのを待っています...
          </Typography>
        </Box>
      );

    case 'answering':
      return (
        <Box sx={{ p: 2, border: '1px solid #eee', borderRadius: '8px' }}>
          <Typography variant="h6" component="h3" gutterBottom>
            お題: {room.currentQuestion}
          </Typography>
          {!currentPlayerHasAnswered ? (
            <Box component="form" onSubmit={handleAnswerSubmit}>
              <TextField
                fullWidth
                variant="outlined"
                label="回答を入力"
                value={answerInput}
                onChange={(e) => setAnswerInput(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Button type="submit" variant="contained">
                回答する
              </Button>
            </Box>
          ) : (
            <Typography variant="body1" paragraph>
              回答済みです。他のプレイヤーの回答を待っています...
            </Typography>
          )}
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
            この回答は誰のもの？
          </Typography>
          <Typography variant="h5" sx={{ mb: 2 }}>
            「{currentAnswer.answer}」
          </Typography>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>回答者を選択</InputLabel>
            <Select
              value={selectedVote}
              label="回答者を選択"
              onChange={handleVoteChange}
              disabled={hasPlayerVotedForCurrentAnswer(currentUserId)}
            >
              {room.players.map(player => (
                <MenuItem key={player.userId} value={player.userId}>
                  {player.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            onClick={handleSubmitVote}
            disabled={!selectedVote || hasPlayerVotedForCurrentAnswer(currentUserId)}
          >
            投票する
          </Button>
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
        </Box>
      );

    default:
      return null;
  }
};

export default GuestGameArea;
