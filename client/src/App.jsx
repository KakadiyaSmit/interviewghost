import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
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
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'rgba(20, 20, 35, 0.95)',
            color: '#fff',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '12px',
            backdropFilter: 'blur(20px)',
            fontSize: '14px',
            fontWeight: 500,
            padding: '12px 16px',
          },
          success: {
            iconTheme: { primary: '#a78bfa', secondary: '#050508' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#050508' },
          },
        }}
      />
      <Routes>
        <Route path="/"         element={<Landing />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

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
    </>
  )
}
