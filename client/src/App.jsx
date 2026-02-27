import { useState } from "react";

export default function App() {
  const [question, setQuestion] = useState("Click the button to get a question");
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState(null);

  const getQuestion = () => {
    fetch("http://localhost:5050/question")
      .then((res) => res.json())
      .then((data) => {
        setQuestion(data.question);
        setAnswer("");
        setResult(null);
      })
      .catch(() => {
        setQuestion("❌ Could not fetch question");
      });
  };

  const submitAnswer = () => {
    fetch("http://localhost:5050/evaluate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answer }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed");
        setResult(data);
      })
      .catch((err) => {
        setResult({ overallScore: 0, feedback: "❌ " + err.message });
      });
  };

  return (
    <div style={{ maxWidth: 800, margin: "60px auto", fontFamily: "system-ui" }}>
      <h1 style={{ textAlign: "center" }}>InterviewGhost 👻</h1>

      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <button
          onClick={getQuestion}
          style={{ padding: "10px 16px", fontSize: 16, cursor: "pointer" }}
        >
          Get Interview Question
        </button>
      </div>

      <div style={{ padding: 16, border: "1px solid #444", borderRadius: 10 }}>
        <h3>Question</h3>
        <p style={{ fontSize: 18 }}>{question}</p>

        <h3>Your Answer</h3>
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          rows={6}
          style={{ width: "100%", fontSize: 16, padding: 10 }}
          placeholder="Type your answer here..."
        />

        <div style={{ marginTop: 12 }}>
          <button
            onClick={submitAnswer}
            style={{ padding: "10px 16px", fontSize: 16, cursor: "pointer" }}
          >
            Submit Answer
          </button>
        </div>

        {result && (
          <div style={{ marginTop: 20 }}>
            <h3>Evaluation</h3>
            <p style={{ fontSize: 18 }}>
              Score: <b>{result.overallScore}/10</b>
            </p>
            <p>{result.feedback}</p>
          </div>
        )}
      </div>
    </div>
  );
}