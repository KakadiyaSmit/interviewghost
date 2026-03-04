// ============================================================
// FILE: server/controllers/evalController.js
// ============================================================

const evalService = require('../services/evalService');
const pool = require('../config/db');

const evalController = {

  // POST /api/evaluations — submit answer for evaluation
  evaluate: async (req, res) => {
    try {
      const { questionId, answer, timeTaken } = req.body;
      const userId = req.user.id;

      if (!questionId || !answer) {
        return res.status(400).json({
          error: 'questionId and answer are required'
        });
      }

      const evaluation = await evalService.evaluateAnswer(
        userId,
        questionId,
        answer,
        timeTaken || 0
      );

      res.status(201).json({
        message: 'Answer evaluated!',
        evaluation
      });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // GET /api/evaluations/question/:questionId
  getByQuestion: async (req, res) => {
    try {
      const { questionId } = req.params;
      const result = await pool.query(
        'SELECT * FROM evaluations WHERE question_id = $1',
        [questionId]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'No evaluation found' });
      }
      res.status(200).json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

};

module.exports = evalController;