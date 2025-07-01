import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";
import { randomUUID } from "crypto";

// 型定義
interface Player {
  userId: string;
  socketId: string;
  name: string;
  status?: 'connected' | 'disconnected';
  hasAnswered?: boolean; // 回答済みかどうか
}

interface Message {
  id: number;
  user: string;
  content: string;
  timestamp: string;
}

interface Answer {
  userId: string; // 回答者のuserId
  user: string; // 回答者の名前
  answer: string;
  id: string; // 回答の一意なID
}

interface Vote {
  voterUserId: string; // 投票したプレイヤーのuserId
  guessedUserId: string; // 誰が回答したと予想したか（プレイヤーのuserId）
}

interface Room {
  name: string;
  host: Player;
  players: Player[];
  messages: Message[];
  gameState: "waiting" | "question" | "answering" | "perAnswerVoting" | "perAnswerRevealing" | "finished";
  currentQuestion: string | null;
  answers: Answer[];
  currentAnswerIndex: number; // 現在投票中の回答のインデックス
  currentAnswerVotes: Vote[]; // 現在の回答に対する投票
}

interface RoomsData {
  [roomId: string]: Room;
}

const app = express();
const httpServer = createServer(app);

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

let roomsData: RoomsData = {};
const hostDisconnectionTimers: { [userId: string]: NodeJS.Timeout } = {};

const RECONNECTION_GRACE_PERIOD = 10000; // 10秒

const updateGameState = (roomId: string) => {
  if (roomsData[roomId]) {
    io.to(roomId).emit("game:update", roomsData[roomId]);
  }
};

