// ============================================================
// FILE: server/services/evalService.js
// PURPOSE: Evaluates user answers using Claude AI
// This is the heart of InterviewGhost's value proposition
// ============================================================

const Anthropic = require('@anthropic-ai/sdk');
const pool = require('../config/db');

const anthropic = new Anthropic();

const evaluateAnswer = async (userId, questionId, userAnswer, timeTaken) => {

  // STEP 1: Get the question from database
  const questionResult = await pool.query(
    'SELECT * FROM questions WHERE id = $1',
    [questionId]
  );

  if (questionResult.rows.length === 0) {
    throw new Error('Question not found');
  }

  const question = questionResult.rows[0];

  // STEP 2: Build evaluation prompt
  // This is advanced prompt engineering —
  // we give Claude a rubric and ask for structured JSON output
  const prompt = `You are an expert technical interviewer evaluating a candidate's answer.

QUESTION: ${question.question_text}
QUESTION TYPE: ${question.question_type}
DIFFICULTY: ${question.difficulty}

CANDIDATE'S ANSWER: ${userAnswer}

Evaluate this answer and return ONLY a valid JSON object with no other text:
{
  "correctness_score": <0-100>,
  "clarity_score": <0-100>,
  "relevance_score": <0-100>,
  "communication_score": <0-100>,
  "overall_score": <0-100, weighted average>,
  "success_probability": <0-100, chance this answer advances them>,
  "strengths": "<what they did well, 2-3 sentences>",
  "improvements": "<specific things to improve, 2-3 sentences>",
  "next_steps": "<concrete resources and practice suggestions>",
  "ideal_answer": "<what an excellent answer would cover, 3-4 sentences>"
}

Scoring guide:
- correctness: technical accuracy and completeness
- clarity: structure, logic flow, easy to follow
- relevance: addresses the question and role requirements  
- communication: professional language and delivery
- success_probability: realistic chance of advancing in real interview`;

  // STEP 3: Call Claude for evaluation
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    messages: [{ role: 'user', content: prompt }]
  });

  // STEP 4: Parse Claude's evaluation
  let evaluation;
  try {
    evaluation = JSON.parse(message.content[0].text);
  } catch (error) {
    throw new Error('Failed to parse evaluation. Please try again.');
  }

  // STEP 5: Save evaluation to database
  const savedEval = await pool.query(
    `INSERT INTO evaluations (
      question_id, user_id, user_answer,
      correctness_score, clarity_score, relevance_score, communication_score,
      overall_score, success_probability,
      strengths, improvements, next_steps, ideal_answer,
      time_taken
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
    RETURNING *`,
    [
      questionId, userId, userAnswer,
      evaluation.correctness_score,
      evaluation.clarity_score,
      evaluation.relevance_score,
      evaluation.communication_score,
      evaluation.overall_score,
      evaluation.success_probability,
      evaluation.strengths,
      evaluation.improvements,
      evaluation.next_steps,
      evaluation.ideal_answer,
      timeTaken
    ]
  );

  // STEP 6: Update completed_questions count in session
  await pool.query(
    `UPDATE sessions 
     SET completed_questions = completed_questions + 1
     WHERE id = (SELECT session_id FROM questions WHERE id = $1)`,
    [questionId]
  );

  return savedEval.rows[0];
};

module.exports = { evaluateAnswer };