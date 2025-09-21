import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

export interface AITutoringRequest {
  userId: string;
  sessionId: string;
  message: string;
  context: string[];
  subject?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  emotionState?: string;
  learningStyle?: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
}

export interface AITutoringResponse {
  response: string;
  confidence: number;
  suggestions: string[];
  followUpQuestions: string[];
  conceptsExplained: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedReadingTime: number;
  metadata: {
    model: string;
    tokens: number;
    processingTime: number;
  };
}

export interface CodeAnalysisRequest {
  code: string;
  language: string;
  userId: string;
  sessionId?: string;
  analysisType: 'review' | 'debug' | 'optimize' | 'explain';
}

export interface CodeAnalysisResponse {
  analysis: string;
  issues: CodeIssue[];
  suggestions: CodeSuggestion[];
  explanation: string;
  optimizedCode?: string;
  complexity: {
    time: string;
    space: string;
    readability: number; // 1-10
  };
  metadata: {
    linesAnalyzed: number;
    processingTime: number;
  };
}

export interface CodeIssue {
  type: 'error' | 'warning' | 'info';
  line: number;
  column?: number;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  fixSuggestion?: string;
}

export interface CodeSuggestion {
  type: 'performance' | 'style' | 'security' | 'maintainability';
  description: string;
  example?: string;
  impact: 'low' | 'medium' | 'high';
}

