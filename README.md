# 🎓 AI Professor Verse

An advanced AI-powered 3D professor system that delivers immersive, interactive education through cutting-edge technology.

## 🚀 **Features**

### **🤖 Realistic 3D Professor Avatar**
- Interactive 3D humanoid avatar built with Three.js
- Natural facial expressions and synchronized lip movements
- Smooth hand gestures and body language
- Emotion-responsive animations

### **🌙 Night Mode Support**
- Adaptive dark theme with soft lighting
- Eye-friendly interface for low-light conditions
- Dynamic 3D environment lighting adjustments
- Seamless theme switching

### **📹 Live Face-to-Face Interaction**
- Real-time webcam and microphone streaming
- Facial expression recognition and mirroring
- Empathetic and responsive communication
- Low-latency video processing

### **🎤 Voice-to-Voice Conversational Interface**
- Speech-to-text with real-time transcription
- Natural text-to-speech responses
- Synchronized avatar lip movements
- Multi-language support ready

### **🔍 Real-Time Error Detection**
- AI-driven code analysis
- Live error detection and highlighting
- Step-by-step solution guidance
- Concept misconception identification

### **😊 Emotion Detection & Adaptive Tutoring**
- Facial expression analysis
- Voice tone emotion recognition
- Adaptive teaching pace and style
- Motivational prompts and break suggestions

### **👥 Multi-Persona System**
- Multiple professor avatars
- Customizable appearances and voices
- Persistent user preferences
- Personalized learning experiences

## 🛠️ **Technology Stack**

### **Frontend Framework**
- **React 18.3.1** - Modern component-based architecture
- **TypeScript 5.8.3** - Type-safe development
- **Vite 5.4.19** - Lightning-fast build tool
- **React Router DOM 6.30.1** - Client-side routing

### **3D Graphics & Animation**
- **Three.js 0.158.0** - 3D rendering engine
- **@react-three/fiber 8.15.11** - React Three.js renderer
- **@react-three/drei 9.88.13** - Useful helpers and abstractions

### **UI & Styling**
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **shadcn/ui** - Modern component library
- **Radix UI** - Accessible, unstyled UI primitives
- **Lucide React** - Beautiful icon library

### **AI & Voice Processing**
- **Web Speech API** - Browser-native speech recognition
- **Speech Synthesis API** - Text-to-speech capabilities
- **MediaPipe** (Ready for integration) - Facial landmark detection
- **WebRTC** (Ready for integration) - Real-time communication

### **State Management & Data**
- **TanStack Query 5.83.0** - Server state management
- **React Hook Form 7.61.1** - Form handling
- **Zod 3.25.76** - Schema validation

## 🏗️ **Project Structure**

```
src/
├── components/
│   ├── ai-professor/
│   │   ├── AIProfessorInterface.tsx    # Main interface component
│   │   ├── ProfessorAvatar.tsx         # 3D avatar rendering
│   │   ├── VoiceInterface.tsx          # Speech processing
│   │   └── EmotionDetection.tsx        # Facial emotion analysis
│   ├── ui/                             # shadcn/ui components
│   └── ...
├── pages/
│   ├── Index.tsx                       # Landing page
│   ├── AIProfessor.tsx                 # AI Professor page
│   └── ...
├── types/
│   └── speech.d.ts                     # Speech API type definitions
└── ...
```

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js 18+ and npm
- Modern web browser with WebRTC support
- Camera and microphone access for full functionality

### **Installation**

1. **Clone the repository**
```bash
git clone <repository-url>
cd ai-professor-verse
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

4. **Open your browser**
Navigate to `http://localhost:8080`

### **Usage**

1. **Access the AI Professor**: Click "Meet AI Professor" on the homepage
2. **Enable Camera/Microphone**: Allow browser permissions for full functionality
3. **Start Interaction**: 
   - Use voice commands by clicking the microphone button
   - Type messages in the chat interface
   - Paste code in the Code Review tab for analysis
4. **Toggle Night Mode**: Use the moon/sun icon for theme switching

## 🎯 **Key Components**

### **ProfessorAvatar**
- 3D avatar rendering with Three.js
- Emotion-based animations
- Lip-sync capabilities
- Night mode lighting adaptation

### **VoiceInterface**
- Real-time speech recognition
- Text-to-speech synthesis
- Audio processing and controls
- Cross-browser compatibility

### **EmotionDetection**
- Facial landmark detection
- Emotion classification
- Confidence scoring
- Real-time feedback

### **AIProfessorInterface**
- Main orchestration component
- State management
- Multi-modal interaction handling
- Adaptive tutoring logic

## 🔮 **Future Enhancements**

### **Phase 2: Advanced Features**
- [ ] WebRTC integration for live streaming
- [ ] MediaPipe FaceMesh for precise facial tracking
- [ ] Ready Player Me avatar integration
- [ ] GPT-4 integration for advanced AI responses
- [ ] Multi-persona avatar selection
- [ ] Advanced code sandboxing

### **Phase 3: Scalability**
- [ ] Backend API integration
- [ ] User authentication and profiles
- [ ] Learning progress tracking
- [ ] Multi-language support
- [ ] Mobile app development

## 🛡️ **Browser Compatibility**

- **Chrome/Edge**: Full support (recommended)
- **Firefox**: Core features supported
- **Safari**: Limited speech API support
- **Mobile**: Basic functionality available

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- Three.js community for 3D rendering capabilities
- shadcn/ui for the beautiful component library
- Radix UI for accessible primitives
- The open-source community for inspiration and tools

---

**Built with ❤️ using modern web technologies to revolutionize online education.**
