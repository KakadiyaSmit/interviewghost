// ============================================================
// FILE: server/controllers/healthController.js
// ROLE: The KITCHEN MANAGER 👨‍🍳
// ============================================================

const healthController = {

    check: (req, res) => {
      res.json({
        status: 'ok',
        message: 'InterviewGhost server is alive 👻',
        timestamp: new Date().toISOString()
      });
    }
  
  };
  
  module.exports = healthController;