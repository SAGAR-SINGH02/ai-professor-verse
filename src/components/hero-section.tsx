import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Brain, Code, BookOpen, Users, Play, Sparkles } from "lucide-react";
import aiProfessorHero from "@/assets/ai-professor-hero.jpg";

export const HeroSection = () => {
  const [currentWord, setCurrentWord] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  
  const animatedWords = ["AI Professor", "Personal Tutor", "Learning Partner", "Code Mentor"];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % animatedWords.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-accent/10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.3),transparent_50%)] opacity-30" />
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 rounded-full bg-accent/20 blur-xl float-animation hidden lg:block" />
      <div className="absolute bottom-20 right-10 w-16 h-16 rounded-full bg-primary/20 blur-lg float-animation hidden lg:block" style={{ animationDelay: "2s" }} />
      <div className="absolute top-1/2 left-0 w-12 h-12 rounded-full bg-accent/10 blur-md float-animation hidden md:block" style={{ animationDelay: "4s" }} />
      
      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Content Side */}
          <div className="space-y-6 lg:space-y-8 text-center lg:text-left animate-fade-in">
            <div className="space-y-4 lg:space-y-6">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium transition-all duration-200 hover:bg-primary/20 hover:scale-105">
                <Brain className="w-4 h-4 mr-2" />
                Next-Gen AI Education
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
                  Learn with Your
                </span>
                <br />
                <span className="relative inline-block">
                  <span 
                    key={currentWord}
                    className="gradient-neural bg-clip-text text-transparent animate-fade-in"
                  >
                    {animatedWords[currentWord]}
                  </span>
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl lg:max-w-lg">
                Experience personalized education with our 3D AI tutor. Interactive lessons, 
                real-time code execution, and adaptive learning paths tailored just for you.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button 
                variant="hero" 
                size="lg" 
                className="group min-w-[180px]"
                onClick={() => scrollToSection('courses')}
              >
                Start Learning
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="group min-w-[150px]"
                onClick={() => setIsVideoPlaying(true)}
              >
                <Play className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                Watch Demo
              </Button>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
              {[
                { icon: Code, label: "Live Code Editor" },
                { icon: BookOpen, label: "AI-Generated Courses" },
                { icon: Users, label: "Collaborative Learning" }
              ].map(({ icon: Icon, label }) => (
                <div 
                  key={label} 
                  className="flex items-center gap-2 px-3 lg:px-4 py-2 rounded-full bg-muted/50 text-sm hover:bg-muted/70 transition-all duration-200 hover:scale-105 cursor-pointer"
                >
                  <Icon className="w-4 h-4 text-accent" />
                  <span className="hidden sm:inline">{label}</span>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 lg:gap-6 pt-4 lg:pt-6">
              {[
                { value: "10K+", label: "Students" },
                { value: "95%", label: "Success Rate" },
                { value: "50+", label: "AI Features" }
              ].map(({ value, label }) => (
                <div key={label} className="text-center lg:text-left">
                  <div className="text-2xl lg:text-3xl font-bold text-primary">{value}</div>
                  <div className="text-sm text-muted-foreground">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Visual Side */}
          <div className="relative order-first lg:order-last animate-scale-in">
            <Card className="relative overflow-hidden shadow-neural border-0 gradient-glow p-1 group">
              <div className="bg-card rounded-lg overflow-hidden relative">
                <img 
                  src={aiProfessorHero} 
                  alt="AI Professor Avatar in futuristic 3D classroom"
                  className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent" />
                
                {/* Interactive Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Button 
                    variant="hero" 
                    size="lg" 
                    className="backdrop-blur-sm bg-white/10"
                    onClick={() => setIsVideoPlaying(true)}
                  >
                    <Play className="w-5 h-5 mr-2" />
                    See AI in Action
                  </Button>
                </div>
                
                {/* Feature Highlights */}
                <div className="absolute top-4 left-4 space-y-2">
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-xs font-medium">
                    <Sparkles className="w-3 h-3 text-accent" />
                    3D Interactive
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-xs font-medium">
                    <Brain className="w-3 h-3 text-primary" />
                    AI-Powered
                  </div>
                </div>
              </div>
            </Card>
            
            {/* Floating Action Cards */}
            <div className="hidden lg:block absolute -top-6 -right-6 w-32 h-24 bg-card/80 backdrop-blur-sm rounded-lg shadow-ai border p-3 float-animation">
              <div className="text-xs font-medium text-accent">Live Coding</div>
              <div className="text-xs text-muted-foreground mt-1">Real-time execution</div>
              <div className="flex items-center gap-1 mt-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-xs">Active</span>
              </div>
            </div>
            
            <div className="hidden lg:block absolute -bottom-6 -left-6 w-28 h-20 bg-card/80 backdrop-blur-sm rounded-lg shadow-ai border p-3 float-animation" style={{ animationDelay: "3s" }}>
              <div className="text-xs font-medium text-primary">AI Tutor</div>
              <div className="text-xs text-muted-foreground mt-1">Online</div>
              <div className="flex items-center gap-1 mt-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-xs">Ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {isVideoPlaying && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsVideoPlaying(false)}
        >
          <div className="relative bg-card rounded-lg p-8 max-w-2xl w-full animate-scale-in">
            <button 
              onClick={() => setIsVideoPlaying(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-bold">Demo Video</h3>
              <p className="text-muted-foreground">
                Experience the power of AI-driven education in action.
              </p>
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center space-y-2">
                  <Play className="w-16 h-16 text-accent mx-auto" />
                  <p className="text-sm text-muted-foreground">Demo video coming soon!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};