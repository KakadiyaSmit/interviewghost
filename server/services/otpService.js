const { Resend } = require('resend')

const resend = new Resend(process.env.RESEND_API_KEY)
const otpStore = {}

const generateOTP = () => String(Math.floor(100000 + Math.random() * 900000))

const sendOTP = async (email) => {
  const otp = generateOTP()
  const expiresAt = Date.now() + 10 * 60 * 1000

  otpStore[email] = { otp, expiresAt }

  await resend.emails.send({
    from: 'InterviewGhost <noreply@interviewghost.site>',
    to: email,
    subject: 'Your InterviewGhost verification code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0a0a0f; color: #fff; padding: 40px; border-radius: 16px;">
        <h1 style="font-size: 28px; margin-bottom: 8px;">👻 InterviewGhost</h1>
        <p style="color: #888; margin-bottom: 32px;">Your verification code</p>
        <div style="background: #1a1a2e; border: 1px solid rgba(139,92,246,0.3); border-radius: 12px; padding: 32px; text-align: center; margin-bottom: 24px;">
          <div style="font-size: 48px; font-weight: 800; letter-spacing: 12px; color: #a78bfa;">${otp}</div>
        </div>
        <p style="color: #888; font-size: 14px;">This code expires in <strong style="color: #fff;">10 minutes</strong>.</p>
        <p style="color: #888; font-size: 14px;">If you didn't request this, ignore this email.</p>
        <hr style="border-color: rgba(255,255,255,0.06); margin: 24px 0;" />
        <p style="color: #555; font-size: 12px;">Built with 💜 by Smit Kakadiya · SF State Sophomore</p>
      </div>
    `,
  })

  return true
}

const verifyOTP = (email, otp) => {
  const record = otpStore[email]
  if (!record) return { valid: false, reason: 'No OTP found for this email' }
  if (Date.now() > record.expiresAt) {
    delete otpStore[email]
    return { valid: false, reason: 'OTP has expired' }
  }
  if (record.otp !== otp) return { valid: false, reason: 'Invalid OTP' }
  delete otpStore[email]
  return { valid: true }
}

module.exports = { sendOTP, verifyOTP }

// Export otpStore for password reset verification
module.exports.otpStore = otpStore
