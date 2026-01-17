import { diffLines } from "diff";

export function generateDiff(oldText: string, newText: string) {
  const changes = diffLines(oldText, newText);

  return changes
    .map((part) => {
      if (part.added) return `+ ${part.value}`;
      if (part.removed) return `- ${part.value}`;
      return `  ${part.value}`;
    })
    .join("");
}
