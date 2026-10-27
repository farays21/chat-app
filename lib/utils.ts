import { customAlphabet } from 'nanoid';

const alphabet = '23456789abcdefghjkmnpqrstuvwxyz';
export const generateRoomId = customAlphabet(alphabet, 8);

export const sanitizeUsername = (username: string) => {
  return username.trim().toLowerCase();
};
