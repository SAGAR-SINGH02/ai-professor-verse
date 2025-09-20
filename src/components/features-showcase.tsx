import { useState } from "react";
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
  Users,
  PlayCircle,
  ArrowRight,
  CheckCircle
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "3D AI Professor",
    description: "Interact with a lifelike 3D avatar that explains concepts with gestures, expressions, and real-time voice synthesis.",
    status: "Core Feature",
    color: "bg-primary/10 text-primary",
    demoAvailable: true,
    category: "AI Interaction"
  },
  {
    icon: MessageCircle,
    title: "Conversational Chat",
    description: "Ask questions in natural language and get detailed, contextual explanations tailored to your learning style.",
    status: "Available",
    color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    demoAvailable: true,
    category: "AI Interaction"
  },
  {
    icon: Code,
    title: "Live Code Editor",
    description: "Write, execute, and debug code in real-time with AI-powered suggestions and step-by-step explanations.",
    status: "Available",
    color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    demoAvailable: true,
    category: "Development"
  },
  {
    icon: BarChart3,
    title: "Progress Analytics",
    description: "Track your learning journey with detailed analytics, skill assessments, and personalized recommendations.",
    status: "Available", 
    color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    demoAvailable: false,
    category: "Analytics"
  },
  {
    icon: Mic,
    title: "Voice Interaction",
    description: "Learn hands-free with voice commands and audio responses for a more natural learning experience.",
    status: "Coming Soon",
    color: "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300",
    demoAvailable: false,
    category: "AI Interaction"
  },
  {
    icon: Trophy,
    title: "Gamification",
    description: "Earn badges, complete challenges, and compete on leaderboards to stay motivated throughout your journey.",
    status: "Coming Soon",
    color: "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300",
    demoAvailable: false,
    category: "Engagement"
  },
  {
    icon: Eye,
    title: "Emotion Recognition",
    description: "AI adapts lesson pace and difficulty based on your engagement and emotional state for optimal learning.",
    status: "Future",
    color: "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300",
    demoAvailable: false,
    category: "Advanced AI"
  },
  {
    icon: Zap,
    title: "Neural Learning",
    description: "Personalized learning paths based on cognitive patterns and neuroscientific insights about how you learn best.",
    status: "Future",
    color: "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300",
    demoAvailable: false,
    category: "Advanced AI"
  },
  {
    icon: Users,
    title: "Virtual Collaboration",
    description: "Join AI-powered virtual classrooms with fellow learners for group projects and peer learning sessions.",
    status: "Future",
    color: "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300",
    demoAvailable: false,
    category: "Social Learning"
  }
];

const categories = ["All", "AI Interaction", "Development", "Analytics", "Engagement", "Advanced AI", "Social Learning"];

export const FeaturesShowcase = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);

  const filteredFeatures = selectedCategory === "All" 
    ? features 
    : features.filter(feature => feature.category === selectedCategory);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Available":
      case "Core Feature":
        return <CheckCircle className="w-3 h-3" />;
      default:
        return null;
    }
  };

  return (
    <section className="py-12 lg:py-20 bg-background" id="features">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center space-y-4 mb-12 lg:mb-16 animate-fade-in">
          <h2 className="text-3xl sm:text-4xl font-bold">Revolutionary Learning Features</h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
            Experience the future of education with our comprehensive suite of AI-powered tools 
            designed to make learning more engaging, effective, and personalized.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8 lg:mb-12 animate-fade-in">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="transition-all duration-200 hover:scale-105"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-12 lg:mb-16">
          {filteredFeatures.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card 
                key={feature.title} 
                className="relative group hover:shadow-neural transition-all duration-300 hover:-translate-y-1 border-0 shadow-ai cursor-pointer animate-scale-in"
                style={{ animationDelay: `${index * 100}ms` }}
                onMouseEnter={() => setHoveredFeature(feature.title)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-lg transition-all duration-200 ${
                        hoveredFeature === feature.title ? "gradient-primary scale-110" : "bg-primary/10"
                      }`}>
                        <IconComponent className={`w-6 h-6 transition-colors duration-200 ${
                          hoveredFeature === feature.title ? "text-white" : "text-primary"
                        }`} />
                      </div>
                      <div>
                        <CardTitle className="text-lg leading-tight">{feature.title}</CardTitle>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {feature.category}
                        </Badge>
                      </div>
                    </div>
                    <Badge 
                      className={`text-xs ${feature.color} border-0 flex items-center gap-1`}
                      variant="secondary"
                    >
                      {getStatusIcon(feature.status)}
                      {feature.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-6">
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    {feature.description}
                  </p>
                  
                  {feature.demoAvailable && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="group/btn transition-all duration-200 hover:bg-accent/10"
                    >
                      <PlayCircle className="w-4 h-4 mr-2 group-hover/btn:scale-110 transition-transform" />
                      Try Demo
                      <ArrowRight className="w-3 h-3 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  )}
                </CardContent>
                
                {/* Hover Glow Effect */}
                <div className={`absolute inset-0 rounded-lg bg-gradient-to-r from-primary/5 to-accent/5 transition-opacity duration-300 pointer-events-none ${
                  hoveredFeature === feature.title ? "opacity-100" : "opacity-0"
                }`} />
                
                {/* Featured Badge */}
                {feature.status === "Core Feature" && (
                  <div className="absolute -top-2 -right-2 w-16 h-16">
                    <div className="absolute inset-0 gradient-primary rounded-full opacity-20 animate-ping" />
                    <div className="absolute inset-2 gradient-primary rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">★</span>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8 mb-12 lg:mb-16 animate-fade-in">
          {[
            { label: "AI Features", value: "9+", icon: Brain },
            { label: "Learning Modes", value: "5+", icon: Code },
            { label: "Progress Tracking", value: "Real-time", icon: BarChart3 },
            { label: "Personalization", value: "100%", icon: Zap }
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="text-center group">
              <div className="inline-flex items-center justify-center w-12 h-12 lg:w-16 lg:h-16 rounded-full gradient-primary mb-3 lg:mb-4 group-hover:scale-110 transition-transform duration-200">
                <Icon className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
              </div>
              <div className="text-2xl lg:text-3xl font-bold">{value}</div>
              <div className="text-sm lg:text-base text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center animate-fade-in">
          <Button variant="hero" size="lg" className="min-w-[200px]">
            Explore All Features
          </Button>
        </div>
      </div>
    </section>
  );
};