export function extractJSON(raw: string): string | null {
  const firstBrace = raw.indexOf("{");
  const lastBrace = raw.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1) return null;

  const json = raw.slice(firstBrace, lastBrace + 1);

  try {
    JSON.parse(json);
    return json;
  } catch {
    return null;
  }
}
