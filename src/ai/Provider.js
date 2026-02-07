import fetch from "node-fetch";

const HF_API_URL = "https://router.huggingface.co/v1/chat/completions";

const MODELS = {
  MIXTRAL: "mixtral-8x7b-32768",
  LLAMA3_70: "llama3-70b-8192",
  LLAMA3_8: "llama3-8b-8192",
  GEMMA_7: "gemma-7b-it",
};

const DEFAULT_MODEL = MODELS.LLAMA3_70;

export async function callHuggingFace(prompt, model = DEFAULT_MODEL) {
  const res = await fetch(HF_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content: "You are an expert software engineer who writes excellent commit messages."
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
      `HuggingFace Groq Error: ${res.status} - ${errText}`
    );
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim();
}
