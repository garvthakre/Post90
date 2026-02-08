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
You are rewriting a LinkedIn post for a developer. The base post is already good - your job is to make it slightly more polished while keeping it authentic.

CRITICAL RULES:
- Keep the EXACT same meaning and facts
- Do NOT add new information or make claims not in the original
- Do NOT make it sound corporate or fake
- Keep it conversational and authentic
- The post should sound like a real developer, not a marketer
- Keep all specific technical details exactly as they are
- Do NOT remove hashtags or the call-to-action question

Base Post:
"""
${basePost}
"""

Your task:
- Fix any awkward phrasing
- Make sentences flow naturally
- Keep the same structure (problem → solution → impact → learning → question → hashtags)
- Keep it under ${constraints.maxLength} characters
- Tone: ${tonePrompts}

Respond with ONLY the rewritten post, no preamble or explanation:
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