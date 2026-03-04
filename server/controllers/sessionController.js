// ============================================================
// FILE: server/controllers/sessionController.js
// ROLE: Kitchen Manager for sessions
// ============================================================

const sessionService = require('../services/sessionService');
const pool = require('../config/db');

const sessionController = {

  // POST /api/sessions — create new interview session
  create: async (req, res) => {
    try {
      const { role, difficulty } = req.body;
      const userId = req.user.id;

      if (!role) {
        return res.status(400).json({ error: 'Role is required' });
      }

      const result = await sessionService.createSession(userId, role, difficulty);

      res.status(201).json({
        message: 'Interview session created!',
        session: result.session,
        questions: result.questions
      });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // GET /api/sessions/:id — get one session
  getOne: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const result = await sessionService.getSession(id, userId);

      res.status(200).json(result);

    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  },

  // GET /api/sessions — get all sessions for logged in user
  getAll: async (req, res) => {
    try {
      const userId = req.user.id;
      const result = await pool.query(
        'SELECT * FROM sessions WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
      );
      res.status(200).json({ sessions: result.rows });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

};

module.exports = sessionController;