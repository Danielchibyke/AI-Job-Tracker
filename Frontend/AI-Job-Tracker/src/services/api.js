import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
 
});

// Add request interceptor for error handling
api.interceptors.request.use(
  (config) => {
    // You can add auth token here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const jobService = {
  getAllJobs: async (page = 1, limit = 12) => {
    const response = await api.get(`/jobs?page=${page}&limit=${limit}`);
    return response.data;
  },

  applyForJob: async (jobId, userId) => {
    const response = await api.post(`/jobs/apply/${jobId}`, { userId });
    return response.data;
  },

  cancelApplication: async (jobId, userId) => {
    const response = await api.post(`/jobs/cancel/${jobId}`, { userId });
    return response.data;
  }
};

export const applicationService = {
  getApplicationTracking: async (userId) => {
    const response = await api.post('/ai/application-tracking', { userId });
    return response.data;
  },

  updateApplicationStatus: async (applicationId, data) => {
    const response = await api.put(`/ai/application-tracking/${applicationId}`, data);
    return response.data;
  }
};

export const userService = {
  async completeOnboarding(data) {
    const formData = new FormData();
    // Append basic info
    formData.append('fullname', data.fullname);
    formData.append('email', data.email);
    // Append resume file if exists
    if (data.resume) {
      formData.append('resume', data.resume);
    }
    
    // Append preferences
    formData.append('preferences', JSON.stringify(data.preferences || []));
    
    // Append skills
    formData.append('skills', JSON.stringify(data.skills || []));
    
    
    
    const response = await fetch('/api/users/onboarding', {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });
    console.log(response)
    if (!response.ok) {
      throw new Error('Failed to complete onboarding');
    }
    return response.json();
  },

  async updateProfile(data) {
    const response = await fetch('/api/users/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to update profile');
    }
    
    return response.json();
  },

  async getProfile() {
    const response = await fetch('/api/users/profile', {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }
    
    return response.json();
  },

  async recommendJobs(userId) {
    const response = await api.post('/ai/recommend-jobs', { userId });
    return response.data;
  }
};

export default api; 