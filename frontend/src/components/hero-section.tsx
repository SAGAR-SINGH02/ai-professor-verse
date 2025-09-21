import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Brain, Code, BookOpen, Users, Play, Sparkles, Video, Mic, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const HeroSection = () => {
  const [currentWord, setCurrentWord] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const navigate = useNavigate();
  
  const animatedWords = ["3D AI Professor", "Personal Tutor", "Learning Partner", "Code Mentor"];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % animatedWords.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [animatedWords.length]);

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background Pattern */}
      <div className="absolute inset-0 gradient-mesh" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.3),transparent_50%)] opacity-30" />
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 rounded-full bg-professor-glow/20 blur-xl avatar-float hidden lg:block" />
      <div className="absolute bottom-20 right-10 w-16 h-16 rounded-full bg-primary/20 blur-lg avatar-float hidden lg:block" style={{ animationDelay: "2s" }} />
      <div className="absolute top-1/2 left-0 w-12 h-12 rounded-full bg-accent/10 blur-md avatar-float hidden md:block" style={{ animationDelay: "4s" }} />
      
      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Content Side */}
          <div className="space-y-6 lg:space-y-8 text-center lg:text-left animate-fade-in">
            <div className="space-y-4 lg:space-y-6">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium transition-all duration-200 hover:bg-primary/20 hover:scale-105 glow-primary">
                <Brain className="w-4 h-4 mr-2" />
                Revolutionary 3D EdTech Platform
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="gradient-neural">
                  Learn with Your
                </span>
                <br />
                <span className="relative inline-block">
                  <span 
                    key={currentWord}
                    className="text-professor-glow animate-fade-in"
                  >
                    {animatedWords[currentWord]}
                  </span>
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl lg:max-w-lg">
                Experience the future of education with realistic 3D AI professors, real-time face-to-face interaction, 
                emotion detection, and adaptive tutoring powered by advanced AI.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button 
                className="group min-w-[200px] gradient-primary hover-lift glow-primary" 
                size="lg"
                onClick={() => navigate('/ai-professor')}
              >
                <Brain className="w-5 h-5 mr-2" />
                Meet Your AI Professor
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="group min-w-[150px] hover-glow"
                onClick={() => scrollToSection('courses')}
              >
                <BookOpen className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                Explore Features
              </Button>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
              {[
                { icon: Video, label: "WebRTC Face-to-Face" },
                { icon: Eye, label: "Emotion Detection" },
                { icon: Mic, label: "Voice Interaction" },
                { icon: Code, label: "Live Code Execution" }
              ].map(({ icon: Icon, label }) => (
                <div 
                  key={label} 
                  className="flex items-center gap-2 px-3 lg:px-4 py-2 rounded-full glass text-sm hover-lift cursor-pointer"
                >
                  <Icon className="w-4 h-4 text-accent" />
                  <span className="hidden sm:inline">{label}</span>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 lg:gap-6 pt-4 lg:pt-6">
              {[
                { value: "100K+", label: "Students" },
                { value: "99%", label: "Satisfaction" },
                { value: "24/7", label: "AI Availability" }
              ].map(({ value, label }) => (
                <div key={label} className="text-center lg:text-left">
                  <div className="text-2xl lg:text-3xl font-bold gradient-neural">{value}</div>
                  <div className="text-sm text-muted-foreground">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Visual Side */}
          <div className="relative order-first lg:order-last animate-scale-in">
            <Card className="relative overflow-hidden shadow-neural border-0 glass-card p-1 group hover-lift">
              <div className="bg-card rounded-lg overflow-hidden relative scene-container">
                <div className="aspect-video bg-gradient-to-br from-primary/20 via-accent/10 to-professor/20 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="w-24 h-24 rounded-full gradient-primary mx-auto flex items-center justify-center glow-professor avatar-float">
                      <Brain className="w-12 h-12 text-white" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold gradient-neural">AI Professor Ready</h3>
                      <p className="text-sm text-muted-foreground">Click to start your learning journey</p>
                    </div>
                  </div>
                </div>
                
                {/* Interactive Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20 backdrop-blur-sm">
                  <Button 
                    className="gradient-primary hover-lift glow-primary"
                    size="lg"
                    onClick={() => navigate('/ai-professor')}
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Start Learning Now
                  </Button>
                </div>
                
                {/* Feature Highlights */}
                <div className="absolute top-4 left-4 space-y-2">
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full glass text-xs font-medium">
                    <Sparkles className="w-3 h-3 text-accent" />
                    3D Interactive
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full glass text-xs font-medium">
                    <Brain className="w-3 h-3 text-primary" />
                    AI-Powered
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full glass text-xs font-medium">
                    <Video className="w-3 h-3 text-professor-glow" />
                    Real-time
                  </div>
                </div>
              </div>
            </Card>
            
            {/* Floating Action Cards */}
            <div className="hidden lg:block absolute -top-6 -right-6 w-32 h-24 glass-card rounded-lg shadow-ai p-3 avatar-float">
              <div className="text-xs font-medium text-accent">WebRTC Active</div>
              <div className="text-xs text-muted-foreground mt-1">Face-to-face ready</div>
              <div className="flex items-center gap-1 mt-2">
                <div className="w-2 h-2 rounded-full bg-green-500 connection-pulse" />
                <span className="text-xs">Connected</span>
              </div>
            </div>
            
            <div className="hidden lg:block absolute -bottom-6 -left-6 w-28 h-20 glass-card rounded-lg shadow-ai p-3 avatar-float" style={{ animationDelay: "3s" }}>
              <div className="text-xs font-medium text-primary">Emotion AI</div>
              <div className="text-xs text-muted-foreground mt-1">Detecting mood</div>
              <div className="flex items-center gap-1 mt-2">
                <div className="w-2 h-2 rounded-full bg-primary emotion-pulse" />
                <span className="text-xs">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
