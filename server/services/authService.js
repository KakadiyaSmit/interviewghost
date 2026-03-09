const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const pool = require('../config/db')

const register = async (email, password, name) => {
  const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email])
  if (existingUser.rows.length > 0) throw new Error('Email already registered')

  const password_hash = await bcrypt.hash(password, 10)

  const newUser = await pool.query(
    'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING *',
    [email, password_hash, name || email.split('@')[0]]
  )

  const user = newUser.rows[0]
  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )

  return { token, user: { id: user.id, email: user.email, name: user.name } }
}

const login = async (email, password) => {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])
  if (result.rows.length === 0) throw new Error('Invalid email or password')

  const user = result.rows[0]
  const isMatch = await bcrypt.compare(password, user.password_hash)
  if (!isMatch) throw new Error('Invalid email or password')

  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )

  return { token, user: { id: user.id, email: user.email, name: user.name } }
}

module.exports = { register, login }
