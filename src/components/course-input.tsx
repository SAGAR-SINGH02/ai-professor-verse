import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Sparkles, Search } from "lucide-react";

const suggestedTags = [
  "Python", "JavaScript", "Machine Learning", "React", "Data Science",
  "AI/ML", "Web Development", "Backend", "Frontend", "Database Design",
  "DevOps", "Cloud Computing", "Cybersecurity", "Mobile Development"
];

export const CourseInput = () => {
  const [tags, setTags] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");

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

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold">Create Your Learning Path</h2>
            <p className="text-xl text-muted-foreground">
              Enter skills and technologies you want to master. Our AI will craft a personalized curriculum.
            </p>
          </div>

          <Card className="shadow-ai border-0 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent" />
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
                    className="pl-10 h-12 text-base"
                  />
                  <Button
                    onClick={() => addTag(inputValue)}
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    disabled={!inputValue.trim()}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {/* Selected Tags */}
                {tags.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Selected Skills:</label>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="px-3 py-1 text-sm bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                        >
                          #{tag}
                          <button
                            onClick={() => removeTag(tag)}
                            className="ml-2 hover:text-destructive"
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
                        className="cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
                        onClick={() => addTag(tag)}
                      >
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              <div className="flex justify-center pt-4">
                <Button
                  variant="neural"
                  size="lg"
                  disabled={tags.length === 0}
                  className="min-w-[200px]"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Course
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};