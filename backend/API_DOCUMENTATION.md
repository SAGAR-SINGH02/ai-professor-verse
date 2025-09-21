# 🚀 AI Professor Verse - API Documentation

## Overview

The AI Professor Verse backend provides a comprehensive set of APIs to power the AI-driven 3D educational platform. This document outlines all available endpoints, their usage, and integration patterns.

## Base URLs

- **Development**: `http://localhost:3000/api/v1`
- **Staging**: `https://api-staging.ai-professor-verse.com/api/v1`
- **Production**: `https://api.ai-professor-verse.com/api/v1`

## Authentication

All API endpoints (except public ones) require authentication using JWT tokens.

### Headers
```http
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

### Authentication Flow
1. **Login**: `POST /auth/login`
2. **Refresh Token**: `POST /auth/refresh`
3. **Logout**: `POST /auth/logout`

---

## 🔐 Authentication Endpoints

### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "student"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "student"
    },
    "tokens": {
      "accessToken": "jwt-token",
      "refreshToken": "refresh-token",
      "expiresIn": 3600
    }
  }
}
```

### POST /auth/login
Authenticate user and get access tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

### POST /auth/oauth/google
Google OAuth authentication.

**Request Body:**
```json
{
  "code": "google-oauth-code",
  "redirectUri": "http://localhost:3000/auth/callback"
}
```

### POST /auth/refresh
Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "your-refresh-token"
}
```

---

## 👤 User Management Endpoints

### GET /users/profile
Get current user profile.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "avatar": "https://example.com/avatar.jpg",
    "preferences": {
      "theme": "dark",
      "language": "en",
      "notifications": {
        "email": true,
        "push": false
      }
    }
  }
}
```

### PUT /users/profile
Update user profile.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "preferences": {
    "theme": "light",
    "language": "es"
  }
}
```

### POST /users/avatar
Upload user avatar.

**Request:** Multipart form data with image file.

---

## 🤖 AI Service Endpoints

### POST /ai/chat
Send message to AI professor for tutoring.

**Request Body:**
```json
{
  "message": "Can you explain recursion in programming?",
  "context": ["Previous conversation messages"],
  "subject": "Computer Science",
  "difficulty": "intermediate",
  "sessionId": "session-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "response": "Recursion is a programming technique where...",
    "confidence": 0.95,
    "suggestions": ["Try implementing a factorial function"],
    "followUpQuestions": ["Would you like to see an example?"],
    "conceptsExplained": ["recursion", "base case", "recursive case"],
    "difficulty": "intermediate",
    "estimatedReadingTime": 2,
    "metadata": {
      "model": "gpt-4-turbo-preview",
      "tokens": 150,
      "processingTime": 1200
    }
  }
}
```

### POST /ai/code/analyze
Analyze code for errors, improvements, and explanations.

**Request Body:**
```json
{
  "code": "def factorial(n):\n    if n == 0:\n        return 1\n    return n * factorial(n-1)",
  "language": "python",
  "analysisType": "review"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "analysis": "This is a correct implementation of factorial using recursion.",
    "issues": [],
    "suggestions": [
      {
        "type": "performance",
        "description": "Consider adding input validation",
        "impact": "medium"
      }
    ],
    "explanation": "The function uses recursion with a proper base case...",
    "complexity": {
      "time": "O(n)",
      "space": "O(n)",
      "readability": 8
    }
  }
}
```

### POST /ai/emotion/detect
Detect emotions from facial image, voice, or text.

**Request Body:**
```json
{
  "type": "facial",
  "data": "base64-encoded-image",
  "sessionId": "session-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "emotions": [
      {
        "emotion": "engaged",
        "confidence": 0.85
      },
      {
        "emotion": "happy",
        "confidence": 0.12
      }
    ],
    "dominantEmotion": "engaged",
    "confidence": 0.85,
    "valence": 0.7,
    "arousal": 0.6,
    "metadata": {
      "processingTime": 450,
      "modelVersion": "1.0.0",
      "source": "facial"
    }
  }
}
```

---

## 🔄 Real-time Communication

### WebSocket Connection
Connect to real-time services for live interactions.

**Connection URL:** `wss://realtime.ai-professor-verse.com/realtime`