io.on("connection", (socket: Socket) => {
  console.log(`ユーザーが接続しました。ID: ${socket.id}`);

  socket.on("room:create", ({ roomName, userName, userId }: { roomName: string; userName: string; userId: string }) => {
    const roomId = randomUUID();
    console.log(`ホスト ${userName} (userId: ${userId}) が新しいルームを作成: ${roomName} (ID: ${roomId})`);

    roomsData[roomId] = {
      name: roomName,
      host: { userId, name: userName, socketId: socket.id, status: 'connected' },
      players: [],
      messages: [{
        id: Date.now(),
        user: "システム",
        content: `ルーム「${roomName}」が作成されました。ホスト: ${userName}`,
        timestamp: new Date().toISOString()
      }],
      gameState: "waiting",
      currentQuestion: null,
      answers: [],
      currentAnswerIndex: 0,
      currentAnswerVotes: [],
    };

    socket.join(roomId);
    socket.emit("room:created", { roomId, roomName });
    updateGameState(roomId);
  });

  socket.on("room:join", ({ roomId, userName, userId }: { roomId: string; userName: string; userId: string }) => {
    const room = roomsData[roomId];
    if (!room) {
      return socket.emit("room:error", "指定されたルームは存在しません。");
    }

    if (room.host.userId === userId) {
      console.log(`ホスト ${userName} (userId: ${userId}) がルーム ${roomId} に再接続しました。`);
      room.host.socketId = socket.id;
      room.host.status = 'connected';

      if (hostDisconnectionTimers[userId]) {
        clearTimeout(hostDisconnectionTimers[userId]);
        delete hostDisconnectionTimers[userId];
        console.log(`ホスト ${userName} の切断タイマーを解除しました。`);
      }
    } else {
      const existingPlayer = room.players.find(p => p.userId === userId);
      if (!existingPlayer) {
        console.log(`ゲスト ${userName} (userId: ${userId}) がルーム ${roomId} に参加しました。`);
        room.players.push({ userId, name: userName, socketId: socket.id, hasAnswered: false }); // hasAnsweredを追加
        const joinMessage: Message = {
          id: Date.now(),
          user: "システム",
          content: `${userName}さんが参加しました。`,
          timestamp: new Date().toISOString()
        };
        room.messages.push(joinMessage);
      } else {
        existingPlayer.socketId = socket.id;
        console.log(`ゲスト ${userName} (userId: ${userId}) がルーム ${roomId} に再接続しました。`);
      }
    }

    socket.join(roomId);
    updateGameState(roomId);
  });

  socket.on("message:send", (data: { roomId: string; user: string; content: string }) => {
    const { roomId, user, content } = data;
    if (!roomsData[roomId]) return;
    const newMessage: Message = { id: Date.now(), user, content, timestamp: new Date().toISOString() };
    roomsData[roomId].messages.push(newMessage);
    io.to(roomId).emit("message:new", { message: newMessage });
  });

  const isHost = (room: Room, userId: string): boolean => room && room.host.userId === userId;

  socket.on("game:start", ({ roomId, userId }: { roomId: string; userId: string }) => {
    const room = roomsData[roomId];
    if (isHost(room, userId)) {
      console.log(`ルーム ${roomId} でゲーム開始`);
      room.gameState = "question";
      // 全プレイヤーのhasAnsweredをリセット
      room.players.forEach(p => p.hasAnswered = false);
      updateGameState(roomId);
    }
  });

  socket.on("question:submit", ({ roomId, question, userId }: { roomId: string; question: string; userId: string }) => {
    const room = roomsData[roomId];
    if (isHost(room, userId)) {
      console.log(`ルーム ${roomId} の新しい問題: ${question}`);
      room.currentQuestion = question;
      room.gameState = "answering";
      room.answers = [];
      room.currentAnswerIndex = 0;
      room.currentAnswerVotes = [];
      // 全プレイヤーのhasAnsweredをリセット
      room.players.forEach(p => p.hasAnswered = false);
      updateGameState(roomId);
    }
  });

  socket.on("answer:submit", ({ roomId, answer, userId }: { roomId: string; answer: string; userId: string }) => {
    const room = roomsData[roomId];
    if (!room || room.gameState !== "answering") return;

    const player = room.players.find(p => p.userId === userId); // 回答したプレイヤーを特定
    if (player && !player.hasAnswered) { // まだ回答していないプレイヤーのみ
      console.log(`ルーム ${roomId} で ${player.name} が回答: ${answer}`);
      room.answers.push({ userId: player.userId, user: player.name, answer, id: randomUUID() });
      player.hasAnswered = true; // 回答済みとしてマーク

      // 全員が回答したかチェック
      if (room.players.every(p => p.hasAnswered)) {
        room.gameState = "perAnswerVoting"; // 個別回答投票フェーズへ
        room.currentAnswerIndex = 0; // 最初の回答から
        room.currentAnswerVotes = []; // 投票をリセット
      }
      updateGameState(roomId);
    }
  });

  socket.on("vote:submit", ({ roomId, answerId, guessedUserId, voterUserId }: { roomId: string; answerId: string; guessedUserId: string; voterUserId: string }) => {
    const room = roomsData[roomId];
    if (!room || room.gameState !== "perAnswerVoting") return;

    const currentAnswer = room.answers[room.currentAnswerIndex];
    if (!currentAnswer || currentAnswer.id !== answerId) return; // 現在投票中の回答でなければ無視

    // 投票を記録
    const existingVoteIndex = room.currentAnswerVotes.findIndex(vote => vote.voterUserId === voterUserId);
    if (existingVoteIndex > -1) {
      room.currentAnswerVotes[existingVoteIndex].guessedUserId = guessedUserId; // 投票を更新
    } else {
      room.currentAnswerVotes.push({ voterUserId, guessedUserId });
    }

    // 全てのプレイヤーが現在の回答に投票したかチェック
    const allPlayersVotedForCurrentAnswer = room.players.every(player => {
      return room.currentAnswerVotes.some(vote => vote.voterUserId === player.userId);
    });

    if (allPlayersVotedForCurrentAnswer) {
      room.gameState = "perAnswerRevealing"; // 個別回答結果発表フェーズへ
    }
    updateGameState(roomId);
  });

  socket.on("game:nextAnswer", ({ roomId, userId }: { roomId: string; userId: string }) => {
    const room = roomsData[roomId];
    if (!isHost(room, userId) || room.gameState !== "perAnswerRevealing") return; // ホストのみ、かつ結果発表フェーズのみ

    room.currentAnswerIndex++;
    if (room.currentAnswerIndex < room.answers.length) {
      room.gameState = "perAnswerVoting"; // 次の回答の投票フェーズへ
      room.currentAnswerVotes = []; // 投票をリセット
    } else {
      room.gameState = "finished"; // 全ての回答の処理が終了
    }
    updateGameState(roomId);
  });

  socket.on("game:nextRound", ({ roomId, userId }: { roomId: string; userId: string }) => {
    const room = roomsData[roomId];
    if (isHost(room, userId)) {
      console.log(`ルーム ${roomId} で次のラウンドを開始`);
      room.gameState = "waiting";
      room.currentQuestion = null;
      room.answers = [];
      room.currentAnswerIndex = 0;
      room.currentAnswerVotes = [];
      // 全プレイヤーのhasAnsweredをリセット
      room.players.forEach(p => p.hasAnswered = false);
      updateGameState(roomId);
    }
  });

  socket.on("room:disband", ({ roomId, userId }: { roomId: string; userId: string }) => {
    const room = roomsData[roomId];
    if (isHost(room, userId)) {
      console.log(`ホスト ${room.host.name} (userId: ${userId}) がルーム ${roomId} を解散しました。`);
      io.to(roomId).emit("room:error", "ホストがルームを解散しました。");
      delete roomsData[roomId];
    }
  });

  socket.on("disconnect", () => {
    console.log(`ユーザー ${socket.id} が切断されました`);
    for (const roomId in roomsData) {
      const room = roomsData[roomId];

      if (room.host.socketId === socket.id) {
        console.log(`ホスト ${room.host.name} がルーム ${roomId} から切断されました`);
        room.host.status = 'disconnected';
        const hostUserId = room.host.userId;

        hostDisconnectionTimers[hostUserId] = setTimeout(() => {
          console.log(`ホスト ${room.host.name} の再接続待機時間が終了しました。`);
          if (roomsData[roomId] && roomsData[roomId].host.status === 'disconnected') {
            console.log(`ルーム ${roomId} を削除します。`);
            io.to(roomId).emit("room:error", "ホストが退出したため、ルームは解散しました。");
            delete roomsData[roomId];
          }
          delete hostDisconnectionTimers[hostUserId];
        }, RECONNECTION_GRACE_PERIOD);
        console.log(`ホスト ${room.host.name} の切断タイマーを開始しました。`);
        updateGameState(roomId);
        return;
      }

      const playerIndex = room.players.findIndex(p => p.socketId === socket.id);
      if (playerIndex > -1) {
        const disconnectedPlayer = room.players[playerIndex];
        console.log(`ゲスト ${disconnectedPlayer.name} がルーム ${roomId} から退出しました`);
        room.players.splice(playerIndex, 1);
        updateGameState(roomId);
        return;
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`サーバーがポート${PORT}で起動しました`);
});