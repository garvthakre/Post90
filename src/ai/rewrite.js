import { callHuggingFace } from "./Provider.js";
 
import { TONES } from "./tones.js";
export async function rewritePost({
  basePost,
  intent,
  angle,
  facts,
  analysis,
  tone= "pro",
  constraints
}) {
    const tonePrompts = TONES[tone] || TONES.pro;
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

Analysis:
${JSON.stringify(analysis, null, 2)}
Tone instructions:
${tonePrompts}

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
