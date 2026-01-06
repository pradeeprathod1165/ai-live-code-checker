export async function explainError(code, error) {
  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "deepseek-coder:6.7b-instruct",
      stream: false,
      prompt: `
You are an expert JavaScript developer and ESLint tutor.

The following JavaScript code has an ESLint error.

Code:
${code}

ESLint Error Details:
- Rule: ${error.ruleId}
- Message: ${error.message}
- Line: ${error.line}
- Column: ${error.column}

Explain:
1. What this ESLint rule means
2. Why this error happens in this code
3. How to fix it (show corrected code if needed)

Keep the explanation short, clear, and beginner-friendly.
`,
    }),
  });

  const data = await response.json();
  return data.response;
}
