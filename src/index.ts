#!/usr/bin/env bun
import { runCLI } from "./cli";

const args = process.argv.slice(2); // ["start"]

const command = args[0];

switch (command) {
  case "start":
    runCLI();
    break;

  case "help":
    console.log(`
axiom - AI coding assistant

Usage:
  axiom start     Start interactive mode
  axiom help      Show help
  axiom version   Show version
`);
    break;

  case "version":
    console.log("axiom v0.1.0");
    break;

  default:
    console.log("Unknown command:", command);
    console.log("Run: axiom help");
}
