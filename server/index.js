const express = require('express');
const cors    = require('cors');
require('dotenv').config();
require('./config/db');

const app = express();

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// --- ROUTES ---
const healthRoutes  = require('./routes/healthRoutes');
const authRoutes    = require('./routes/authRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const evalRoutes    = require('./routes/evalRoutes');


app.use('/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/evaluations', evalRoutes);

// --- START SERVER ---
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
