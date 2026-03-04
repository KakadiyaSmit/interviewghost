import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Setup from './pages/Setup'
import Interview from './pages/Interview'
import Feedback from './pages/Feedback'
import Dashboard from './pages/Dashboard'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{
      minHeight: '100vh',
      background: '#050508',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '48px',
      animation: 'float 2s ease-in-out infinite'
    }}>
      👻
    </div>
  )
  return user ? children : <Navigate to="/login" />
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"         element={<Landing />} />
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected */}
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

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}