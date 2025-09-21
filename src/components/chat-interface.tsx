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
      return `**Python Functions: Complete Guide**

Functions are the building blocks of Python programming. Here's a comprehensive breakdown:

\`\`\`python
# Basic Function Definition
def greet(name, age=None):
    \"\"\"This function greets a person with optional age.\"\"\"
    if age:
        return f"Hello {name}, you are {age} years old!"
    return f"Hello {name}!"

# Advanced Function Examples
def calculate_area(shape, *args, **kwargs):
    \"\"\"Calculate area based on shape type.\"\"\"
    if shape == "circle":
        radius = args[0] if args else kwargs.get('radius', 0)
        return 3.14159 * radius ** 2
    elif shape == "rectangle":
        length, width = args if len(args) >= 2 else (kwargs.get('length', 0), kwargs.get('width', 0))
        return length * width
    return 0

# Lambda Functions (Anonymous Functions)
square = lambda x: x ** 2
numbers = [1, 2, 3, 4, 5]
squared_numbers = list(map(square, numbers))

# Higher-Order Functions
def apply_operation(func, data):
    \"\"\"Apply a function to each element in data.\"\"\"
    return [func(item) for item in data]

# Usage Examples
print(greet("Alice"))                    # Hello Alice!
print(greet("Bob", 25))                  # Hello Bob, you are 25 years old!
print(calculate_area("circle", 5))       # 78.53975
print(apply_operation(lambda x: x*2, [1,2,3]))  # [2, 4, 6]
\`\`\`

**Function Components:**
• **Parameters**: Input values (positional or keyword arguments)
• **Return Statement**: Output value(s) or None
• **Docstrings**: Documentation strings for functions
• **Scope**: Local vs Global variables
• **Arguments**: *args (variable positional), **kwargs (variable keyword)

**Advanced Concepts:**
• **Decorators**: Functions that modify other functions
• **Generators**: Functions that yield values one at a time
• **Closures**: Inner functions with access to outer scope
• **Recursion**: Functions that call themselves

**Best Practices:**
• Use descriptive function names
• Include docstrings for documentation
• Handle edge cases and errors
• Use type hints for better code clarity
• Keep functions focused on single responsibilities

Would you like me to explain any specific aspect in more detail, such as decorators, generators, or error handling?`;
    }
    
    if (lower.includes("machine learning") || lower.includes("ml")) {
      return `**Machine Learning** is a subset of AI that enables computers to learn from data:

**Core Types:**
• **Supervised Learning**: Learn from labeled examples (classification, regression)
• **Unsupervised Learning**: Find patterns in unlabeled data (clustering, dimensionality reduction)
• **Reinforcement Learning**: Learn through trial and error with rewards

**Common Algorithms:**
• Linear Regression, Decision Trees
• Neural Networks, Support Vector Machines
• K-Means Clustering, Random Forest

**Typical Workflow:**
1. Data Collection & Cleaning
2. Feature Engineering
3. Model Selection & Training
4. Evaluation & Validation
5. Deployment & Monitoring

What specific aspect would you like to dive deeper into?`;
    }
    
    if (lower.includes("react")) {
      return `**React: Complete Development Guide**

React is a powerful JavaScript library for building user interfaces, particularly web applications. Here's a comprehensive overview:

**Core Concepts:**

\`\`\`jsx
import React, { useState, useEffect, useCallback } from 'react';

// Functional Component with Hooks
function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState('');

  // Effect Hook for side effects
  useEffect(() => {
    document.title = \`Todos: \${todos.length}\`;
  }, [todos.length]);

  // Custom Hook
  const addTodo = useCallback(() => {
    if (inputValue.trim()) {
      setTodos(prev => [...prev, {
        id: Date.now(),
        text: inputValue,
        completed: false
      }]);
      setInputValue('');
    }
  }, [inputValue]);

  return (
    <div className="todo-app">
      <h1>My Todo List</h1>
      <div className="input-section">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Add a new todo..."
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
        />
        <button onClick={addTodo}>Add Todo</button>
      </div>
      <ul className="todo-list">
        {todos.map(todo => (
          <li key={todo.id} className={todo.completed ? 'completed' : ''}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
            />
            <span>{todo.text}</span>
            <button onClick={() => deleteTodo(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Class Component (Legacy approach)
class Counter extends React.Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 };
  }

  increment = () => {
    this.setState({ count: this.state.count + 1 });
  };

  render() {
    return (
      <div>
        <h2>Count: {this.state.count}</h2>
        <button onClick={this.increment}>Increment</button>
      </div>
    );
  }
}
\`\`\`

**React Hooks (Modern Approach):**

• **useState**: Manage component state
• **useEffect**: Handle side effects (API calls, subscriptions)
• **useContext**: Access context values
• **useReducer**: Complex state management
• **useCallback**: Memoize functions
• **useMemo**: Memoize expensive calculations
• **useRef**: Access DOM elements directly

**Component Lifecycle:**

1. **Mounting**: Component is created and inserted into DOM
2. **Updating**: Component re-renders due to state/props changes
3. **Unmounting**: Component is removed from DOM

**Advanced Patterns:**

• **Higher-Order Components (HOC)**: Functions that take components and return enhanced components
• **Render Props**: Pattern for sharing code between components
• **Compound Components**: Components that work together as a complete set
• **Custom Hooks**: Reusable stateful logic

**State Management:**

• **Local State**: useState, useReducer
• **Global State**: Context API, Redux, Zustand
• **Server State**: React Query, SWR

**Performance Optimization:**

• **React.memo**: Prevent unnecessary re-renders
• **useMemo**: Memoize expensive calculations
• **useCallback**: Memoize function references
• **Lazy Loading**: Code splitting with React.lazy()
• **Virtualization**: Handle large lists efficiently

**Best Practices:**

• Use functional components with hooks
• Keep components small and focused
• Use TypeScript for better development experience
• Implement proper error boundaries
• Use React DevTools for debugging
• Write tests with React Testing Library
• Follow accessibility guidelines (ARIA)

**Ecosystem:**

• **Next.js**: Full-stack React framework
• **Gatsby**: Static site generator
• **React Native**: Mobile app development
• **Material-UI**: Component library
• **Ant Design**: Enterprise UI components

Would you like me to dive deeper into any specific React concept, such as advanced hooks, state management, performance optimization, or help you with a specific implementation?`;
    }
    
    return `That's a great topic! I'd be happy to provide more specific guidance. Could you share more details about what you'd like to learn or any specific challenges you're facing? I can provide:

• Step-by-step explanations
• Code examples and best practices
• Debugging assistance
• Project guidance
• Resource recommendations

Feel free to ask follow-up questions!`;
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