@Injectable()
export class OpenAIService {
  private readonly logger = new Logger(OpenAIService.name);
  private readonly openai: OpenAI;
  private readonly defaultModel: string;
  private readonly maxTokens: number;
  private readonly temperature: number;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OpenAI API key is required');
    }

    this.openai = new OpenAI({
      apiKey,
      timeout: 30000,
      maxRetries: 3,
    });

    this.defaultModel = this.configService.get<string>('OPENAI_MODEL', 'gpt-4-turbo-preview');
    this.maxTokens = this.configService.get<number>('OPENAI_MAX_TOKENS', 2000);
    this.temperature = this.configService.get<number>('OPENAI_TEMPERATURE', 0.7);

    this.logger.log(`🤖 OpenAI Service initialized with model: ${this.defaultModel}`);
  }

  async generateTutoringResponse(request: AITutoringRequest): Promise<AITutoringResponse> {
    const startTime = Date.now();
    
    try {
      const systemPrompt = this.buildTutoringSystemPrompt(request);
      const messages: ChatCompletionMessageParam[] = [
        { role: 'system', content: systemPrompt },
        ...this.buildContextMessages(request.context),
        { role: 'user', content: request.message },
      ];

      const completion = await this.openai.chat.completions.create({
        model: this.defaultModel,
        messages,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
        functions: [
          {
            name: 'provide_tutoring_response',
            description: 'Provide a comprehensive tutoring response with metadata',
            parameters: {
              type: 'object',
              properties: {
                response: {
                  type: 'string',
                  description: 'The main tutoring response',
                },
                suggestions: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Learning suggestions for the student',
                },
                followUpQuestions: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Questions to deepen understanding',
                },
                conceptsExplained: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Key concepts covered in the response',
                },
                difficulty: {
                  type: 'string',
                  enum: ['beginner', 'intermediate', 'advanced'],
                  description: 'Difficulty level of the response',
                },
                confidence: {
                  type: 'number',
                  description: 'Confidence in the response (0-1)',
                },
              },
              required: ['response', 'suggestions', 'followUpQuestions', 'conceptsExplained', 'difficulty', 'confidence'],
            },
          },
        ],
        function_call: { name: 'provide_tutoring_response' },
      });

      const processingTime = Date.now() - startTime;
      const functionCall = completion.choices[0]?.message?.function_call;
      
      if (!functionCall || !functionCall.arguments) {
        throw new Error('Invalid response from OpenAI');
      }

      const parsedResponse = JSON.parse(functionCall.arguments);
      const estimatedReadingTime = this.calculateReadingTime(parsedResponse.response);

      const response: AITutoringResponse = {
        ...parsedResponse,
        estimatedReadingTime,
        metadata: {
          model: this.defaultModel,
          tokens: completion.usage?.total_tokens || 0,
          processingTime,
        },
      };

      this.logger.log(`✅ Generated tutoring response for user ${request.userId} in ${processingTime}ms`);
      return response;

    } catch (error) {
      this.logger.error(`❌ Failed to generate tutoring response for user ${request.userId}:`, error);
      throw new Error('Failed to generate AI tutoring response');
    }
  }

  async analyzeCode(request: CodeAnalysisRequest): Promise<CodeAnalysisResponse> {
    const startTime = Date.now();
    
    try {
      const systemPrompt = this.buildCodeAnalysisSystemPrompt(request);
      const userPrompt = this.buildCodeAnalysisUserPrompt(request);

      const completion = await this.openai.chat.completions.create({
        model: this.defaultModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: this.maxTokens,
        temperature: 0.3, // Lower temperature for more consistent code analysis
        functions: [
          {
            name: 'analyze_code',
            description: 'Analyze code and provide detailed feedback',
            parameters: {
              type: 'object',
              properties: {
                analysis: {
                  type: 'string',
                  description: 'Overall analysis of the code',
                },
                issues: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      type: { type: 'string', enum: ['error', 'warning', 'info'] },
                      line: { type: 'number' },
                      column: { type: 'number' },
                      message: { type: 'string' },
                      severity: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
                      fixSuggestion: { type: 'string' },
                    },
                    required: ['type', 'line', 'message', 'severity'],
                  },
                },
                suggestions: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      type: { type: 'string', enum: ['performance', 'style', 'security', 'maintainability'] },
                      description: { type: 'string' },
                      example: { type: 'string' },
                      impact: { type: 'string', enum: ['low', 'medium', 'high'] },
                    },
                    required: ['type', 'description', 'impact'],
                  },
                },
                explanation: {
                  type: 'string',
                  description: 'Detailed explanation of the code',
                },
                optimizedCode: {
                  type: 'string',
                  description: 'Optimized version of the code (if applicable)',
                },
                complexity: {
                  type: 'object',
                  properties: {
                    time: { type: 'string' },
                    space: { type: 'string' },
                    readability: { type: 'number' },
                  },
                  required: ['time', 'space', 'readability'],
                },
              },
              required: ['analysis', 'issues', 'suggestions', 'explanation', 'complexity'],
            },
          },
        ],
        function_call: { name: 'analyze_code' },
      });

      const processingTime = Date.now() - startTime;
      const functionCall = completion.choices[0]?.message?.function_call;
      
      if (!functionCall || !functionCall.arguments) {
        throw new Error('Invalid response from OpenAI');
      }

      const parsedResponse = JSON.parse(functionCall.arguments);
      const linesAnalyzed = request.code.split('\n').length;

      const response: CodeAnalysisResponse = {
        ...parsedResponse,
        metadata: {
          linesAnalyzed,
          processingTime,
        },
      };

      this.logger.log(`✅ Analyzed ${linesAnalyzed} lines of ${request.language} code in ${processingTime}ms`);
      return response;

    } catch (error) {
      this.logger.error(`❌ Failed to analyze code for user ${request.userId}:`, error);
      throw new Error('Failed to analyze code');
    }
  }

  async generatePersonalizedContent(
    userId: string,
    topic: string,
    userPreferences: any,
    learningHistory: any[],
  ): Promise<string> {
    try {
      const systemPrompt = `You are an AI professor creating personalized educational content.
        User preferences: ${JSON.stringify(userPreferences)}
        Learning history: ${JSON.stringify(learningHistory.slice(-5))}
        
        Create engaging, personalized content that:
        1. Matches the user's learning style and preferences
        2. Builds on their previous learning
        3. Uses appropriate difficulty level
        4. Includes interactive elements when possible
        5. Provides clear learning objectives`;

      const completion = await this.openai.chat.completions.create({
        model: this.defaultModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Create personalized content about: ${topic}` },
        ],
        max_tokens: this.maxTokens,
        temperature: this.temperature,
      });

      return completion.choices[0]?.message?.content || '';

    } catch (error) {
      this.logger.error(`❌ Failed to generate personalized content:`, error);
      throw new Error('Failed to generate personalized content');
    }
  }

  private buildTutoringSystemPrompt(request: AITutoringRequest): string {
    return `You are an expert AI professor with deep knowledge across all subjects. Your role is to provide personalized, engaging, and effective tutoring.

    Student Context:
    - Subject: ${request.subject || 'General'}
    - Difficulty Level: ${request.difficulty || 'intermediate'}
    - Current Emotion: ${request.emotionState || 'neutral'}
    - Learning Style: ${request.learningStyle || 'mixed'}

    Your Teaching Style:
    1. Be encouraging and supportive, especially if the student seems frustrated or confused
    2. Adapt your explanation complexity to the student's level
    3. Use analogies and real-world examples to clarify concepts
    4. Break down complex topics into digestible steps
    5. Ask probing questions to check understanding
    6. Provide multiple perspectives on difficult concepts
    7. Celebrate progress and learning milestones

    Response Guidelines:
    - Keep responses conversational and engaging
    - Use markdown formatting for better readability
    - Include code examples when relevant
    - Suggest practical exercises or applications
    - Provide encouragement and motivation
    - If the student seems confused, offer simpler explanations
    - If the student seems bored, increase complexity or add interesting facts`;
  }

  private buildCodeAnalysisSystemPrompt(request: CodeAnalysisRequest): string {
    return `You are an expert code reviewer and programming mentor specializing in ${request.language}.

    Analysis Type: ${request.analysisType}
    
    Your responsibilities:
    1. Identify bugs, errors, and potential issues
    2. Suggest performance optimizations
    3. Check for security vulnerabilities
    4. Evaluate code style and best practices
    5. Assess code readability and maintainability
    6. Provide educational explanations for improvements
    7. Suggest alternative approaches when beneficial

    Focus Areas:
    - Correctness and functionality
    - Performance and efficiency
    - Security considerations
    - Code style and conventions
    - Error handling
    - Documentation and comments
    - Scalability and maintainability

    Provide constructive, educational feedback that helps the developer learn and improve.`;
  }

  private buildCodeAnalysisUserPrompt(request: CodeAnalysisRequest): string {
    return `Please analyze this ${request.language} code for ${request.analysisType}:

\`\`\`${request.language}
${request.code}
\`\`\`

Provide a comprehensive analysis including:
1. Overall assessment
2. Specific issues with line numbers
3. Improvement suggestions
4. Code explanation
5. Complexity analysis
6. Optimized version (if applicable)`;
  }

  private buildContextMessages(context: string[]): ChatCompletionMessageParam[] {
    return context.slice(-10).map((msg, index) => ({
      role: index % 2 === 0 ? 'user' : 'assistant',
      content: msg,
    })) as ChatCompletionMessageParam[];
  }

  private calculateReadingTime(text: string): number {
    const wordsPerMinute = 200;
    const wordCount = text.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 5,
      });
      
      return !!response.choices[0]?.message?.content;
    } catch (error) {
      this.logger.error('OpenAI health check failed:', error);
      return false;
    }
  }
}
