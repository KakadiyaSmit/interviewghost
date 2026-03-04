import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createSession } from '../services/api'

const ROLES = [
  { title: 'Software Engineer Intern', icon: '💻', tags: ['DSA', 'System Design', 'Coding'] },
  { title: 'Frontend Engineer', icon: '🎨', tags: ['React', 'CSS', 'Performance'] },
  { title: 'Backend Engineer', icon: '⚙️', tags: ['APIs', 'Databases', 'Architecture'] },
  { title: 'Full Stack Engineer', icon: '🚀', tags: ['React', 'Node', 'SQL'] },
  { title: 'Data Scientist', icon: '📊', tags: ['ML', 'Python', 'Statistics'] },
  { title: 'Product Manager', icon: '🎯', tags: ['Strategy', 'Analytics', 'Leadership'] },
  { title: 'DevOps Engineer', icon: '🔧', tags: ['CI/CD', 'Docker', 'Cloud'] },
  { title: 'UX Designer', icon: '✏️', tags: ['Figma', 'Research', 'Prototyping'] },
]

const DIFFICULTIES = [
  { value: 'easy', label: 'Beginner', desc: 'Foundational concepts', color: 'var(--green)' },
  { value: 'medium', label: 'Intermediate', desc: 'Industry standard', color: 'var(--purple)' },
  { value: 'hard', label: 'Advanced', desc: 'FAANG level', color: 'var(--red)' },
]

