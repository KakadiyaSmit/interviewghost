// ============================================================
// FILE: client/src/pages/Dashboard.jsx
// PURPOSE: Home page — shows user stats + start new interview
// ============================================================

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/sessions')
        setSessions(res.data.sessions || [])
      } catch {
        // no sessions yet
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.logo}>👻 InterviewGhost</h1>
        <div style={styles.headerRight}>
          <span style={styles.email}>{user?.email}</span>
          <button style={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Welcome + Start */}
      <div style={styles.hero}>
        <h2 style={styles.heroTitle}>Ready to practice?</h2>
        <p style={styles.heroSub}>
          AI-powered mock interviews with real-time feedback
        </p>
        <button
          style={styles.startBtn}
          onClick={() => navigate('/setup')}
        >
          Start New Interview →
        </button>
      </div>

      {/* Stats */}
      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{sessions.length}</div>
          <div style={styles.statLabel}>Sessions</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>
            {sessions.filter(s => s.status === 'completed').length}
          </div>
          <div style={styles.statLabel}>Completed</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>
            {sessions.length > 0
              ? Math.round(sessions.reduce((sum, s) =>
                  sum + (parseFloat(s.overall_score) || 0), 0) / sessions.length)
              : 0}
          </div>
          <div style={styles.statLabel}>Avg Score</div>
        </div>
      </div>

      {/* Recent sessions */}
      <h3 style={styles.sectionTitle}>Recent Sessions</h3>
      {loading ? (
        <p style={styles.empty}>Loading...</p>
      ) : sessions.length === 0 ? (
        <div style={styles.emptyCard}>
          <p>No sessions yet. Start your first interview! 🚀</p>
        </div>
      ) : (
        sessions.slice(0, 5).map(session => (
          <div
            key={session.id}
            style={styles.sessionCard}
            onClick={() => navigate(`/feedback/${session.id}`)}
          >
            <div>
              <div style={styles.sessionRole}>{session.role}</div>
              <div style={styles.sessionMeta}>
                {session.difficulty} · {session.completed_questions}/{session.total_questions} questions
              </div>
            </div>
            <div style={styles.sessionScore}>
              {session.overall_score
                ? `${Math.round(session.overall_score)}/100`
                : session.status === 'in_progress' ? 'In Progress' : '—'
              }
            </div>
          </div>
        ))
      )}
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#0f0f0f',
    padding: '24px',
    maxWidth: '800px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '40px',
  },
  logo: { color: '#fff', fontSize: '24px' },
  headerRight: { display: 'flex', alignItems: 'center', gap: '16px' },
  email: { color: '#888', fontSize: '14px' },
  logoutBtn: {
    background: 'transparent',
    border: '1px solid #444',
    color: '#aaa',
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  hero: {
    background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
    padding: '40px',
    borderRadius: '16px',
    textAlign: 'center',
    marginBottom: '32px',
    border: '1px solid #333',
  },
  heroTitle: { color: '#fff', fontSize: '28px', marginBottom: '8px' },
  heroSub: { color: '#888', marginBottom: '24px' },
  startBtn: {
    background: '#6c47ff',
    color: '#fff',
    border: 'none',
    padding: '14px 32px',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
  },
  statsRow: {
    display: 'flex',
    gap: '16px',
    marginBottom: '32px',
  },
  statCard: {
    flex: 1,
    background: '#1a1a1a',
    padding: '20px',
    borderRadius: '12px',
    border: '1px solid #333',
    textAlign: 'center',
  },
  statNumber: {
    fontSize: '36px',
    fontWeight: 'bold',
    color: '#6c47ff',
  },
  statLabel: { color: '#888', fontSize: '13px', marginTop: '4px' },
  sectionTitle: { color: '#fff', marginBottom: '16px' },
  empty: { color: '#888', textAlign: 'center' },
  emptyCard: {
    background: '#1a1a1a',
    padding: '40px',
    borderRadius: '12px',
    border: '1px solid #333',
    textAlign: 'center',
    color: '#888',
  },
  sessionCard: {
    background: '#1a1a1a',
    padding: '20px',
    borderRadius: '12px',
    border: '1px solid #333',
    marginBottom: '12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
  },
  sessionRole: { color: '#fff', fontWeight: 'bold', marginBottom: '4px' },
  sessionMeta: { color: '#888', fontSize: '13px', textTransform: 'capitalize' },
  sessionScore: { color: '#6c47ff', fontWeight: 'bold', fontSize: '18px' },
}