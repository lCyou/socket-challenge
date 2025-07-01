import React from 'react';
import { Room } from '../socket';
import HostGameArea from './HostGameArea.tsx';
import GuestGameArea from './GuestGameArea.tsx';

interface GameAreaProps {
  room: Room;
  isHost: boolean;
  // isMyTurn: boolean; // 削除
  onStartGame: () => void;
  onQuestionSubmit: (question: string) => void;
  onAnswerSubmit: (answer: string) => void;
  onVoteSubmit: (answerId: string, guessedUserId: string) => void;
  onNextAnswer: () => void;
  onNextRound: () => void;
  currentUserId: string;
}

const GameArea: React.FC<GameAreaProps> = (props) => {
  const { isHost } = props;

  if (isHost) {
    return <HostGameArea {...props} />;
  } else {
    return <GuestGameArea {...props} />;
  }
};

export default GameArea;