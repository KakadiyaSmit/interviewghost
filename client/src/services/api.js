import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : 'http://localhost:5050/api';

const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const sendOtp = (email) =>
  api.post('/auth/send-otp', { email });

export const registerUser = (email, password, name, otp) =>
  api.post('/auth/register', { email, password, name, otp });

export const loginUser = (email, password) =>
  api.post('/auth/login', { email, password });

export const createSession = (role, difficulty) =>
  api.post('/sessions', { role, difficulty });

export const getSession = (sessionId) =>
  api.get(`/sessions/${sessionId}`);

export const submitAnswer = (questionId, answer, timeTaken) =>
  api.post('/evaluations', { questionId, answer, timeTaken });

export default api;

export const forgotPassword = (email) =>
  api.post('/auth/forgot-password', { email })

export const resetPassword = (email, otp, newPassword) =>
  api.post('/auth/reset-password', { email, otp, newPassword })

export const forgotPassword = (email) =>
  api.post('/auth/forgot-password', { email })

export const resetPassword = (email, otp, newPassword) =>
  api.post('/auth/reset-password', { email, otp, newPassword })
