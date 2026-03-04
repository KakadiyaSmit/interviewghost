import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { loginUser } from '../services/api'

export default function Login() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const { login } = useAuth()
  const navigate  = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await loginUser(email, password)
      login(res.data.token, res.data.user)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      {/* Ambient orbs */}
      <div style={styles.orb1} />
      <div style={styles.orb2} />

      {/* Grid background */}
      <div style={styles.grid} />

      <div style={styles.wrapper}>
        {/* Ghost logo */}
        <div className="animate-fade-up stagger-1" style={styles.logoWrap}>
          <div className="animate-float" style={styles.ghostIcon}>👻</div>
          <h1 style={styles.logoText}>
            Interview<span className="gradient-text">Ghost</span>
          </h1>
          <p style={styles.tagline}>Practice. Improve. <span className="gradient-text">Get hired.</span></p>
        </div>

        {/* Card */}
        <div className="glass animate-fade-up stagger-2" style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>Welcome back</h2>
            <p style={styles.cardSub}>Sign in to your account</p>
          </div>

          {error && (
            <div style={styles.errorBox}>
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.fieldWrap}>
              <label style={styles.label}>Email</label>
              <input
                className="input-field"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div style={styles.fieldWrap}>
              <label style={styles.label}>Password</label>
              <input
                className="input-field"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              className="btn-primary"
              style={styles.submitBtn}
              disabled={loading}
            >
              {loading ? (
                <span style={styles.loadingRow}>
                  <span style={styles.spinner} /> Signing in...
                </span>
              ) : 'Sign In →'}
            </button>
          </form>

          <p style={styles.switchText}>
            Don't have an account?{' '}
            <Link to="/register" style={styles.link}>Create one</Link>
          </p>
        </div>

        {/* Stats bar */}
        <div className="animate-fade-up stagger-3" style={styles.statsBar}>
          {['AI-Powered', 'Real-time Feedback', 'Track Progress'].map((s, i) => (
            <div key={i} style={styles.statItem}>
              <span style={styles.statDot} />
              <span style={styles.statText}>{s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    background: 'var(--bg-primary)',
  },
  orb1: {
    position: 'fixed', top: '-20%', left: '-10%',
    width: '600px', height: '600px',
    background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
    borderRadius: '50%', pointerEvents: 'none', zIndex: 0,
    animation: 'orb-float 8s ease-in-out infinite',
  },
  orb2: {
    position: 'fixed', bottom: '-20%', right: '-10%',
    width: '500px', height: '500px',
    background: 'radial-gradient(circle, rgba(34,211,238,0.1) 0%, transparent 70%)',
    borderRadius: '50%', pointerEvents: 'none', zIndex: 0,
    animation: 'orb-float 10s ease-in-out infinite reverse',
  },
  grid: {
    position: 'fixed', inset: 0, zIndex: 0,
    backgroundImage: 'linear-gradient(rgba(139,92,246,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.03) 1px, transparent 1px)',
    backgroundSize: '40px 40px',
    pointerEvents: 'none',
  },
  wrapper: {
    position: 'relative', zIndex: 1,
    width: '100%', maxWidth: '420px',
    padding: '24px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px',
  },
  logoWrap: {
    textAlign: 'center', display: 'flex',
    flexDirection: 'column', alignItems: 'center', gap: '8px',
  },
  ghostIcon: { fontSize: '56px', lineHeight: 1, marginBottom: '4px' },
  logoText: {
    fontFamily: 'var(--font-display)', fontSize: '36px',
    fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em',
  },
  tagline: { color: 'var(--text-secondary)', fontSize: '15px' },
  card: {
    width: '100%', padding: '32px',
    background: 'rgba(255,255,255,0.03)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '24px',
  },
  cardHeader: { marginBottom: '24px' },
  cardTitle: {
    fontFamily: 'var(--font-display)', fontSize: '22px',
    fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px',
  },
  cardSub: { color: 'var(--text-muted)', fontSize: '14px' },
  errorBox: {
    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
    color: '#fca5a5', padding: '12px 16px', borderRadius: '10px',
    marginBottom: '20px', fontSize: '14px', display: 'flex', gap: '8px', alignItems: 'center',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  fieldWrap: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500 },
  submitBtn: { width: '100%', padding: '14px', marginTop: '8px', fontSize: '15px' },
  loadingRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' },
  spinner: {
    width: '16px', height: '16px', borderRadius: '50%',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
    display: 'inline-block',
    animation: 'spin 0.7s linear infinite',
  },
  switchText: { color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center', marginTop: '20px' },
  link: { color: 'var(--purple-bright)', textDecoration: 'none', fontWeight: 600 },
  statsBar: {
    display: 'flex', gap: '20px', alignItems: 'center',
    padding: '12px 20px',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '50px',
  },
  statItem: { display: 'flex', alignItems: 'center', gap: '6px' },
  statDot: {
    width: '6px', height: '6px', borderRadius: '50%',
    background: 'var(--purple-bright)',
    boxShadow: '0 0 6px var(--purple-glow)',
  },
  statText: { color: 'var(--text-muted)', fontSize: '12px', fontWeight: 500, whiteSpace: 'nowrap' },
}