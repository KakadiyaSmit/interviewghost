// ============================================================
// FILE: server/controllers/authController.js
// ROLE: The KITCHEN MANAGER
// PURPOSE: Receives HTTP requests, calls authService,
// sends back responses. No logic — just coordination.
// ============================================================

const authService = require('../services/authService');

const authController = {

  // --------------------------------------------------------
  // REGISTER HANDLER
  // Called when: POST /api/auth/register
  // Expects: { email, password } in request body
  // --------------------------------------------------------
  register: async (req, res) => {
    try {
      // Extract email and password from request body
      // req.body works because of express.json() middleware
      const { email, password } = req.body;

      // Basic validation — never trust user input!
      if (!email || !password) {
        return res.status(400).json({
          error: 'Email and password are required'
        });
        // 400 = Bad Request (user sent wrong data)
      }

      if (password.length < 6) {
        return res.status(400).json({
          error: 'Password must be at least 6 characters'
        });
      }

      // Call the service to do the real work
      const result = await authService.register(email, password);

      // 201 = Created (something new was created)
      res.status(201).json({
        message: 'Account created successfully!',
        token: result.token,
        user: result.user
      });

    } catch (error) {
      // If service throws an error, catch it here
      // and send it back as a 400 response
      res.status(400).json({ error: error.message });
    }
  },

  // --------------------------------------------------------
  // LOGIN HANDLER
  // Called when: POST /api/auth/login
  // Expects: { email, password } in request body
  // --------------------------------------------------------
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          error: 'Email and password are required'
        });
      }

      const result = await authService.login(email, password);

      // 200 = OK (request succeeded)
      res.status(200).json({
        message: 'Login successful!',
        token: result.token,
        user: result.user
      });

    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

};

module.exports = authController;