const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

type GroqResponse = {
  choices?: {
    message?: {
      content?: string;
    };
  }[];
  error?: {
    message: string;
  };
};

export async function askGroq(
  systemPrompt: string,
  userInput: string
) {
  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "qwen/qwen3-32b",
      temperature: 0.2,
      stream: false,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userInput },
      ],
    }),
  });

  const json = (await res.json()) as GroqResponse;

  // 🔴 HANDLE GROQ ERRORS PROPERLY
  if (json.error) {
    throw new Error(`Groq API Error: ${json.error.message}`);
  }

  const content = json.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("Empty response from Groq");
  }

  return content;
}
