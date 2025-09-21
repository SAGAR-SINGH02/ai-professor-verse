// Core Entity Types
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

// User Types
export interface User extends BaseEntity {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  preferences: UserPreferences;
  organizationId?: string;
  lastLoginAt?: Date;
  emailVerifiedAt?: Date;
}

export enum UserRole {
  STUDENT = 'student',
  TEACHER = 'teacher',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
  ORGANIZATION_ADMIN = 'organization_admin'
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING_VERIFICATION = 'pending_verification'
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  notifications: NotificationPreferences;
  accessibility: AccessibilityPreferences;
  avatar: AvatarPreferences;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  inApp: boolean;
  learningReminders: boolean;
  achievementAlerts: boolean;
  systemUpdates: boolean;
}

export interface AccessibilityPreferences {
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  screenReader: boolean;
  reducedMotion: boolean;
  captionsEnabled: boolean;
}

export interface AvatarPreferences {
  selectedAvatarId: string;
  voiceSettings: VoiceSettings;
  emotionSensitivity: number; // 0-1
  interactionStyle: 'formal' | 'casual' | 'friendly' | 'professional';
}

export interface VoiceSettings {
  voiceId: string;
  speed: number; // 0.5-2.0
  pitch: number; // 0.5-2.0
  volume: number; // 0-1
}

// Organization Types
export interface Organization extends BaseEntity {
  name: string;
  domain: string;
  logo?: string;
  settings: OrganizationSettings;
  subscription: SubscriptionInfo;
  adminIds: string[];
}

export interface OrganizationSettings {
  allowedDomains: string[];
  ssoEnabled: boolean;
  maxUsers: number;
  features: OrganizationFeatures;
}

export interface OrganizationFeatures {
  aiTutoring: boolean;
  codeExecution: boolean;
  videoConferencing: boolean;
  analytics: boolean;
  customBranding: boolean;
}

export interface SubscriptionInfo {
  plan: 'free' | 'basic' | 'premium' | 'enterprise';
  status: 'active' | 'cancelled' | 'expired' | 'trial';
  expiresAt: Date;
  maxUsers: number;
  features: string[];
}

// AI & Learning Types
export interface LearningSession extends BaseEntity {
  userId: string;
  courseId?: string;
  topicId?: string;
  type: SessionType;
  status: SessionStatus;
  startedAt: Date;
  endedAt?: Date;
  duration?: number; // in seconds
  metadata: SessionMetadata;
  analytics: SessionAnalytics;
}

export enum SessionType {
  AI_TUTORING = 'ai_tutoring',
  CODE_REVIEW = 'code_review',
  LIVE_LECTURE = 'live_lecture',
  PRACTICE = 'practice',
  ASSESSMENT = 'assessment'
}

export enum SessionStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  PAUSED = 'paused',
  CANCELLED = 'cancelled'
}

export interface SessionMetadata {
  subject: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  objectives: string[];
  resources: string[];
}

export interface SessionAnalytics {
  engagementScore: number; // 0-1
  comprehensionScore: number; // 0-1
  emotionData: EmotionData[];
  interactionCount: number;
  questionsAsked: number;
  mistakesMade: number;
  conceptsLearned: string[];
}

export interface EmotionData {
  timestamp: Date;
  emotion: EmotionType;
  confidence: number; // 0-1
  source: 'facial' | 'voice' | 'text';
}

export enum EmotionType {
  HAPPY = 'happy',
  CONFUSED = 'confused',
  FRUSTRATED = 'frustrated',
  ENGAGED = 'engaged',
  BORED = 'bored',
  EXCITED = 'excited',
  NEUTRAL = 'neutral'
}

// Content Types
export interface Course extends BaseEntity {
  title: string;
  description: string;
  thumbnail?: string;
  instructorId: string;
  organizationId?: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in minutes
  status: 'draft' | 'published' | 'archived';
  tags: string[];
  prerequisites: string[];
  learningObjectives: string[];
  modules: CourseModule[];
  enrollmentCount: number;
  rating: number;
  reviews: CourseReview[];
}

export interface CourseModule extends BaseEntity {
  courseId: string;
  title: string;
  description: string;
  order: number;
  duration: number; // in minutes
  lessons: Lesson[];
  assessments: Assessment[];
}

export interface Lesson extends BaseEntity {
  moduleId: string;
  title: string;
  description: string;
  order: number;
  type: 'video' | 'text' | 'interactive' | 'code' | 'ai_tutoring';
  content: LessonContent;
  duration: number; // in minutes
  isRequired: boolean;
}

export interface LessonContent {
  type: string;
  data: any; // Flexible content structure
  resources: Resource[];
  interactiveElements: InteractiveElement[];
}

export interface Resource {
  id: string;
  type: 'document' | 'video' | 'audio' | 'image' | 'link';
  title: string;
  url: string;
  description?: string;
}

export interface InteractiveElement {
  id: string;
  type: 'quiz' | 'code_editor' | 'simulation' | 'discussion';
  config: any;
  position: number;
}

