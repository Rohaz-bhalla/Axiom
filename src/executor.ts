import fs from "fs";

export function applyPatch(result: any) {
  const filePath = result.file;

  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  let content = fs.readFileSync(filePath, "utf-8");

  for (const step of result.patch) {
    if (!content.includes(step.search)) {
      throw new Error("Search block not found in file");
    }
    content = content.replace(step.search, step.replace);
  }

  return content;
}
