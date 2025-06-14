import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const Chat = () => {
  const [socket, setSocket] = useState(null);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [username, setUsername] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [roomUsers, setRoomUsers] = useState({});
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

    // 利用可能なルーム一覧の受信
    newSocket.on('rooms:list', (rooms) => {
      setAvailableRooms(rooms);
    });

    // 初期メッセージの受信
    newSocket.on('messages:initial', (data) => {
      const { room, messages: initialMessages } = data;
      if (room === currentRoom) {
        setMessages(initialMessages);
      }
    });

    // 新しいメッセージの受信
    newSocket.on('message:new', (data) => {
      const { room, message } = data;
      if (room === currentRoom) {
        setMessages(prev => [...prev, message]);
      }
    });

    // 接続ユーザー数の更新
    newSocket.on('users:count', (data) => {
      const { room, count } = data;
      setRoomUsers(prev => ({
        ...prev,
        [room]: count
      }));
    });

    // タイピング状態の管理
    newSocket.on('typing:user', (data) => {
      const { room, user, isTyping } = data;
      if (room === currentRoom) {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          if (isTyping) {
            newSet.add(user);
          } else {
            newSet.delete(user);
          }
          return newSet;
        });
      }
    });

    // クリーンアップ
    return () => {
      newSocket.close();
    };
  }, [currentRoom]);

  // ルーム変更時の処理
  const joinRoom = (roomId) => {
    if (socket && roomId) {
      setCurrentRoom(roomId);
      setMessages([]);
      setTypingUsers(new Set());
      socket.emit('room:join', roomId);
    }
  };

  // メッセージ送信
  const sendMessage = (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || !username.trim() || !socket || !currentRoom) return;

    socket.emit('message:send', {
      roomId: currentRoom,
      user: username,
      content: inputMessage.trim()
    });

    setInputMessage('');
    handleStopTyping();
  };

  // タイピング開始
  const handleStartTyping = () => {
    if (!isTyping && socket && username && currentRoom) {
      setIsTyping(true);
      socket.emit('typing:start', { roomId: currentRoom, user: username });
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
    if (isTyping && socket && username && currentRoom) {
      setIsTyping(false);
      socket.emit('typing:stop', { roomId: currentRoom, user: username });
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

  // 現在のルーム情報を取得
  const getCurrentRoomInfo = () => {
    return availableRooms.find(room => room.id === currentRoom);
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>マルチルームチャット</h2>
        <div className="status-info">
          <span className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? '接続中' : '切断中'}
          </span>
          {currentRoom && (
            <span className="user-count">
              {getCurrentRoomInfo()?.name}: {roomUsers[currentRoom] || 0}人
            </span>
          )}
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
      ) : !currentRoom ? (
        <div className="room-selection">
          <h3>参加するルームを選択してください</h3>
          <div className="room-list">
            {availableRooms.map((room) => (
              <div key={room.id} className="room-card">
                <div className="room-header">
                  <h4>{room.name}</h4>
                  <span className="room-users">{roomUsers[room.id] || 0}人</span>
                </div>
                <p className="room-description">{room.description}</p>
                <button onClick={() => joinRoom(room.id)}>参加</button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="room-info">
            <div className="current-room">
              <span>現在のルーム: <strong>{getCurrentRoomInfo()?.name}</strong></span>
              <button 
                className="leave-room-btn" 
                onClick={() => setCurrentRoom(null)}
              >
                ルーム変更
              </button>
            </div>
          </div>

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