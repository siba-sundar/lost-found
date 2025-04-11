import { io } from "socket.io-client";

// Create socket instance
export const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
  autoConnect: false,
  reconnection: true,
  reconnectionDelay: 500,
  reconnectionAttempts: 5
});

// Socket event logging for development
if (import.meta.env.DEV) {
  socket.onAny((event, ...args) => {
    console.log("Socket event:", event, args);
  });
}