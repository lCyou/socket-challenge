import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
const httpServer = createServer(app);

// CORSの設定
app.use(cors({
  origin: "http://localhost:5173", // Viteのデフォルトポート
  credentials: true
}));

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// ルーム別のメッセージを保存するオブジェクト
let roomMessages = {};

// ルーム別の接続ユーザー数を管理
let roomUsers = {};

// 利用可能なルーム一覧
const availableRooms = [
  { id: 'general', name: '一般', description: '誰でも参加できる一般的な話題' },
  { id: 'tech', name: '技術', description: 'プログラミングや技術の話題' },
  { id: 'random', name: '雑談', description: '自由な雑談スペース' },
  { id: 'gaming', name: 'ゲーム', description: 'ゲームに関する話題' }
];

// 初期メッセージの設定
availableRooms.forEach(room => {
  roomMessages[room.id] = [
    { 
      id: 1, 
      user: "システム", 
      content: `${room.name}ルームへようこそ！`, 
      timestamp: new Date().toISOString() 
    }
  ];
  roomUsers[room.id] = 0;
});

io.on("connection", (socket) => {
  console.log(`ユーザーが接続しました。ID: ${socket.id}`);
  
  // 利用可能なルーム一覧を送信
  socket.emit("rooms:list", availableRooms);

  // ルームに参加
  socket.on("room:join", (roomId) => {
    // 既存のルームから退出
    const rooms = Array.from(socket.rooms);
    rooms.forEach(room => {
      if (room !== socket.id && roomUsers[room] !== undefined) {
        socket.leave(room);
        roomUsers[room]--;
        socket.to(room).emit("users:count", { room, count: roomUsers[room] });
      }
    });

    // 新しいルームに参加
    if (roomMessages[roomId]) {
      socket.join(roomId);
      roomUsers[roomId]++;
      
      // 新しいクライアントに既存のメッセージを送信
      socket.emit("messages:initial", { room: roomId, messages: roomMessages[roomId] });
      
      // ルーム内の全クライアントに接続者数を通知
      io.to(roomId).emit("users:count", { room: roomId, count: roomUsers[roomId] });
      
      console.log(`ユーザー ${socket.id} がルーム ${roomId} に参加しました`);
    }
  });

  // 新しいメッセージを受信した時の処理
  socket.on("message:send", (data) => {
    const { roomId, user, content } = data;
    
    if (!roomMessages[roomId]) return;
    
    const newMessage = {
      id: Date.now(),
      user: user || "匿名",
      content: content,
      timestamp: new Date().toISOString()
    };
    
    // メッセージを保存
    roomMessages[roomId].push(newMessage);
    
    // 最新100件のみ保持
    if (roomMessages[roomId].length > 100) {
      roomMessages[roomId] = roomMessages[roomId].slice(-100);
    }
    
    // ルーム内の全クライアントに新しいメッセージを送信
    io.to(roomId).emit("message:new", { room: roomId, message: newMessage });
    
    console.log(`新しいメッセージ (${roomId}): ${newMessage.user} - ${newMessage.content}`);
  });

  // ユーザーの入力状態を管理
  socket.on("typing:start", (data) => {
    const { roomId, user } = data;
    socket.to(roomId).emit("typing:user", { room: roomId, user, isTyping: true });
  });

  socket.on("typing:stop", (data) => {
    const { roomId, user } = data;
    socket.to(roomId).emit("typing:user", { room: roomId, user, isTyping: false });
  });

  // 切断時の処理
  socket.on("disconnect", () => {
    // 参加していたすべてのルームから退出
    const rooms = Array.from(socket.rooms);
    rooms.forEach(room => {
      if (room !== socket.id && roomUsers[room] !== undefined) {
        roomUsers[room]--;
        socket.to(room).emit("users:count", { room, count: roomUsers[room] });
      }
    });
    
    console.log(`ユーザーが切断しました。ID: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`サーバーがポート${PORT}で起動しました`);
});