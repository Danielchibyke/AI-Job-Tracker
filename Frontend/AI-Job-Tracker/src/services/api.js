import axios from 'axios';

// Constants
const API_URL = import.meta.env.VITE_API_URL;
const BASE_URL = API_URL.endsWith('/api') ? API_URL : `${API_URL}/api`;
const DEFAULT_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 2; // Reduced from 3 to avoid excessive retries
const RETRY_DELAY = 1000; // 1 second

// Validate environment variable
if (!API_URL) {
  console.warn('VITE_API_URL environment variable is not set');
}

// Custom error class for API errors
class ApiError extends Error {
  constructor(message, statusCode, data = null) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.data = data;
    this.timestamp = new Date().toISOString();
  }
}

// Utility functions
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const shouldRetry = (error) => {
  if (!error.response) return true; // Network errors
  const status = error.response.status;
  return [408, 429, 500, 502, 503, 504].includes(status);
};

const retryRequest = async (fn, retries = MAX_RETRIES) => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0 && shouldRetry(error)) {
      console.warn(`Retrying request... ${retries} attempts left`);
      await delay(RETRY_DELAY * (MAX_RETRIES - retries + 1));
      return retryRequest(fn, retries - 1);
    }
    throw error;
  }
};

const handleApiResponse = (response) => {
  return response.data;
};

const handleApiError = (error) => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;
    const data = error.response?.data;

    // Handle CORS errors specifically
    if (error.code === 'NETWORK_ERROR' || error.message.includes('CORS') || error.message.includes('Access-Control')) {
      throw new ApiError('CORS error: Unable to connect to server. Please check server configuration.', 0, data);
    }

    switch (status) {
      case 400:
        throw new ApiError(message || 'Bad request', status, data);
      case 401:
        throw new ApiError(message || 'Unauthorized access', status, data);
      case 403:
        throw new ApiError(message || 'Access forbidden', status, data);
      case 404:
        throw new ApiError(message || 'Resource not found', status, data);
      case 409:
        throw new ApiError(message || 'Conflict occurred', status, data);
      case 422:
        throw new ApiError(message || 'Validation failed', status, data);
      case 429:
        throw new ApiError(message || 'Too many requests', status, data);
      case 500:
        throw new ApiError(message || 'Internal server error', status, data);
      case 502:
        throw new ApiError(message || 'Bad gateway', status, data);
      case 503:
        throw new ApiError(message || 'Service unavailable', status, data);
      case 504:
        throw new ApiError(message || 'Gateway timeout', status, data);
      default:
        if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNREFUSED') {
          throw new ApiError('Network error: Unable to connect to server', 0, data);
        }
        throw new ApiError(message || 'An unexpected error occurred', status || 0, data);
    }
  }
  
  throw new ApiError(error.message || 'An unexpected error occurred', 0);
};

