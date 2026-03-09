const authService = require('../services/authService')
const { sendOTP, verifyOTP } = require('../services/otpService')

const authController = {

  sendOtp: async (req, res) => {
    try {
      const { email } = req.body
      if (!email) return res.status(400).json({ error: 'Email is required' })

      const pool = require('../config/db')
      const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email])
      if (existing.rows.length > 0) {
        return res.status(400).json({ error: 'Email already registered' })
      }

      await sendOTP(email)
      res.json({ message: 'OTP sent! Check your email.' })
    } catch (error) {
      console.error('Send OTP error:', error)
      res.status(500).json({ error: 'Failed to send OTP. Try again.' })
    }
  },

  register: async (req, res) => {
    try {
      const { email, password, name, otp } = req.body

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' })
      }
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' })
      }
      if (!otp) {
        return res.status(400).json({ error: 'OTP is required' })
      }

      const verification = verifyOTP(email, otp)
      if (!verification.valid) {
        return res.status(400).json({ error: verification.reason })
      }

      const result = await authService.register(email, password, name)
      res.status(201).json({
        message: 'Account created successfully!',
        token: result.token,
        user: result.user,
      })
    } catch (error) {
      res.status(400).json({ error: error.message })
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' })
      }
      const result = await authService.login(email, password)
      res.status(200).json({
        message: 'Login successful!',
        token: result.token,
        user: result.user,
      })
    } catch (error) {
      res.status(400).json({ error: error.message })
    }
  },
}

module.exports = authController
