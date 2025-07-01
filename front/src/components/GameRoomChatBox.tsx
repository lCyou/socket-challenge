import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, TextField, Button, List, ListItem, ListItemText } from '@mui/material';

interface Message {
  id: number;
  user: string;
  content: string;
  timestamp: string;
}

interface ChatBoxProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
}

const GameRoomChatBox: React.FC<ChatBoxProps> = ({ messages = [], onSendMessage }) => {
  const [messageInput, setMessageInput] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim()) {
      onSendMessage(messageInput);
      setMessageInput('');
    }
  };

  return (
    <Box sx={{ border: '1px solid #ccc', borderRadius: '8px', p: 2, display: 'flex', flexDirection: 'column', height: '400px' }}>
      <Typography variant="h6" component="h3" gutterBottom>
        チャット
      </Typography>
      <Box sx={{ flexGrow: 1, overflowY: 'auto', mb: 2 }}>
        <List>
          {messages.map((msg) => (
            <ListItem key={msg.id} disablePadding>
              <ListItemText primary={<><strong>{msg.user}:</strong> {msg.content}</>} />
            </ListItem>
          ))}
          <div ref={messagesEndRef} />
        </List>
      </Box>
      <Box component="form" onSubmit={handleSendMessage} sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          placeholder="メッセージを入力..."
        />
        <Button type="submit" variant="contained" disabled={!messageInput.trim()}>
          送信
        </Button>
      </Box>
    </Box>
  );
};

export default GameRoomChatBox;