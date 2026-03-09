const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')
const authMiddleware = require('../middleware/authMiddleware')
const { sendOTP, verifyOTP } = require('../services/otpService')
const bcrypt = require('bcryptjs')
const pool = require('../config/db')

router.post('/send-otp', authController.sendOtp)
router.post('/register', authController.register)
router.post('/login', authController.login)

router.get('/me', authMiddleware, (req, res) => {
  res.json({ message: 'You are authenticated!', user: req.user })
})

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ error: 'Email is required' })
    const result = await pool.query('SELECT id FROM users WHERE email = $1', [email])
    if (result.rows.length === 0) return res.status(400).json({ error: 'No account with that email' })
    await sendOTP(email)
    res.json({ message: 'Reset code sent! Check your email.' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to send reset code' })
  }
})

router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body
    if (!email || !otp || !newPassword) return res.status(400).json({ error: 'All fields required' })
    if (newPassword.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' })
    const verification = verifyOTP(email, otp)
    if (!verification.valid) return res.status(400).json({ error: verification.reason })
    const hash = await bcrypt.hash(newPassword, 10)
    await pool.query('UPDATE users SET password_hash = $1 WHERE email = $2', [hash, email])
    res.json({ message: 'Password reset successfully!' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to reset password' })
  }
})

module.exports = router