// Assessment Types
export interface Assessment extends BaseEntity {
  moduleId?: string;
  courseId?: string;
  title: string;
  description: string;
  type: 'quiz' | 'assignment' | 'project' | 'exam';
  questions: Question[];
  timeLimit?: number; // in minutes
  maxAttempts: number;
  passingScore: number; // percentage
  isRequired: boolean;
  dueDate?: Date;
}

export interface Question {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay' | 'code';
  question: string;
  options?: string[]; // for multiple choice
  correctAnswer: any;
  explanation?: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
}

export interface CourseReview extends BaseEntity {
  courseId: string;
  userId: string;
  rating: number; // 1-5
  comment?: string;
  isVerified: boolean;
}

// Real-time Communication Types
export interface ChatMessage extends BaseEntity {
  sessionId: string;
  senderId: string;
  senderType: 'user' | 'ai' | 'system';
  content: string;
  type: 'text' | 'voice' | 'image' | 'file' | 'code';
  metadata?: MessageMetadata;
  reactions: MessageReaction[];
  isEdited: boolean;
  editedAt?: Date;
}

export interface MessageMetadata {
  voiceData?: VoiceMessageData;
  codeData?: CodeMessageData;
  fileData?: FileMessageData;
  aiContext?: AIMessageContext;
}

export interface VoiceMessageData {
  duration: number; // in seconds
  transcription?: string;
  audioUrl: string;
  waveform?: number[];
}

export interface CodeMessageData {
  language: string;
  code: string;
  executionResult?: CodeExecutionResult;
  isExecutable: boolean;
}

export interface FileMessageData {
  fileName: string;
  fileSize: number;
  fileType: string;
  fileUrl: string;
  thumbnail?: string;
}

export interface AIMessageContext {
  model: string;
  confidence: number;
  processingTime: number;
  tokens: number;
  context: string[];
}

export interface MessageReaction {
  userId: string;
  emoji: string;
  timestamp: Date;
}

// Code Execution Types
export interface CodeExecutionRequest {
  language: string;
  code: string;
  input?: string;
  timeout?: number; // in seconds
  memoryLimit?: number; // in MB
  userId: string;
  sessionId?: string;
}

export interface CodeExecutionResult {
  id: string;
  status: 'success' | 'error' | 'timeout' | 'memory_exceeded';
  output?: string;
  error?: string;
  executionTime: number; // in milliseconds
  memoryUsed: number; // in bytes
  timestamp: Date;
  language: string;
  codeHash: string;
}

// Analytics Types
export interface LearningAnalytics {
  userId: string;
  timeframe: 'day' | 'week' | 'month' | 'year';
  metrics: AnalyticsMetrics;
  trends: AnalyticsTrends;
  recommendations: LearningRecommendation[];
  lastUpdated: Date;
}

export interface AnalyticsMetrics {
  totalStudyTime: number; // in minutes
  sessionsCompleted: number;
  averageEngagement: number; // 0-1
  conceptsMastered: number;
  skillsImproved: string[];
  weakAreas: string[];
  strongAreas: string[];
  progressPercentage: number; // 0-100
}

export interface AnalyticsTrends {
  studyTimeByDay: DailyMetric[];
  engagementBySubject: SubjectMetric[];
  performanceOverTime: PerformanceMetric[];
  emotionTrends: EmotionTrend[];
}

export interface DailyMetric {
  date: Date;
  value: number;
}

export interface SubjectMetric {
  subject: string;
  value: number;
}

export interface PerformanceMetric {
  date: Date;
  score: number;
  subject: string;
}

export interface EmotionTrend {
  date: Date;
  emotions: Record<EmotionType, number>;
}

export interface LearningRecommendation {
  type: 'course' | 'topic' | 'skill' | 'break' | 'review';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  estimatedTime: number; // in minutes
  resourceId?: string;
  reasoning: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
  timestamp: Date;
  requestId: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  stack?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// WebSocket Event Types
export interface WebSocketEvent {
  type: string;
  payload: any;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
}

export interface RealTimeEvent extends WebSocketEvent {
  type: 'user_joined' | 'user_left' | 'message' | 'emotion_detected' | 'session_started' | 'session_ended';
}

// Configuration Types
export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;
  poolSize?: number;
}

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  keyPrefix?: string;
}

export interface JWTConfig {
  secret: string;
  expiresIn: string;
  refreshExpiresIn: string;
  issuer: string;
  audience: string;
}

export interface AIConfig {
  openai: {
    apiKey: string;
    model: string;
    maxTokens: number;
    temperature: number;
  };
  huggingface: {
    apiKey: string;
    models: Record<string, string>;
  };
  mediaipe: {
    modelPath: string;
    confidence: number;
  };
}

// Event Types for Message Queue
export interface DomainEvent {
  id: string;
  type: string;
  aggregateId: string;
  aggregateType: string;
  version: number;
  payload: any;
  metadata: EventMetadata;
  timestamp: Date;
}

export interface EventMetadata {
  userId?: string;
  sessionId?: string;
  correlationId: string;
  causationId?: string;
  source: string;
}

// Health Check Types
export interface HealthCheck {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: Date;
  services: ServiceHealth[];
  version: string;
  uptime: number;
}

export interface ServiceHealth {
  name: string;
  status: 'healthy' | 'unhealthy';
  responseTime: number;
  details?: any;
}
