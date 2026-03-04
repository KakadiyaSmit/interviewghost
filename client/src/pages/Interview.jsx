// ============================================================
// FILE: client/src/pages/Interview.jsx
// PURPOSE: Shows questions one by one, user answers each one
// ============================================================

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getSession, submitAnswer } from '../services/api'

export default function Interview() {
  const { sessionId } = useParams()
  const navigate = useNavigate()

  const [session, setSession]       = useState(null)
  const [questions, setQuestions]   = useState([])
  const [current, setCurrent]       = useState(0)
  const [answer, setAnswer]         = useState('')
  const [loading, setLoading]       = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [startTime, setStartTime]   = useState(null)
  const [error, setError]           = useState('')

  // Load session + questions on mount
  useEffect(() => {
    const load = async () => {
      try {
        const res = await getSession(sessionId)
        setSession(res.data.session)
        setQuestions(res.data.questions)
        setStartTime(Date.now())
      } catch {
        setError('Failed to load session')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [sessionId])

  const handleSubmit = async () => {
    if (!answer.trim()) return
    setSubmitting(true)

    try {
      const timeTaken = Math.floor((Date.now() - startTime) / 1000)
      await submitAnswer(questions[current].id, answer, timeTaken)

      if (current + 1 < questions.length) {
        // Move to next question
        setCurrent(current + 1)
        setAnswer('')
        setStartTime(Date.now())
      } else {
        // All questions done → go to feedback
        navigate(`/feedback/${sessionId}`)
      }
    } catch {
      setError('Failed to submit answer')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div style={styles.center}>Loading your interview...</div>
  if (error)   return <div style={styles.center}>{error}</div>
  if (!questions.length) return <div style={styles.center}>No questions found</div>

  const question = questions[current]
  const progress = ((current) / questions.length) * 100

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <span style={styles.role}>👻 {session?.role}</span>
        <span style={styles.progress}>
          Question {current + 1} of {questions.length}
        </span>
      </div>

      {/* Progress bar */}
      <div style={styles.progressBar}>
        <div style={{ ...styles.progressFill, width: `${progress}%` }} />
      </div>

      {/* Question card */}
      <div style={styles.card}>
        <div style={styles.badges}>
          <span style={styles.badge}>{question.question_type}</span>
          <span style={styles.badge}>{question.difficulty}</span>
          <span style={styles.badge}>
            ~{Math.floor(question.estimated_time / 60)} min
          </span>
        </div>

        <h2 style={styles.question}>{question.question_text}</h2>

        <textarea
          style={styles.textarea}
          placeholder="Type your answer here..."
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          rows={8}
        />

        {error && <div style={styles.error}>{error}</div>}

        <button
          style={styles.button}
          onClick={handleSubmit}
          disabled={submitting || !answer.trim()}
        >
          {submitting
            ? '🤖 Claude is evaluating...'
            : current + 1 === questions.length
            ? 'Finish Interview →'
            : 'Submit & Next →'
          }
        </button>
      </div>
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
  center: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    background: '#0f0f0f',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  role: { color: '#fff', fontSize: '18px', fontWeight: 'bold' },
  progress: { color: '#888', fontSize: '14px' },
  progressBar: {
    height: '4px',
    background: '#333',
    borderRadius: '2px',
    marginBottom: '32px',
  },
  progressFill: {
    height: '100%',
    background: '#6c47ff',
    borderRadius: '2px',
    transition: 'width 0.3s ease',
  },
  card: {
    background: '#1a1a1a',
    padding: '32px',
    borderRadius: '12px',
    border: '1px solid #333',
  },
  badges: { display: 'flex', gap: '8px', marginBottom: '20px' },
  badge: {
    background: '#2a2a2a',
    color: '#aaa',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    textTransform: 'capitalize',
  },
  question: {
    color: '#fff',
    fontSize: '20px',
    lineHeight: '1.6',
    marginBottom: '24px',
  },
  textarea: {
    width: '100%',
    padding: '16px',
    background: '#2a2a2a',
    border: '1px solid #444',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '16px',
    resize: 'vertical',
    boxSizing: 'border-box',
    marginBottom: '16px',
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