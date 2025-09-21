import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, BookOpen } from "lucide-react";

export const CourseInput = () => {
  const [courseQuery, setCourseQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseQuery.trim()) return;
    
    setIsLoading(true);
    // TODO: Implement course search/creation logic
    console.log("Searching for course:", courseQuery);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  return (
    <section id="course-input" className="py-12 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What would you like to learn today?
            </h2>
            <p className="text-muted-foreground text-lg">
              Enter a topic, subject, or question to get started with your AI professor
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="E.g., Machine Learning, Python Basics, Quantum Physics..."
                className="pl-10 py-6 text-base"
                value={courseQuery}
                onChange={(e) => setCourseQuery(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Button 
              type="submit" 
              size="lg" 
              className="gap-2"
              disabled={isLoading || !courseQuery.trim()}
            >
              {isLoading ? (
                <>
                  <span className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full" />
                  Searching...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Start Learning
                </>
              )}
            </Button>
          </form>
          
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {['React', 'Data Science', 'Web Development', 'AI Basics'].map((topic) => (
              <button
                key={topic}
                onClick={() => setCourseQuery(topic)}
                className="px-4 py-2 text-sm rounded-full bg-muted hover:bg-muted/80 transition-colors text-foreground/80"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
