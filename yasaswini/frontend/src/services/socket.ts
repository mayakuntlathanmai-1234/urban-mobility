import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

export const socket: Socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000
});

socket.on('connect', () => {
  console.log('⚡ Connected to Urban Ride Mobility Socket.IO Server');
});

socket.on('disconnect', () => {
  console.log('🔌 Disconnected from Socket.IO Server');
});
