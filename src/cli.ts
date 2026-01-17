import readline from "readline";
import fs from "fs";
import { askGroq } from "./groq";
import { SYSTEM_PROMPT } from "./prompt";
import { loadFileContext } from "./context";
import { applyPatch } from "./executor";

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
    if (input === "exit") {
      rl.close();
      return;
    }

    let systemPrompt = SYSTEM_PROMPT;

    // Attach file context if mentioned
    if (input.startsWith("fix") || input.startsWith("refactor")) {
      const file = input.split(" ").pop();
      systemPrompt += loadFileContext(file);
    }

    let raw;
    try {
      raw = await askGroq(systemPrompt, input);
    } catch (e: any) {
      console.error("Groq error:", e.message);
      return prompt();
    }

    let result;
    try {
      result = JSON.parse(raw);
    } catch {
      // Normal text reply
      console.log("\n" + raw + "\n");
      return prompt();
    }

    // 🔥 Codex-style edit
    if (result.action === "edit_file") {
      try {
        const updated = applyPatch(result);

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

    // Normal reply
    if (result.action === "reply") {
      console.log("\n" + result.message + "\n");
      prompt();
      return;
    }

    prompt();
  });
}
