export interface Message {
  id: string;
  username: string;
  text: string;
  timestamp: number;
}

export interface RoomMeta {
  createdAt: number;
  lastActivity: number;
}

export interface SSEData {
  messages: Message[];
  users: string[];
  typing: string[];
}
