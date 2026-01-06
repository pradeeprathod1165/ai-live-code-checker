// src/monacoWorkers.js
self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === "typescript" || label === "javascript") {
      return new Worker(
        new URL(
          "monaco-editor/esm/vs/language/typescript/ts.worker",
          import.meta.url
        ),
        { type: "module" }
      );
    }

    return new Worker(
      new URL("monaco-editor/esm/vs/editor/editor.worker", import.meta.url),
      { type: "module" }
    );
  },
};
