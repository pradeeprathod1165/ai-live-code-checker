import { useRef } from "react";
import Editor from "@monaco-editor/react";

let hoverErrorData = null;
let debounceTimer = null;
let hoverRegistered = false;
let codeActionRegistered = false;

const MARKER_OWNER = "eslint-ai";

export default function CodeEditor() {
  const editorRef = useRef(null);

  async function fixCode() {
    if (!editorRef.current || !hoverErrorData) return;

    const code = editorRef.current.getValue();

    const res = await fetch("http://localhost:3000/fix", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        error: hoverErrorData,
      }),
    });

    const data = await res.json();

    if (data.fixedCode) {
      editorRef.current.setValue(data.fixedCode);
    }
  }

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;
    const model = editor.getModel();

    monaco.editor.setModelLanguage(model, "javascript");

    // ✅ HOVER PROVIDER
    if (!hoverRegistered) {
      monaco.languages.registerHoverProvider("javascript", {
        provideHover(_, position) {
          if (hoverErrorData && position.lineNumber === hoverErrorData.line) {
            return {
              contents: [
                { value: `### ❌ ${hoverErrorData.ruleId}` },
                { value: hoverErrorData.explanation || "Fix available" },
              ],
            };
          }
        },
      });
      hoverRegistered = true;
    }

    // ✅ CODE ACTION (💡 FIX WITH AI)
    if (!codeActionRegistered) {
      monaco.languages.registerCodeActionProvider("javascript", {
        provideCodeActions(model, range) {
          if (
            !hoverErrorData ||
            range.startLineNumber !== hoverErrorData.line
          ) {
            return { actions: [], dispose: () => {} };
          }

          return {
            actions: [
              {
                title: "✨ Fix with AI",
                kind: "quickfix",
                isPreferred: true,
                run: fixCode,
              },
            ],
            dispose: () => {},
          };
        },
      });

      codeActionRegistered = true;
    }

    // ✅ LIVE ESLINT CHECK
    editor.onDidChangeModelContent(() => {
      clearTimeout(debounceTimer);

      debounceTimer = setTimeout(async () => {
        const code = editor.getValue();

        const res = await fetch("http://localhost:3000/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });

        const data = await res.json();

        monaco.editor.setModelMarkers(model, MARKER_OWNER, []);
        hoverErrorData = null;

        if (!data.error) return;

        const col = Number.isInteger(data.error.column) ? data.error.column : 1;

        hoverErrorData = {
          line: data.error.line,
          ruleId: data.error.ruleId,
          explanation: data.explanation,
        };

        monaco.editor.setModelMarkers(model, MARKER_OWNER, [
          {
            startLineNumber: data.error.line,
            endLineNumber: data.error.line,
            startColumn: col,
            endColumn: col + 1,
            message: data.error.message,
            severity: monaco.MarkerSeverity.Error,
          },
        ]);
      }, 400);
    });
  }

  return (
    <Editor
      height="100vh"
      defaultLanguage="javascript"
      defaultValue={`function test() {
  console.log("hi")
}`}
      theme="vs-dark"
      onMount={handleEditorDidMount}
    />
  );
}
