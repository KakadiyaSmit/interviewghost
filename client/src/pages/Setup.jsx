// ============================================================
// FILE: client/src/pages/Setup.jsx
// PURPOSE: User picks role + difficulty → creates AI session
// ============================================================

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createSession } from '../services/api'

const ROLES = [
  'Software Engineer Intern',
  'Frontend Engineer',
  'Backend Engineer',
  'Full Stack Engineer',
  'Data Scientist',
  'Product Manager',
  'UX Designer',
  'DevOps Engineer',
]

export default function Setup() {
  const [role, setRole]           = useState('')
  const [difficulty, setDifficulty] = useState('medium')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const navigate = useNavigate()

  const handleStart = async () => {
    if (!role) return setError('Please select a role')
    setLoading(true)
    setError('')

    try {
      const res = await createSession(role, difficulty)
      // Navigate to interview with the session id
      navigate(`/interview/${res.data.session.id}`)
    } catch (err) {
      setError('Failed to create session. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>👻 New Interview</h1>
        <p style={styles.subtitle}>Choose your target role and difficulty</p>

        {error && <div style={styles.error}>{error}</div>}

        <label style={styles.label}>Target Role</label>
        <select
          style={styles.select}
          value={role}
          onChange={e => setRole(e.target.value)}
        >
          <option value="">Select a role...</option>
          {ROLES.map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        <label style={styles.label}>Difficulty</label>
        <div style={styles.difficultyRow}>
          {['easy', 'medium', 'hard'].map(d => (
            <button
              key={d}
              style={{
                ...styles.diffBtn,
                background: difficulty === d ? '#6c47ff' : '#2a2a2a',
                border: difficulty === d ? '1px solid #6c47ff' : '1px solid #444',
              }}
              onClick={() => setDifficulty(d)}
            >
              {d.charAt(0).toUpperCase() + d.slice(1)}
            </button>
          ))}
        </div>

        <button
          style={styles.button}
          onClick={handleStart}
          disabled={loading}
        >
          {loading ? '🤖 Generating questions...' : 'Start Interview →'}
        </button>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0f0f0f',
  },
  card: {
    background: '#1a1a1a',
    padding: '40px',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '500px',
    border: '1px solid #333',
  },
  title: {
    color: '#fff',
    textAlign: 'center',
    marginBottom: '8px',
  },
  subtitle: {
    color: '#888',
    textAlign: 'center',
    marginBottom: '32px',
  },
  label: {
    color: '#aaa',
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
  },
  select: {
    width: '100%',
    padding: '12px',
    marginBottom: '24px',
    background: '#2a2a2a',
    border: '1px solid #444',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '16px',
  },
  difficultyRow: {
    display: 'flex',
    gap: '12px',
    marginBottom: '32px',
  },
  diffBtn: {
    flex: 1,
    padding: '12px',
    borderRadius: '8px',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '14px',
  },
  button: {
    width: '100%',
    padding: '14px',
    background: '#6c47ff',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
  },
  error: {
    background: '#ff4444',
    color: '#fff',
    padding: '10px',
    borderRadius: '8px',
    marginBottom: '16px',
    textAlign: 'center',
  },
}