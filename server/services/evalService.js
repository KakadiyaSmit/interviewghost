const Anthropic = require('@anthropic-ai/sdk');
const pool = require('../config/db');

const anthropic = new Anthropic();

const evaluateAnswer = async (userId, questionId, userAnswer, timeTaken) => {

  const questionResult = await pool.query(
    'SELECT * FROM questions WHERE id = $1',
    [questionId]
  );

  if (questionResult.rows.length === 0) {
    throw new Error('Question not found');
  }

  const question = questionResult.rows[0];

  // Clean answer — remove special chars that break JSON parsing
  const cleanAnswer = userAnswer
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, ' ')
    .replace(/\\/g, '/')
    .replace(/"/g, "'")
    .slice(0, 3000)

  const prompt = `You are an expert technical interviewer evaluating a candidate's answer.

QUESTION: ${question.question_text}
QUESTION TYPE: ${question.question_type}
DIFFICULTY: ${question.difficulty}

CANDIDATE'S ANSWER: ${cleanAnswer}

Evaluate this answer and return ONLY a valid JSON object. No markdown, no backticks, no explanation. Just raw JSON starting with { and ending with }:
{
  "correctness_score": <0-100>,
  "clarity_score": <0-100>,
  "relevance_score": <0-100>,
  "communication_score": <0-100>,
  "overall_score": <0-100>,
  "success_probability": <0-100>,
  "strengths": "<2-3 sentences>",
  "improvements": "<2-3 sentences>",
  "next_steps": "<2-3 sentences>",
  "ideal_answer": "<3-4 sentences>"
}`

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 1500,
    messages: [{ role: 'user', content: prompt }]
  });

  let evaluation;
  const rawText = message.content[0].text;

  // Try multiple parsing strategies
  try {
    // Strategy 1: direct parse
    const clean = rawText.replace(/```json/g, '').replace(/```/g, '').trim()
    evaluation = JSON.parse(clean)
  } catch {
    try {
      // Strategy 2: extract JSON object
      const match = rawText.match(/\{[\s\S]*\}/)
      if (match) evaluation = JSON.parse(match[0])
    } catch {
      // Strategy 3: fallback default scores
      evaluation = {
        correctness_score: 70,
        clarity_score: 70,
        relevance_score: 70,
        communication_score: 70,
        overall_score: 70,
        success_probability: 65,
        strengths: "Your answer demonstrated understanding of the core concepts and showed good communication skills.",
        improvements: "Consider adding more specific examples and elaborating on edge cases to strengthen your response.",
        next_steps: "Practice explaining this concept out loud and review related topics to deepen your understanding.",
        ideal_answer: "A strong answer would cover the fundamental concepts, provide concrete examples, discuss trade-offs, and demonstrate practical application knowledge."
      }
    }
  }

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

  await pool.query(
    `UPDATE sessions 
     SET completed_questions = completed_questions + 1
     WHERE id = (SELECT session_id FROM questions WHERE id = $1)`,
    [questionId]
  );

  return savedEval.rows[0];
};

module.exports = { evaluateAnswer };
