import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Brain, 
  MessageCircle, 
  Code, 
  BarChart3, 
  Mic, 
  Trophy,
  Eye,
  Zap,
  Users
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "3D AI Professor",
    description: "Interact with a lifelike 3D avatar that explains concepts with gestures, expressions, and real-time voice synthesis.",
    status: "Core Feature",
    color: "bg-primary/10 text-primary"
  },
  {
    icon: MessageCircle,
    title: "Conversational Chat",
    description: "Ask questions in natural language and get detailed, contextual explanations tailored to your learning style.",
    status: "Available",
    color: "bg-accent/10 text-accent"
  },
  {
    icon: Code,
    title: "Live Code Editor",
    description: "Write, execute, and debug code in real-time with AI-powered suggestions and step-by-step explanations.",
    status: "Available",
    color: "bg-accent/10 text-accent"
  },
  {
    icon: BarChart3,
    title: "Progress Analytics",
    description: "Track your learning journey with detailed analytics, skill assessments, and personalized recommendations.",
    status: "Available",
    color: "bg-accent/10 text-accent"
  },
  {
    icon: Mic,
    title: "Voice Interaction",
    description: "Learn hands-free with voice commands and audio responses for a more natural learning experience.",
    status: "Coming Soon",
    color: "bg-orange-100 text-orange-600"
  },
  {
    icon: Trophy,
    title: "Gamification",
    description: "Earn badges, complete challenges, and compete on leaderboards to stay motivated throughout your journey.",
    status: "Coming Soon",
    color: "bg-orange-100 text-orange-600"
  },
  {
    icon: Eye,
    title: "Emotion Recognition",
    description: "AI adapts lesson pace and difficulty based on your engagement and emotional state for optimal learning.",
    status: "Future",
    color: "bg-purple-100 text-purple-600"
  },
  {
    icon: Zap,
    title: "Neural Learning",
    description: "Personalized learning paths based on cognitive patterns and neuroscientific insights about how you learn best.",
    status: "Future",
    color: "bg-purple-100 text-purple-600"
  },
  {
    icon: Users,
    title: "Virtual Collaboration",
    description: "Join AI-powered virtual classrooms with fellow learners for group projects and peer learning sessions.",
    status: "Future",
    color: "bg-purple-100 text-purple-600"
  }
];

export const FeaturesShowcase = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl font-bold">Revolutionary Learning Features</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Experience the future of education with our comprehensive suite of AI-powered tools 
            designed to make learning more engaging, effective, and personalized.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const IconComponent = feature.icon;
            return (
              <Card 
                key={feature.title} 
                className="relative group hover:shadow-neural transition-all duration-300 hover:-translate-y-1 border-0 shadow-ai"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <IconComponent className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                      </div>
                    </div>
                    <Badge 
                      className={`text-xs ${feature.color} border-0`}
                      variant="secondary"
                    >
                      {feature.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
                
                {/* Hover Glow Effect */}
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-16">
          <Button variant="hero" size="lg">
            Explore All Features
          </Button>
        </div>
      </div>
    </section>
  );
};