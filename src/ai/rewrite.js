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
/**
 * batch rewrite - generate multiple tone variations in one call
 * Saves 66% of API calls
 */
export async function batchRewritePost({
  basePost,
  tones = ["pro", "fun", "concise"],
  maxLength = 300
}) {
  const toneList = tones.join(", ");
  
  const prompt = `Rewrite this LinkedIn post in ${tones.length} different tones: ${toneList}.
Keep the same meaning. Max ${maxLength} chars each.

Original:
${basePost}

Format your response as:

[${tones[0].toUpperCase()}]
...post...

[${tones[1].toUpperCase()}]
...post...

${tones[2] ? `[${tones[2].toUpperCase()}]\n...post...` : ''}

Start now:`;

  const response = await callHuggingFace(prompt, {
    maxTokens: 250 * tones.length,
    temperature: 0.6
  });
  
  // Parse the response into separate posts
  return parseMultiplePosts(response, tones);
}

/**
 * Check if post needs rewriting
 * Skip AI call if post is already good
 */
export function needsRewrite(basePost) {
  // Already short and clean
  if (basePost.length < 250 && !basePost.includes('  ')) {
    return false;
  }
  
  // Has obvious issues
  if (basePost.includes('  ') || basePost.length > 350) {
    return true;
  }
  
  // Check for awkward patterns
  const awkwardPatterns = [
    /\s{2,}/,           // Multiple spaces
    /\n{3,}/,           // Too many newlines
    /[A-Z]{4,}/,        // CAPS LOCK
    /([.!?]){2,}/       // Multiple punctuation
  ];
  
  return awkwardPatterns.some(pattern => pattern.test(basePost));
}

/**
 * Simple cache for rewrite results
 * Avoid re-rewriting the same content
 */
const rewriteCache = new Map();

export async function rewriteWithCache(basePost, tone, maxLength) {
  const cacheKey = `${basePost.slice(0, 50)}-${tone}`;
  
  if (rewriteCache.has(cacheKey)) {
    console.log('✓ Using cached rewrite');
    return rewriteCache.get(cacheKey);
  }
  
  const result = await rewritePost({ basePost, tone, maxLength });
  
  // Keep cache size reasonable
  if (rewriteCache.size > 100) {
    const firstKey = rewriteCache.keys().next().value;
    rewriteCache.delete(firstKey);
  }
  
  rewriteCache.set(cacheKey, result);
  return result;
}

// Helper: Parse multiple posts from batch response
function parseMultiplePosts(response, tones) {
  const posts = {};
  
  for (const tone of tones) {
    const regex = new RegExp(`\\[${tone.toUpperCase()}\\]\\s*([\\s\\S]*?)(?=\\[|$)`, 'i');
    const match = response.match(regex);
    
    if (match && match[1]) {
      posts[tone] = match[1].trim();
    } else {
      // Fallback: split by tone markers
      posts[tone] = response; // Better than nothing
    }
  }
  
  return posts;
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