import axios, { AxiosInstance, AxiosResponse } from 'axios';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: string;
  requestId: string;
}

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for auth
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('ai_professor_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          await this.refreshToken();
          return this.client.request(error.config);
        }
        return Promise.reject(error);
      }
    );
  }

  private async refreshToken(): Promise<void> {
    const refreshToken = localStorage.getItem('ai_professor_refresh');
    if (!refreshToken) {
      this.logout();
      return;
    }

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/refresh`, {
        refreshToken,
      });

      const { accessToken, refreshToken: newRefreshToken } = response.data.data.tokens;
      localStorage.setItem('ai_professor_token', accessToken);
      localStorage.setItem('ai_professor_refresh', newRefreshToken);
    } catch (error) {
      this.logout();
    }
  }

  private logout(): void {
    localStorage.removeItem('ai_professor_token');
    localStorage.removeItem('ai_professor_refresh');
    window.location.href = '/login';
  }

  // Auth methods
  async login(email: string, password: string): Promise<ApiResponse> {
    const response = await this.client.post('/auth/login', { email, password });
    return response.data;
  }

  async register(userData: Record<string, unknown>): Promise<ApiResponse> {
    const response = await this.client.post('/auth/register', userData);
    return response.data;
  }

  // AI methods
  async chatWithAI(message: string, context: string[] = [], sessionId?: string): Promise<ApiResponse> {
    const response = await this.client.post('/ai/chat', {
      message,
      context,
      sessionId,
      subject: 'General',
      difficulty: 'intermediate',
    });
    return response.data;
  }

  async analyzeCode(code: string, language: string): Promise<ApiResponse> {
    const response = await this.client.post('/ai/code/analyze', {
      code,
      language,
      analysisType: 'review',
    });
    return response.data;
  }

  async detectEmotion(imageData: string, sessionId: string): Promise<ApiResponse> {
    const response = await this.client.post('/ai/emotion/detect', {
      type: 'facial',
      data: imageData,
      sessionId,
    });
    return response.data;
  }

  // Code execution
  async executeCode(code: string, language: string, input?: string): Promise<ApiResponse> {
    const response = await this.client.post('/code/execute', {
      code,
      language,
      input,
      timeout: 10000,
      memoryLimit: 128,
    });
    return response.data;
  }

  // Analytics
  async getLearningAnalytics(timeframe: string = 'week'): Promise<ApiResponse> {
    const response = await this.client.get(`/analytics/learning?timeframe=${timeframe}`);
    return response.data;
  }

  async getLearningPatterns(): Promise<ApiResponse> {
    const response = await this.client.get('/analytics/patterns');
    return response.data;
  }

  // User profile
  async getUserProfile(): Promise<ApiResponse> {
    const response = await this.client.get('/users/profile');
    return response.data;
  }

  async updateUserProfile(data: Record<string, unknown>): Promise<ApiResponse> {
    const response = await this.client.put('/users/profile', data);
    return response.data;
  }
}

export const apiClient = new ApiClient();
