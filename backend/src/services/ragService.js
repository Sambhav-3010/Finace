import { spawn } from "node:child_process";

import { pythonRagDir, resolvePythonCommand } from "../config/paths.js";

export async function runGeneralQuery({ prompt, topK = 5, regulator = null, category = null }) {
  return new Promise((resolve, reject) => {
    const py = resolvePythonCommand();
    const args = [
      ...py.extraArgs,
      "-m",
      "api.general_query",
      "--prompt",
      prompt,
      "--top-k",
      String(topK),
    ];
    if (regulator) args.push("--regulator", regulator);
    if (category) args.push("--category", category);

    const child = spawn(py.exe, args, {
      cwd: pythonRagDir,
      env: {
        ...process.env,
        PYTHONWARNINGS: "ignore",
      },
      windowsHide: true,
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", (err) => {
      if (err.code === "ENOENT") {
        reject(
          new Error(
            "Python executable not found. Set PYTHON_RAG_EXE or create python-rag/.venv."
          )
        );
        return;
      }
      reject(err);
    });

    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(stderr || `Python exited with code ${code}`));
        return;
      }

      try {
        const parsed = JSON.parse(stdout.trim());
        resolve(parsed);
      } catch (err) {
        reject(
          new Error(`Invalid JSON from python service: ${err.message}\n${stdout}\n${stderr}`)
        );
      }
    });
  });
}
