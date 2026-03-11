import { io } from 'socket.io-client';

let socketInstance = null;

export const getSocket = () => {
    if (!socketInstance || !socketInstance.connected) {
        socketInstance = io(import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000', {
            withCredentials: true,
            transports: ['websocket', 'polling'],
        });
    }
    return socketInstance;
};
