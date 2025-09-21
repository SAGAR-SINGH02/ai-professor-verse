# AI Professor Verse - Backend API

A production-ready backend system for the AI Professor Verse 3D EdTech platform with microservices architecture, real-time communication, and AI integration.

## 🚀 Features

### Core Services
- **API Gateway** - Central routing, authentication, rate limiting
- **Authentication Service** - OAuth 2.0, JWT, multi-factor auth
- **AI Service** - GPT-4 integration, emotion detection, adaptive tutoring
- **Real-time Service** - WebRTC, WebSockets, live communication
- **User Service** - Profile management, preferences
- **Content Service** - Course management, media storage
- **Analytics Service** - Learning patterns, progress tracking

### Key Features
- **Scalable Architecture** - Microservices with Express.js/TypeScript
- **Real-time Communication** - Socket.io + WebRTC signaling
- **AI Integration** - OpenAI GPT-4 + Google AI
- **Security** - JWT with refresh token rotation, rate limiting
- **Database Support** - MongoDB with Mongoose ODM
- **Comprehensive Logging** - Winston logger with multiple transports
- **Error Handling** - Centralized error handling middleware

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB
- **Caching**: Redis (optional)
- **Real-time**: Socket.io
- **Authentication**: JWT + bcryptjs
- **Validation**: express-validator
- **Logging**: Winston
- **AI Services**: OpenAI API, Google Generative AI

## 📦 Installation

### Prerequisites
- Node.js 18+
- MongoDB 5.0+
- Redis 6.0+ (optional)
- OpenAI API Key
- Google AI API Key (optional)

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file:
   ```env
   PORT=3000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/ai-professor-verse
   JWT_SECRET=your_super_secret_jwt_key
   JWT_REFRESH_SECRET=your_super_secret_refresh_key
   OPENAI_API_KEY=your_openai_api_key
   GOOGLE_AI_API_KEY=your_google_ai_api_key
   FRONTEND_URL=http://localhost:8080
   ```

4. **Start MongoDB**
   ```bash
   # Using MongoDB service
   sudo systemctl start mongod
   
   # Or using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:5.0
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Verify installation**
   Navigate to `http://localhost:3000/health`

## 🏗️ Project Structure

```
backend-api/
├── src/
│   ├── config/           # Configuration files
│   │   └── database.ts   # Database connection
│   ├── middleware/       # Express middleware
│   │   ├── auth.ts      # Authentication middleware
│   │   └── errorHandler.ts # Error handling
│   ├── models/          # Database models
│   │   └── User.ts      # User model
│   ├── routes/          # API routes
│   │   ├── auth.ts      # Authentication routes
│   │   ├── ai.ts        # AI service routes
│   │   ├── courses.ts   # Course management
│   │   ├── users.ts     # User management
│   │   └── webrtc.ts    # WebRTC signaling
│   ├── services/        # Business logic services
│   │   ├── aiService.ts # AI integration
│   │   └── socketService.ts # Socket.io handling
│   ├── utils/           # Utility functions
│   │   └── logger.ts    # Winston logger
│   └── server.ts        # Main server file
├── logs/                # Log files
├── package.json
├── tsconfig.json
└── .env.example
```

## 🔐 Authentication

### JWT Token System
- **Access Token**: Short-lived (7 days) for API access
- **Refresh Token**: Long-lived (30 days) for token renewal
- **Automatic Rotation**: Refresh tokens rotate on use

### API Endpoints
```typescript
POST /api/auth/register  # User registration
POST /api/auth/login     # User login
POST /api/auth/refresh   # Token refresh
POST /api/auth/logout    # User logout
GET  /api/auth/me        # Get current user
```

### Usage Example
```typescript
// Register new user
const response = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'securepassword'
  })
});

// Use JWT token
const token = response.data.token;
fetch('/api/protected-route', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

## 🤖 AI Integration

### Supported AI Services
- **OpenAI GPT-4**: Primary AI service for conversations
- **Google Generative AI**: Alternative AI service
- **Text-to-Speech**: OpenAI TTS for voice synthesis
- **Emotion Analysis**: Custom emotion processing

### AI API Endpoints
```typescript
POST /api/ai/chat                # Chat with AI Professor
POST /api/ai/generate-course     # Generate course content
POST /api/ai/analyze-code        # Code analysis and feedback
POST /api/ai/emotion-feedback    # Process emotion data
POST /api/ai/text-to-speech      # Convert text to speech
GET  /api/ai/recommendations     # Get personalized recommendations
```

### Usage Example
```typescript
// Chat with AI Professor
const chatResponse = await fetch('/api/ai/chat', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    message: 'Explain JavaScript closures',
    context: { topic: 'javascript' },
    emotion: 'confused'
  })
});
```

## 🔄 Real-time Communication

### Socket.io Events
```typescript
// Client-side events
socket.emit('join-ai-session', { sessionId, userInfo });
socket.emit('ai-message', { message, sessionId });
socket.emit('emotion-detected', { emotion, confidence });

