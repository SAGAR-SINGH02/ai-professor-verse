import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { User } from './user.entity';
import { 
  SessionType, 
  SessionStatus, 
  SessionMetadata, 
  SessionAnalytics,
  EmotionData 
} from '../types';

@Entity('learning_sessions')
@Index(['userId', 'startedAt'])
@Index(['status', 'startedAt'])
@Index(['type', 'startedAt'])
export class LearningSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  @Index()
  courseId?: string;

  @Column({ nullable: true })
  @Index()
  topicId?: string;

  @Column({
    type: 'enum',
    enum: SessionType,
    default: SessionType.AI_TUTORING,
  })
  @Index()
  type: SessionType;

  @Column({
    type: 'enum',
    enum: SessionStatus,
    default: SessionStatus.ACTIVE,
  })
  @Index()
  status: SessionStatus;

  @Column()
  startedAt: Date;

  @Column({ nullable: true })
  endedAt?: Date;

  @Column({ nullable: true })
  duration?: number; // in seconds

  @Column({ type: 'jsonb', nullable: true })
  metadata?: SessionMetadata;

  @Column({ type: 'jsonb', nullable: true })
  analytics?: SessionAnalytics;

  @Column({ type: 'jsonb', nullable: true })
  emotionHistory?: EmotionData[];

  @Column({ type: 'jsonb', nullable: true })
  chatHistory?: {
    id: string;
    timestamp: Date;
    sender: 'user' | 'ai';
    message: string;
    type: 'text' | 'voice' | 'code';
  }[];

  @Column({ type: 'jsonb', nullable: true })
  codeExecutions?: {
    id: string;
    timestamp: Date;
    language: string;
    code: string;
    output?: string;
    error?: string;
    executionTime: number;
  }[];

  @Column({ type: 'jsonb', nullable: true })
  achievements?: {
    id: string;
    type: string;
    title: string;
    description: string;
    earnedAt: Date;
    points: number;
  }[];

  @Column({ type: 'jsonb', nullable: true })
  webrtcMetrics?: {
    connectionQuality: number;
    averageLatency: number;
    packetsLost: number;
    videoBitrate: number;
    audioBitrate: number;
    connectionDuration: number;
  };

  @Column({ type: 'jsonb', nullable: true })
  deviceInfo?: {
    userAgent: string;
    platform: string;
    screenResolution: string;
    timezone: string;
    language: string;
    hasCamera: boolean;
    hasMicrophone: boolean;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  // Virtual properties
  get isActive(): boolean {
    return this.status === SessionStatus.ACTIVE;
  }

  get isCompleted(): boolean {
    return this.status === SessionStatus.COMPLETED;
  }

  get actualDuration(): number {
    if (this.duration) return this.duration;
    if (this.endedAt) {
      return Math.floor((this.endedAt.getTime() - this.startedAt.getTime()) / 1000);
    }
    return Math.floor((new Date().getTime() - this.startedAt.getTime()) / 1000);
  }

  get engagementScore(): number {
    return this.analytics?.engagementScore || 0;
  }

  get comprehensionScore(): number {
    return this.analytics?.comprehensionScore || 0;
  }

  get dominantEmotion(): string {
    if (!this.emotionHistory || this.emotionHistory.length === 0) return 'neutral';
    
    const emotionCounts = this.emotionHistory.reduce((acc, emotion) => {
      acc[emotion.emotion] = (acc[emotion.emotion] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(emotionCounts)
      .sort(([,a], [,b]) => b - a)[0][0];
  }

  get averageEmotionConfidence(): number {
    if (!this.emotionHistory || this.emotionHistory.length === 0) return 0;
    
    const totalConfidence = this.emotionHistory.reduce((sum, emotion) => sum + emotion.confidence, 0);
    return totalConfidence / this.emotionHistory.length;
  }

  get messageCount(): number {
    return this.chatHistory?.length || 0;
  }

  get codeExecutionCount(): number {
    return this.codeExecutions?.length || 0;
  }

  get conceptsLearned(): string[] {
    return this.analytics?.conceptsLearned || [];
  }

  // Hooks
  @BeforeInsert()
  setDefaults() {
    if (!this.startedAt) {
      this.startedAt = new Date();
    }

    if (!this.metadata) {
      this.metadata = {
        subject: 'General',
        difficulty: 'intermediate',
        tags: [],
        objectives: [],
        resources: [],
      };
    }

    if (!this.analytics) {
      this.analytics = {
        engagementScore: 0,
        comprehensionScore: 0,
        emotionData: [],
        interactionCount: 0,
        questionsAsked: 0,
        mistakesMade: 0,
        conceptsLearned: [],
      };
    }

    this.emotionHistory = this.emotionHistory || [];
    this.chatHistory = this.chatHistory || [];
    this.codeExecutions = this.codeExecutions || [];
    this.achievements = this.achievements || [];
  }

  @BeforeUpdate()
  updateDuration() {
    if (this.status === SessionStatus.COMPLETED && this.endedAt && !this.duration) {
      this.duration = Math.floor((this.endedAt.getTime() - this.startedAt.getTime()) / 1000);
    }
  }

  // Methods
  start(): void {
    this.status = SessionStatus.ACTIVE;
    this.startedAt = new Date();
  }

  pause(): void {
    this.status = SessionStatus.PAUSED;
  }

  resume(): void {
    this.status = SessionStatus.ACTIVE;
  }

  complete(): void {
    this.status = SessionStatus.COMPLETED;
    this.endedAt = new Date();
    this.duration = Math.floor((this.endedAt.getTime() - this.startedAt.getTime()) / 1000);
  }

  cancel(): void {
    this.status = SessionStatus.CANCELLED;
    this.endedAt = new Date();
  }

  addEmotion(emotion: EmotionData): void {
    if (!this.emotionHistory) this.emotionHistory = [];
    this.emotionHistory.push(emotion);
    
    // Update analytics
    if (this.analytics) {
      this.analytics.emotionData = this.emotionHistory;
    }
  }

  addChatMessage(sender: 'user' | 'ai', message: string, type: 'text' | 'voice' | 'code' = 'text'): void {
    if (!this.chatHistory) this.chatHistory = [];
    
    this.chatHistory.push({
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      sender,
      message,
      type,
    });

    // Update analytics
    if (this.analytics) {
      this.analytics.interactionCount = this.chatHistory.length;
      if (sender === 'user' && message.includes('?')) {
        this.analytics.questionsAsked++;
      }
    }
  }

  addCodeExecution(language: string, code: string, output?: string, error?: string, executionTime: number = 0): void {
    if (!this.codeExecutions) this.codeExecutions = [];
    
    this.codeExecutions.push({
      id: `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      language,
      code,
      output,
      error,
      executionTime,
    });

    // Update analytics
    if (this.analytics && error) {
      this.analytics.mistakesMade++;
    }
  }

  addAchievement(type: string, title: string, description: string, points: number = 0): void {
    if (!this.achievements) this.achievements = [];
    
    this.achievements.push({
      id: `ach_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      title,
      description,
      earnedAt: new Date(),
      points,
    });
  }

  updateEngagementScore(score: number): void {
    if (this.analytics) {
      this.analytics.engagementScore = Math.max(0, Math.min(1, score));
    }
  }

  updateComprehensionScore(score: number): void {
    if (this.analytics) {
      this.analytics.comprehensionScore = Math.max(0, Math.min(1, score));
    }
  }

  addConceptLearned(concept: string): void {
    if (this.analytics) {
      if (!this.analytics.conceptsLearned.includes(concept)) {
        this.analytics.conceptsLearned.push(concept);
      }
    }
  }

  updateWebRTCMetrics(metrics: Partial<LearningSession['webrtcMetrics']>): void {
    this.webrtcMetrics = {
      ...this.webrtcMetrics,
      ...metrics,
    } as any;
  }

  setDeviceInfo(deviceInfo: LearningSession['deviceInfo']): void {
    this.deviceInfo = deviceInfo;
  }

  // Analytics methods
  calculateEngagementTrend(): 'increasing' | 'decreasing' | 'stable' {
    if (!this.emotionHistory || this.emotionHistory.length < 3) return 'stable';

    const recentEmotions = this.emotionHistory.slice(-10);
    const engagementScores = recentEmotions.map(e => {
      // Map emotions to engagement scores
      const engagementMap: Record<string, number> = {
        engaged: 1.0,
        excited: 0.9,
        happy: 0.7,
        neutral: 0.5,
        confused: 0.4,
        frustrated: 0.2,
        bored: 0.0,
      };
      return engagementMap[e.emotion] || 0.5;
    });

    if (engagementScores.length < 3) return 'stable';

    const firstHalf = engagementScores.slice(0, Math.floor(engagementScores.length / 2));
    const secondHalf = engagementScores.slice(Math.floor(engagementScores.length / 2));

    const firstAvg = firstHalf.reduce((sum, score) => sum + score, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, score) => sum + score, 0) / secondHalf.length;

    const difference = secondAvg - firstAvg;

    if (difference > 0.1) return 'increasing';
    if (difference < -0.1) return 'decreasing';
    return 'stable';
  }

  getEmotionDistribution(): Record<string, number> {
    if (!this.emotionHistory || this.emotionHistory.length === 0) return {};

    const distribution = this.emotionHistory.reduce((acc, emotion) => {
      acc[emotion.emotion] = (acc[emotion.emotion] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Convert to percentages
    const total = this.emotionHistory.length;
    Object.keys(distribution).forEach(emotion => {
      distribution[emotion] = distribution[emotion] / total;
    });

    return distribution;
  }

  getPerformanceMetrics() {
    return {
      duration: this.actualDuration,
      engagementScore: this.engagementScore,
      comprehensionScore: this.comprehensionScore,
      messageCount: this.messageCount,
      codeExecutionCount: this.codeExecutionCount,
      conceptsLearned: this.conceptsLearned.length,
      achievementsEarned: this.achievements?.length || 0,
      dominantEmotion: this.dominantEmotion,
      emotionConfidence: this.averageEmotionConfidence,
      engagementTrend: this.calculateEngagementTrend(),
      emotionDistribution: this.getEmotionDistribution(),
    };
  }

  // Serialization
  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      courseId: this.courseId,
      topicId: this.topicId,
      type: this.type,
      status: this.status,
      startedAt: this.startedAt,
      endedAt: this.endedAt,
      duration: this.actualDuration,
      metadata: this.metadata,
      analytics: this.analytics,
      performanceMetrics: this.getPerformanceMetrics(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  toDetailedJSON() {
    return {
      ...this.toJSON(),
      emotionHistory: this.emotionHistory,
      chatHistory: this.chatHistory,
      codeExecutions: this.codeExecutions,
      achievements: this.achievements,
      webrtcMetrics: this.webrtcMetrics,
      deviceInfo: this.deviceInfo,
    };
  }
}
