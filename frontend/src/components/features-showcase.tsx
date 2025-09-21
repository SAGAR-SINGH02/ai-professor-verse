import { Code, Brain, MessageSquare, Zap, Users, BookOpen, Award, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

type Feature = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

export const FeaturesShowcase = () => {
  const features: Feature[] = [
    {
      icon: <Brain className="h-8 w-8 text-primary" />,
      title: "AI-Powered Learning",
      description: "Personalized learning experience powered by advanced AI algorithms that adapt to your pace and style."
    },
    {
      icon: <MessageSquare className="h-8 w-8 text-primary" />,
      title: "Interactive Chat",
      description: "Engage in natural conversations with your AI professor to clarify doubts and deepen understanding."
    },
    {
      icon: <Code className="h-8 w-8 text-primary" />,
      title: "Real-time Code Analysis",
      description: "Get instant feedback on your code with detailed explanations and suggestions for improvement."
    },
    {
      icon: <Zap className="h-8 w-8 text-primary" />,
      title: "Quick Responses",
      description: "Get instant answers to your questions without waiting, available 24/7 for your learning needs."
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Collaborative Learning",
      description: "Join study groups and collaborate with peers for a more engaging learning experience."
    },
    {
      icon: <BookOpen className="h-8 w-8 text-primary" />,
      title: "Comprehensive Courses",
      description: "Access a wide range of courses across various subjects, from beginner to advanced levels."
    },
    {
      icon: <Award className="h-8 w-8 text-primary" />,
      title: "Achievement Tracking",
      description: "Earn badges and track your progress as you master new concepts and complete courses."
    },
    {
      icon: <Clock className="h-8 w-8 text-primary" />,
      title: "Self-Paced Learning",
      description: "Learn at your own pace with flexible scheduling and on-demand access to all materials."
    }
  ];

  return (
    <section id="features" className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Powerful Features for Effective Learning
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Experience the future of education with our AI-powered learning platform
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="h-full hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
