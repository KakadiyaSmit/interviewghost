// ============================================================
// FILE: server/services/sessionService.js
// PURPOSE: Handles all interview session logic.
// This is where we talk to Claude to generate questions.
// ============================================================

const Anthropic = require('@anthropic-ai/sdk');
const pool = require('../config/db');

// Initialize the Anthropic client
// It automatically reads ANTHROPIC_API_KEY from .env
const anthropic = new Anthropic();

// ============================================================
// CREATE SESSION SERVICE
// What it does:
// 1. Build a smart prompt for Claude
// 2. Ask Claude to generate questions
// 3. Parse Claude's response
// 4. Save session + questions to database
// 5. Return everything to the controller
// ============================================================

const createSession = async (userId, role, difficulty = 'medium') => {

  // STEP 1: Build the prompt
  // This is PROMPT ENGINEERING — the skill that makes
  // InterviewGhost extraordinary vs a basic app.
  // We tell Claude exactly what we want and in what format.
  const prompt = `You are a senior hiring manager at a top tech company conducting a ${difficulty} difficulty interview for a ${role} position.

Generate exactly 5 interview questions for this role. Include a mix of:
- Technical questions specific to ${role}
- Behavioral questions (1-2)
- At least one system design or problem-solving question

For each question provide:
- The question itself
- Question type (technical/behavioral/system_design/case)
- Difficulty (easy/medium/hard)
- Estimated time in seconds to answer
- Key points a strong answer should cover

Return ONLY a valid JSON array with no other text, markdown, or explanation.
Use this exact format:
[
  {
    "order_number": 1,
    "question_text": "...",
    "question_type": "technical",
    "difficulty": "${difficulty}",
    "estimated_time": 120,
    "key_points": ["point1", "point2", "point3"]
  }
]`;

  // STEP 2: Call Claude API
  // This is the actual API call to Anthropic
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    // claude-sonnet = best balance of speed + quality + cost
    
    max_tokens: 2000,
    // Maximum tokens Claude can use in response
    // 2000 is plenty for 5 questions
    
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ]
  });

  // STEP 3: Parse Claude's response
  const responseText = message.content[0].text;
  // message.content = array of content blocks
  // [0].text = the actual text response

  let questions;
  try {
    questions = JSON.parse(responseText);
    // JSON.parse converts the string into a JavaScript array
    // If Claude returns anything other than valid JSON, this throws
  } catch (error) {
    throw new Error('Failed to parse AI response. Please try again.');
  }

  // STEP 4: Save session to database
  const sessionResult = await pool.query(
    `INSERT INTO sessions 
     (user_id, role, difficulty, status, total_questions) 
     VALUES ($1, $2, $3, 'in_progress', $4) 
     RETURNING *`,
    [userId, role, difficulty, questions.length]
  );

  const session = sessionResult.rows[0];

  // STEP 5: Save each question to database
  // Promise.all = run all inserts at the SAME TIME
  // Way faster than running them one by one
  const savedQuestions = await Promise.all(
    questions.map(q =>
      pool.query(
        `INSERT INTO questions 
         (session_id, question_text, question_type, difficulty, estimated_time, order_number)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [session.id, q.question_text, q.question_type, q.difficulty, q.estimated_time, q.order_number]
      ).then(result => result.rows[0])
    )
  );

  // Return everything the frontend needs
  return {
    session,
    questions: savedQuestions.map((q, i) => ({
      ...q,
      key_points: questions[i].key_points
      // key_points aren't stored in DB (not needed)
      // but we return them for the frontend to show
    }))
  };
};

// ============================================================
// GET SESSION SERVICE
// Fetches a session and all its questions
// ============================================================
const getSession = async (sessionId, userId) => {
  // Get session
  const sessionResult = await pool.query(
    'SELECT * FROM sessions WHERE id = $1 AND user_id = $2',
    [sessionId, userId]
  );

  if (sessionResult.rows.length === 0) {
    throw new Error('Session not found');
  }

  // Get questions for this session
  const questionsResult = await pool.query(
    'SELECT * FROM questions WHERE session_id = $1 ORDER BY order_number',
    [sessionId]
  );

  return {
    session: sessionResult.rows[0],
    questions: questionsResult.rows
  };
};

module.exports = { createSession, getSession };