// ============================================================
// FILE: client/src/services/api.js
// PURPOSE: All API calls to our Express backend live here.
// Every page imports from here — never writes fetch() directly.
// ============================================================

import axios from 'axios';

// Base URL — in development hits localhost
// In production will hit your Render URL
const API_BASE = 'http://localhost:5050/api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_BASE,
});

// ============================================================
// REQUEST INTERCEPTOR
// Runs before EVERY request automatically
// Attaches JWT token from localStorage to every request
// So we never have to manually add the token
// ============================================================
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ============================================================
// AUTH ENDPOINTS
// ============================================================
export const registerUser = (email, password) =>
  api.post('/auth/register', { email, password });

export const loginUser = (email, password) =>
  api.post('/auth/login', { email, password });

// ============================================================
// SESSION ENDPOINTS
// ============================================================
export const createSession = (role, difficulty) =>
  api.post('/sessions', { role, difficulty });

export const getSession = (sessionId) =>
  api.get(`/sessions/${sessionId}`);

// ============================================================
// EVALUATION ENDPOINTS
// ============================================================
export const submitAnswer = (questionId, answer, timeTaken) =>
  api.post('/evaluations', { questionId, answer, timeTaken });

export default api;