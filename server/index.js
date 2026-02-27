const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const app = express();

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// --- ROUTES ---
const healthRoutes = require('./routes/healthRoutes');
app.use('/health', healthRoutes);

// --- START SERVER ---
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
