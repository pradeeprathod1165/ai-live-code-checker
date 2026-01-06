import { ESLint } from "eslint";

const eslint = new ESLint();

export async function checkJS(code) {
  const results = await eslint.lintText(code);
  return results[0].messages;
}
