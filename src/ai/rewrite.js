import { callHuggingFace } from "./Provider.js";

export async function rewritePost({
  basePost,
  intent,
  angle,
  facts,
  constraints
}) {
  const prompt = `
You are rewriting a developer social media post.

Rules:
- Do NOT add new facts
- Do NOT change the meaning
- Keep it authentic and concise
- Avoid buzzwords

Intent: ${intent}
Angle: ${angle}

Known facts:
${JSON.stringify(facts, null, 2)}

Base post:
"""
${basePost}
"""

Platform: ${constraints.platform}
Max length: ${constraints.maxLength}
Emoji allowed: ${constraints.emoji}

Rewrite the post:
`;

   return await callHuggingFace(prompt);
}
