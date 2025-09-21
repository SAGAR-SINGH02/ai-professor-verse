import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const { token, refreshToken: newRefreshToken } = response.data.data;
          localStorage.setItem('token', token);
          localStorage.setItem('refreshToken', newRefreshToken);

          // Retry the original request
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/';
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (userData: {
    name: string;
    email: string;
    password: string;
    role?: string;
  }) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials: { email: string; password: string }) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  refreshToken: async (refreshToken: string) => {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },
};

// AI API
export const aiAPI = {
  chat: async (message: string, context?: any, emotion?: string) => {
    const response = await api.post('/ai/chat', { message, context, emotion });
    return response.data;
  },

  generateCourse: async (courseData: {
    topic: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    duration?: number;
  }) => {
    const response = await api.post('/ai/generate-course', courseData);
    return response.data;
  },

  analyzeCode: async (code: string, language: string) => {
    const response = await api.post('/ai/analyze-code', { code, language });
    return response.data;
  },

  getRecommendations: async () => {
    const response = await api.get('/ai/recommendations');
    return response.data;
  },

  sendEmotionFeedback: async (emotion: string, confidence: number, context?: string) => {
    const response = await api.post('/ai/emotion-feedback', {
      emotion,
      confidence,
      context,
    });
    return response.data;
  },

  textToSpeech: async (text: string, voice?: string) => {
    const response = await api.post('/ai/text-to-speech', { text, voice }, {
      responseType: 'blob',
    });
    return response.data;
  },
};

// Courses API
export const coursesAPI = {
  getFeatured: async () => {
    const response = await api.get('/courses/featured');
    return response.data;
  },

  getCategories: async () => {
    const response = await api.get('/courses/categories');
    return response.data;
  },

  search: async (query: string, filters?: any) => {
    const response = await api.get('/courses/search', {
      params: { q: query, ...filters },
    });
    return response.data;
  },

  getCourse: async (courseId: string) => {
    const response = await api.get(`/courses/${courseId}`);
    return response.data;
  },

  enroll: async (courseId: string) => {
    const response = await api.post(`/courses/${courseId}/enroll`);
    return response.data;
  },
};

// Users API
export const usersAPI = {
  updateProfile: async (profileData: any) => {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  },

  getProgress: async () => {
    const response = await api.get('/users/progress');
    return response.data;
  },

  getAchievements: async () => {
    const response = await api.get('/users/achievements');
    return response.data;
  },
};

export default api;