**Authentication:** Include JWT token in connection headers.

### WebSocket Events

#### Client → Server Events

**join_session**
```json
{
  "sessionId": "session-uuid",
  "userType": "student"
}
```

**send_message**
```json
{
  "sessionId": "session-uuid",
  "content": "Hello, professor!",
  "type": "text"
}
```

**emotion_update**
```json
{
  "sessionId": "session-uuid",
  "emotion": {
    "emotion": "confused",
    "confidence": 0.8,
    "timestamp": "2024-01-01T12:00:00Z"
  }
}
```

**webrtc_signal**
```json
{
  "sessionId": "session-uuid",
  "targetUserId": "target-user-id",
  "signal": { "sdp": "..." },
  "type": "offer"
}
```

#### Server → Client Events

**user_joined**
```json
{
  "type": "user_joined",
  "payload": {
    "userId": "user-id",
    "userType": "student",
    "sessionId": "session-uuid"
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

**new_message**
```json
{
  "type": "message",
  "payload": {
    "id": "message-id",
    "senderId": "user-id",
    "content": "Hello!",
    "type": "text",
    "timestamp": "2024-01-01T12:00:00Z"
  }
}
```

**emotion_detected**
```json
{
  "type": "emotion_detected",
  "payload": {
    "userId": "user-id",
    "emotion": {
      "emotion": "frustrated",
      "confidence": 0.9
    }
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

---

## 💻 Code Execution Endpoints

### POST /code/execute
Execute code in a secure sandbox environment.

**Request Body:**
```json
{
  "language": "python",
  "code": "print('Hello, World!')",
  "input": "optional input data",
  "timeout": 5000,
  "memoryLimit": 128
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "execution-id",
    "status": "success",
    "output": "Hello, World!\n",
    "executionTime": 245,
    "memoryUsed": 1024,
    "timestamp": "2024-01-01T12:00:00Z",
    "language": "python"
  }
}
```

### GET /code/history
Get code execution history for the current user.

**Query Parameters:**
- `limit`: Number of results (default: 10)
- `offset`: Pagination offset (default: 0)

---

## 📊 Analytics Endpoints

### GET /analytics/learning
Get learning analytics for the current user.

**Query Parameters:**
- `timeframe`: day, week, month, year (default: week)

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "user-id",
    "timeframe": "week",
    "metrics": {
      "totalStudyTime": 120,
      "sessionsCompleted": 8,
      "averageEngagement": 0.85,
      "conceptsMastered": 15,
      "skillsImproved": ["JavaScript", "React"],
      "progressPercentage": 75
    },
    "trends": {
      "studyTimeByDay": [
        { "date": "2024-01-01", "value": 30 },
        { "date": "2024-01-02", "value": 45 }
      ],
      "engagementBySubject": [
        { "subject": "JavaScript", "value": 0.9 },
        { "subject": "Python", "value": 0.7 }
      ]
    },
    "recommendations": [
      {
        "type": "skill",
        "title": "Advanced JavaScript",
        "description": "You're ready for advanced topics",
        "priority": "medium",
        "estimatedTime": 60
      }
    ]
  }
}
```

### GET /analytics/patterns
Get learning patterns and insights.

**Response:**
```json
{
  "success": true,
  "data": {
    "patterns": {
      "preferredStudyTime": "morning",
      "averageSessionDuration": 45,
      "learningVelocity": 2.3,
      "retentionRate": 0.85,
      "difficultyPreference": "intermediate",
      "emotionalStability": 0.7,
      "engagementTrend": "increasing"
    },
    "insights": [
      {
        "type": "strength",
        "title": "High Engagement",
        "description": "You maintain excellent focus during sessions",
        "impact": "high",
        "confidence": 0.9
      }
    ]
  }
}
```

---

## 📚 Content Management Endpoints

### GET /content/courses
Get available courses.

**Query Parameters:**
- `category`: Filter by category
- `level`: beginner, intermediate, advanced
- `search`: Search term
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "courses": [
      {
        "id": "course-id",
        "title": "Introduction to JavaScript",
        "description": "Learn the basics of JavaScript programming",
        "thumbnail": "https://example.com/thumb.jpg",
        "level": "beginner",
        "duration": 180,
        "rating": 4.8,
        "enrollmentCount": 1250
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "hasNext": true
    }
  }
}
```

