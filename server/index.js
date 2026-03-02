const express = require('express');
const cors    = require('cors');
require('dotenv').config();
require('./config/db'); // connects to database on startup

const app = express();

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// --- ROUTES ---
const healthRoutes = require('./routes/healthRoutes');
const authRoutes   = require('./routes/authRoutes');

app.use('/health', healthRoutes);
app.use('/api/auth', authRoutes);
// This means:
// /api/auth/register → authRoutes → authController.register
// /api/auth/login    → authRoutes → authController.login

// --- START SERVER ---
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
