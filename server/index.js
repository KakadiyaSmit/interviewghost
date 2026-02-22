console.log("✅ index.js started");
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("InterviewGhost API is live ✅  Try /health");
  });

app.get("/health", (req, res) => {
  res.json({ status: "InterviewGhost API Running 🚀" });
});

app.get("/question", (req, res) => {
  res.json({
    question: "Explain the difference between let, const, and var in JavaScript."
  });
});

app.post("/evaluate", (req, res) => {
  const { answer } = req.body;

  if (!answer || answer.trim().length === 0) {
    return res.status(400).json({ error: "Answer is required" });
  }

  // Fake evaluation logic (for now)
  const lengthScore = Math.min(10, Math.ceil(answer.trim().length / 40));
  const feedback =
    lengthScore >= 7
      ? "Good explanation. Try adding a real example and mention scope/hoisting."
      : "Too short. Explain each keyword and add a simple example.";

  res.json({
    overallScore: lengthScore,
    feedback,
  });
});

app.listen(5050, () => {
  console.log("Server running on http://localhost:5050");
});