import readline from "readline";
import { askGroq } from "./groq";
import { SYSTEM_PROMPT } from "./prompt";
import { loadFileContext } from "./context";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

export function runCLI() {
  console.log("⚡ groq-code (Bun + Groq)");
  prompt();
}

function prompt() {
  rl.question("› ", async (input) => {
    if (input === "exit") {
      rl.close();
      return;
    }

    let context = SYSTEM_PROMPT;

    // Example: /explain src/index.ts
    if (input.startsWith("/explain")) {
      const file = input.split(" ")[1];
      context += loadFileContext(file);
    }

    const res = await askGroq(input, context);
    console.log("\n" + res + "\n");

    prompt();
  });
}
