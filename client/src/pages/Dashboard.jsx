import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/sessions')
        setSessions(res.data.sessions || [])
      } catch {}
      finally { setLoading(false) }
    }
    load()
  }, [])

  const handleLogout = () => { logout(); navigate('/login') }

  const avgScore = sessions.length
    ? Math.round(sessions.filter(s => s.overall_score).reduce((sum, s) => sum + parseFloat(s.overall_score || 0), 0) / (sessions.filter(s => s.overall_score).length || 1))
    : 0

  const completed = sessions.filter(s => s.status === 'completed').length

  return (
    <div style={styles.page}>
      <div style={styles.orb1} />
      <div style={styles.orb2} />
      <div style={styles.grid} />

      {/* Navbar */}
      <nav style={styles.nav}>
        <div style={styles.navLeft}>
          <span style={styles.navGhost}>👻</span>
          <span style={styles.navBrand}>
            Interview<span className="gradient-text">Ghost</span>
          </span>
        </div>
        <div style={styles.navRight}>
          <div style={styles.userPill}>
            <div style={styles.userDot} />
            <span style={styles.userEmail}>{user?.email}</span>
          </div>
          <button style={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      <div style={styles.container}>
        {/* Hero */}
        <div className="animate-fade-up stagger-1" style={styles.hero}>
          <div style={styles.heroLeft}>
            <div style={styles.heroBadge}>
              <span style={styles.heroBadgeDot} />
              AI-Powered Interview Coach
            </div>
            <h1 style={styles.heroTitle}>
              Ready to land your<br />
              <span className="gradient-text">dream internship?</span>
            </h1>
            <p style={styles.heroSub}>
              Practice with Claude AI, get real-time feedback, and track your progress toward your goals.
            </p>
            <button
              className="btn-primary"
              style={styles.heroBtn}
              onClick={() => navigate('/setup')}
            >
              🚀 Start New Interview
            </button>
          </div>
          <div style={styles.heroRight}>
            <div className="animate-float" style={styles.heroGhost}>👻</div>
            <div style={styles.heroGlow} />
          </div>
        </div>

        {/* Stats */}
        <div className="animate-fade-up stagger-2" style={styles.statsRow}>
          {[
            { value: sessions.length, label: 'Total Sessions', icon: '📋', color: 'var(--purple-bright)' },
            { value: completed, label: 'Completed', icon: '✅', color: 'var(--green)' },
            { value: avgScore || '—', label: 'Avg Score', icon: '🎯', color: 'var(--cyan)' },
            { value: sessions.length * 5 || 0, label: 'Questions Answered', icon: '💬', color: 'var(--yellow)' },
          ].map((stat, i) => (
            <div key={i} style={styles.statCard}>
              <div style={styles.statIcon}>{stat.icon}</div>
              <div style={{ ...styles.statValue, color: stat.color }}>{stat.value}</div>
              <div style={styles.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Recent sessions */}
        <div className="animate-fade-up stagger-3" style={styles.sessionsSection}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Recent Sessions</h2>
            <button
              style={styles.newSessionBtn}
              onClick={() => navigate('/setup')}
            >
              + New Session
            </button>
          </div>

          {loading ? (
            <div style={styles.emptyCard}>
              <div style={{ fontSize: '32px', animation: 'float 2s ease-in-out infinite' }}>👻</div>
              <p style={{ color: 'var(--text-muted)' }}>Loading sessions...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div style={styles.emptyCard}>
              <div style={{ fontSize: '48px' }}>🚀</div>
              <h3 style={styles.emptyTitle}>No sessions yet</h3>
              <p style={styles.emptySub}>Start your first AI-powered interview practice!</p>
              <button
                className="btn-primary"
                style={{ padding: '12px 28px', marginTop: '8px' }}
                onClick={() => navigate('/setup')}
              >
                Start Practicing →
              </button>
            </div>
          ) : (
            <div style={styles.sessionsList}>
              {sessions.slice(0, 8).map((session, i) => {
                const score = session.overall_score ? Math.round(parseFloat(session.overall_score)) : null
                const scoreColor = score ? (score >= 80 ? 'var(--green)' : score >= 60 ? 'var(--yellow)' : 'var(--red)') : 'var(--text-muted)'
                return (
                  <div
                    key={session.id}
                    className="animate-fade-up"
                    style={{ ...styles.sessionCard, animationDelay: `${i * 0.05}s`, opacity: 0 }}
                    onClick={() => navigate(`/feedback/${session.id}`)}
                  >
                    <div style={styles.sessionLeft}>
                      <div style={styles.sessionIcon}>
                        {session.role?.includes('Frontend') ? '🎨'
                          : session.role?.includes('Backend') ? '⚙️'
                          : session.role?.includes('Data') ? '📊'
                          : session.role?.includes('Product') ? '🎯'
                          : '💻'}
                      </div>
                      <div>
                        <div style={styles.sessionRole}>{session.role}</div>
                        <div style={styles.sessionMeta}>
                          <span className={`badge badge-${session.difficulty === 'hard' ? 'red' : session.difficulty === 'easy' ? 'green' : 'purple'}`}>
                            {session.difficulty}
                          </span>
                          <span style={styles.sessionDate}>
                            {new Date(session.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                          <span style={styles.sessionQs}>
                            {session.completed_questions}/{session.total_questions} questions
                          </span>
                        </div>
                      </div>
                    </div>
                    <div style={styles.sessionRight}>
                      {score ? (
                        <div style={styles.sessionScoreWrap}>
                          <div style={{ ...styles.sessionScore, color: scoreColor }}>{score}</div>
                          <div style={styles.sessionScoreLabel}>/ 100</div>
                        </div>
                      ) : (
                        <span className="badge badge-yellow">In Progress</span>
                      )}
                      <span style={styles.sessionArrow}>→</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: 'var(--bg-primary)', position: 'relative' },
  orb1: {
    position: 'fixed', top: '-15%', right: '-5%', width: '600px', height: '600px',
    background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
    borderRadius: '50%', pointerEvents: 'none', zIndex: 0,
    animation: 'orb-float 8s ease-in-out infinite',
  },
  orb2: {
    position: 'fixed', bottom: '-15%', left: '-5%', width: '500px', height: '500px',
    background: 'radial-gradient(circle, rgba(34,211,238,0.08) 0%, transparent 70%)',
    borderRadius: '50%', pointerEvents: 'none', zIndex: 0,
    animation: 'orb-float 12s ease-in-out infinite reverse',
  },
  grid: {
    position: 'fixed', inset: 0, zIndex: 0,
    backgroundImage: 'linear-gradient(rgba(139,92,246,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.025) 1px, transparent 1px)',
    backgroundSize: '40px 40px', pointerEvents: 'none',
  },
  nav: {
    position: 'sticky', top: 0, zIndex: 10,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '16px 32px',
    background: 'rgba(5,5,8,0.85)', backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  navLeft: { display: 'flex', alignItems: 'center', gap: '10px' },
  navGhost: { fontSize: '24px' },
  navBrand: { fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800, letterSpacing: '-0.02em' },
  navRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  userPill: {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '6px 14px', borderRadius: '50px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  userDot: { width: '7px', height: '7px', borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 8px var(--green)' },
  userEmail: { color: 'var(--text-secondary)', fontSize: '13px' },
  logoutBtn: {
    background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
    color: 'var(--text-muted)', padding: '7px 16px', borderRadius: '8px',
    cursor: 'pointer', fontSize: '13px', transition: 'all 0.2s ease',
  },
  container: { position: 'relative', zIndex: 1, maxWidth: '900px', margin: '0 auto', padding: '40px 24px 80px' },
  hero: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(34,211,238,0.04))',
    border: '1px solid rgba(139,92,246,0.15)',
    borderRadius: '28px', padding: '48px', marginBottom: '32px', gap: '32px',
  },
  heroLeft: { flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' },
  heroBadge: {
    display: 'inline-flex', alignItems: 'center', gap: '8px',
    padding: '6px 14px', borderRadius: '50px', width: 'fit-content',
    background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)',
    color: 'var(--purple-bright)', fontSize: '12px', fontWeight: 600,
  },
  heroBadgeDot: { width: '6px', height: '6px', borderRadius: '50%', background: 'var(--purple-bright)', boxShadow: '0 0 6px var(--purple-glow)' },
  heroTitle: { fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: 800, lineHeight: 1.2, letterSpacing: '-0.02em' },
  heroSub: { color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.7, maxWidth: '400px' },
  heroBtn: { padding: '14px 32px', fontSize: '15px', width: 'fit-content' },
  heroRight: { position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '160px', flexShrink: 0 },
  heroGhost: { fontSize: '80px', position: 'relative', zIndex: 1 },
  heroGlow: {
    position: 'absolute', width: '120px', height: '120px',
    background: 'radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%)',
    borderRadius: '50%', filter: 'blur(20px)',
  },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '32px' },
  statCard: {
    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '16px', padding: '20px',
    display: 'flex', flexDirection: 'column', gap: '6px',
    transition: 'all 0.2s ease', cursor: 'default',
  },
  statIcon: { fontSize: '20px', marginBottom: '4px' },
  statValue: { fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 800 },
  statLabel: { color: 'var(--text-muted)', fontSize: '12px' },
  sessionsSection: {},
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  sectionTitle: { fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700 },
  newSessionBtn: {
    background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)',
    color: 'var(--purple-bright)', padding: '8px 18px', borderRadius: '8px',
    cursor: 'pointer', fontSize: '13px', fontWeight: 600, transition: 'all 0.2s ease',
  },
  emptyCard: {
    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '20px', padding: '60px 40px', textAlign: 'center',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
  },
  emptyTitle: { fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700 },
  emptySub: { color: 'var(--text-muted)', fontSize: '14px' },
  sessionsList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  sessionCard: {
    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '16px', padding: '20px 24px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    cursor: 'pointer', transition: 'all 0.2s ease',
  },
  sessionLeft: { display: 'flex', alignItems: 'center', gap: '16px' },
  sessionIcon: {
    width: '44px', height: '44px', borderRadius: '12px',
    background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.15)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px',
  },
  sessionRole: { color: 'var(--text-primary)', fontWeight: 600, fontSize: '15px', marginBottom: '6px' },
  sessionMeta: { display: 'flex', alignItems: 'center', gap: '8px' },
  sessionDate: { color: 'var(--text-muted)', fontSize: '12px', fontFamily: 'var(--font-mono)' },
  sessionQs: { color: 'var(--text-muted)', fontSize: '12px' },
  sessionRight: { display: 'flex', alignItems: 'center', gap: '16px' },
  sessionScoreWrap: { display: 'flex', alignItems: 'baseline', gap: '2px' },
  sessionScore: { fontFamily: 'var(--font-mono)', fontSize: '24px', fontWeight: 700 },
  sessionScoreLabel: { color: 'var(--text-muted)', fontSize: '12px', fontFamily: 'var(--font-mono)' },
  sessionArrow: { color: 'var(--text-muted)', fontSize: '18px' },
}