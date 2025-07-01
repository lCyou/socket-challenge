import { createContext, useState, useContext, ReactNode } from 'react';

interface UserContextType {
  userId: string;
  userName: string;
  setUserName: (name: string) => void;
}

const UserContext = createContext<UserContextType | null>(null);

const getUserId = (): string => {
  let userId = sessionStorage.getItem('userId');
  if (!userId) {
    userId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    sessionStorage.setItem('userId', userId);
  }
  return userId;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const [userId] = useState<string>(getUserId());
  const [userName, setUserNameState] = useState<string>(() => sessionStorage.getItem('userName') || '');

  const setUserName = (name: string) => {
    sessionStorage.setItem('userName', name);
    setUserNameState(name);
  };

  return (
    <UserContext.Provider value={{ userId, userName, setUserName }}>
      {children}
    </UserContext.Provider>
  );
};
