const express = require('express');
const cors = require('cors');
const path = require('path');

// Load environment variables
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic routes
app.get('/', (req, res) => {
  res.json({
    message: 'AI Professor Verse Backend API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.version
  });
});

// API v1 routes
app.get('/api/v1/status', (req, res) => {
  res.json({
    api: 'v1',
    status: 'active',
    services: {
      'api-gateway': 'running',
      'auth-service': 'pending',
      'ai-service': 'pending',
      'realtime-service': 'pending'
    }
  });
});

// Mock AI chat endpoint
app.post('/api/v1/ai/chat', (req, res) => {
  const { message, context = [], sessionId } = req.body;
  
  // Simple mock response
  const responses = [
    "That's a great question! Let me help you understand this concept step by step.",
    "I can see you're working on an interesting problem. Let's break it down together.",
    "Excellent! You're on the right track. Here's what I think about your approach...",
    "That's a common challenge many students face. Let me explain it in a simpler way.",
    "I love your curiosity! This topic connects to several important concepts we should explore."
  ];
  
  const response = responses[Math.floor(Math.random() * responses.length)];
  
  res.json({
    success: true,
    data: {
      response,
      sessionId: sessionId || `session_${Date.now()}`,
      timestamp: new Date().toISOString(),
      model: 'mock-gpt-4',
      usage: {
        prompt_tokens: message.length,
        completion_tokens: response.length,
        total_tokens: message.length + response.length
      }
    }
  });
});

// Mock emotion detection endpoint
app.post('/api/v1/ai/emotion/detect', (req, res) => {
  const emotions = ['happy', 'neutral', 'confused', 'frustrated', 'bored', 'excited'];
  const emotion = emotions[Math.floor(Math.random() * emotions.length)];
  
  res.json({
    success: true,
    data: {
      emotion,
      confidence: 0.7 + Math.random() * 0.3,
      timestamp: new Date().toISOString(),
      source: 'facial'
    }
  });
});

// Mock code analysis endpoint
app.post('/api/v1/ai/code/analyze', (req, res) => {
  const { code, language } = req.body;
  
  res.json({
    success: true,
    data: {
      analysis: {
        syntax_errors: [],
        suggestions: [
          "Consider adding comments to explain complex logic",
          "Variable names could be more descriptive",
          "Good use of proper indentation!"
        ],
        complexity_score: Math.floor(Math.random() * 10) + 1,
        readability_score: Math.floor(Math.random() * 10) + 1
      },
      language,
      timestamp: new Date().toISOString()
    }
  });
});

// Mock authentication endpoints
app.post('/api/v1/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (email && password) {
    res.json({
      success: true,
      data: {
        user: {
          id: '1',
          email,
          name: 'Test User',
          role: 'student'
        },
        tokens: {
          accessToken: 'mock-jwt-token',
          refreshToken: 'mock-refresh-token'
        }
      }
    });
  } else {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Email and password are required'
      }
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Something went wrong!'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.originalUrl} not found`
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
🚀 AI Professor Verse Backend Server Started!

📍 Server URL: http://localhost:${PORT}
🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}
📚 API Documentation: http://localhost:${PORT}/api/v1/status
🔍 Health Check: http://localhost:${PORT}/health

🎯 Available Endpoints:
   GET  /                     - API Info
   GET  /health              - Health Check
   GET  /api/v1/status       - Service Status
   POST /api/v1/ai/chat      - AI Chat (Mock)
   POST /api/v1/ai/emotion/detect - Emotion Detection (Mock)
   POST /api/v1/ai/code/analyze   - Code Analysis (Mock)
   POST /api/v1/auth/login   - Authentication (Mock)

💡 This is a development server with mock responses.
   Configure your .env file for full functionality.

Press Ctrl+C to stop the server.
  `);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down server...');
  process.exit(0);
});
