import { create } from 'zustand';

interface ChatStore {
  username: string;
  currentRoomId: string | null;
  setUsername: (username: string) => void;
  setCurrentRoomId: (roomId: string | null) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  username: '',
  currentRoomId: null,
  setUsername: (username) => set({ username }),
  setCurrentRoomId: (roomId) => set({ currentRoomId: roomId }),
}));
