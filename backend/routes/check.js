import express from "express";
import { checkJS } from "../lint/jsChecker.js";
import { explainError } from "../ai/explainError.js";

const router = express.Router();

router.post("/", async (req, res) => {
  console.log("🛬 /check API HIT");

  const { code } = req.body;
  console.log("📄 CODE RECEIVED:\n", code);

  const errors = await checkJS(code);
  console.log("🚨 ESLINT ERRORS:", errors);

  if (!errors.length) {
    console.log("✅ NO ERRORS FOUND");
    return res.json({});
  }

  console.log("🧠 CALLING OLLAMA...");
  const explanation = await explainError(code, errors[0]);

  console.log("🧠 AI EXPLANATION:", explanation);

  res.json({
    error: errors[0],
    explanation,
  });
});

export default router;
