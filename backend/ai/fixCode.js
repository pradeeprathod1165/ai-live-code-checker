export async function fixCodeWithAI(code, error) {
  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "deepseek-coder:6.7b-instruct",
      stream: false,
      prompt: `
You are a senior JavaScript developer.

Fix the following error WITHOUT changing unrelated code.

Error:
${error.message}

Code:
${code}

Return ONLY the corrected full code.
`,
    }),
  });

  const data = await response.json();
  return data.response;
}
