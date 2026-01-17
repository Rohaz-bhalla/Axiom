#!/usr/bin/env bun
import { runCLI } from "./cli";

const args = process.argv.slice(2); // ["start"]

const command = args[0];

switch (command) {
  case "start":
    runCLI();
    break;

  case "help":
  case "--help":
  case "-h":
    console.log(`
axiom — AI coding assistant

Usage:
  axiom start     Start interactive mode
  axiom help      Show help
`);
    break;

  case undefined:
    console.log("No command provided. Try: axiom start");
    break;

  default:
    console.log(`Unknown command: ${command}`);
    console.log("Try: axiom help");
}
