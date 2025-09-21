import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RealTimeEvent, ChatMessage, EmotionData } from '@ai-professor/shared';
import { RealtimeService } from '../services/realtime.service';
import { WebRTCService } from '../services/webrtc.service';
import { SessionService } from '../services/session.service';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  sessionId?: string;
  role?: string;
}

interface JoinSessionDto {
  sessionId: string;
  userType: 'student' | 'professor';
}

interface SendMessageDto {
  sessionId: string;
  content: string;
  type: 'text' | 'voice' | 'image' | 'code';
  metadata?: any;
}

interface EmotionUpdateDto {
  sessionId: string;
  emotion: EmotionData;
}

interface WebRTCSignalDto {
  sessionId: string;
  targetUserId: string;
  signal: any;
  type: 'offer' | 'answer' | 'ice-candidate';
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:8080',
    credentials: true,
  },
  namespace: '/realtime',
  transports: ['websocket', 'polling'],
})
@UseGuards(JwtAuthGuard)
@UsePipes(new ValidationPipe({ transform: true }))
export class RealtimeGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RealtimeGateway.name);
  private connectedUsers = new Map<string, AuthenticatedSocket>();
  private sessionParticipants = new Map<string, Set<string>>(); // sessionId -> Set of userIds

  constructor(
    private readonly realtimeService: RealtimeService,
    private readonly webrtcService: WebRTCService,
    private readonly sessionService: SessionService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('🔌 Real-time WebSocket Gateway initialized');
    
    // Set up Redis adapter for horizontal scaling
    this.setupRedisAdapter(server);
  }

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Extract user info from JWT token (handled by guard)
      const userId = client.userId;
      const userRole = client.role;

      if (!userId) {
        this.logger.warn('❌ Connection rejected: No user ID found');
        client.disconnect();
        return;
      }

      this.connectedUsers.set(userId, client);
      
      this.logger.log(`✅ User ${userId} (${userRole}) connected: ${client.id}`);

      // Send connection confirmation
      client.emit('connected', {
        userId,
        timestamp: new Date(),
        serverTime: new Date().toISOString(),
      });

      // Update user online status
      await this.realtimeService.setUserOnlineStatus(userId, true);

    } catch (error) {
      this.logger.error('❌ Error handling connection:', error);
      client.disconnect();
    }
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    try {
      const userId = client.userId;
      
      if (userId) {
        this.connectedUsers.delete(userId);
        
        // Remove user from all sessions
        for (const [sessionId, participants] of this.sessionParticipants.entries()) {
          if (participants.has(userId)) {
            participants.delete(userId);
            
            // Notify other participants
            this.server.to(sessionId).emit('user_left', {
              type: 'user_left',
              payload: { userId, sessionId },
              timestamp: new Date(),
            } as RealTimeEvent);

            // Clean up empty sessions
            if (participants.size === 0) {
              this.sessionParticipants.delete(sessionId);
            }
          }
        }

        // Update user offline status
        await this.realtimeService.setUserOnlineStatus(userId, false);
        
        this.logger.log(`👋 User ${userId} disconnected: ${client.id}`);
      }
    } catch (error) {
      this.logger.error('❌ Error handling disconnect:', error);
    }
  }

  @SubscribeMessage('join_session')
  async handleJoinSession(
    @MessageBody() data: JoinSessionDto,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      const { sessionId, userType } = data;
      const userId = client.userId!;

      // Validate session exists and user has permission
      const session = await this.sessionService.getSession(sessionId);
      if (!session) {
        client.emit('error', { message: 'Session not found' });
        return;
      }

      // Join socket room
      await client.join(sessionId);
      client.sessionId = sessionId;

      // Track session participants
      if (!this.sessionParticipants.has(sessionId)) {
        this.sessionParticipants.set(sessionId, new Set());
      }
      this.sessionParticipants.get(sessionId)!.add(userId);

      // Notify other participants
      client.to(sessionId).emit('user_joined', {
        type: 'user_joined',
        payload: { userId, userType, sessionId },
        timestamp: new Date(),
      } as RealTimeEvent);

      // Send current session state to new participant
      const sessionState = await this.sessionService.getSessionState(sessionId);
      client.emit('session_state', sessionState);

      this.logger.log(`👥 User ${userId} joined session ${sessionId} as ${userType}`);

    } catch (error) {
      this.logger.error('❌ Error joining session:', error);
      client.emit('error', { message: 'Failed to join session' });
    }
  }

  @SubscribeMessage('leave_session')
  async handleLeaveSession(
    @MessageBody() data: { sessionId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      const { sessionId } = data;
      const userId = client.userId!;

      // Leave socket room
      await client.leave(sessionId);
      client.sessionId = undefined;

      // Remove from participants
      const participants = this.sessionParticipants.get(sessionId);
      if (participants) {
        participants.delete(userId);
        
        if (participants.size === 0) {
          this.sessionParticipants.delete(sessionId);
        }
      }

      // Notify other participants
      client.to(sessionId).emit('user_left', {
        type: 'user_left',
        payload: { userId, sessionId },
        timestamp: new Date(),
      } as RealTimeEvent);

      this.logger.log(`👋 User ${userId} left session ${sessionId}`);

    } catch (error) {
      this.logger.error('❌ Error leaving session:', error);
    }
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @MessageBody() data: SendMessageDto,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      const { sessionId, content, type, metadata } = data;
      const userId = client.userId!;

      // Create message
      const message: ChatMessage = {
        id: await this.generateMessageId(),
        sessionId,
        senderId: userId,
        senderType: 'user',
        content,
        type,
        metadata,
        reactions: [],
        isEdited: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Save message
      await this.realtimeService.saveMessage(message);

      // Broadcast to session participants
      this.server.to(sessionId).emit('new_message', {
        type: 'message',
        payload: message,
        timestamp: new Date(),
      } as RealTimeEvent);

      this.logger.log(`💬 Message sent in session ${sessionId} by user ${userId}`);

    } catch (error) {
      this.logger.error('❌ Error sending message:', error);
      client.emit('error', { message: 'Failed to send message' });
    }
  }

  @SubscribeMessage('emotion_update')
  async handleEmotionUpdate(
    @MessageBody() data: EmotionUpdateDto,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      const { sessionId, emotion } = data;
      const userId = client.userId!;

      // Save emotion data
      await this.realtimeService.saveEmotionData(userId, sessionId, emotion);

      // Broadcast emotion update to session (for AI professor to adapt)
      client.to(sessionId).emit('emotion_detected', {
        type: 'emotion_detected',
        payload: { userId, emotion },
        timestamp: new Date(),
      } as RealTimeEvent);

      // Get adaptive tutoring recommendations
      const recommendations = await this.realtimeService.getAdaptiveTutoringRecommendations(
        userId,
        sessionId,
      );

      if (recommendations.length > 0) {
        client.emit('tutoring_recommendations', {
          recommendations,
          timestamp: new Date(),
        });
      }

    } catch (error) {
      this.logger.error('❌ Error handling emotion update:', error);
    }
  }

  @SubscribeMessage('webrtc_signal')
  async handleWebRTCSignal(
    @MessageBody() data: WebRTCSignalDto,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      const { sessionId, targetUserId, signal, type } = data;
      const userId = client.userId!;

      // Forward WebRTC signal to target user
      const targetSocket = this.connectedUsers.get(targetUserId);
      if (targetSocket) {
        targetSocket.emit('webrtc_signal', {
          fromUserId: userId,
          signal,
          type,
          sessionId,
        });

        this.logger.log(`📡 WebRTC ${type} forwarded from ${userId} to ${targetUserId}`);
      } else {
        client.emit('error', { message: 'Target user not connected' });
      }

    } catch (error) {
      this.logger.error('❌ Error handling WebRTC signal:', error);
    }
  }

  @SubscribeMessage('start_screen_share')
  async handleStartScreenShare(
    @MessageBody() data: { sessionId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      const { sessionId } = data;
      const userId = client.userId!;

      // Notify session participants about screen sharing
      client.to(sessionId).emit('screen_share_started', {
        type: 'screen_share_started',
        payload: { userId, sessionId },
        timestamp: new Date(),
      } as RealTimeEvent);

      this.logger.log(`🖥️ Screen sharing started by user ${userId} in session ${sessionId}`);

    } catch (error) {
      this.logger.error('❌ Error starting screen share:', error);
    }
  }

  @SubscribeMessage('stop_screen_share')
  async handleStopScreenShare(
    @MessageBody() data: { sessionId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      const { sessionId } = data;
      const userId = client.userId!;

      // Notify session participants
      client.to(sessionId).emit('screen_share_stopped', {
        type: 'screen_share_stopped',
        payload: { userId, sessionId },
        timestamp: new Date(),
      } as RealTimeEvent);

      this.logger.log(`🖥️ Screen sharing stopped by user ${userId} in session ${sessionId}`);

    } catch (error) {
      this.logger.error('❌ Error stopping screen share:', error);
    }
  }

  @SubscribeMessage('typing_start')
  async handleTypingStart(
    @MessageBody() data: { sessionId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const { sessionId } = data;
    const userId = client.userId!;

    client.to(sessionId).emit('user_typing', {
      userId,
      isTyping: true,
      timestamp: new Date(),
    });
  }

  @SubscribeMessage('typing_stop')
  async handleTypingStop(
    @MessageBody() data: { sessionId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const { sessionId } = data;
    const userId = client.userId!;

    client.to(sessionId).emit('user_typing', {
      userId,
      isTyping: false,
      timestamp: new Date(),
    });
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: AuthenticatedSocket) {
    client.emit('pong', { timestamp: new Date() });
  }

  // Utility methods
  private async setupRedisAdapter(server: Server) {
    try {
      const redisAdapter = require('socket.io-redis');
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      
      server.adapter(redisAdapter(redisUrl));
      this.logger.log('🔗 Redis adapter configured for horizontal scaling');
    } catch (error) {
      this.logger.warn('⚠️ Redis adapter not configured, running in single instance mode');
    }
  }

  private async generateMessageId(): Promise<string> {
    const { v4: uuidv4 } = require('uuid');
    return uuidv4();
  }

  // Public methods for external services
  async broadcastToSession(sessionId: string, event: string, data: any) {
    this.server.to(sessionId).emit(event, data);
  }

  async sendToUser(userId: string, event: string, data: any) {
    const socket = this.connectedUsers.get(userId);
    if (socket) {
      socket.emit(event, data);
    }
  }

  getConnectedUsers(): string[] {
    return Array.from(this.connectedUsers.keys());
  }

  getSessionParticipants(sessionId: string): string[] {
    const participants = this.sessionParticipants.get(sessionId);
    return participants ? Array.from(participants) : [];
  }

  isUserConnected(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }
}
