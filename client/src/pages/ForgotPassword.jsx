import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { forgotPassword, resetPassword } from '../services/api'
import toast from 'react-hot-toast'

export default function ForgotPassword() {
  const [step, setStep]         = useState(1) // 1=email, 2=otp+newpass
  const [email, setEmail]       = useState('')
  const [otp, setOtp]           = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const navigate = useNavigate()

  const handleSendOtp = async () => {
    setError('')
    if (!email) return setError('Email is required')
    setLoading(true)
    try {
      await forgotPassword(email)
      toast.success('Reset code sent! Check your email 📧')
      setStep(2)
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to send reset code'
      setError(msg); toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async () => {
    setError('')
    if (!otp || !newPassword) return setError('All fields are required')
    if (newPassword.length < 6) return setError('Password must be at least 6 characters')
    setLoading(true)
    try {
      await resetPassword(email, otp, newPassword)
      toast.success('Password reset! Sign in with your new password 🔑')
      navigate('/login')
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to reset password'
      setError(msg); toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.orb1} />
      <div style={styles.orb2} />
      <div style={styles.grid} />

      <div style={styles.wrapper}>
        <div className="animate-fade-up stagger-1" style={styles.logoWrap}>
          <div className="animate-float" style={styles.ghostIcon}>👻</div>
          <h1 style={styles.logoText}>
            Interview<span className="gradient-text">Ghost</span>
          </h1>
          <p style={styles.tagline}>Reset your password</p>
        </div>

        <div className="glass animate-fade-up stagger-2" style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>
              {step === 1 ? 'Forgot password?' : 'Enter reset code'}
            </h2>
            <p style={styles.cardSub}>
              {step === 1 ? "We'll send a reset code to your email" : `Code sent to ${email}`}
            </p>
          </div>

          <div style={styles.stepRow}>
            {[1, 2].map(s => (
              <div key={s} style={{
                ...styles.stepDot,
                background: step >= s ? 'var(--purple-bright)' : 'rgba(255,255,255,0.1)'
              }} />
            ))}
          </div>

          {error && (
            <div style={styles.errorBox}>
              <span>⚠️</span> {error}
            </div>
          )}

          {step === 1 ? (
            <div style={styles.form}>
              <div style={styles.fieldWrap}>
                <label style={styles.label}>Email</label>
                <input
                  className="input-field"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              <button
                className="btn-primary"
                style={styles.submitBtn}
                onClick={handleSendOtp}
                disabled={loading}
              >
                {loading ? (
                  <span style={styles.loadingRow}>
                    <span style={styles.spinner} /> Sending code...
                  </span>
                ) : 'Send Reset Code →'}
              </button>
            </div>
          ) : (
            <div style={styles.form}>
              <div style={styles.otpHint}>
                📧 Check your inbox for a 6-digit code
              </div>
              <div style={styles.fieldWrap}>
                <label style={styles.label}>Reset Code</label>
                <input
                  className="input-field"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  maxLength={6}
                  style={{ fontSize: '32px', letterSpacing: '6px', textAlign: 'center', whiteSpace: 'nowrap' }}
                />
              </div>
              <div style={styles.fieldWrap}>
                <label style={styles.label}>New Password</label>
                <input
                  className="input-field"
                  type="password"
                  placeholder="Min. 6 characters"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                />
              </div>
              <button
                className="btn-primary"
                style={styles.submitBtn}
                onClick={handleReset}
                disabled={loading}
              >
                {loading ? (
                  <span style={styles.loadingRow}>
                    <span style={styles.spinner} /> Resetting...
                  </span>
                ) : 'Reset Password →'}
              </button>
              <button
                style={styles.resendBtn}
                onClick={handleSendOtp}
                disabled={loading}
              >
                Resend code
              </button>
            </div>
          )}

          <p style={styles.switchText}>
            Remember it?{' '}
            <Link to="/login" style={styles.link}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    position: 'relative', overflow: 'hidden',
    background: 'var(--bg-primary)',
  },
  orb1: {
    position: 'fixed', top: '-20%', right: '-10%',
    width: '600px', height: '600px',
    background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
    borderRadius: '50%', pointerEvents: 'none', zIndex: 0,
    animation: 'orb-float 9s ease-in-out infinite',
  },
  orb2: {
    position: 'fixed', bottom: '-20%', left: '-10%',
    width: '500px', height: '500px',
    background: 'radial-gradient(circle, rgba(34,211,238,0.1) 0%, transparent 70%)',
    borderRadius: '50%', pointerEvents: 'none', zIndex: 0,
    animation: 'orb-float 11s ease-in-out infinite reverse',
  },
  grid: {
    position: 'fixed', inset: 0, zIndex: 0,
    backgroundImage: 'linear-gradient(rgba(139,92,246,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.03) 1px, transparent 1px)',
    backgroundSize: '40px 40px', pointerEvents: 'none',
  },
  wrapper: {
    position: 'relative', zIndex: 1,
    width: '100%', maxWidth: '420px', padding: '24px',
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
  cardHeader: { marginBottom: '16px' },
  cardTitle: {
    fontFamily: 'var(--font-display)', fontSize: '22px',
    fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px',
  },
  cardSub: { color: 'var(--text-muted)', fontSize: '14px' },
  stepRow: { display: 'flex', gap: '8px', marginBottom: '20px' },
  stepDot: { height: '3px', flex: 1, borderRadius: '2px', transition: 'background 0.3s ease' },
  errorBox: {
    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
    color: '#fca5a5', padding: '12px 16px', borderRadius: '10px',
    marginBottom: '20px', fontSize: '14px', display: 'flex', gap: '8px', alignItems: 'center',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  fieldWrap: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500 },
  otpHint: {
    background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)',
    color: '#c4b5fd', padding: '12px 16px', borderRadius: '10px',
    fontSize: '14px', textAlign: 'center',
  },
  submitBtn: { width: '100%', padding: '14px', marginTop: '8px', fontSize: '15px' },
  resendBtn: {
    background: 'none', border: 'none', color: 'var(--purple-bright)',
    fontSize: '14px', cursor: 'pointer', textAlign: 'center', padding: '4px',
  },
  loadingRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' },
  spinner: {
    width: '16px', height: '16px', borderRadius: '50%',
    border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff',
    display: 'inline-block', animation: 'spin 0.7s linear infinite',
  },
  switchText: { color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center', marginTop: '20px' },
  link: { color: 'var(--purple-bright)', textDecoration: 'none', fontWeight: 600 },
}
