import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getSession } from '../services/api'
import api from '../services/api'
import toast from 'react-hot-toast'

function Confetti({ active }) {
  if (!active) return null
  const pieces = Array.from({ length: 60 }, (_, i) => ({
    id: i, left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 3}s`, duration: `${2 + Math.random() * 3}s`,
    color: ['#8b5cf6','#22d3ee','#10b981','#f59e0b','#a78bfa'][Math.floor(Math.random() * 5)],
    size: `${6 + Math.random() * 8}px`,
  }))
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 100, overflow: 'hidden' }}>
      {pieces.map(p => (
        <div key={p.id} style={{
          position: 'absolute', top: '-20px', left: p.left,
          width: p.size, height: p.size, background: p.color,
          borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          animation: `confetti ${p.duration} ${p.delay} ease-in forwards`,
        }} />
      ))}
    </div>
  )
}

function ScoreRing({ score, label, color }) {
  const [displayed, setDisplayed] = useState(0)
  useEffect(() => {
    let start = 0
    const target = Math.round(score)
    const step = target / 40
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setDisplayed(target); clearInterval(timer) }
      else setDisplayed(Math.floor(start))
    }, 30)
    return () => clearInterval(timer)
  }, [score])
  const circumference = 2 * Math.PI * 36
  const strokeDash = (displayed / 100) * circumference
  return (
    <div style={styles.ringWrap}>
      <svg width="88" height="88" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="44" cy="44" r="36" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
        <circle cx="44" cy="44" r="36" fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={`${strokeDash} ${circumference}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.1s ease' }} />
      </svg>
      <div style={styles.ringInner}>
        <div style={{ ...styles.ringScore, color }}>{displayed}</div>
      </div>
      <div style={styles.ringLabel}>{label}</div>
    </div>
  )
}

function ScoreCard({ session, avgScore, avgProb, evaluations, onShare }) {
  return (
    <div style={styles.shareCard}>
      <div style={styles.shareCardHeader}>
        <span style={styles.shareCardGhost}>👻</span>
        <span style={styles.shareCardTitle}>InterviewGhost</span>
      </div>
      <div style={styles.shareCardRole}>{session?.role} · {session?.difficulty}</div>
      <div style={{ ...styles.shareCardScore, color: avgScore >= 80 ? 'var(--green)' : avgScore >= 60 ? 'var(--yellow)' : 'var(--red)' }}>
        {Math.round(avgScore)}
      </div>
      <div style={styles.shareCardLabel}>Overall Score</div>
      <div style={styles.shareCardStats}>
        <div style={styles.shareCardStat}>
          <div style={styles.shareCardStatVal}>{Math.round(avgProb)}%</div>
          <div style={styles.shareCardStatLabel}>Success Rate</div>
        </div>
        <div style={styles.shareCardStat}>
          <div style={styles.shareCardStatVal}>{evaluations.length}</div>
          <div style={styles.shareCardStatLabel}>Questions</div>
        </div>
      </div>
      <button className="btn-primary" style={{ width: '100%', padding: '12px', marginTop: '8px' }} onClick={onShare}>
        📤 Share Score
      </button>
    </div>
  )
}

export default function Feedback() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const [session, setSession]           = useState(null)
  const [questions, setQuestions]       = useState([])
  const [evaluations, setEvaluations]   = useState([])
  const [prevSession, setPrevSession]   = useState(null)
  const [prevAvg, setPrevAvg]           = useState(null)
  const [loading, setLoading]           = useState(true)
  const [activeTab, setActiveTab]       = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showShareCard, setShowShareCard] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getSession(sessionId)
        setSession(res.data.session)
        setQuestions(res.data.questions)
        const evals = await Promise.all(
          res.data.questions.map(q =>
            api.get(`/evaluations/question/${q.id}`).then(r => r.data).catch(() => null)
          )
        )
        const filtered = evals.filter(Boolean)
        setEvaluations(filtered)
        const avg = filtered.reduce((s, e) => s + parseFloat(e.overall_score), 0) / filtered.length
        if (avg >= 75) setTimeout(() => setShowConfetti(true), 500)

        // Load previous session for comparison
        try {
          const allRes = await api.get('/sessions')
          const all = allRes.data.sessions || []
          const completed = all.filter(s => s.status === 'completed' && s.id !== parseInt(sessionId))
          if (completed.length > 0) {
            const prev = completed[0]
            setPrevSession(prev)
            const prevRes = await getSession(prev.id)
            const prevEvals = await Promise.all(
              prevRes.data.questions.map(q =>
                api.get(`/evaluations/question/${q.id}`).then(r => r.data).catch(() => null)
              )
            )
            const prevFiltered = prevEvals.filter(Boolean)
            if (prevFiltered.length > 0) {
              setPrevAvg(prevFiltered.reduce((s, e) => s + parseFloat(e.overall_score), 0) / prevFiltered.length)
            }
          }
        } catch {}
      } catch {}
      finally { setLoading(false) }
    }
    load()
  }, [sessionId])

  const handleShare = () => {
    const text = `Just scored ${Math.round(avgScore)}/100 on a ${session?.role} interview with InterviewGhost! 👻\n\nPractice AI-powered interviews free at interviewghost.site`
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Score card copied! Paste it anywhere 🔥')
    })
  }

  if (loading) return (
    <div style={styles.loadingPage}>
      <div style={styles.loadingContent}>
        <div style={{ fontSize: '64px', animation: 'float 2s ease-in-out infinite' }}>👻</div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>Analyzing your performance...</p>
      </div>
    </div>
  )

  const avgScore = evaluations.length
    ? evaluations.reduce((s, e) => s + parseFloat(e.overall_score), 0) / evaluations.length : 0
  const avgProb = evaluations.length
    ? evaluations.reduce((s, e) => s + parseFloat(e.success_probability), 0) / evaluations.length : 0

  const getScoreColor = (s) => s >= 80 ? 'var(--green)' : s >= 60 ? 'var(--yellow)' : 'var(--red)'
  const getScoreLabel = (s) => s >= 80 ? 'Excellent' : s >= 60 ? 'Good' : 'Needs Work'
  const diff = prevAvg !== null ? Math.round(avgScore) - Math.round(prevAvg) : null

  const currentEval = evaluations[activeTab]
  const currentQ = questions[activeTab]

  return (
    <div style={styles.page}>
      <Confetti active={showConfetti} />
      <div style={styles.orb1} />
      <div style={styles.orb2} />
      <div style={styles.grid} />

      <div style={styles.container}>
        {/* Header */}
        <div className="animate-fade-up stagger-1" style={styles.header}>
          <h1 style={styles.headerTitle}>
            Interview <span className="gradient-text">Complete</span> 🎉
          </h1>
          <p style={styles.headerSub}>{session?.role} · {session?.difficulty} difficulty</p>
        </div>

        {/* vs Last Attempt banner */}
        {diff !== null && (
          <div className="animate-fade-up" style={{
            ...styles.comparisonBanner,
            borderColor: diff >= 0 ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)',
            background: diff >= 0 ? 'rgba(16,185,129,0.05)' : 'rgba(239,68,68,0.05)',
          }}>
            <span style={{ fontSize: '20px' }}>{diff >= 0 ? '📈' : '📉'}</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              vs last attempt ({session?.role}):
            </span>
            <span style={{
              fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '16px',
              color: diff >= 0 ? 'var(--green)' : 'var(--red)'
            }}>
              {diff >= 0 ? '+' : ''}{diff} points
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
              {diff > 5 ? '🔥 Great improvement!' : diff >= 0 ? '👍 Keep it up!' : '💪 You got this!'}
            </span>
          </div>
        )}

        <div style={styles.mainLayout}>
          <div style={styles.mainLeft}>
            {/* Overall scores */}
            <div className="animate-fade-up stagger-2" style={styles.overallCard}>
              <div style={styles.overallLeft}>
                <div style={styles.overallLabel}>Overall Performance</div>
                <div style={{ ...styles.overallScore, color: getScoreColor(avgScore) }}>
                  {getScoreLabel(avgScore)}
                </div>
                <div style={styles.overallSub}>Based on {evaluations.length} evaluated answers</div>
              </div>
              <div style={styles.ringsRow}>
                <ScoreRing score={avgScore} label="Score" color={getScoreColor(avgScore)} />
                <ScoreRing score={avgProb} label="Success %" color="var(--cyan)" />
                <ScoreRing
                  score={evaluations.length > 0 ? evaluations.reduce((s,e) => s + parseFloat(e.correctness_score), 0) / evaluations.length : 0}
                  label="Accuracy" color="var(--purple-bright)"
                />
              </div>
            </div>

            {/* Question tabs */}
            <div className="animate-fade-up stagger-3" style={styles.tabsWrap}>
              <div style={styles.tabs}>
                {questions.map((q, i) => (
                  <button key={i} onClick={() => setActiveTab(i)} style={{
                    ...styles.tab,
                    background: activeTab === i ? 'rgba(139,92,246,0.15)' : 'transparent',
                    border: activeTab === i ? '1px solid rgba(139,92,246,0.3)' : '1px solid transparent',
                    color: activeTab === i ? 'var(--purple-bright)' : 'var(--text-muted)',
                  }}>
                    Q{i + 1}
                    {evaluations[i] && (
                      <span style={{ ...styles.tabScore, color: getScoreColor(parseFloat(evaluations[i].overall_score)) }}>
                        {Math.round(evaluations[i].overall_score)}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {currentEval && currentQ && (
              <div className="animate-fade-up" key={activeTab}>
                <div style={styles.questionBox}>
                  <div style={styles.questionLabel}>Question {activeTab + 1}</div>
                  <p style={styles.questionText}>{currentQ.question_text}</p>
                </div>

                <div style={styles.scoresCard}>
                  <h3 style={styles.scoresTitle}>Score Breakdown</h3>
                  <div style={styles.scoresGrid}>
                    {[
                      { label: 'Correctness', score: currentEval.correctness_score, icon: '🎯' },
                      { label: 'Clarity', score: currentEval.clarity_score, icon: '💡' },
                      { label: 'Relevance', score: currentEval.relevance_score, icon: '🎪' },
                      { label: 'Communication', score: currentEval.communication_score, icon: '💬' },
                    ].map(({ label, score, icon }) => (
                      <div key={label} style={styles.scoreItem}>
                        <div style={styles.scoreItemHeader}>
                          <span>{icon} {label}</span>
                          <span style={{ color: getScoreColor(parseFloat(score)), fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                            {Math.round(score)}/100
                          </span>
                        </div>
                        <div className="progress-bar">
                          <div style={{
                            height: '100%', borderRadius: '2px', width: `${score}%`,
                            background: getScoreColor(parseFloat(score)),
                            transition: 'width 1s cubic-bezier(0.4,0,0.2,1)',
                            animation: 'bar-fill 1.2s ease forwards',
                          }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={styles.probRow}>
                    <div style={styles.probLabel}>Success Probability</div>
                    <div style={{ ...styles.probScore, color: getScoreColor(parseFloat(currentEval.success_probability)) }}>
                      {Math.round(currentEval.success_probability)}%
                    </div>
                    <div style={styles.probSub}>chance of advancing in a real interview</div>
                  </div>
                </div>

                <div style={styles.feedbackGrid}>
                  {[
                    { key: 'strengths', title: '💪 Strengths', color: 'var(--green)', border: 'rgba(16,185,129,0.2)' },
                    { key: 'improvements', title: '📈 Improvements', color: 'var(--yellow)', border: 'rgba(245,158,11,0.2)' },
                    { key: 'next_steps', title: '🎯 Next Steps', color: 'var(--purple-bright)', border: 'rgba(139,92,246,0.2)' },
                    { key: 'ideal_answer', title: '⭐ Ideal Answer', color: 'var(--cyan)', border: 'rgba(34,211,238,0.2)' },
                  ].map(({ key, title, color, border }) => (
                    <div key={key} style={{ ...styles.feedbackCard, borderColor: border }}>
                      <div style={{ ...styles.feedbackTitle, color }}>{title}</div>
                      <p style={styles.feedbackText}>{currentEval[key]}</p>
                    </div>
                  ))}
                </div>

                <div style={styles.answerBox}>
                  <div style={styles.answerLabel}>Your Answer</div>
                  <p style={styles.answerText}>{currentEval.user_answer}</p>
                </div>
              </div>
            )}

            <div className="animate-fade-up" style={styles.actions}>
              <button className="btn-primary" style={styles.actionBtn} onClick={() => navigate('/setup')}>
                🚀 Practice Again
              </button>
              <button style={{ ...styles.actionBtn, ...styles.actionBtnSecondary }} onClick={() => navigate('/dashboard')}>
                📊 Dashboard
              </button>
            </div>
          </div>

          {/* Share card sidebar */}
          <div style={styles.sidebar}>
            <ScoreCard
              session={session}
              avgScore={avgScore}
              avgProb={avgProb}
              evaluations={evaluations}
              onShare={handleShare}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: 'var(--bg-primary)', position: 'relative' },
  loadingPage: { minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  loadingContent: { textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' },
  orb1: { position: 'fixed', top: '-10%', left: '-5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none', zIndex: 0, animation: 'orb-float 8s ease-in-out infinite' },
  orb2: { position: 'fixed', bottom: '-10%', right: '-5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(34,211,238,0.08) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none', zIndex: 0, animation: 'orb-float 12s ease-in-out infinite reverse' },
  grid: { position: 'fixed', inset: 0, zIndex: 0, backgroundImage: 'linear-gradient(rgba(139,92,246,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.02) 1px, transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' },
  container: { position: 'relative', zIndex: 1, maxWidth: '1100px', margin: '0 auto', padding: '40px 24px 80px' },
  header: { textAlign: 'center', marginBottom: '32px' },
  headerTitle: { fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '8px' },
  headerSub: { color: 'var(--text-muted)', fontSize: '15px', textTransform: 'capitalize' },
  comparisonBanner: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '14px 20px', borderRadius: '16px', border: '1px solid',
    marginBottom: '24px', flexWrap: 'wrap',
  },
  mainLayout: { display: 'grid', gridTemplateColumns: '1fr 280px', gap: '24px', alignItems: 'start' },
  mainLeft: { display: 'flex', flexDirection: 'column', gap: '16px' },
  sidebar: { position: 'sticky', top: '24px' },
  shareCard: {
    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(139,92,246,0.2)',
    borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
  },
  shareCardHeader: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' },
  shareCardGhost: { fontSize: '24px' },
  shareCardTitle: { fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' },
  shareCardRole: { color: 'var(--text-muted)', fontSize: '12px', textTransform: 'capitalize', textAlign: 'center' },
  shareCardScore: { fontFamily: 'var(--font-display)', fontSize: '64px', fontWeight: 800, lineHeight: 1 },
  shareCardLabel: { color: 'var(--text-muted)', fontSize: '12px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em' },
  shareCardStats: { display: 'flex', gap: '24px', margin: '8px 0' },
  shareCardStat: { textAlign: 'center' },
  shareCardStatVal: { fontFamily: 'var(--font-mono)', fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' },
  shareCardStatLabel: { color: 'var(--text-muted)', fontSize: '11px' },
  overallCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '32px', flexWrap: 'wrap', gap: '24px' },
  overallLeft: { display: 'flex', flexDirection: 'column', gap: '6px' },
  overallLabel: { color: 'var(--text-muted)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-mono)' },
  overallScore: { fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 800 },
  overallSub: { color: 'var(--text-muted)', fontSize: '13px' },
  ringsRow: { display: 'flex', gap: '32px' },
  ringWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', position: 'relative' },
  ringInner: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -65%)', textAlign: 'center' },
  ringScore: { fontFamily: 'var(--font-mono)', fontSize: '18px', fontWeight: 700 },
  ringLabel: { color: 'var(--text-muted)', fontSize: '12px', fontFamily: 'var(--font-mono)' },
  tabsWrap: {},
  tabs: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  tab: { padding: '8px 18px', borderRadius: '20px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-mono)' },
  tabScore: { fontSize: '11px', fontWeight: 700 },
  questionBox: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' },
  questionLabel: { color: 'var(--text-muted)', fontSize: '11px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' },
  questionText: { color: 'var(--text-primary)', fontSize: '17px', lineHeight: 1.6, fontWeight: 500 },
  scoresCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '28px' },
  scoresTitle: { fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700, marginBottom: '20px' },
  scoresGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' },
  scoreItem: { display: 'flex', flexDirection: 'column', gap: '8px' },
  scoreItemHeader: { display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '13px' },
  probRow: { display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' },
  probLabel: { color: 'var(--text-muted)', fontSize: '13px' },
  probScore: { fontFamily: 'var(--font-mono)', fontSize: '24px', fontWeight: 700 },
  probSub: { color: 'var(--text-muted)', fontSize: '12px' },
  feedbackGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  feedbackCard: { background: 'rgba(255,255,255,0.02)', border: '1px solid', borderRadius: '16px', padding: '20px' },
  feedbackTitle: { fontSize: '13px', fontWeight: 700, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.04em' },
  feedbackText: { color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.7 },
  answerBox: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px' },
  answerLabel: { color: 'var(--text-muted)', fontSize: '11px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' },
  answerText: { color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.7 },
  actions: { display: 'flex', gap: '12px' },
  actionBtn: { flex: 1, padding: '14px', fontSize: '15px' },
  actionBtnSecondary: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)', borderRadius: '12px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, transition: 'all 0.2s ease' },
}