// Axios instance configuration - SIMPLIFIED to avoid CORS issues
const api = axios.create({
  baseURL: BASE_URL,
  timeout: DEFAULT_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor - REMOVED custom headers causing CORS issues
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.debug(`🚀 ${config.method?.toUpperCase()} ${config.url}`, {
      params: config.params,
      data: config.data
    });

    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.debug(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    const url = error.config?.url;
    const method = error.config?.method?.toUpperCase();
    const status = error.response?.status;

    // Don't log CORS errors repeatedly
    if (!error.message.includes('CORS') && !error.message.includes('Access-Control')) {
      console.error(`❌ ${method} ${url} failed:`, {
        status,
        message: error.message,
        response: error.response?.data
      });
    }

    return Promise.reject(error);
  }
);

// Enhanced fetch wrapper with better error handling
const enhancedFetch = async (url, options = {}) => {
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  // If body is FormData, let the browser set the Content-Type header
  if (options.body instanceof FormData) {
    delete defaultHeaders['Content-Type'];
  }

  const config = {
    credentials: 'include',
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  // Add auth token if available
  const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${BASE_URL}${url}`, config);
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: `HTTP error! status: ${response.status}` };
      }
      
      throw new ApiError(
        errorData.message || `Request failed with status ${response.status}`,
        response.status,
        errorData
      );
    }

    // Handle empty responses
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return await response.text();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new ApiError('Network error: Unable to connect to server', 0);
    }
    
    throw new ApiError(error.message || 'An unexpected error occurred', 0);
  }
};

// Service implementations
export const authService = {
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
      }
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  },

  signup: async (userData) => {
    return retryRequest(() =>
      api.post('/auth/signup', userData).then(handleApiResponse).catch(handleApiError)
    );
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('authToken');
    } catch (error) {
      handleApiError(error);
    }
  },

  getCurrentUser: async () => {
    return retryRequest(() =>
      api.get('/auth/welcome').then(handleApiResponse).catch(handleApiError)
    );
  },
};

export const jobService = {
  getAllJobs: async (page = 1, limit = 12, filters = {}) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters
    });

    return retryRequest(() =>
      api.get(`/jobs?${params}`).then(handleApiResponse).catch(handleApiError)
    );
  },

  getJobById: async (jobId) => {
    if (!jobId) {
      throw new ApiError('Job ID is required', 400);
    }

    return retryRequest(() =>
      api.get(`/jobs/${jobId}`).then(handleApiResponse).catch(handleApiError)
    );
  },

  applyForJob: async (jobId, userId, coverLetter = null) => {
    if (!jobId || !userId) {
      throw new ApiError('Job ID and User ID are required', 400);
    }

    const payload = { userId };
    if (coverLetter) {
      payload.coverLetter = coverLetter;
    }

    return retryRequest(() =>
      api.post(`/jobs/apply/${jobId}`, payload).then(handleApiResponse).catch(handleApiError)
    );
  },

  cancelApplication: async (jobId, userId) => {
    if (!jobId || !userId) {
      throw new ApiError('Job ID and User ID are required', 400);
    }

    return retryRequest(() =>
      api.post(`/jobs/cancel/${jobId}`, { userId }).then(handleApiResponse).catch(handleApiError)
    );
  },

  searchJobs: async (query, location, filters = {}) => {
    const params = new URLSearchParams();
    
    if (query) params.append('q', query);
    if (location) params.append('location', location);
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    return retryRequest(() =>
      api.get(`/jobs/search?${params}`).then(handleApiResponse).catch(handleApiError)
    );
  }
};

export const applicationService = {
  getApplicationTracking: async (userId) => {
    if (!userId) {
      throw new ApiError('User ID is required', 400);
    }

    return retryRequest(() =>
      api.post('/ai/application-tracking', { userId }).then(handleApiResponse).catch(handleApiError)
    );
  },

  updateApplicationStatus: async (applicationId, data) => {
    if (!applicationId) {
      throw new ApiError('Application ID is required', 400);
    }

    const allowedFields = ['status', 'notes', 'interviewDate', 'followUpDate'];
    const filteredData = Object.keys(data)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = data[key];
        return obj;
      }, {});

    return retryRequest(() =>
      api.put(`/ai/application-tracking/${applicationId}`, filteredData)
        .then(handleApiResponse)
        .catch(handleApiError)
    );
  },

  getApplicationHistory: async (userId, limit = 50) => {
    if (!userId) {
      throw new ApiError('User ID is required', 400);
    }

    return retryRequest(() =>
      api.get(`/ai/application-tracking/history/${userId}?limit=${limit}`)
        .then(handleApiResponse)
        .catch(handleApiError)
    );
  }
};

export const userService = {
  completeOnboarding: async (data) => {
    if (!data?.email || !data?.fullname) {
      throw new ApiError('Email and fullname are required', 400);
    }

    const formData = new FormData();
    
    // Append required fields
    formData.append('fullname', data.fullname.trim());
    formData.append('email', data.email.toLowerCase().trim());
    
    // Append optional fields with validation
    if (data.resume instanceof File) {
      if (data.resume.size > 5 * 1024 * 1024) { // 5MB limit
        throw new ApiError('Resume file size must be less than 5MB', 400);
      }
      formData.append('resume', data.resume);
    }
    
    if (data.preferences && typeof data.preferences === 'object') {
      formData.append('preferences', JSON.stringify(data.preferences));
    }
    
    if (data.skills && Array.isArray(data.skills)) {
      formData.append('skills', JSON.stringify(data.skills.filter(skill => skill && skill.trim())));
    }
    
    if (data.resumeText && typeof data.resumeText === 'string') {
      formData.append('resumeText', data.resumeText.substring(0, 10000)); // Limit length
    }

    return retryRequest(() =>
      enhancedFetch('/users/onboarding', {
        method: 'POST',
        body: formData,
        // Don't set Content-Type for FormData - let browser set it with boundary
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
        }
      })
    );
  },

  updateProfile: async (data) => {
    if (!data || typeof data !== 'object') {
      throw new ApiError('Profile data is required', 400);
    }

    const allowedFields = [
      'fullname', 'profile.bio', 'profile.skills', 'profile.linkedin', 
      'profile.github', 'smartAutomationEnabled'
    ];

    const filteredData = Object.keys(data)
      .filter(key => allowedFields.some(field => key.startsWith(field.replace(/\.\*$/, ''))))
      .reduce((obj, key) => {
        obj[key] = data[key];
        return obj;
      }, {});

    return retryRequest(() =>
      enhancedFetch('/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filteredData),
      })
    );
  },

  getProfile: async () => {
    return retryRequest(() =>
      enhancedFetch('/users/profile', {
        method: 'GET',
      })
    );
  },

  getUnreadNotificationCount: async () => {
    return retryRequest(() =>
      api.get('/users/notifications/unread/count').then(handleApiResponse).catch(handleApiError)
    );
  },

  getAvatar: async () => {
    return retryRequest(() =>
      api.get('/users/profile/avatar', { responseType: 'blob' }).then(handleApiResponse).catch(handleApiError)
    );
  },

  refreshAiProfile: async () => {
    return retryRequest(() =>
      api.post('/users/profile/ai-profile/refresh').then(handleApiResponse).catch(handleApiError)
    );
  },

  recommendJobs: async (userId) => {
    if (!userId) {
      throw new ApiError('User ID is required', 400);
    }

    return retryRequest(() =>
      api.post('/ai/recommend-jobs', { userId }).then(handleApiResponse).catch(handleApiError)
    );
  },

  uploadAvatar: async (file) => {
    if (!(file instanceof File)) {
      throw new ApiError('Valid file is required', 400);
    }

    if (!file.type.startsWith('image/')) {
      throw new ApiError('File must be an image', 400);
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      throw new ApiError('Image size must be less than 2MB', 400);
    }

    const formData = new FormData();
    formData.append('avatar', file);

    return retryRequest(() =>
      enhancedFetch('/users/profile/avatar', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
        }
      })
    );
  },

  getNotifications: async () => {
    return retryRequest(() =>
      api.get('/users/notifications').then(handleApiResponse).catch(handleApiError)
    );
  },

  markNotificationAsRead: async (id) => {
    return retryRequest(() =>
      api.post(`/users/notifications/${id}/read`).then(handleApiResponse).catch(handleApiError)
    );
  },
};

// Utility function to check API health
export const checkApiHealth = async () => {
  try {
    const response = await api.get('/health', { timeout: 5000 });
    return {
      status: 'healthy',
      timestamp: response.data.timestamp,
      version: response.data.version
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

// CORS-specific helper
export const checkCorsConfiguration = async () => {
  try {
    const response = await fetch(`${API_URL}/jobs?page=1&limit=1`, {
      method: 'OPTIONS',
      headers: {
        'Origin': window.location.origin,
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type,Authorization'
      }
    });
    
    return {
      corsEnabled: response.ok,
      allowedHeaders: response.headers.get('access-control-allow-headers'),
      allowedMethods: response.headers.get('access-control-allow-methods'),
      allowedOrigin: response.headers.get('access-control-allow-origin')
    };
  } catch (error) {
    return {
      corsEnabled: false,
      error: error.message
    };
  }
};

// Export the enhanced API instance and error class
export { api, ApiError };
export default api;