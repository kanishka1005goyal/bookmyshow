import axios from 'axios';

// Backend base URL — set in .env as VITE_API_BASE_URL.
// Local dev default points at http://localhost:5000/api
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token (if present) to every request.
// Not used yet since auth isn't wired up, but harmless and ready for later.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
