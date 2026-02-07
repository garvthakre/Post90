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
  
  // Extract only essential facts to avoid token limit
  const essentialFacts = extractEssentialFacts(facts, analysis);
  
  const prompt = `
Rewrite this developer social media post to be more polished while keeping it authentic.

Rules:
- Keep the SAME meaning and facts
- Do NOT add new information
- Make it sound natural and conversational
- Remove any awkward phrasing
- Keep it under ${constraints.maxLength} characters

Tone: ${tonePrompts}

Original post:
"""
${basePost}
"""

Platform: ${constraints.platform}
Emoji allowed: ${constraints.emoji}

Rewrite the post (respond with ONLY the rewritten post, no preamble):
`;

  return await callHuggingFace(prompt);
}

function extractEssentialFacts(facts, analysis) {
  // Only extract the most important facts to keep prompt small
  const essential = {};
  
  if (facts.commits) essential.commits = facts.commits;
  if (facts.filesChanged) essential.filesChanged = facts.filesChanged;
  if (facts.signal) essential.mainFocus = facts.signal;
  if (facts.count) essential.count = facts.count;
  if (analysis?.totalWeight) essential.totalWeight = analysis.totalWeight;
  
  return essential;
}