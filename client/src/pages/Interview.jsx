import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getSession, submitAnswer } from '../services/api'
import toast from 'react-hot-toast'

export default function Interview() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const textareaRef = useRef(null)

  const [session, setSession]         = useState(null)
  const [questions, setQuestions]     = useState([])
  const [current, setCurrent]         = useState(0)
  const [answer, setAnswer]           = useState('')
  const [loading, setLoading]         = useState(true)
  const [submitting, setSubmitting]   = useState(false)
  const [error, setError]             = useState('')
  const [startTime, setStartTime]     = useState(null)
  const [elapsed, setElapsed]         = useState(0)
  const [listening, setListening]     = useState(false)
  const [wordCount, setWordCount]     = useState(0)
  const [pressureMode, setPressureMode] = useState(false)
  const [timeLeft, setTimeLeft]       = useState(null)
  const [autoSubmitted, setAutoSubmitted] = useState(false)
  const recognitionRef = useRef(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getSession(sessionId)
        setSession(res.data.session)
        setQuestions(res.data.questions)
        setStartTime(Date.now())
      } catch { setError('Failed to load session') }
      finally { setLoading(false) }
    }
    load()
  }, [sessionId])

  // Elapsed timer (normal mode)
  useEffect(() => {
    if (!startTime || pressureMode) return
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [startTime, pressureMode])

  // Countdown timer (pressure mode)
  useEffect(() => {
    if (!pressureMode || timeLeft === null) return
    if (timeLeft <= 0) {
      if (!autoSubmitted) {
        setAutoSubmitted(true)
        toast.error('⏰ Time\'s up! Auto-submitting...')
        handleSubmit(true)
      }
      return
    }
    if (timeLeft === 30) toast('⚠️ 30 seconds left!', { icon: '⚠️' })
    if (timeLeft === 10) toast.error('🔥 10 seconds!')
    const interval = setInterval(() => setTimeLeft(t => t - 1), 1000)
    return () => clearInterval(interval)
  }, [pressureMode, timeLeft])

  // Word count
  useEffect(() => {
    setWordCount(answer.trim() ? answer.trim().split(/\s+/).length : 0)
  }, [answer])

  const togglePressureMode = () => {
    if (!pressureMode) {
      const limit = questions[current]?.estimated_time || 120
      setTimeLeft(limit)
      setPressureMode(true)
      setElapsed(0)
      setStartTime(Date.now())
      toast('🔥 Pressure Mode ON! Clock is ticking...', { icon: '🔥' })
    } else {
      setPressureMode(false)
      setTimeLeft(null)
      setStartTime(Date.now())
      toast('😮‍💨 Pressure Mode OFF', { icon: '✅' })
    }
  }

  const formatTime = (s) => {
    if (s === null || s === undefined) return '00:00'
    const abs = Math.abs(s)
    return `${String(Math.floor(abs/60)).padStart(2,'0')}:${String(abs%60).padStart(2,'0')}`
  }

  const getTimerColor = () => {
    if (pressureMode && timeLeft !== null) {
      if (timeLeft > 60) return 'var(--green)'
      if (timeLeft > 30) return 'var(--yellow)'
      return 'var(--red)'
    }
    if (!questions[current]) return 'var(--text-secondary)'
    const pct = elapsed / questions[current].estimated_time
    if (pct < 0.6) return 'var(--green)'
    if (pct < 0.85) return 'var(--yellow)'
    return 'var(--red)'
  }

  const toggleVoice = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      toast.error('Voice input not supported. Try Chrome!')
      return
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition

    if (listening) {
      if (recognitionRef.current) recognitionRef.current.stop()
      setListening(false)
      return
    }

    const recognition = new SR()
    recognitionRef.current = recognition
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'
    setListening(true)
    recognition.start()
    recognition.onresult = (e) => {
      const transcript = Array.from(e.results).map(r => r[0].transcript).join('')
      setAnswer(transcript)
    }
    recognition.onend = () => setListening(false)
  }

  const handleSubmit = async (auto = false) => {
    if (!auto && !answer.trim()) return
    setSubmitting(true)
    try {
      const timeTaken = Math.floor((Date.now() - startTime) / 1000)
      await submitAnswer(questions[current].id, answer, timeTaken)
      if (current + 1 < questions.length) {
        setCurrent(c => c + 1)
        setAnswer('')
        setStartTime(Date.now())
        setElapsed(0)
        setAutoSubmitted(false)
        if (pressureMode) {
          const nextLimit = questions[current + 1]?.estimated_time || 120
          setTimeLeft(nextLimit)
        }
      } else {
        navigate(`/feedback/${sessionId}`)
      }
    } catch { setError('Failed to submit. Try again.') }
    finally { setSubmitting(false) }
  }

  if (loading) return (
    <div style={styles.loadingPage}>
      <div style={styles.loadingContent}>
        <div style={styles.loadingGhost}>👻</div>
        <p style={styles.loadingText}>Loading your interview...</p>
        <div style={styles.loadingBar}>
          <div style={styles.loadingFill} />
        </div>
      </div>
    </div>
  )

  if (error) return (
    <div style={styles.loadingPage}>
      <p style={{ color: 'var(--red)' }}>{error}</p>
    </div>
  )

  const question = questions[current]
  const progress = (current / questions.length) * 100
  const typeColors = {
    technical: 'badge-purple', behavioral: 'badge-cyan',
    system_design: 'badge-yellow', case: 'badge-green',
  }

  const timerColor = getTimerColor()
  const displayTime = pressureMode ? timeLeft : elapsed

  return (
    <div style={{
      ...styles.page,
      background: pressureMode && timeLeft !== null && timeLeft <= 30
        ? 'radial-gradient(ellipse at top, rgba(239,68,68,0.08) 0%, var(--bg-primary) 60%)'
        : 'var(--bg-primary)'
    }}>
      <div style={styles.orb1} />
      <div style={styles.grid} />

      {/* Top bar */}
      <div style={{
        ...styles.topBar,
        borderBottom: pressureMode ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{...styles.topLeft, cursor: 'pointer'}} onClick={() => navigate("/")}>
          <span style={styles.topGhost}>👻</span>
          <div>
            <div style={styles.topRole}>{session?.role}</div>
            <div style={styles.topDiff}>{session?.difficulty} difficulty</div>
          </div>
        </div>

        <div style={styles.topCenter}>
          <div style={styles.progressWrap}>
            <div style={styles.progressLabel}>Question {current + 1} of {questions.length}</div>
            <div className="progress-bar" style={{ width: '200px' }}>
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        <div style={styles.topRight}>
          {/* Pressure mode toggle */}
          <button onClick={togglePressureMode} style={{
            ...styles.pressureBtn,
            background: pressureMode ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.04)',
            border: pressureMode ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(255,255,255,0.08)',
            color: pressureMode ? '#fca5a5' : 'var(--text-muted)',
            animation: pressureMode && timeLeft !== null && timeLeft <= 30 ? 'pulse-glow 1s ease infinite' : 'none',
          }}>
            {pressureMode ? '🔥 Pressure ON' : '😤 Pressure Mode'}
          </button>

          <div style={{ ...styles.timer, color: timerColor }}>
            {pressureMode ? '⏳' : '⏱'} {formatTime(displayTime)}
          </div>
          {!pressureMode && question && (
            <div style={styles.timerTarget}>/ {formatTime(question.estimated_time)}</div>
          )}
        </div>
      </div>

      {/* Pressure mode banner */}
      {pressureMode && (
        <div style={styles.pressureBanner}>
          <span>🔥</span>
          <span>PRESSURE MODE — Answer before time runs out or it auto-submits!</span>
          <span style={{ fontFamily: 'var(--font-mono)', color: timerColor, fontWeight: 700 }}>
            {formatTime(timeLeft)} remaining
          </span>
        </div>
      )}

      {/* Main content */}
      <div style={styles.main}>
        <div className="animate-fade-up" style={{
          ...styles.questionCard,
          border: pressureMode ? '1px solid rgba(239,68,68,0.15)' : '1px solid rgba(255,255,255,0.08)',
        }} key={current}>
          <div style={styles.questionMeta}>
            <span className={`badge ${typeColors[question?.question_type] || 'badge-purple'}`}>
              {question?.question_type?.replace('_', ' ')}
            </span>
            <span className={`badge ${question?.difficulty === 'hard' ? 'badge-red' : question?.difficulty === 'easy' ? 'badge-green' : 'badge-yellow'}`}>
              {question?.difficulty}
            </span>
            <span className="badge badge-purple" style={{ marginLeft: 'auto' }}>
              ~{Math.floor((question?.estimated_time || 0) / 60)} min
            </span>
          </div>
          <h2 style={styles.questionText}>{question?.question_text}</h2>
        </div>

        <div className="animate-fade-up stagger-2" style={styles.answerCard}>
          <div style={styles.answerHeader}>
            <span style={styles.answerLabel}>Your Answer</span>
            <div style={styles.answerActions}>
              <span style={styles.wordCount}>{wordCount} words</span>
              <button style={{
                ...styles.voiceBtn,
                background: listening ? 'rgba(239,68,68,0.15)' : 'rgba(139,92,246,0.1)',
                border: listening ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(139,92,246,0.2)',
                color: listening ? 'var(--red)' : 'var(--purple-bright)',
                animation: listening ? 'pulse-glow 1.5s ease infinite' : 'none',
              }} onClick={toggleVoice}>
                {listening ? '🔴 Stop Recording' : '🎤 Voice Input'}
              </button>
            </div>
          </div>

          <textarea
            ref={textareaRef}
            style={styles.textarea}
            placeholder="Type your answer here, or use voice input above...&#10;&#10;💡 Tip: Structure your answer with clear points. For technical questions, explain your thought process. For behavioral questions, use the STAR method."
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            rows={10}
          />

          {error && <div style={styles.errorBox}>{error}</div>}

          <div style={styles.submitRow}>
            <div style={styles.submitHint}>
              {answer.trim().length < 50
                ? '⚠️ Add more detail for a better score'
                : '✅ Good length — ready to submit'
              }
            </div>
            <button
              className="btn-primary"
              style={styles.submitBtn}
              onClick={() => handleSubmit(false)}
              disabled={submitting || !answer.trim()}
            >
              {submitting ? (
                <span style={styles.loadingRow}>
                  <span style={styles.spinner} />
                  🤖 Claude is evaluating...
                </span>
              ) : current + 1 === questions.length ? '🏁 Finish Interview' : 'Submit & Next →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', position: 'relative', transition: 'background 0.5s ease' },
  orb1: { position: 'fixed', top: '-15%', right: '-5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none', zIndex: 0, animation: 'orb-float 10s ease-in-out infinite' },
  grid: { position: 'fixed', inset: 0, zIndex: 0, backgroundImage: 'linear-gradient(rgba(139,92,246,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.02) 1px, transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' },
  loadingPage: { minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  loadingContent: { textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' },
  loadingGhost: { fontSize: '64px', animation: 'float 2s ease-in-out infinite' },
  loadingText: { color: 'var(--text-secondary)', fontSize: '16px' },
  loadingBar: { width: '200px', height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' },
  loadingFill: { height: '100%', background: 'linear-gradient(90deg, var(--purple), var(--cyan))', borderRadius: '2px', animation: 'shimmer 1.5s ease infinite', backgroundSize: '200% 100%' },
  topBar: { position: 'sticky', top: 0, zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 32px', background: 'rgba(5,5,8,0.8)', backdropFilter: 'blur(20px)', transition: 'border 0.3s ease' },
  topLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  topGhost: { fontSize: '24px' },
  topRole: { color: 'var(--text-primary)', fontSize: '14px', fontWeight: 600 },
  topDiff: { color: 'var(--text-muted)', fontSize: '12px', textTransform: 'capitalize' },
  topCenter: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' },
  progressWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' },
  progressLabel: { color: 'var(--text-muted)', fontSize: '12px', fontFamily: 'var(--font-mono)' },
  topRight: { display: 'flex', alignItems: 'center', gap: '10px' },
  pressureBtn: { padding: '6px 14px', borderRadius: '20px', cursor: 'pointer', fontSize: '12px', fontWeight: 600, transition: 'all 0.2s ease' },
  timer: { fontFamily: 'var(--font-mono)', fontSize: '20px', fontWeight: 500, transition: 'color 0.5s ease' },
  timerTarget: { color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '14px' },
  pressureBanner: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '10px 24px', background: 'rgba(239,68,68,0.08)', borderBottom: '1px solid rgba(239,68,68,0.15)', color: '#fca5a5', fontSize: '13px', fontWeight: 500 },
  main: { maxWidth: '800px', margin: '0 auto', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative', zIndex: 1 },
  questionCard: { background: 'rgba(255,255,255,0.03)', borderRadius: '20px', padding: '32px', transition: 'border 0.3s ease' },
  questionMeta: { display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' },
  questionText: { color: 'var(--text-primary)', fontSize: '22px', fontWeight: 600, lineHeight: 1.6, fontFamily: 'var(--font-display)' },
  answerCard: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' },
  answerHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  answerLabel: { color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' },
  answerActions: { display: 'flex', alignItems: 'center', gap: '12px' },
  wordCount: { color: 'var(--text-muted)', fontSize: '12px', fontFamily: 'var(--font-mono)' },
  voiceBtn: { padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, transition: 'all 0.2s ease' },
  textarea: { width: '100%', padding: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: 'var(--text-primary)', fontFamily: 'var(--font-body)', fontSize: '15px', lineHeight: 1.7, resize: 'vertical', outline: 'none', transition: 'border 0.2s ease' },
  errorBox: { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5', padding: '12px 16px', borderRadius: '10px', fontSize: '14px' },
  submitRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' },
  submitHint: { color: 'var(--text-muted)', fontSize: '13px', flex: 1 },
  submitBtn: { padding: '14px 32px', fontSize: '15px', whiteSpace: 'nowrap' },
  loadingRow: { display: 'flex', alignItems: 'center', gap: '10px' },
  spinner: { width: '16px', height: '16px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', display: 'inline-block', animation: 'spin 0.7s linear infinite' },
}
