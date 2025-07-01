import { io } from 'socket.io-client';

// サーバーとクライアント間でやり取りされるイベントとデータの型定義
export interface Player {
  userId: string;
  socketId: string;
  name: string;
  status?: 'connected' | 'disconnected';
  hasAnswered?: boolean; // 回答済みかどうか
}

export interface Message {
  id: number;
  user: string;
  content: string;
  timestamp: string;
}

export interface Answer {
  userId: string; // 回答者のuserId
  user: string; // 回答者の名前
  answer: string;
  id: string; // 回答の一意なID
}

export interface Vote {
  voterUserId: string; // 投票したプレイヤーのuserId
  guessedUserId: string; // 誰が回答したと予想したか（プレイヤーのuserId）
}

export interface Room {
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

export interface ServerToClientEvents {
  'game:update': (room: Room) => void;
  'message:new': (data: { message: Message }) => void;
  'room:error': (errorMessage: string) => void;
  'room:created': (data: { roomId: string; roomName: string }) => void;
}

export interface ClientToServerEvents {
  'room:create': (data: { roomName: string; userName: string; userId: string }) => void;
  'room:join': (data: { roomId: string; userName: string; userId: string }) => void;
  'message:send': (data: { roomId: string; user: string; content: string }) => void;
  'game:start': (data: { roomId: string; userId: string }) => void;
  'question:submit': (data: { roomId: string; question: string; userId: string }) => void;
  'answer:submit': (data: { roomId: string; answer: string; userId: string }) => void;
  'vote:submit': (data: { roomId: string; answerId: string; guessedUserId: string; voterUserId: string }) => void;
  'game:nextAnswer': (data: { roomId: string; userId: string }) => void;
  'game:nextRound': (data: { roomId: string; userId: string }) => void;
  'room:disband': (data: { roomId: string; userId: string }) => void;
}

export const socket = io('http://localhost:3000');
