import express from "express";
import { fixCodeWithAI } from "../ai/fixCode.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { code, error } = req.body;

  if (!code || !error) {
    return res.status(400).json({ error: "Missing data" });
  }

  const fixedCode = await fixCodeWithAI(code, error);

  res.json({ fixedCode });
});

export default router;