// WebRTC signaling
socket.emit('webrtc-offer', { offer, sessionId });
socket.emit('webrtc-answer', { answer, targetUserId });
socket.emit('webrtc-ice-candidate', { candidate, targetUserId });
```

### WebRTC Signaling
The backend provides WebRTC signaling for:
- **Peer-to-peer video calls**
- **Screen sharing**
- **Audio communication**
- **ICE candidate exchange**

## 📊 API Documentation

### Authentication Required
Most endpoints require JWT authentication:
```
Authorization: Bearer <jwt_token>
```

### Response Format
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    // Validation errors (if any)
  ]
}
```

## 🛡️ Security Features

### Rate Limiting
- **Global Rate Limit**: 100 requests per 15 minutes per IP
- **Authentication Routes**: Additional rate limiting
- **Configurable Limits**: Environment-based configuration

### Input Validation
- **express-validator**: Request validation middleware
- **Sanitization**: Input sanitization and normalization
- **Type Safety**: TypeScript for compile-time safety

### Security Headers
- **Helmet.js**: Security headers middleware
- **CORS**: Cross-origin resource sharing configuration
- **Content Security Policy**: XSS protection

## 📝 Logging

### Winston Logger Configuration
```typescript
// Log levels: error, warn, info, debug
logger.info('Server started on port 3000');
logger.error('Database connection failed', error);
logger.warn('High memory usage detected');
```

### Log Files
- `logs/error.log`: Error-level logs only
- `logs/combined.log`: All log levels
- **Console**: Development environment logging

## 🚀 Available Scripts

```bash
npm run dev          # Start development server with nodemon
npm run build        # Compile TypeScript to JavaScript
npm start           # Start production server
npm run lint        # Run ESLint
npm test           # Run tests (when implemented)
```

## 🔧 Configuration

### Environment Variables
```env
# Server Configuration
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:8080

# Database
MONGODB_URI=mongodb://localhost:27017/ai-professor-verse
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your_super_secret_jwt_key
JWT_REFRESH_SECRET=your_super_secret_refresh_key

# AI Services
OPENAI_API_KEY=your_openai_api_key
GOOGLE_AI_API_KEY=your_google_ai_api_key

# Logging
LOG_LEVEL=info

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 📈 Performance

### Optimization Features
- **Compression**: Gzip compression middleware
- **Caching**: Redis caching for frequent queries
- **Connection Pooling**: MongoDB connection pooling
- **Rate Limiting**: Prevent API abuse

### Monitoring
- **Health Check**: `/health` endpoint for monitoring
- **Performance Metrics**: Request timing and memory usage
- **Error Tracking**: Comprehensive error logging

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Setup
- Set `NODE_ENV=production`
- Configure production database
- Set secure JWT secrets
- Configure external services (Redis, etc.)

## 🧪 Testing

### Test Structure (Future Implementation)
```
tests/
├── unit/           # Unit tests
├── integration/    # Integration tests
├── e2e/           # End-to-end tests
└── fixtures/      # Test data
```

### Testing Commands
```bash
npm test           # Run all tests
npm run test:unit  # Run unit tests only
npm run test:e2e   # Run e2e tests only
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Follow TypeScript and ESLint rules
4. Add tests for new features
5. Update documentation
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   ```bash
   # Check MongoDB status
   sudo systemctl status mongod
   
   # Start MongoDB
   sudo systemctl start mongod
   ```

2. **Port Already in Use**
   ```bash
   # Kill process on port 3000
   lsof -ti:3000 | xargs kill -9
   ```

3. **JWT Token Invalid**
   - Check JWT_SECRET in environment
   - Verify token expiration
   - Check token format

4. **AI API Errors**
   - Verify API keys in environment
   - Check API quotas and limits
   - Review request format

## 🔮 Future Enhancements

- **GraphQL API**: Alternative to REST API
- **Microservices**: Split into separate services
- **Kubernetes**: Container orchestration
- **Monitoring**: Prometheus + Grafana
- **Testing**: Comprehensive test suite
- **Documentation**: OpenAPI/Swagger docs
