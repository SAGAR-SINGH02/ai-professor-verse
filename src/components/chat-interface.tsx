import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, Sparkles, Mic, MicOff, Volume2, VolumeX } from "lucide-react";

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
  isTyping?: boolean;
}

const aiResponses = [
  "Great question! Let me explain that concept step by step...",
  "That's an excellent point to explore. Here's how it works:",
  "I can help you understand this better. Let me break it down:",
  "Perfect! This is a fundamental concept. Here's what you need to know:",
  "Interesting question! This involves several key principles:",
  "Let me provide a detailed explanation with examples:",
  "That's a common challenge. Here's how to approach it:",
  "Excellent! This is where it gets really interesting:",
];

const quickSuggestions = [
  "Explain Python functions",
  "How does machine learning work?",
  "What is React?",
  "Help with debugging",
  "Best coding practices"
];

export const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "Hello! I'm your AI professor. I'm here to help you learn programming concepts, debug code, and guide you through your learning journey. What would you like to explore today?",
      sender: "ai",
      timestamp: new Date(Date.now() - 60000)
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (content?: string) => {
    const messageContent = content || inputValue.trim();
    if (!messageContent) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: messageContent,
      sender: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponses[Math.floor(Math.random() * aiResponses.length)] + "\n\n" + generateDetailedResponse(messageContent),
        sender: "ai",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000);
  };

  const generateDetailedResponse = (question: string) => {
    const lower = question.toLowerCase();
    
    if (lower.includes("python") || lower.includes("function")) {
      return `**Python Functions** are reusable blocks of code that perform specific tasks:\n\n\`\`\`python\ndef greet(name, age=None):\n    if age:\n        return f"Hello {name}, you are {age} years old!"\n    return f"Hello {name}!"\n\n# Usage examples\nprint(greet("Alice"))  # Hello Alice!\nprint(greet("Bob", 25))  # Hello Bob, you are 25 years old!\n\`\`\`\n\n**Key concepts:**\n• **Parameters**: Input values (name, age)\n• **Default values**: age=None provides a fallback\n• **Return statement**: Outputs the result\n• **Scope**: Variables inside functions are local\n\nWould you like me to explain any specific aspect in more detail?`;
    }
    
    if (lower.includes("machine learning") || lower.includes("ml")) {
      return `**Machine Learning** is a subset of AI that enables computers to learn from data:\n\n**Core Types:**\n• **Supervised Learning**: Learn from labeled examples (classification, regression)\n• **Unsupervised Learning**: Find patterns in unlabeled data (clustering, dimensionality reduction)\n• **Reinforcement Learning**: Learn through trial and error with rewards\n\n**Common Algorithms:**\n• Linear Regression, Decision Trees\n• Neural Networks, Support Vector Machines\n• K-Means Clustering, Random Forest\n\n**Typical Workflow:**\n1. Data Collection & Cleaning\n2. Feature Engineering\n3. Model Selection & Training\n4. Evaluation & Validation\n5. Deployment & Monitoring\n\nWhat specific aspect would you like to dive deeper into?`;
    }
    
    if (lower.includes("react")) {
      return `**React** is a powerful JavaScript library for building user interfaces:\n\n\`\`\`jsx\nimport React, { useState } from 'react';\n\nfunction Counter() {\n  const [count, setCount] = useState(0);\n  \n  return (\n    <div>\n      <h2>Count: {count}</h2>\n      <button onClick={() => setCount(count + 1)}>\n        Increment\n      </button>\n    </div>\n  );\n}\n\nexport default Counter;\n\`\`\`\n\n**Key Concepts:**\n• **Components**: Reusable UI building blocks\n• **JSX**: JavaScript syntax extension for HTML-like code\n• **State**: Data that changes over time\n• **Props**: Data passed between components\n• **Hooks**: Functions that let you use state and lifecycle features\n\n**Benefits:**\n• Virtual DOM for performance\n• Component-based architecture\n• Large ecosystem and community\n• Excellent developer tools\n\nNeed help with a specific React concept?`;
    }
    
    return `That's a great topic! I'd be happy to provide more specific guidance. Could you share more details about what you'd like to learn or any specific challenges you're facing? I can provide:\n\n• Step-by-step explanations\n• Code examples and best practices\n• Debugging assistance\n• Project guidance\n• Resource recommendations\n\nFeel free to ask follow-up questions!`;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleVoice = () => {
    setIsListening(!isListening);
    // Simulate voice recognition
    if (!isListening) {
      setTimeout(() => {
        setIsListening(false);
        setInputValue("How do I create a React component?");
      }, 3000);
    }
  };

  return (
    <section className="py-12 lg:py-20 bg-muted/30" id="chat">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4 animate-fade-in">
            <h2 className="text-3xl sm:text-4xl font-bold">Intelligent Conversation</h2>
            <p className="text-lg sm:text-xl text-muted-foreground">
              Ask questions, get explanations, and have natural conversations with your AI tutor.
            </p>
          </div>

          {/* Chat Card */}
          <Card className="shadow-neural border-0 bg-card/80 backdrop-blur-sm animate-scale-in">
            <CardHeader className="border-b bg-card/50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-accent neural-pulse" />
                  AI Tutor Chat
                </CardTitle>
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMuted(!isMuted)}
                    className="transition-all duration-200 hover:scale-105"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </Button>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Online
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              {/* Messages Area */}
              <ScrollArea className="h-80 sm:h-96" ref={scrollRef}>
                <div className="p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 animate-fade-in ${
                        message.sender === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      {message.sender === "ai" && (
                        <Avatar className="w-8 h-8 bg-primary shrink-0">
                          <AvatarFallback>
                            <Bot className="w-4 h-4 text-primary-foreground" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                      
                      <div
                        className={`max-w-[85%] sm:max-w-[80%] rounded-lg px-4 py-3 transition-all duration-200 hover:shadow-sm ${
                          message.sender === "user"
                            ? "bg-primary text-primary-foreground ml-auto"
                            : "bg-muted"
                        }`}
                      >
                        <div className="text-sm leading-relaxed whitespace-pre-wrap">
                          {message.content}
                        </div>
                        <div className={`text-xs mt-2 opacity-70 ${
                          message.sender === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                        }`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>

                      {message.sender === "user" && (
                        <Avatar className="w-8 h-8 bg-accent shrink-0">
                          <AvatarFallback>
                            <User className="w-4 h-4 text-accent-foreground" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                  
                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex gap-3 justify-start animate-fade-in">
                      <Avatar className="w-8 h-8 bg-primary">
                        <AvatarFallback>
                          <Bot className="w-4 h-4 text-primary-foreground" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-muted rounded-lg px-4 py-3">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" />
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: "0.2s" }} />
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: "0.4s" }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Quick Suggestions */}
              <div className="border-t border-b p-4 bg-card/30">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Quick Questions:</label>
                  <div className="flex flex-wrap gap-2">
                    {quickSuggestions.map((suggestion) => (
                      <Badge
                        key={suggestion}
                        variant="outline"
                        className="cursor-pointer hover:bg-accent hover:text-accent-foreground transition-all duration-200 hover:scale-105 text-xs"
                        onClick={() => sendMessage(suggestion)}
                      >
                        {suggestion}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Input Area */}
              <div className="p-4 bg-card/50">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      ref={inputRef}
                      placeholder="Ask me anything about programming..."
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="pr-12 transition-all duration-200 focus:scale-[1.01]"
                      disabled={isTyping}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`absolute right-2 top-1/2 transform -translate-y-1/2 transition-all duration-200 ${
                        isListening ? "text-red-500 animate-pulse" : "text-muted-foreground hover:text-accent"
                      }`}
                      onClick={toggleVoice}
                    >
                      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </Button>
                  </div>
                  <Button
                    onClick={() => sendMessage()}
                    disabled={!inputValue.trim() || isTyping}
                    variant="ai"
                    size="icon"
                    className="shrink-0 transition-all duration-200"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                
                {isListening && (
                  <div className="mt-2 text-xs text-accent animate-fade-in">
                    🎤 Listening... Speak your question
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};