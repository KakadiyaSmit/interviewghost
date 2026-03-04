// ============================================================
// FILE: client/src/pages/Feedback.jsx
// PURPOSE: Shows AI evaluation results after interview
// ============================================================

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getSession } from '../services/api'
import api from '../services/api'

export default function Feedback() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const [session, setSession]       = useState(null)
  const [questions, setQuestions]   = useState([])
  const [evaluations, setEvaluations] = useState([])
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getSession(sessionId)
        setSession(res.data.session)
        setQuestions(res.data.questions)

        // Fetch evaluations for each question
        const evals = await Promise.all(
          res.data.questions.map(q =>
            api.get(`/evaluations/question/${q.id}`)
              .then(r => r.data)
              .catch(() => null)
          )
        )
        setEvaluations(evals.filter(Boolean))
      } catch {
        // handle error
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [sessionId])

  if (loading) return <div style={styles.center}>Loading results...</div>

  const avgScore = evaluations.length
    ? Math.round(evaluations.reduce((sum, e) => sum + parseFloat(e.overall_score), 0) / evaluations.length)
    : 0

  const avgProb = evaluations.length
    ? Math.round(evaluations.reduce((sum, e) => sum + parseFloat(e.success_probability), 0) / evaluations.length)
    : 0

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>👻 Interview Complete!</h1>

      {/* Score summary */}
      <div style={styles.scoreRow}>
        <div style={styles.scoreCard}>
          <div style={styles.scoreNumber}>{avgScore}</div>
          <div style={styles.scoreLabel}>Overall Score</div>
        </div>
        <div style={styles.scoreCard}>
          <div style={{ ...styles.scoreNumber, color: '#00cc88' }}>
            {avgProb}%
          </div>
          <div style={styles.scoreLabel}>Success Probability</div>
        </div>
        <div style={styles.scoreCard}>
          <div style={styles.scoreNumber}>{evaluations.length}</div>
          <div style={styles.scoreLabel}>Questions Answered</div>
        </div>
      </div>

      {/* Per question breakdown */}
      {evaluations.map((evalData, i) => (
        <div key={i} style={styles.evalCard}>
          <h3 style={styles.questionText}>
            Q{i + 1}: {questions[i]?.question_text}
          </h3>

          {/* Score bars */}
          <div style={styles.scoresGrid}>
            {[
              { label: 'Correctness', score: evalData.correctness_score },
              { label: 'Clarity', score: evalData.clarity_score },
              { label: 'Relevance', score: evalData.relevance_score },
              { label: 'Communication', score: evalData.communication_score },
            ].map(({ label, score }) => (
              <div key={label}>
                <div style={styles.scoreBarLabel}>
                  <span>{label}</span>
                  <span>{Math.round(score)}/100</span>
                </div>
                <div style={styles.scoreBarBg}>
                  <div style={{
                    ...styles.scoreBarFill,
                    width: `${score}%`,
                    background: score >= 80 ? '#00cc88' : score >= 60 ? '#ffaa00' : '#ff4444'
                  }} />
                </div>
              </div>
            ))}
          </div>

          {/* Feedback */}
          <div style={styles.feedbackSection}>
            <div style={styles.feedbackBox}>
              <strong style={{ color: '#00cc88' }}>💪 Strengths</strong>
              <p>{evalData.strengths}</p>
            </div>
            <div style={styles.feedbackBox}>
              <strong style={{ color: '#ffaa00' }}>📈 Improvements</strong>
              <p>{evalData.improvements}</p>
            </div>
            <div style={styles.feedbackBox}>
              <strong style={{ color: '#6c47ff' }}>🎯 Next Steps</strong>
              <p>{evalData.next_steps}</p>
            </div>
            <div style={styles.feedbackBox}>
              <strong style={{ color: '#aaa' }}>⭐ Ideal Answer</strong>
              <p>{evalData.ideal_answer}</p>
            </div>
          </div>
        </div>
      ))}

      <div style={styles.buttonRow}>
        <button style={styles.button} onClick={() => navigate('/setup')}>
          Practice Again →
        </button>
        <button
          style={{ ...styles.button, background: '#2a2a2a' }}
          onClick={() => navigate('/dashboard')}
        >
          Dashboard
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
  title: {
    color: '#fff',
    textAlign: 'center',
    marginBottom: '32px',
    fontSize: '28px',
  },
  scoreRow: {
    display: 'flex',
    gap: '16px',
    marginBottom: '32px',
  },
  scoreCard: {
    flex: 1,
    background: '#1a1a1a',
    padding: '24px',
    borderRadius: '12px',
    border: '1px solid #333',
    textAlign: 'center',
  },
  scoreNumber: {
    fontSize: '48px',
    fontWeight: 'bold',
    color: '#6c47ff',
  },
  scoreLabel: {
    color: '#888',
    fontSize: '14px',
    marginTop: '8px',
  },
  evalCard: {
    background: '#1a1a1a',
    padding: '24px',
    borderRadius: '12px',
    border: '1px solid #333',
    marginBottom: '24px',
  },
  questionText: {
    color: '#fff',
    marginBottom: '20px',
    lineHeight: '1.5',
  },
  scoresGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginBottom: '24px',
  },
  scoreBarLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    color: '#aaa',
    fontSize: '13px',
    marginBottom: '6px',
  },
  scoreBarBg: {
    height: '8px',
    background: '#333',
    borderRadius: '4px',
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.5s ease',
  },
  feedbackSection: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  feedbackBox: {
    background: '#2a2a2a',
    padding: '16px',
    borderRadius: '8px',
    color: '#ccc',
    fontSize: '14px',
    lineHeight: '1.6',
  },
  buttonRow: {
    display: 'flex',
    gap: '16px',
    marginTop: '32px',
  },
  button: {
    flex: 1,
    padding: '14px',
    background: '#6c47ff',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
  },
}