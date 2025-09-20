import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, X, Sparkles, Search, Clock, BookOpen, Target, CheckCircle } from "lucide-react";

const suggestedTags = [
  "Python", "JavaScript", "Machine Learning", "React", "Data Science",
  "AI/ML", "Web Development", "Backend", "Frontend", "Database Design",
  "DevOps", "Cloud Computing", "Cybersecurity", "Mobile Development"
];

interface CourseModule {
  id: string;
  title: string;
  duration: string;
  topics: string[];
  difficulty: "Beginner" | "Intermediate" | "Advanced";
}

export const CourseInput = () => {
  const [tags, setTags] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCourse, setGeneratedCourse] = useState<CourseModule[] | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);

  const addTag = (tag: string) => {
    if (tag.trim() && !tags.includes(tag.trim())) {
      setTags([...tags, tag.trim()]);
      setInputValue("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag(inputValue);
    }
  };

  const generateCourse = async () => {
    if (tags.length === 0) return;
    
    setIsGenerating(true);
    setGenerationProgress(0);
    
    // Simulate AI course generation with progress
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // Generate course modules based on tags
    setTimeout(() => {
      const sampleModules: CourseModule[] = [
        {
          id: "1",
          title: `Introduction to ${tags[0]}`,
          duration: "2 weeks",
          topics: [`${tags[0]} Fundamentals`, "Setup & Environment", "Basic Concepts", "Hands-on Practice"],
          difficulty: "Beginner"
        },
        {
          id: "2", 
          title: `Intermediate ${tags[0]} Concepts`,
          duration: "3 weeks",
          topics: ["Advanced Features", "Best Practices", "Real-world Applications", "Project Development"],
          difficulty: "Intermediate"
        },
        {
          id: "3",
          title: `${tags[0]} Projects & Portfolio`,
          duration: "3 weeks", 
          topics: ["Capstone Project", "Portfolio Development", "Code Review", "Deployment"],
          difficulty: "Advanced"
        }
      ];

      if (tags.length > 1) {
        sampleModules.push({
          id: "4",
          title: `Integration: ${tags.slice(0, 2).join(" + ")}`,
          duration: "2 weeks",
          topics: ["Cross-technology Integration", "Advanced Patterns", "Performance Optimization"],
          difficulty: "Advanced"
        });
      }

      setGeneratedCourse(sampleModules);
      setIsGenerating(false);
      clearInterval(progressInterval);
    }, 2500);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
      case "Intermediate": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300";
      case "Advanced": return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <section className="py-12 lg:py-20 bg-muted/30" id="courses">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4 animate-fade-in">
            <h2 className="text-3xl sm:text-4xl font-bold">Create Your Learning Path</h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Enter skills and technologies you want to master. Our AI will craft a personalized curriculum.
            </p>
          </div>

          {/* Input Card */}
          <Card className="shadow-ai border-0 bg-card/50 backdrop-blur-sm animate-scale-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Sparkles className="w-5 h-5 text-accent neural-pulse" />
                AI Course Generator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Tag Input */}
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Type skills and press Enter (e.g., Python, Machine Learning...)"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pl-10 h-12 text-base transition-all duration-200 focus:scale-[1.02]"
                    disabled={isGenerating}
                  />
                  <Button
                    onClick={() => addTag(inputValue)}
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 transition-all duration-200 hover:scale-105"
                    disabled={!inputValue.trim() || isGenerating}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {/* Selected Tags */}
                {tags.length > 0 && (
                  <div className="space-y-2 animate-fade-in">
                    <label className="text-sm font-medium">Selected Skills:</label>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="px-3 py-1 text-sm bg-primary/10 text-primary hover:bg-primary/20 transition-all duration-200 hover:scale-105 animate-scale-in"
                        >
                          #{tag}
                          <button
                            onClick={() => removeTag(tag)}
                            className="ml-2 hover:text-destructive transition-colors"
                            disabled={isGenerating}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggested Tags */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Popular Skills:</label>
                  <div className="flex flex-wrap gap-2">
                    {suggestedTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="cursor-pointer hover:bg-accent hover:text-accent-foreground transition-all duration-200 hover:scale-105"
                        onClick={() => addTag(tag)}
                      >
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Generation Progress */}
              {isGenerating && (
                <div className="space-y-3 animate-fade-in">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Sparkles className="w-4 h-4 animate-spin" />
                    Generating your personalized course...
                  </div>
                  <Progress value={generationProgress} className="h-2" />
                </div>
              )}

              {/* Generate Button */}
              <div className="flex justify-center pt-4">
                <Button
                  variant="neural"
                  size="lg"
                  disabled={tags.length === 0 || isGenerating}
                  className="min-w-[200px] transition-all duration-200"
                  onClick={generateCourse}
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  {isGenerating ? "Generating..." : "Generate Course"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Generated Course */}
          {generatedCourse && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center">
                <h3 className="text-2xl font-bold flex items-center justify-center gap-2">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  Your AI-Generated Course
                </h3>
                <p className="text-muted-foreground mt-2">
                  Estimated completion: {generatedCourse.reduce((acc, module) => acc + parseInt(module.duration), 0)} weeks
                </p>
              </div>

              <div className="grid gap-4 md:gap-6">
                {generatedCourse.map((module, index) => (
                  <Card 
                    key={module.id} 
                    className="shadow-ai border-0 hover:shadow-neural transition-all duration-300 hover:-translate-y-1 animate-scale-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                        <div>
                          <h4 className="text-lg font-semibold">{module.title}</h4>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {module.duration}
                            </div>
                            <div className="flex items-center gap-1">
                              <BookOpen className="w-4 h-4" />
                              {module.topics.length} topics
                            </div>
                          </div>
                        </div>
                        <Badge className={`${getDifficultyColor(module.difficulty)} border-0`}>
                          <Target className="w-3 h-3 mr-1" />
                          {module.difficulty}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Topics Covered:</label>
                        <div className="flex flex-wrap gap-2">
                          {module.topics.map((topic, topicIndex) => (
                            <Badge 
                              key={topicIndex}
                              variant="outline" 
                              className="text-xs hover:bg-muted/50 transition-colors"
                            >
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="text-center">
                <Button variant="hero" size="lg" className="transition-all duration-200">
                  Start Learning Journey
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};