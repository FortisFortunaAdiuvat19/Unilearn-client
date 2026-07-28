import axios from 'axios';
// We will create this firebase config file in a later step
import { auth } from '@/lib/firebase'; 

const apiClient = axios.create({
  // This will point to your Render backend URL in production
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api', 
});

// Intercept requests to attach the Firebase Auth token
apiClient.interceptors.request.use(async (config) => {
  if (auth.currentUser) {
    const token = await auth.currentUser.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default apiClient;
