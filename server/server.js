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
      id: Date.now() + Math.random(), // より一意なIDを生成
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
    console.log(`ユーザー ${socket.id} がルーム ${roomId} への参加を要求`);
    
    // 既存のルームから退出
    const rooms = Array.from(socket.rooms);
    rooms.forEach(room => {
      if (room !== socket.id && roomUsers[room] !== undefined) {
        socket.leave(room);
        roomUsers[room] = Math.max(0, roomUsers[room] - 1); // 負の数にならないように
        io.to(room).emit("users:count", { room, count: roomUsers[room] });
        console.log(`ユーザー ${socket.id} がルーム ${room} から退出`);
      }
    });

    // 新しいルームに参加
    if (roomMessages[roomId]) {
      socket.join(roomId);
      roomUsers[roomId]++;
      
      console.log(`ルーム ${roomId} の既存メッセージ数: ${roomMessages[roomId].length}`);
      
      // 新しいクライアントに既存のメッセージを送信
      socket.emit("messages:initial", { 
        room: roomId, 
        messages: roomMessages[roomId] 
      });
      
      // ルーム内の全クライアントに接続者数を通知
      io.to(roomId).emit("users:count", { 
        room: roomId, 
        count: roomUsers[roomId] 
      });
      
      console.log(`ユーザー ${socket.id} がルーム ${roomId} に参加しました (現在 ${roomUsers[roomId]} 人)`);
    } else {
      console.log(`エラー: 存在しないルーム ${roomId} への参加要求`);
    }
  });

  // 新しいメッセージを受信した時の処理
  socket.on("message:send", (data) => {
    const { roomId, user, content } = data;
    
    console.log(`メッセージ受信: ルーム ${roomId}, ユーザー ${user}, 内容: ${content}`);
    
    if (!roomMessages[roomId]) {
      console.log(`エラー: 存在しないルーム ${roomId} へのメッセージ送信`);
      return;
    }
    
    const newMessage = {
      id: Date.now() + Math.random(), // より一意なIDを生成
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
    io.to(roomId).emit("message:new", { 
      room: roomId, 
      message: newMessage 
    });
    
    console.log(`メッセージ送信完了: ルーム ${roomId}, ID ${newMessage.id}`);
  });

  // ユーザーの入力状態を管理
  socket.on("typing:start", (data) => {
    const { roomId, user } = data;
    socket.to(roomId).emit("typing:user", { 
      room: roomId, 
      user, 
      isTyping: true 
    });
  });

  socket.on("typing:stop", (data) => {
    const { roomId, user } = data;
    socket.to(roomId).emit("typing:user", { 
      room: roomId, 
      user, 
      isTyping: false 
    });
  });

  // 切断時の処理
  socket.on("disconnect", () => {
    console.log(`ユーザー ${socket.id} が切断されました`);
    
    // 参加していたすべてのルームから退出
    const rooms = Array.from(socket.rooms);
    rooms.forEach(room => {
      if (room !== socket.id && roomUsers[room] !== undefined) {
        roomUsers[room] = Math.max(0, roomUsers[room] - 1); // 負の数にならないように
        io.to(room).emit("users:count", { 
          room, 
          count: roomUsers[room] 
        });
        console.log(`ルーム ${room} のユーザー数を更新: ${roomUsers[room]} 人`);
      }
    });
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`サーバーがポート${PORT}で起動しました`);
  console.log('利用可能なルーム:', availableRooms.map(r => r.name).join(', '));
});