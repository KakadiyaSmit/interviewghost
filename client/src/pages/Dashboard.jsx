import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, RadarChart, Radar,
  PolarGrid, PolarAngleAxis
} from 'recharts'

// ─── Helpers ────────────────────────────────────────────────────────────────
const scoreColor = s => s >= 80 ? 'var(--green)' : s >= 60 ? 'var(--yellow)' : 'var(--red)'
const roleIcon = r =>
  r?.includes('Frontend') ? '🎨' : r?.includes('Backend') ? '⚙️' :
  r?.includes('Data') ? '📊' : r?.includes('Product') ? '🎯' :
  r?.includes('DevOps') ? '🔧' : r?.includes('UX') ? '🖌️' : '💻'

function calcStreak(sessions) {
  if (!sessions.length) return 0
  const days = [...new Set(
    sessions
      .filter(s => s.status === 'completed')
      .map(s => new Date(s.created_at).toDateString())
  )].sort((a, b) => new Date(b) - new Date(a))

  let streak = 0
  let check = new Date()
  check.setHours(0, 0, 0, 0)

  for (const day of days) {
    const d = new Date(day)
    const diff = Math.round((check - d) / 86400000)
    if (diff <= 1) { streak++; check = d }
    else break
  }
  return streak
}

function getBadges(sessions, streak, avgScore, bestScore) {
  const completed = sessions.filter(s => s.status === 'completed').length
  const badges = []
  if (completed >= 1)  badges.push({ icon: '🎯', label: 'First Interview', desc: 'Completed your first session' })
  if (completed >= 5)  badges.push({ icon: '💪', label: 'Getting Serious', desc: '5 sessions completed' })
  if (completed >= 10) badges.push({ icon: '🏆', label: 'Grinder', desc: '10 sessions completed' })
  if (streak >= 3)     badges.push({ icon: '🔥', label: '3-Day Streak', desc: 'Practiced 3 days in a row' })
  if (streak >= 7)     badges.push({ icon: '⚡', label: 'Week Warrior', desc: '7-day streak' })
  if (bestScore >= 80) badges.push({ icon: '🌟', label: 'High Scorer', desc: 'Scored 80+ in a session' })
  if (bestScore >= 90) badges.push({ icon: '👑', label: 'Elite', desc: 'Scored 90+ in a session' })
  if (avgScore >= 75)  badges.push({ icon: '📈', label: 'Consistent', desc: 'Average score above 75' })

  const roles = [...new Set(sessions.map(s => s.role))]
  if (roles.length >= 3) badges.push({ icon: '🎭', label: 'Versatile', desc: 'Practiced 3+ different roles' })
  return badges
}

// ─── Components ─────────────────────────────────────────────────────────────
function StatCard({ value, label, icon, color, sub }) {
  return (
    <div style={st.statCard}>
      <div style={st.statIcon}>{icon}</div>
      <div style={{ ...st.statValue, color }}>{value}</div>
      <div style={st.statLabel}>{label}</div>
      {sub && <div style={st.statSub}>{sub}</div>}
    </div>
  )
}

function BadgeItem({ icon, label, desc, earned }) {
  return (
    <div style={{ ...st.badge, opacity: earned ? 1 : 0.3, filter: earned ? 'none' : 'grayscale(1)' }}
      title={desc}>
      <div style={st.badgeIcon}>{icon}</div>
      <div style={st.badgeLabel}>{label}</div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'rgba(10,10,15,0.95)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '10px', padding: '10px 14px' }}>
      <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginBottom: '4px' }}>{label}</div>
      <div style={{ color: 'var(--purple-bright)', fontSize: '16px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{payload[0].value}</div>
    </div>
  )
}

