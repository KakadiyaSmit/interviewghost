// ============================================================
// FILE: server/index.js
// PURPOSE: App entry point — now much cleaner.
// Notice: no route logic here anymore.
// index.js just CONNECTS things together.
// ============================================================

const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const app = express();

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// --- ROUTES ---
// Import our route files
const healthRoutes = require('./routes/healthRoutes');

// Mount the router at /health
// This means: "anything starting with /health
// gets handled by healthRoutes"
app.use('/health', healthRoutes);

// --- START SERVER ---
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});