export default function Setup() {
  const [role, setRole]             = useState('')
  const [difficulty, setDifficulty] = useState('medium')
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')
  const navigate = useNavigate()

  const handleStart = async () => {
    if (!role) return setError('Please select a role')
    setLoading(true)
    setError('')
    try {
      const res = await createSession(role, difficulty)
      navigate(`/interview/${res.data.session.id}`)
    } catch {
      setError('Failed to create session. Try again.')
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.orb1} />
      <div style={styles.orb2} />
      <div style={styles.grid} />

      <div style={styles.container}>
        {/* Header */}
        <div className="animate-fade-up stagger-1" style={styles.header}>
          <a href="/dashboard" style={styles.backBtn}>← Dashboard</a>
          <div style={styles.headerCenter}>
            <span style={styles.headerGhost}>👻</span>
            <h1 style={styles.headerTitle}>
              New <span className="gradient-text">Interview</span>
            </h1>
          </div>
          <div />
        </div>

        {/* Step 1 — Role */}
        <div className="animate-fade-up stagger-2" style={styles.section}>
          <div style={styles.sectionHeader}>
            <span style={styles.stepBadge}>01</span>
            <h2 style={styles.sectionTitle}>Choose your target role</h2>
          </div>

          <div style={styles.rolesGrid}>
            {ROLES.map((r) => (
              <button
                key={r.title}
                onClick={() => { setRole(r.title); setError('') }}
                style={{
                  ...styles.roleCard,
                  border: role === r.title
                    ? '1px solid var(--purple)'
                    : '1px solid rgba(255,255,255,0.06)',
                  background: role === r.title
                    ? 'rgba(139,92,246,0.1)'
                    : 'rgba(255,255,255,0.02)',
                  transform: role === r.title ? 'translateY(-2px)' : 'translateY(0)',
                  boxShadow: role === r.title ? '0 8px 30px rgba(139,92,246,0.2)' : 'none',
                }}
              >
                <span style={styles.roleIcon}>{r.icon}</span>
                <span style={styles.roleTitle}>{r.title}</span>
                <div style={styles.roleTags}>
                  {r.tags.map(t => (
                    <span key={t} style={styles.roleTag}>{t}</span>
                  ))}
                </div>
                {role === r.title && (
                  <div style={styles.selectedCheck}>✓</div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Step 2 — Difficulty */}
        <div className="animate-fade-up stagger-3" style={styles.section}>
          <div style={styles.sectionHeader}>
            <span style={styles.stepBadge}>02</span>
            <h2 style={styles.sectionTitle}>Select difficulty level</h2>
          </div>

          <div style={styles.diffRow}>
            {DIFFICULTIES.map((d) => (
              <button
                key={d.value}
                onClick={() => setDifficulty(d.value)}
                style={{
                  ...styles.diffCard,
                  border: difficulty === d.value
                    ? `1px solid ${d.color}`
                    : '1px solid rgba(255,255,255,0.06)',
                  background: difficulty === d.value
                    ? `${d.color}15`
                    : 'rgba(255,255,255,0.02)',
                }}
              >
                <div style={{ ...styles.diffDot, background: d.color }} />
                <div>
                  <div style={{ ...styles.diffLabel, color: difficulty === d.value ? d.color : 'var(--text-primary)' }}>
                    {d.label}
                  </div>
                  <div style={styles.diffDesc}>{d.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={styles.errorBox}>⚠️ {error}</div>
        )}

        {/* CTA */}
        <div className="animate-fade-up stagger-4" style={styles.ctaWrap}>
          {role && (
            <div style={styles.selectedInfo}>
              <span style={styles.selectedLabel}>Ready to interview for</span>
              <span style={styles.selectedRole}>{role}</span>
            </div>
          )}
          <button
            className="btn-primary"
            style={styles.startBtn}
            onClick={handleStart}
            disabled={loading || !role}
          >
            {loading ? (
              <span style={styles.loadingRow}>
                <span style={styles.spinner} />
                🤖 Claude is generating your questions...
              </span>
            ) : (
              '🚀 Start Interview →'
            )}
          </button>
          {loading && (
            <p style={styles.loadingHint}>
              This takes 5-10 seconds. Claude is crafting personalized questions for you.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh', background: 'var(--bg-primary)',
    position: 'relative', overflow: 'hidden',
  },
  orb1: {
    position: 'fixed', top: '-10%', right: '-5%',
    width: '500px', height: '500px',
    background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
    borderRadius: '50%', pointerEvents: 'none', zIndex: 0,
    animation: 'orb-float 8s ease-in-out infinite',
  },
  orb2: {
    position: 'fixed', bottom: '-10%', left: '-5%',
    width: '400px', height: '400px',
    background: 'radial-gradient(circle, rgba(34,211,238,0.08) 0%, transparent 70%)',
    borderRadius: '50%', pointerEvents: 'none', zIndex: 0,
    animation: 'orb-float 12s ease-in-out infinite reverse',
  },
  grid: {
    position: 'fixed', inset: 0, zIndex: 0,
    backgroundImage: 'linear-gradient(rgba(139,92,246,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.025) 1px, transparent 1px)',
    backgroundSize: '40px 40px', pointerEvents: 'none',
  },
  container: {
    position: 'relative', zIndex: 1,
    maxWidth: '860px', margin: '0 auto',
    padding: '32px 24px 60px',
  },
  header: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: '48px',
  },
  backBtn: {
    color: 'var(--text-muted)', textDecoration: 'none',
    fontSize: '14px', fontWeight: 500,
    transition: 'color 0.2s',
  },
  headerCenter: { display: 'flex', alignItems: 'center', gap: '12px' },
  headerGhost: { fontSize: '28px' },
  headerTitle: {
    fontFamily: 'var(--font-display)', fontSize: '28px',
    fontWeight: 800, letterSpacing: '-0.02em',
  },
  section: { marginBottom: '40px' },
  sectionHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' },
  stepBadge: {
    fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 500,
    color: 'var(--purple-bright)', background: 'rgba(139,92,246,0.1)',
    border: '1px solid rgba(139,92,246,0.2)',
    padding: '4px 10px', borderRadius: '20px', letterSpacing: '0.05em',
  },
  sectionTitle: {
    fontFamily: 'var(--font-display)', fontSize: '18px',
    fontWeight: 700, color: 'var(--text-primary)',
  },
  rolesGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
    gap: '12px',
  },
  roleCard: {
    padding: '20px', borderRadius: '16px',
    cursor: 'pointer', textAlign: 'left',
    transition: 'all 0.2s ease', position: 'relative',
    display: 'flex', flexDirection: 'column', gap: '8px',
  },
  roleIcon: { fontSize: '28px' },
  roleTitle: { color: 'var(--text-primary)', fontSize: '13px', fontWeight: 600, lineHeight: 1.3 },
  roleTags: { display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' },
  roleTag: {
    fontSize: '10px', color: 'var(--text-muted)',
    background: 'rgba(255,255,255,0.05)',
    padding: '2px 7px', borderRadius: '10px',
  },
  selectedCheck: {
    position: 'absolute', top: '12px', right: '12px',
    width: '20px', height: '20px', borderRadius: '50%',
    background: 'var(--purple)', color: '#fff',
    fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 700,
  },
  diffRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' },
  diffCard: {
    padding: '20px', borderRadius: '16px',
    cursor: 'pointer', transition: 'all 0.2s ease',
    display: 'flex', alignItems: 'center', gap: '14px',
  },
  diffDot: { width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0 },
  diffLabel: { fontSize: '15px', fontWeight: 700, marginBottom: '2px' },
  diffDesc: { fontSize: '12px', color: 'var(--text-muted)' },
  errorBox: {
    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
    color: '#fca5a5', padding: '12px 16px', borderRadius: '10px',
    marginBottom: '20px', fontSize: '14px',
  },
  ctaWrap: { display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' },
  selectedInfo: {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '10px 20px', borderRadius: '50px',
    background: 'rgba(139,92,246,0.08)',
    border: '1px solid rgba(139,92,246,0.15)',
  },
  selectedLabel: { color: 'var(--text-muted)', fontSize: '13px' },
  selectedRole: { color: 'var(--purple-bright)', fontSize: '13px', fontWeight: 600 },
  startBtn: { padding: '16px 48px', fontSize: '16px', minWidth: '280px' },
  loadingRow: { display: 'flex', alignItems: 'center', gap: '10px' },
  spinner: {
    width: '16px', height: '16px', borderRadius: '50%',
    border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff',
    display: 'inline-block', animation: 'spin 0.7s linear infinite',
  },
  loadingHint: { color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center' },
}