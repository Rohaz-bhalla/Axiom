import fs from "fs";

export function applyPatch(result: any) {
  const filePath = result.file;

  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const original = fs.readFileSync(filePath, "utf-8");
  let updated = original;

  for (const step of result.patch) {
    if (!updated.includes(step.search)) {
      throw new Error("Search block not found in file");
    }
    updated = updated.replace(step.search, step.replace);
  }

  return { original, updated };
}
