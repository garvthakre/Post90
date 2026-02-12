import { callHuggingFace } from "./Provider.js";
import { TONES } from "./tones.js";

export async function rewritePost({
  basePost,
  intent,
  angle,
  facts,
  analysis,
  tone= "pro",
  constraints,
  seed = Date.now()
}) {
  const tonePrompts = TONES[tone] || TONES.pro;
  
  // Use seed to vary temperature slightly for different outputs
  const seedVariation = seed % 3; // 0, 1, or 2
  const temperature = 0.6 + (seedVariation * 0.15); // 0.6, 0.75, or 0.9
  
  // Determine length style based on maxLength
  let lengthStyle = 'balanced';
  let lengthGuidance = '';
  
  if (constraints.maxLength <= 600) {
    lengthStyle = 'quick';
    lengthGuidance = `
TARGET LENGTH: ${constraints.maxLength} characters (QUICK/PUNCHY)
- Keep it Twitter-like and impactful
- One main point, one insight
- Skip the lengthy explanations
- Get straight to the value
- Think: "What's the ONE takeaway?"`;
  } else if (constraints.maxLength <= 1200) {
    lengthStyle = 'standard';
    lengthGuidance = `
TARGET LENGTH: ${constraints.maxLength} characters (STANDARD)
- Balanced detail and readability
- Include: problem → solution → impact → insight
- Keep paragraphs short (2-3 sentences)
- One CTA question at the end`;
  } else {
    lengthStyle = 'detailed';
    lengthGuidance = `
TARGET LENGTH: ${constraints.maxLength} characters (DETAILED)
- Tell the full story with context
- Include: background → challenge → approach → results → learning
- Add specific technical details
- Can use multiple paragraphs
- Show your thought process`;
  }
  
  const prompt = `
You are rewriting a LinkedIn post for a developer. The base post is already good - your job is to make it ${lengthStyle} while keeping it authentic.

${lengthGuidance}

CRITICAL RULES:
- Keep the EXACT same meaning and facts
- Do NOT add new information or make claims not in the original
- Do NOT make it sound corporate or fake
- Keep it conversational and authentic
- The post should sound like a real developer, not a marketer
- Keep all specific technical details exactly as they are (library names, function names, etc.)
- Do NOT remove hashtags or the call-to-action question
- IMPORTANT: Your response should be APPROXIMATELY ${constraints.maxLength} characters

Base Post:
"""
${basePost}
"""

Your task:
- ${lengthStyle === 'quick' ? 'Condense to the most impactful points' : lengthStyle === 'detailed' ? 'Expand with more context and details' : 'Polish while keeping current length'}
- Fix any awkward phrasing
- Make sentences flow naturally
- ${lengthStyle === 'quick' ? 'Focus on ONE key message' : lengthStyle === 'detailed' ? 'Include background and technical depth' : 'Keep balanced structure'}
- Tone: ${tonePrompts}
- Variation seed: ${seed}

Respond with ONLY the rewritten post, no preamble or explanation:
`;

  return await callHuggingFace(prompt, {
    temperature,
    maxTokens: lengthStyle === 'quick' ? 200 : lengthStyle === 'detailed' ? 800 : 400,
  });
}

/**
 * batch rewrite - generate multiple tone variations in one call
 * Saves 66% of API calls
 */
export async function batchRewritePost({
  basePost,
  tones = ["pro", "fun", "concise"],
  maxLength = 1200,
  seed = Date.now()
}) {
  const toneList = tones.join(", ");
  
  const prompt = `Rewrite this LinkedIn post in ${tones.length} different tones: ${toneList}.
Keep the same meaning. Max ${maxLength} chars each.
Variation seed: ${seed}

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
    temperature: 0.6 + ((seed % 3) * 0.1)
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

export async function rewriteWithCache(basePost, tone, maxLength, seed) {
  const cacheKey = `${basePost.slice(0, 50)}-${tone}-${maxLength}-${seed}`;
  
  if (rewriteCache.has(cacheKey)) {
    console.log('✓ Using cached rewrite');
    return rewriteCache.get(cacheKey);
  }
  
  const result = await rewritePost({ 
    basePost, 
    tone, 
    constraints: { maxLength },
    seed 
  });
  
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