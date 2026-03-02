// ============================================================
// FILE: server/controllers/evalController.js
// ============================================================

const evalService = require('../services/evalService');

const evalController = {

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
  }

};

module.exports = evalController;