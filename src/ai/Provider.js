import fetch from "node-fetch";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const MODELS = {
  MIXTRAL: "mixtral-8x7b-32768",
  LLAMA3_70: "llama3-70b-8192",
  LLAMA3_8: "llama3-8b-8192",
  LLAMA_90: "llama-3.3-70b-versatile",
  GEMMA_7: "gemma-7b-it",
};

const DEFAULT_MODEL = MODELS.LLAMA_90;

export async function callHuggingFace(prompt, model = DEFAULT_MODEL) {
  const apiKey = process.env.GROQ_API_KEY || process.env.HUGGINGFACE_API_KEY;
  
  if (!apiKey) {
    throw new Error("Missing API key. Please set GROQ_API_KEY in your .env file");
  }

  const res = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content: "You are an expert software engineer who writes excellent commit messages and social media posts about technical work."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.6,
      max_tokens: 300,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(
      `Groq API Error: ${res.status} - ${errText}`
    );
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim();
}