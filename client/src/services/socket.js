import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_API?.replace('/api', '') || 'http://localhost:5000';

const socket = io(SOCKET_URL, {
  autoConnect: false,
  auth: {
    token: () => localStorage.getItem('token')
  },
  path: '/socket.io'
});

export const connectSocket = () => {
  if (!socket.connected) {
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

export default socket; 