// ─── Main ────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

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

  const completed = sessions.filter(s => s.status === 'completed')
  const scored = completed.filter(s => s.overall_score)

  const avgScore = scored.length
    ? Math.round(scored.reduce((sum, s) => sum + parseFloat(s.overall_score), 0) / scored.length)
    : 0

  const bestScore = scored.length
    ? Math.round(Math.max(...scored.map(s => parseFloat(s.overall_score))))
    : 0

  const streak = calcStreak(sessions)

  const earnedBadges = getBadges(sessions, streak, avgScore, bestScore)
  const allBadges = [
    { icon: '🎯', label: 'First Interview', desc: 'Complete your first session' },
    { icon: '💪', label: 'Getting Serious', desc: '5 sessions completed' },
    { icon: '🏆', label: 'Grinder', desc: '10 sessions completed' },
    { icon: '🔥', label: '3-Day Streak', desc: 'Practice 3 days in a row' },
    { icon: '⚡', label: 'Week Warrior', desc: '7-day streak' },
    { icon: '🌟', label: 'High Scorer', desc: 'Score 80+ in a session' },
    { icon: '👑', label: 'Elite', desc: 'Score 90+ in a session' },
    { icon: '📈', label: 'Consistent', desc: 'Average score above 75' },
    { icon: '🎭', label: 'Versatile', desc: 'Practice 3+ different roles' },
  ]

  const chartData = scored.slice(-10).map((s, i) => ({
    name: `S${i + 1}`,
    score: Math.round(parseFloat(s.overall_score)),
    date: new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }))

  const favoriteRole = sessions.length
    ? Object.entries(sessions.reduce((acc, s) => {
        acc[s.role] = (acc[s.role] || 0) + 1; return acc
      }, {})).sort((a, b) => b[1] - a[1])[0]?.[0]
    : null

  const radarData = scored.length ? [
    { subject: 'Correctness', value: Math.round(scored.reduce((s, e) => s + parseFloat(e.correctness_avg || e.overall_score || 0), 0) / scored.length) },
    { subject: 'Clarity', value: Math.round(scored.reduce((s, e) => s + parseFloat(e.clarity_avg || e.overall_score || 0), 0) / scored.length) },
    { subject: 'Relevance', value: Math.round(scored.reduce((s, e) => s + parseFloat(e.relevance_avg || e.overall_score || 0), 0) / scored.length) },
    { subject: 'Communication', value: Math.round(scored.reduce((s, e) => s + parseFloat(e.communication_avg || e.overall_score || 0), 0) / scored.length) },
  ] : []

  return (
    <div style={st.page}>
      <div style={st.orb1} /><div style={st.orb2} /><div style={st.grid} />

      {/* Navbar */}
      <nav style={st.nav}>
        <div style={{...st.navLeft, cursor: 'pointer'}} onClick={() => navigate('/')}>
          <span style={st.navGhost}>👻</span>
          <span style={{...st.navBrand, cursor: 'pointer'}} onClick={() => navigate("/")}>Interview<span className="gradient-text">Ghost</span></span>
        </div>
        <div style={st.navCenter}>
          {['overview', 'progress', 'badges'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              ...st.navTab,
              color: activeTab === tab ? 'var(--purple-bright)' : 'var(--text-muted)',
              borderBottom: activeTab === tab ? '2px solid var(--purple-bright)' : '2px solid transparent',
            }}>
              {tab === 'overview' ? '📋 Overview' : tab === 'progress' ? '📊 Progress' : '🏆 Badges'}
            </button>
          ))}
        </div>
        <div style={st.navRight}>
          {streak > 0 && (
            <div style={st.streakPill}>
              🔥 <strong>{streak}</strong> day streak
            </div>
          )}
          <div style={st.userPill}>
            <div style={st.userDot} />
            <span style={st.userEmail}>{user?.name || user?.email}</span>
          </div>
          <button style={st.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div style={st.container}>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <>
            {/* Hero */}
            <div className="animate-fade-up stagger-1" style={st.hero}>
              <div style={st.heroLeft}>
                <div style={st.heroBadge}>
                  <span style={st.heroBadgeDot} />
                  AI-Powered Interview Coach
                </div>
                <h1 style={st.heroTitle}>
                  {sessions.length === 0
                    ? <>Ready to land your<br /><span className="gradient-text">dream internship?</span></>
                    : <>Welcome back,<br /><span className="gradient-text">{user?.name?.split(' ')[0] || 'Champ'} 👋</span></>
                  }
                </h1>
                <p style={st.heroSub}>
                  {sessions.length === 0
                    ? 'Practice with Claude AI, get real-time feedback, and track your progress.'
                    : `${completed.length} sessions completed · Avg score ${avgScore || '—'} · Best ${bestScore || '—'}`
                  }
                </p>
                <button className="btn-primary" style={st.heroBtn} onClick={() => navigate('/setup')}>
                  🚀 Start New Interview
                </button>
              </div>
              <div style={st.heroRight}>
                <div className="animate-float" style={st.heroGhost}>👻</div>
                <div style={st.heroGlow} />
              </div>
            </div>

            {/* Stats */}
            <div className="animate-fade-up stagger-2" style={st.statsRow}>
              <StatCard value={sessions.length} label="Total Sessions" icon="📋" color="var(--purple-bright)" />
              <StatCard value={completed.length} label="Completed" icon="✅" color="var(--green)" />
              <StatCard value={avgScore || '—'} label="Avg Score" icon="🎯" color="var(--cyan)" />
              <StatCard value={bestScore || '—'} label="Best Score" icon="🏆" color="var(--yellow)" />
              <StatCard
                value={streak > 0 ? `${streak}🔥` : '0'}
                label="Day Streak"
                icon="🔥"
                color="var(--yellow)"
                sub={streak > 0 ? 'Keep it up!' : 'Practice today!'}
              />
            </div>

            {/* Recent Sessions */}
            <div className="animate-fade-up stagger-3" style={st.sessionsSection}>
              <div style={st.sectionHeader}>
                <h2 style={st.sectionTitle}>Recent Sessions</h2>
                <button style={st.newSessionBtn} onClick={() => navigate('/setup')}>+ New Session</button>
              </div>

              {loading ? (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
    {[1,2,3].map(i => (
      <div key={i} style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '16px', padding: '20px',
        animation: 'pulse 1.5s ease-in-out infinite'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ width: '160px', height: '16px', borderRadius: '8px', background: 'rgba(255,255,255,0.07)' }} />
            <div style={{ width: '100px', height: '12px', borderRadius: '6px', background: 'rgba(255,255,255,0.04)' }} />
          </div>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
        </div>
      </div>
    ))}
  </div>
              ) : sessions.length === 0 ? (
                <div style={st.emptyCard}>
                  <div style={{ fontSize: '48px' }}>🚀</div>
                  <h3 style={st.emptyTitle}>No sessions yet</h3>
                  <p style={st.emptySub}>Start your first AI-powered interview practice!</p>
                  <button className="btn-primary" style={{ padding: '12px 28px', marginTop: '8px' }} onClick={() => navigate('/setup')}>
                    Start Practicing →
                  </button>
                </div>
              ) : (
                <div style={st.sessionsList}>
                  {sessions.slice(0, 8).map((session, i) => {
                    const score = session.overall_score ? Math.round(parseFloat(session.overall_score)) : null
                    const sc = score ? scoreColor(score) : 'var(--text-muted)'
                    return (
                      <div key={session.id} className="animate-fade-up"
                        style={{ ...st.sessionCard, animationDelay: `${i * 0.05}s`, opacity: 0 }}
                        onClick={() => navigate(`/feedback/${session.id}`)}>
                        <div style={st.sessionLeft}>
                          <div style={st.sessionIcon}>{roleIcon(session.role)}</div>
                          <div>
                            <div style={st.sessionRole}>{session.role}</div>
                            <div style={st.sessionMeta}>
                              <span className={`badge badge-${session.difficulty === 'hard' ? 'red' : session.difficulty === 'easy' ? 'green' : 'purple'}`}>
                                {session.difficulty}
                              </span>
                              <span style={st.sessionDate}>
                                {new Date(session.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div style={st.sessionRight}>
                          {score ? (
                            <div style={st.sessionScoreWrap}>
                              <div style={{ ...st.sessionScore, color: sc }}>{score}</div>
                              <div style={st.sessionScoreLabel}>/100</div>
                            </div>
                          ) : <span className="badge badge-yellow">In Progress</span>}
                          <span style={st.sessionArrow}>→</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* ── PROGRESS TAB ── */}
        {activeTab === 'progress' && (
          <div className="animate-fade-up">
            <h2 style={{ ...st.sectionTitle, marginBottom: '24px' }}>📊 Your Progress</h2>

            {scored.length < 2 ? (
              <div style={st.emptyCard}>
                <div style={{ fontSize: '48px' }}>📊</div>
                <h3 style={st.emptyTitle}>Not enough data yet</h3>
                <p style={st.emptySub}>Complete at least 2 scored sessions to see your progress charts.</p>
                <button className="btn-primary" style={{ padding: '12px 28px', marginTop: '8px' }} onClick={() => navigate('/setup')}>
                  Start Practicing →
                </button>
              </div>
            ) : (
              <>
                {/* Score over time */}
                <div style={st.chartCard}>
                  <h3 style={st.chartTitle}>Score Over Time</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={chartData}>
                      <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                      <YAxis domain={[0, 100]} stroke="rgba(255,255,255,0.2)" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone" dataKey="score"
                        stroke="var(--purple-bright)" strokeWidth={2.5}
                        dot={{ fill: 'var(--purple-bright)', r: 4, strokeWidth: 0 }}
                        activeDot={{ r: 6, fill: 'var(--cyan)' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Radar chart */}
                {radarData.length > 0 && (
                  <div style={st.chartCard}>
                    <h3 style={st.chartTitle}>Skills Breakdown</h3>
                    <ResponsiveContainer width="100%" height={260}>
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="rgba(255,255,255,0.08)" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                        <Radar dataKey="value" stroke="var(--purple-bright)" fill="var(--purple-bright)" fillOpacity={0.15} strokeWidth={2} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Stats summary */}
                <div style={st.statsRow}>
                  <StatCard value={completed.length} label="Sessions Done" icon="✅" color="var(--green)" />
                  <StatCard value={avgScore} label="Avg Score" icon="🎯" color="var(--cyan)" />
                  <StatCard value={bestScore} label="Best Score" icon="🏆" color="var(--yellow)" />
                  <StatCard value={favoriteRole?.split(' ')[0] || '—'} label="Fav Role" icon="⭐" color="var(--purple-bright)" />
                </div>
              </>
            )}
          </div>
        )}

        {/* ── BADGES TAB ── */}
        {activeTab === 'badges' && (
          <div className="animate-fade-up">
            <div style={{ marginBottom: '24px' }}>
              <h2 style={st.sectionTitle}>🏆 Achievements</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '6px' }}>
                {earnedBadges.length} of {allBadges.length} badges earned
              </p>
            </div>

            {/* Progress bar */}
            <div style={st.badgeProgress}>
              <div style={{ ...st.badgeProgressFill, width: `${(earnedBadges.length / allBadges.length) * 100}%` }} />
            </div>

            <div style={st.badgesGrid}>
              {allBadges.map((b, i) => {
                const earned = earnedBadges.some(e => e.label === b.label)
                return <BadgeItem key={i} {...b} earned={earned} />
              })}
            </div>

            {earnedBadges.length === 0 && (
              <div style={{ textAlign: 'center', marginTop: '32px' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Complete your first session to start earning badges! 🎯</p>
                <button className="btn-primary" style={{ padding: '12px 28px', marginTop: '16px' }} onClick={() => navigate('/setup')}>
                  Start Practicing →
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const st = {
  page: { minHeight: '100vh', background: 'var(--bg-primary)', position: 'relative' },
  orb1: { position: 'fixed', top: '-15%', right: '-5%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none', zIndex: 0, animation: 'orb-float 8s ease-in-out infinite' },
  orb2: { position: 'fixed', bottom: '-15%', left: '-5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(34,211,238,0.08) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none', zIndex: 0, animation: 'orb-float 12s ease-in-out infinite reverse' },
  grid: { position: 'fixed', inset: 0, zIndex: 0, backgroundImage: 'linear-gradient(rgba(139,92,246,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.025) 1px, transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' },
  nav: { position: 'sticky', top: 0, zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', height: '64px', background: 'rgba(5,5,8,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' },
  navLeft: { display: 'flex', alignItems: 'center', gap: '10px' },
  navGhost: { fontSize: '24px' },
  navBrand: { fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800, letterSpacing: '-0.02em' },
  navCenter: { display: 'flex', alignItems: 'center', gap: '4px' },
  navTab: { background: 'transparent', border: 'none', padding: '20px 16px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font-body)', transition: 'all 0.2s ease', whiteSpace: 'nowrap' },
  navRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  streakPill: { display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '50px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', color: 'var(--yellow)', fontSize: '13px' },
  userPill: { display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '50px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' },
  userDot: { width: '7px', height: '7px', borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 8px var(--green)' },
  userEmail: { color: 'var(--text-secondary)', fontSize: '13px' },
  logoutBtn: { background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)', padding: '7px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', transition: 'all 0.2s ease' },
  container: { position: 'relative', zIndex: 1, maxWidth: '960px', margin: '0 auto', padding: '40px 24px 80px' },
  hero: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(34,211,238,0.04))', border: '1px solid rgba(139,92,246,0.15)', borderRadius: '28px', padding: '48px', marginBottom: '32px', gap: '32px' },
  heroLeft: { flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' },
  heroBadge: { display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '50px', width: 'fit-content', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', color: 'var(--purple-bright)', fontSize: '12px', fontWeight: 600 },
  heroBadgeDot: { width: '6px', height: '6px', borderRadius: '50%', background: 'var(--purple-bright)', boxShadow: '0 0 6px var(--purple-glow)' },
  heroTitle: { fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: 800, lineHeight: 1.2, letterSpacing: '-0.02em' },
  heroSub: { color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.7, maxWidth: '400px' },
  heroBtn: { padding: '14px 32px', fontSize: '15px', width: 'fit-content' },
  heroRight: { position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '160px', flexShrink: 0 },
  heroGhost: { fontSize: '80px', position: 'relative', zIndex: 1 },
  heroGlow: { position: 'absolute', width: '120px', height: '120px', background: 'radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(20px)' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '32px' },
  statCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '4px' },
  statIcon: { fontSize: '20px', marginBottom: '6px' },
  statValue: { fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800 },
  statLabel: { color: 'var(--text-muted)', fontSize: '12px' },
  statSub: { color: 'var(--text-muted)', fontSize: '11px', marginTop: '2px' },
  sessionsSection: {},
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  sectionTitle: { fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700 },
  newSessionBtn: { background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', color: 'var(--purple-bright)', padding: '8px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, transition: 'all 0.2s ease' },
  emptyCard: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '60px 40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' },
  emptyTitle: { fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700 },
  emptySub: { color: 'var(--text-muted)', fontSize: '14px' },
  sessionsList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  sessionCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s ease' },
  sessionLeft: { display: 'flex', alignItems: 'center', gap: '16px' },
  sessionIcon: { width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' },
  sessionRole: { color: 'var(--text-primary)', fontWeight: 600, fontSize: '15px', marginBottom: '6px' },
  sessionMeta: { display: 'flex', alignItems: 'center', gap: '8px' },
  sessionDate: { color: 'var(--text-muted)', fontSize: '12px', fontFamily: 'var(--font-mono)' },
  sessionRight: { display: 'flex', alignItems: 'center', gap: '16px' },
  sessionScoreWrap: { display: 'flex', alignItems: 'baseline', gap: '2px' },
  sessionScore: { fontFamily: 'var(--font-mono)', fontSize: '24px', fontWeight: 700 },
  sessionScoreLabel: { color: 'var(--text-muted)', fontSize: '12px', fontFamily: 'var(--font-mono)' },
  sessionArrow: { color: 'var(--text-muted)', fontSize: '18px' },
  chartCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '28px', marginBottom: '20px' },
  chartTitle: { fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700, marginBottom: '20px' },
  badgeProgress: { height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', marginBottom: '32px', overflow: 'hidden' },
  badgeProgressFill: { height: '100%', background: 'linear-gradient(90deg, var(--purple), var(--cyan))', borderRadius: '3px', transition: 'width 1s ease' },
  badgesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '16px' },
  badge: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', cursor: 'default', transition: 'all 0.2s ease' },
  badgeIcon: { fontSize: '32px' },
  badgeLabel: { color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 600, textAlign: 'center' },
}