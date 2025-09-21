import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userEmail?: string;
  userRole?: string;
}

interface RoomData {
  participants: Map<string, {
    socketId: string;
    userId: string;
    userInfo: any;
  }>;
  createdAt: Date;
  type: 'ai-session' | 'group-study' | 'one-on-one';
}

class SocketService {
  private io: Server;
  private rooms: Map<string, RoomData> = new Map();
  private userSockets: Map<string, string> = new Map(); // userId -> socketId

  constructor(io: Server) {
    this.io = io;
    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware() {
    // Authentication middleware for Socket.IO
    this.io.use((socket: any, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Authentication error: No token provided'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
        socket.userId = decoded.userId;
        socket.userEmail = decoded.email;
        socket.userRole = decoded.role;
        
        logger.info(`Socket authenticated for user: ${decoded.email}`);
        next();
      } catch (error) {
        logger.error('Socket authentication error:', error);
        next(new Error('Authentication error: Invalid token'));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      logger.info(`User connected: ${socket.userEmail} (${socket.id})`);
      
      // Store user socket mapping
      if (socket.userId) {
        this.userSockets.set(socket.userId, socket.id);
      }

      // Join AI Professor session
      socket.on('join-ai-session', (data) => {
        this.handleJoinAISession(socket, data);
      });

      // WebRTC signaling events
      socket.on('webrtc-offer', (data) => {
        this.handleWebRTCOffer(socket, data);
      });

      socket.on('webrtc-answer', (data) => {
        this.handleWebRTCAnswer(socket, data);
      });

      socket.on('webrtc-ice-candidate', (data) => {
        this.handleICECandidate(socket, data);
      });

      // AI interaction events
      socket.on('ai-message', (data) => {
        this.handleAIMessage(socket, data);
      });

      socket.on('emotion-detected', (data) => {
        this.handleEmotionDetection(socket, data);
      });

      socket.on('voice-activity', (data) => {
        this.handleVoiceActivity(socket, data);
      });

      // Screen sharing events
      socket.on('start-screen-share', (data) => {
        this.handleStartScreenShare(socket, data);
      });

      socket.on('stop-screen-share', (data) => {
        this.handleStopScreenShare(socket, data);
      });

      // Code collaboration events
      socket.on('code-change', (data) => {
        this.handleCodeChange(socket, data);
      });

      socket.on('cursor-position', (data) => {
        this.handleCursorPosition(socket, data);
      });

      // Disconnect handling
      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });
    });
  }

  private handleJoinAISession(socket: AuthenticatedSocket, data: { sessionId: string; userInfo: any }) {
    const { sessionId, userInfo } = data;
    
    try {
      // Create or get room
      if (!this.rooms.has(sessionId)) {
        this.rooms.set(sessionId, {
          participants: new Map(),
          createdAt: new Date(),
          type: 'ai-session'
        });
      }

      const room = this.rooms.get(sessionId)!;
      
      // Add participant to room
      room.participants.set(socket.userId!, {
        socketId: socket.id,
        userId: socket.userId!,
        userInfo
      });

      // Join socket room
      socket.join(sessionId);

      // Notify others in the room
      socket.to(sessionId).emit('user-joined', {
        userId: socket.userId,
        userInfo,
        timestamp: new Date().toISOString()
      });

      // Send room info to the user
      socket.emit('session-joined', {
        sessionId,
        participants: Array.from(room.participants.values()),
        timestamp: new Date().toISOString()
      });

      logger.info(`User ${socket.userEmail} joined AI session: ${sessionId}`);
    } catch (error) {
      logger.error('Error joining AI session:', error);
      socket.emit('error', { message: 'Failed to join AI session' });
    }
  }

  private handleWebRTCOffer(socket: AuthenticatedSocket, data: { offer: any; targetUserId?: string; sessionId: string }) {
    const { offer, targetUserId, sessionId } = data;

    try {
      if (targetUserId) {
        // Direct peer-to-peer offer
        const targetSocketId = this.userSockets.get(targetUserId);
        if (targetSocketId) {
          this.io.to(targetSocketId).emit('webrtc-offer', {
            offer,
            fromUserId: socket.userId,
            sessionId
          });
        }
      } else {
        // Broadcast to session (for AI Professor connection)
        socket.to(sessionId).emit('webrtc-offer', {
          offer,
          fromUserId: socket.userId,
          sessionId
        });
      }

      logger.info(`WebRTC offer sent from ${socket.userEmail} in session ${sessionId}`);
    } catch (error) {
      logger.error('Error handling WebRTC offer:', error);
      socket.emit('error', { message: 'Failed to send WebRTC offer' });
    }
  }

  private handleWebRTCAnswer(socket: AuthenticatedSocket, data: { answer: any; targetUserId: string; sessionId: string }) {
    const { answer, targetUserId, sessionId } = data;

    try {
      const targetSocketId = this.userSockets.get(targetUserId);
      if (targetSocketId) {
        this.io.to(targetSocketId).emit('webrtc-answer', {
          answer,
          fromUserId: socket.userId,
          sessionId
        });
      }

      logger.info(`WebRTC answer sent from ${socket.userEmail} to ${targetUserId}`);
    } catch (error) {
      logger.error('Error handling WebRTC answer:', error);
      socket.emit('error', { message: 'Failed to send WebRTC answer' });
    }
  }

  private handleICECandidate(socket: AuthenticatedSocket, data: { candidate: any; targetUserId?: string; sessionId: string }) {
    const { candidate, targetUserId, sessionId } = data;

    try {
      if (targetUserId) {
        const targetSocketId = this.userSockets.get(targetUserId);
        if (targetSocketId) {
          this.io.to(targetSocketId).emit('webrtc-ice-candidate', {
            candidate,
            fromUserId: socket.userId,
            sessionId
          });
        }
      } else {
        socket.to(sessionId).emit('webrtc-ice-candidate', {
          candidate,
          fromUserId: socket.userId,
          sessionId
        });
      }
    } catch (error) {
      logger.error('Error handling ICE candidate:', error);
    }
  }

  private handleAIMessage(socket: AuthenticatedSocket, data: { message: string; sessionId: string; context?: any }) {
    const { message, sessionId, context } = data;

    try {
      // Broadcast AI message to all participants in the session
      this.io.to(sessionId).emit('ai-message', {
        message,
        fromUserId: socket.userId,
        userEmail: socket.userEmail,
        context,
        timestamp: new Date().toISOString()
      });

      logger.info(`AI message from ${socket.userEmail} in session ${sessionId}`);
    } catch (error) {
      logger.error('Error handling AI message:', error);
    }
  }

  private handleEmotionDetection(socket: AuthenticatedSocket, data: { emotion: string; confidence: number; sessionId: string }) {
    const { emotion, confidence, sessionId } = data;

    try {
      // Broadcast emotion data to AI Professor (could be used for adaptive responses)
      socket.to(sessionId).emit('emotion-detected', {
        emotion,
        confidence,
        fromUserId: socket.userId,
        timestamp: new Date().toISOString()
      });

      logger.info(`Emotion detected: ${emotion} (${confidence}) from ${socket.userEmail}`);
    } catch (error) {
      logger.error('Error handling emotion detection:', error);
    }
  }

  private handleVoiceActivity(socket: AuthenticatedSocket, data: { isActive: boolean; sessionId: string }) {
    const { isActive, sessionId } = data;

    try {
      socket.to(sessionId).emit('voice-activity', {
        isActive,
        fromUserId: socket.userId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error handling voice activity:', error);
    }
  }

  private handleStartScreenShare(socket: AuthenticatedSocket, data: { sessionId: string }) {
    const { sessionId } = data;

    try {
      socket.to(sessionId).emit('screen-share-started', {
        fromUserId: socket.userId,
        userEmail: socket.userEmail,
        timestamp: new Date().toISOString()
      });

      logger.info(`Screen share started by ${socket.userEmail} in session ${sessionId}`);
    } catch (error) {
      logger.error('Error handling screen share start:', error);
    }
  }

  private handleStopScreenShare(socket: AuthenticatedSocket, data: { sessionId: string }) {
    const { sessionId } = data;

    try {
      socket.to(sessionId).emit('screen-share-stopped', {
        fromUserId: socket.userId,
        timestamp: new Date().toISOString()
      });

      logger.info(`Screen share stopped by ${socket.userEmail} in session ${sessionId}`);
    } catch (error) {
      logger.error('Error handling screen share stop:', error);
    }
  }

  private handleCodeChange(socket: AuthenticatedSocket, data: { code: string; language: string; sessionId: string }) {
    const { code, language, sessionId } = data;

    try {
      socket.to(sessionId).emit('code-change', {
        code,
        language,
        fromUserId: socket.userId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error handling code change:', error);
    }
  }

  private handleCursorPosition(socket: AuthenticatedSocket, data: { position: any; sessionId: string }) {
    const { position, sessionId } = data;

    try {
      socket.to(sessionId).emit('cursor-position', {
        position,
        fromUserId: socket.userId,
        userEmail: socket.userEmail,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error handling cursor position:', error);
    }
  }

  private handleDisconnect(socket: AuthenticatedSocket) {
    try {
      logger.info(`User disconnected: ${socket.userEmail} (${socket.id})`);

      // Remove from user socket mapping
      if (socket.userId) {
        this.userSockets.delete(socket.userId);
      }

      // Remove from all rooms and notify other participants
      this.rooms.forEach((room, sessionId) => {
        if (room.participants.has(socket.userId!)) {
          room.participants.delete(socket.userId!);
          
          // Notify others in the room
          socket.to(sessionId).emit('user-left', {
            userId: socket.userId,
            userEmail: socket.userEmail,
            timestamp: new Date().toISOString()
          });

          // Clean up empty rooms
          if (room.participants.size === 0) {
            this.rooms.delete(sessionId);
            logger.info(`Cleaned up empty session: ${sessionId}`);
          }
        }
      });
    } catch (error) {
      logger.error('Error handling disconnect:', error);
    }
  }

  // Public methods for external use
  public sendToUser(userId: string, event: string, data: any) {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
      return true;
    }
    return false;
  }

  public sendToSession(sessionId: string, event: string, data: any) {
    this.io.to(sessionId).emit(event, data);
  }

  public getActiveUsers(): number {
    return this.userSockets.size;
  }

  public getActiveSessions(): number {
    return this.rooms.size;
  }
}

export const setupSocketIO = (io: Server): SocketService => {
  return new SocketService(io);
};
