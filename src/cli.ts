import readline from "readline";
import fs from "fs";
import { askGroq } from "./groq";
import { SYSTEM_PROMPT } from "./prompt";
import { loadFileContext } from "./context";
import { applyPatch } from "./executor";

/**
 * Extracts the first valid JSON object from model output
 * (handles <think>, EDIT:, explanations, etc.)
 */
function extractJSON(raw: string): string | null {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) return null;

  const candidate = raw.slice(start, end + 1);
  try {
    JSON.parse(candidate);
    return candidate;
  } catch {
    return null;
  }
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

export function runCLI() {
  console.log("⚡ axiom — AI coding assistant");
  console.log("Type 'exit' to quit\n");
  prompt();
}

function prompt() {
  rl.question("› ", async (input) => {
    if (input.trim().toLowerCase() === "exit") {
      rl.close();
      return;
    }

    let systemPrompt = SYSTEM_PROMPT;

    // 🔥 Detect edit intent
    const editIntent =
      /\b(add|fix|update|refactor|modify|create)\b/i.test(input) &&
      /\.\w+/.test(input);

    // 🔥 Load file context if a file is mentioned
    if (editIntent) {
      const match = input.match(/\S+\.(ts|js|tsx|jsx|json|md)/);
      if (match) {
        systemPrompt += loadFileContext(match[0]);
      }
    }

    let raw: string;
    try {
      raw = await askGroq(systemPrompt, input);
    } catch (e: any) {
      console.error("❌ Groq error:", e.message);
      return prompt();
    }

    // 🔥 Extract JSON safely
    const extracted = extractJSON(raw);

    if (editIntent && !extracted) {
      console.error("❌ Model did not return valid JSON. Edit aborted.\n");
      console.error(raw);
      return prompt();
    }

    let result: any;
    try {
      result = extracted ? JSON.parse(extracted) : JSON.parse(raw);
    } catch {
      console.error("❌ Failed to parse model response.\n");
      console.error(raw);
      return prompt();
    }

    // =========================
    // 🔥 EDIT FILE ACTION
    // =========================
    if (result.action === "edit_file") {
      if (
        typeof result.file !== "string" ||
        !Array.isArray(result.patch)
      ) {
        console.error("❌ Invalid edit_file schema. Aborted.");
        return prompt();
      }

      try {
        const { original, updated } = applyPatch(result);

        console.log(`\nProposed changes to ${result.file}`);
        console.log(`Reason: ${result.reason}\n`);

        rl.question("Apply changes? (y/n) ", (ans) => {
          if (ans.toLowerCase() === "y") {
            fs.writeFileSync(result.file, updated);
            console.log("✅ Changes applied\n");
          } else {
            console.log("❌ Aborted\n");
          }
          prompt();
        });

      } catch (err: any) {
        console.error("❌ Patch failed:", err.message);
        prompt();
      }

      return;
    }

    // =========================
    // 🔹 NORMAL REPLY
    // =========================
    if (result.action === "reply") {
      console.log("\n" + result.message + "\n");
      return prompt();
    }

    console.error("❌ Unknown action returned by model.");
    prompt();
  });
}