### GET /content/courses/:id
Get detailed course information.

### POST /content/courses/:id/enroll
Enroll in a course.

---

## 🔔 Notification Endpoints

### GET /notifications
Get user notifications.

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notification-id",
        "type": "achievement",
        "title": "Congratulations!",
        "message": "You've completed your first course!",
        "isRead": false,
        "createdAt": "2024-01-01T12:00:00Z"
      }
    ],
    "unreadCount": 3
  }
}
```

### PUT /notifications/:id/read
Mark notification as read.

### POST /notifications/preferences
Update notification preferences.

---

## 📈 Health and Monitoring

### GET /health
System health check.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00Z",
  "uptime": 86400,
  "services": [
    {
      "name": "database",
      "status": "healthy",
      "responseTime": 15
    },
    {
      "name": "redis",
      "status": "healthy",
      "responseTime": 5
    }
  ]
}
```

### GET /metrics
Prometheus metrics endpoint (requires admin access).

---

## Error Handling

All API responses follow a consistent error format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    }
  },
  "timestamp": "2024-01-01T12:00:00Z",
  "requestId": "req-uuid"
}
```

### Common Error Codes

- `AUTHENTICATION_REQUIRED` (401): Missing or invalid authentication
- `FORBIDDEN` (403): Insufficient permissions
- `NOT_FOUND` (404): Resource not found
- `VALIDATION_ERROR` (400): Invalid input data
- `RATE_LIMIT_EXCEEDED` (429): Too many requests
- `INTERNAL_ERROR` (500): Server error

---

## Rate Limiting

API endpoints are rate-limited to ensure fair usage:

- **Authenticated users**: 1000 requests per hour
- **Anonymous users**: 100 requests per hour
- **AI endpoints**: 20 requests per minute
- **Code execution**: 10 requests per minute

Rate limit headers are included in responses:
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

---

## SDKs and Libraries

### JavaScript/TypeScript SDK
```bash
npm install @ai-professor/sdk
```

```typescript
import { AIProfessorClient } from '@ai-professor/sdk';

const client = new AIProfessorClient({
  baseUrl: 'https://api.ai-professor-verse.com',
  apiKey: 'your-api-key'
});

// Chat with AI professor
const response = await client.ai.chat({
  message: 'Explain recursion',
  subject: 'Computer Science'
});
```

### Python SDK
```bash
pip install ai-professor-sdk
```

```python
from ai_professor import AIProfessorClient

client = AIProfessorClient(
    base_url='https://api.ai-professor-verse.com',
    api_key='your-api-key'
)

# Execute code
result = client.code.execute(
    language='python',
    code='print("Hello, World!")'
)
```

---

## Webhooks

Configure webhooks to receive real-time notifications about events:

### Webhook Events

- `user.registered`: New user registration
- `session.started`: Learning session started
- `session.completed`: Learning session completed
- `achievement.unlocked`: User earned achievement
- `emotion.detected`: Emotion change detected

### Webhook Payload Example
```json
{
  "event": "session.completed",
  "timestamp": "2024-01-01T12:00:00Z",
  "data": {
    "userId": "user-id",
    "sessionId": "session-id",
    "duration": 1800,
    "conceptsLearned": ["variables", "functions"]
  }
}
```

---

## Support

- **Documentation**: https://docs.ai-professor-verse.com
- **API Status**: https://status.ai-professor-verse.com
- **Support Email**: api-support@ai-professor-verse.com
- **Discord Community**: https://discord.gg/ai-professor-verse

---

*Last updated: January 2024*
