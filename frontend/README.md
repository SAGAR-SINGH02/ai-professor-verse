# AI Professor Verse - Frontend

A revolutionary 3D EdTech platform featuring realistic AI professors, real-time face-to-face interaction, emotion detection, and adaptive tutoring.

## 🚀 Features

### Core Features
- **3D AI Professor Avatar** - Interactive 3D avatars with emotion-based responses
- **Real-time WebRTC Communication** - Face-to-face video calls with AI professors
- **Emotion Detection** - Real-time emotion analysis for adaptive tutoring
- **Voice Interface** - Speech-to-text and text-to-speech capabilities
- **Live Code Execution** - Real-time code analysis and feedback
- **Adaptive Learning** - Personalized learning paths based on user behavior
- **Multi-theme Support** - Dark/light mode with adaptive lighting

### Technical Features
- **Modern React + TypeScript** - Type-safe, component-based architecture
- **Three.js Integration** - 3D graphics and avatar rendering
- **WebSocket Real-time Communication** - Live updates and synchronization
- **Progressive Web App** - Offline capabilities and mobile optimization
- **Responsive Design** - Works seamlessly across all devices
- **Authentication System** - Secure JWT-based authentication

## 🛠️ Tech Stack

- **Frontend Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **3D Graphics**: Three.js + React Three Fiber
- **UI Components**: Radix UI + Tailwind CSS
- **State Management**: Zustand + React Query
- **Real-time Communication**: Socket.io + WebRTC
- **Authentication**: JWT + Refresh Tokens
- **Styling**: Tailwind CSS + CSS Variables
- **Icons**: Lucide React

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Modern web browser with WebRTC support

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   VITE_API_URL=http://localhost:3000/api
   VITE_SOCKET_URL=http://localhost:3000
   VITE_OPENAI_API_KEY=your_openai_api_key
   VITE_GOOGLE_AI_API_KEY=your_google_ai_api_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:8080`

## 🏗️ Project Structure

```
frontend/
├── public/                 # Static assets
├── src/
│   ├── components/        # React components
│   │   ├── ui/           # Reusable UI components
│   │   ├── auth/         # Authentication components
│   │   └── ai-professor/ # AI Professor specific components
│   ├── hooks/            # Custom React hooks
│   ├── services/         # API services and utilities
│   ├── pages/            # Page components
│   ├── types/            # TypeScript type definitions
│   ├── lib/              # Utility functions
│   └── assets/           # Images, fonts, etc.
├── package.json
├── vite.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

## 🎯 Key Components

### AI Professor Interface
- **ProfessorAvatar**: 3D avatar with emotion-based animations
- **EmotionDetection**: Real-time facial emotion analysis
- **VoiceInterface**: Speech recognition and synthesis
- **ChatInterface**: Text-based AI conversation

### Authentication System
- **AuthModal**: Login/Register modal with validation
- **AuthProvider**: Context provider for authentication state
- **Protected Routes**: Route protection based on authentication

### Real-time Features
- **WebRTC Integration**: Video calling capabilities
- **Socket Connection**: Real-time updates and synchronization
- **Screen Sharing**: Share screen during AI sessions

## 🔧 Configuration

### Environment Variables
```env
# API Configuration
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000

# AI Services
VITE_OPENAI_API_KEY=your_openai_api_key
VITE_GOOGLE_AI_API_KEY=your_google_ai_api_key

# WebRTC
VITE_STUN_SERVER=stun:stun.l.google.com:19302

# App Configuration
VITE_APP_NAME="AI Professor Verse"
VITE_APP_VERSION=1.0.0
```

### Tailwind CSS Customization
The project uses custom CSS variables for theming:
- `--primary`: Primary brand color
- `--secondary`: Secondary color
- `--accent`: Accent color for highlights
- `--professor-glow`: AI Professor glow effect
- `--emotion-*`: Emotion-based colors

## 🚀 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checks

## 🎨 Theming

The application supports both light and dark themes with adaptive lighting for 3D elements:

```typescript
// Theme switching
const { theme, setTheme } = useTheme();
setTheme(theme === "light" ? "dark" : "light");
```

## 🔐 Authentication

JWT-based authentication with automatic token refresh:

```typescript
// Using the auth hook
const { user, login, logout, isAuthenticated } = useAuth();

// Login
await login(email, password);

// Register
await register(name, email, password);
```

## 🎮 WebRTC Integration

Real-time video communication with AI professors:

```typescript
// Using WebRTC hook
const { startCall, endCall, toggleVideo, toggleAudio } = useWebRTC();

// Start video call
await startCall();
```

## 🧠 AI Integration

Multiple AI services integration:

```typescript
// Chat with AI Professor
const response = await aiAPI.chat(message, context, emotion);

// Analyze code
const analysis = await aiAPI.analyzeCode(code, language);

// Generate course content
const course = await aiAPI.generateCourse(topic, level, duration);
```

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop (1920px+)
- Laptop (1024px - 1919px)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🔧 Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

**Note**: WebRTC features require modern browser support.

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Deploy to Netlify/Vercel
The built files in `dist/` can be deployed to any static hosting service.

### Environment Variables for Production
Make sure to set all required environment variables in your deployment platform.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔮 Future Enhancements

- **VR/AR Support**: Virtual and augmented reality integration
- **Multi-language Support**: Internationalization
- **Advanced Analytics**: Learning pattern analysis
- **Mobile App**: Native mobile applications
- **Offline Mode**: Progressive Web App capabilities
