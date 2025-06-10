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

// メッセージを保存する配列（本来はデータベースを使用）
let messages = [
  { id: 1, user: "システム", content: "チャットルームへようこそ！", timestamp: new Date().toISOString() }
];

// 接続中のユーザー数を管理
let connectedUsers = 0;

io.on("connection", (socket) => {
  connectedUsers++;
  console.log(`ユーザーが接続しました。ID: ${socket.id}, 接続数: ${connectedUsers}`);
  
  // 新しいクライアントに既存のメッセージを送信
  socket.emit("messages:initial", messages);
  
  // 全クライアントに接続者数を通知
  io.emit("users:count", connectedUsers);

  // 新しいメッセージを受信した時の処理
  socket.on("message:send", (data) => {
    const newMessage = {
      id: Date.now(),
      user: data.user || "匿名",
      content: data.content,
      timestamp: new Date().toISOString()
    };
    
    // メッセージを保存
    messages.push(newMessage);
    
    // 最新100件のみ保持
    if (messages.length > 100) {
      messages = messages.slice(-100);
    }
    
    // 全クライアントに新しいメッセージを送信
    io.emit("message:new", newMessage);
    
    console.log(`新しいメッセージ: ${newMessage.user} - ${newMessage.content}`);
  });

  // ユーザーの入力状態を管理
  socket.on("typing:start", (data) => {
    socket.broadcast.emit("typing:user", { user: data.user, isTyping: true });
  });

  socket.on("typing:stop", (data) => {
    socket.broadcast.emit("typing:user", { user: data.user, isTyping: false });
  });

  // 切断時の処理
  socket.on("disconnect", () => {
    connectedUsers--;
    console.log(`ユーザーが切断しました。ID: ${socket.id}, 接続数: ${connectedUsers}`);
    
    // 全クライアントに接続者数を通知
    io.emit("users:count", connectedUsers);
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`サーバーがポート${PORT}で起動しました`);
});