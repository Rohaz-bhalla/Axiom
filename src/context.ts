import { existsSync, readFileSync } from "fs";

export function loadFileContext(file?: string) {
  if (!file || !existsSync(file)) return "";
  return `
FILE: ${file}
----------------
${readFileSync(file, "utf-8")}
----------------
`;
}
