import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const Chat = () => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [username, setUsername] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState(0);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // メッセージリストの最下部にスクロール
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // WebSocket接続の初期化
  useEffect(() => {
    const newSocket = io('http://localhost:3000', {
      transports: ['websocket']
    });

    setSocket(newSocket);

    // 接続状態の管理
    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('サーバーに接続しました');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('サーバーから切断されました');
    });

    // 初期メッセージの受信
    newSocket.on('messages:initial', (initialMessages) => {
      setMessages(initialMessages);
    });

    // 新しいメッセージの受信
    newSocket.on('message:new', (message) => {
      setMessages(prev => [...prev, message]);
    });

    // 接続ユーザー数の更新
    newSocket.on('users:count', (count) => {
      setConnectedUsers(count);
    });

    // タイピング状態の管理
    newSocket.on('typing:user', ({ user, isTyping }) => {
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        if (isTyping) {
          newSet.add(user);
        } else {
          newSet.delete(user);
        }
        return newSet;
      });
    });

    // クリーンアップ
    return () => {
      newSocket.close();
    };
  }, []);

  // メッセージ送信
  const sendMessage = (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || !username.trim() || !socket) return;

    socket.emit('message:send', {
      user: username,
      content: inputMessage.trim()
    });

    setInputMessage('');
    handleStopTyping();
  };

  // タイピング開始
  const handleStartTyping = () => {
    if (!isTyping && socket && username) {
      setIsTyping(true);
      socket.emit('typing:start', { user: username });
    }

    // タイピング停止のタイマーをリセット
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 1000);
  };

  // タイピング停止
  const handleStopTyping = () => {
    if (isTyping && socket && username) {
      setIsTyping(false);
      socket.emit('typing:stop', { user: username });
    }
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  // 入力変更時の処理
  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
    if (e.target.value.trim()) {
      handleStartTyping();
    } else {
      handleStopTyping();
    }
  };

  // 時間のフォーマット
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>リアルタイムチャット</h2>
        <div className="status-info">
          <span className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? '接続中' : '切断中'}
          </span>
          <span className="user-count">
            オンライン: {connectedUsers}人
          </span>
        </div>
      </div>

      {!username ? (
        <div className="username-input">
          <h3>ユーザー名を入力してください</h3>
          <form onSubmit={(e) => {
            e.preventDefault();
            const name = e.target.username.value.trim();
            if (name) setUsername(name);
          }}>
            <input
              type="text"
              name="username"
              placeholder="ユーザー名"
              maxLength={20}
              required
            />
            <button type="submit">チャットに参加</button>
          </form>
        </div>
      ) : (
        <>
          <div className="messages-container">
            {messages.map((message) => (
              <div key={message.id} className="message">
                <div className="message-header">
                  <span className="username">{message.user}</span>
                  <span className="timestamp">{formatTime(message.timestamp)}</span>
                </div>
                <div className="message-content">{message.content}</div>
              </div>
            ))}
            
            {typingUsers.size > 0 && (
              <div className="typing-indicator">
                {Array.from(typingUsers).join(', ')} が入力中...
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={sendMessage} className="message-form">
            <input
              type="text"
              value={inputMessage}
              onChange={handleInputChange}
              placeholder="メッセージを入力..."
              maxLength={500}
              disabled={!isConnected}
            />
            <button 
              type="submit" 
              disabled={!inputMessage.trim() || !isConnected}
            >
              送信
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default Chat;