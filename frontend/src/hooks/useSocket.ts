import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './useAuth';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  useEffect(() => {
    if (!user) {
      // Disconnect socket if user is not authenticated
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    // Create socket connection
    const newSocket = io(SOCKET_URL, {
      auth: {
        token
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      setIsConnected(true);
      reconnectAttempts.current = 0;
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
      
      reconnectAttempts.current += 1;
      if (reconnectAttempts.current >= maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        newSocket.disconnect();
      }
    });

    // Authentication error handler
    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
      if (error.message?.includes('Authentication')) {
        // Token might be invalid, try to refresh or logout
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.reload();
      }
    });

    // AI Professor specific events
    newSocket.on('session-joined', (data) => {
      console.log('Joined AI session:', data);
    });

    newSocket.on('user-joined', (data) => {
      console.log('User joined session:', data);
    });

    newSocket.on('user-left', (data) => {
      console.log('User left session:', data);
    });

    newSocket.on('ai-message', (data) => {
      console.log('AI message received:', data);
    });

    newSocket.on('emotion-detected', (data) => {
      console.log('Emotion detected:', data);
    });

    newSocket.on('voice-activity', (data) => {
      console.log('Voice activity:', data);
    });

    newSocket.on('screen-share-started', (data) => {
      console.log('Screen share started:', data);
    });

    newSocket.on('screen-share-stopped', (data) => {
      console.log('Screen share stopped:', data);
    });

    newSocket.on('code-change', (data) => {
      console.log('Code change:', data);
    });

    newSocket.on('cursor-position', (data) => {
      console.log('Cursor position:', data);
    });

    setSocket(newSocket);

    // Cleanup function
    return () => {
      newSocket.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [user]);

  // Helper functions
  const emit = (event: string, data?: any) => {
    if (socket && isConnected) {
      socket.emit(event, data);
    } else {
      console.warn('Socket not connected, cannot emit event:', event);
    }
  };

  const on = (event: string, handler: (...args: any[]) => void) => {
    if (socket) {
      socket.on(event, handler);
    }
  };

  const off = (event: string, handler?: (...args: any[]) => void) => {
    if (socket) {
      socket.off(event, handler);
    }
  };

  return {
    socket,
    isConnected,
    emit,
    on,
    off,
  };
};
