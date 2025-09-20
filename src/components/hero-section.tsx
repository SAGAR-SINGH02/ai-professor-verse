import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Brain, Code, BookOpen, Users } from "lucide-react";
import aiProfessorHero from "@/assets/ai-professor-hero.jpg";

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-accent/10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.3),transparent_50%)] opacity-30" />
      
      <div className="relative z-10 container mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content Side */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Brain className="w-4 h-4 mr-2" />
                Next-Gen AI Education
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent leading-tight">
                Learn with Your
                <span className="block gradient-neural bg-clip-text text-transparent">
                  AI Professor
                </span>
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                Experience personalized education with our 3D AI tutor. Interactive lessons, 
                real-time code execution, and adaptive learning paths tailored just for you.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="lg" className="group">
                Start Learning
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="lg">
                Watch Demo
              </Button>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-3">
              {[
                { icon: Code, label: "Live Code Editor" },
                { icon: BookOpen, label: "AI-Generated Courses" },
                { icon: Users, label: "Collaborative Learning" }
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 text-sm">
                  <Icon className="w-4 h-4 text-accent" />
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Visual Side */}
          <div className="relative">
            <Card className="relative overflow-hidden shadow-neural border-0 gradient-glow p-1">
              <div className="bg-card rounded-lg overflow-hidden">
                <img 
                  src={aiProfessorHero} 
                  alt="AI Professor Avatar in futuristic 3D classroom"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent" />
              </div>
            </Card>
            
            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-accent/20 blur-xl float-animation" />
            <div className="absolute -bottom-6 -left-6 w-16 h-16 rounded-full bg-primary/20 blur-lg float-animation" style={{ animationDelay: "2s" }} />
          </div>
        </div>
      </div>
    </section>
  );
};