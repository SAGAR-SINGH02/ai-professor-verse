import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '../utils/logger';
import User from '../models/User';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

interface ChatRequest {
  message: string;
  userId: string;
  context?: any;
  emotion?: string;
}

interface CourseRequest {
  topic: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  userId: string;
}

interface CodeAnalysisRequest {
  code: string;
  language: string;
}

interface EmotionFeedbackRequest {
  userId: string;
  emotion: string;
  confidence: number;
  context?: string;
}

interface TTSRequest {
  text: string;
  voice: string;
}

class AIService {
  async generateResponse({ message, userId, context, emotion }: ChatRequest) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Build system prompt based on user profile and emotion
      const systemPrompt = this.buildSystemPrompt(user, emotion);

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      const response = completion.choices[0]?.message?.content || "I'm sorry, I couldn't process that request.";

      // Determine professor emotion based on response and student emotion
      const professorEmotion = this.determineProfessorEmotion(emotion, response);

      // Generate follow-up suggestions
      const suggestions = await this.generateSuggestions(message, response);

      return {
        message: response,
        professorEmotion,
        suggestions
      };
    } catch (error) {
      logger.error('AI response generation error:', error);
      throw new Error('Failed to generate AI response');
    }
  }

  async generateCourse({ topic, level, duration, userId }: CourseRequest) {
    try {
      const prompt = `Create a comprehensive ${level} level course on "${topic}" that should take approximately ${duration} minutes to complete.

      Structure the course with:
      1. Course overview and objectives
      2. 4-6 main modules with clear learning outcomes
      3. Interactive exercises and examples
      4. Assessment questions
      5. Additional resources

      Format as JSON with the following structure:
      {
        "title": "Course Title",
        "description": "Course description",
        "objectives": ["objective1", "objective2"],
        "estimatedDuration": ${duration},
        "level": "${level}",
        "modules": [
          {
            "title": "Module Title",
            "content": "Module content",
            "exercises": ["exercise1", "exercise2"],
            "duration": 15
          }
        ],
        "assessment": {
          "questions": [
            {
              "question": "Question text",
              "options": ["A", "B", "C", "D"],
              "correct": 0
            }
          ]
        },
        "resources": ["resource1", "resource2"]
      }`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: "You are an expert educational content creator. Generate comprehensive, engaging course content." },
          { role: "user", content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 2000
      });

      const courseContent = JSON.parse(completion.choices[0]?.message?.content || '{}');
      
      return {
        ...courseContent,
        createdBy: 'AI Professor',
        createdAt: new Date().toISOString(),
        tags: this.generateCourseTags(topic, level)
      };
    } catch (error) {
      logger.error('Course generation error:', error);
      throw new Error('Failed to generate course content');
    }
  }

  async analyzeCode({ code, language }: CodeAnalysisRequest) {
    try {
      const prompt = `Analyze the following ${language} code and provide:
      1. Code quality assessment (1-10 scale)
      2. Potential bugs or errors
      3. Suggestions for improvement
      4. Best practices recommendations
      5. Performance considerations

      Code:
      \`\`\`${language}
      ${code}
      \`\`\`

      Respond in JSON format:
      {
        "quality": 8,
        "errors": [{"line": 1, "message": "Error description", "severity": "error"}],
        "suggestions": ["suggestion1", "suggestion2"],
        "bestPractices": ["practice1", "practice2"],
        "performance": "Performance analysis"
      }`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: "You are an expert code reviewer and programming tutor." },
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 1000
      });

      return JSON.parse(completion.choices[0]?.message?.content || '{}');
    } catch (error) {
      logger.error('Code analysis error:', error);
      throw new Error('Failed to analyze code');
    }
  }

  async getPersonalizedRecommendations(userId: string) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const { learningStats } = user.profile;
      
      // Generate recommendations based on user's learning history
      const recommendations = {
        courses: [
          {
            title: "Advanced JavaScript Concepts",
            description: "Deep dive into closures, prototypes, and async programming",
            difficulty: "intermediate",
            estimatedTime: 120,
            reason: "Based on your progress in JavaScript fundamentals"
          },
          {
            title: "React.js Mastery",
            description: "Build modern web applications with React",
            difficulty: "intermediate",
            estimatedTime: 180,
            reason: "Perfect next step after JavaScript"
          }
        ],
        skills: [
          "TypeScript",
          "Node.js",
          "Database Design",
          "API Development"
        ],
        nextSteps: [
          "Complete your current JavaScript course",
          "Practice with coding exercises",
          "Build a portfolio project"
        ]
      };

      return recommendations;
    } catch (error) {
      logger.error('Recommendations error:', error);
      throw new Error('Failed to get recommendations');
    }
  }

  async processEmotionFeedback({ userId, emotion, confidence, context }: EmotionFeedbackRequest) {
    try {
      // Adaptive response based on detected emotion
      const adaptiveResponses = {
        confused: {
          message: "I can see you might be feeling confused. Let me break this down into simpler steps.",
          action: "simplify_explanation",
          professorEmotion: "understanding"
        },
        frustrated: {
          message: "I notice some frustration. That's completely normal! Let's try a different approach.",
          action: "change_approach",
          professorEmotion: "encouraging"
        },
        bored: {
          message: "Let's make this more engaging! How about we try a hands-on example?",
          action: "add_interactivity",
          professorEmotion: "energetic"
        },
        happy: {
          message: "I love seeing your enthusiasm! Let's build on that momentum.",
          action: "increase_pace",
          professorEmotion: "excited"
        }
      };

      const response = adaptiveResponses[emotion as keyof typeof adaptiveResponses] || {
        message: "I'm here to help you learn at your own pace.",
        action: "continue",
        professorEmotion: "neutral"
      };

      return {
        ...response,
        confidence,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Emotion feedback processing error:', error);
      throw new Error('Failed to process emotion feedback');
    }
  }

  async textToSpeech({ text, voice }: TTSRequest): Promise<Buffer> {
    try {
      const mp3 = await openai.audio.speech.create({
        model: "tts-1",
        voice: voice as any,
        input: text,
      });

      const buffer = Buffer.from(await mp3.arrayBuffer());
      return buffer;
    } catch (error) {
      logger.error('Text-to-speech error:', error);
      throw new Error('Failed to generate speech');
    }
  }

  private buildSystemPrompt(user: any, emotion?: string): string {
    const basePrompt = `You are an AI Professor in a 3D virtual learning environment. You are knowledgeable, patient, encouraging, and adaptive to student needs.

    Student Profile:
    - Name: ${user.name}
    - Role: ${user.role}
    - Learning Stats: ${user.profile.learningStats?.coursesCompleted || 0} courses completed
    - Preferences: ${user.profile.preferences?.theme || 'dark'} theme, ${user.profile.preferences?.language || 'en'} language

    ${emotion ? `Current Student Emotion: ${emotion} - Adapt your response accordingly.` : ''}

    Guidelines:
    - Be encouraging and supportive
    - Provide clear, concise explanations
    - Use examples and analogies when helpful
    - Ask follow-up questions to ensure understanding
    - Adapt your teaching style based on the student's emotional state
    - Keep responses conversational but informative
    - Maximum 3-4 sentences per response unless explaining complex concepts`;

    return basePrompt;
  }

  private determineProfessorEmotion(studentEmotion?: string, response?: string): string {
    if (!studentEmotion) return 'neutral';

    const emotionMap = {
      confused: 'understanding',
      frustrated: 'encouraging',
      bored: 'energetic',
      happy: 'excited',
      sad: 'supportive',
      angry: 'calm',
      surprised: 'pleased',
      neutral: 'neutral'
    };

    return emotionMap[studentEmotion as keyof typeof emotionMap] || 'neutral';
  }

  private async generateSuggestions(userMessage: string, aiResponse: string): Promise<string[]> {
    try {
      const suggestions = [
        "Can you explain that in more detail?",
        "Show me an example",
        "What are the practical applications?",
        "How does this relate to other concepts?",
        "Can we try a hands-on exercise?"
      ];

      // Return random 3 suggestions for now
      return suggestions.sort(() => 0.5 - Math.random()).slice(0, 3);
    } catch (error) {
      return ["Tell me more", "Show an example", "What's next?"];
    }
  }

  private generateCourseTags(topic: string, level: string): string[] {
    const baseTags = [topic.toLowerCase(), level];
    const additionalTags = ['ai-generated', 'interactive', 'self-paced'];
    return [...baseTags, ...additionalTags];
  }
}

export const aiService = new AIService();
