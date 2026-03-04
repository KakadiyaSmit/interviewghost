// ============================================================
// FILE: client/src/App.jsx
// PURPOSE: Maps URLs to page components
// ============================================================

import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Setup from './pages/Setup'
import Interview from './pages/Interview'
import Feedback from './pages/Feedback'
import Dashboard from './pages/Dashboard'

// ProtectedRoute — redirects to login if not logged in
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <div>Loading...</div>
  return user ? children : <Navigate to="/login" />
}

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected routes — must be logged in */}
      <Route path="/dashboard" element={
        <ProtectedRoute><Dashboard /></ProtectedRoute>
      }/>
      <Route path="/setup" element={
        <ProtectedRoute><Setup /></ProtectedRoute>
      }/>
      <Route path="/interview/:sessionId" element={
        <ProtectedRoute><Interview /></ProtectedRoute>
      }/>
      <Route path="/feedback/:sessionId" element={
        <ProtectedRoute><Feedback /></ProtectedRoute>
      }/>

      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  )
}