import fetch from "node-fetch";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const MODELS = {
  MIXTRAL: "mixtral-8x7b-32768",
  LLAMA3_70: "llama3-70b-8192",
  LLAMA3_8: "llama3-8b-8192",
  LLAMA_90: "llama-3.3-70b-versatile",
  GEMMA_7: "gemma-7b-it",
};

// Use smaller model for simple rewrites (faster + cheaper)
const DEFAULT_MODEL = MODELS.LLAMA3_8; // Changed from LLAMA_90

// System message - sent once, not repeated in every call
const SYSTEM_MESSAGE = "You polish LinkedIn posts for developers. Keep them authentic, conversational, and concise. Never add new information.";

export async function callHuggingFace(prompt, options = {}) {
  const apiKey = process.env.GROQ_API_KEY || process.env.HUGGINGFACE_API_KEY;
  
  if (!apiKey) {
    throw new Error("Missing API key. Please set GROQ_API_KEY in your .env file");
  }

  const {
    model = DEFAULT_MODEL,
    maxTokens = 150,      // Reduced from 300
    temperature = 0.6,
    systemMessage = SYSTEM_MESSAGE
  } = options;

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
          content: systemMessage
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(
      `Groq API Error: ${res.status} - ${errText}`
    );
  }

  const data = await res.json();
  
  // Log token usage for monitoring
  if (data.usage) {
    console.log(`Token usage: ${data.usage.total_tokens} (prompt: ${data.usage.prompt_tokens}, completion: ${data.usage.completion_tokens})`);
  }
  
  return data.choices?.[0]?.message?.content?.trim();
}

/**
 * Rate limiter for API calls
 */
class RateLimiter {
  constructor(maxRequestsPerMinute = 30) {
    this.maxRequests = maxRequestsPerMinute;
    this.requests = [];
  }
  
  async checkLimit() {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    // Remove old requests
    this.requests = this.requests.filter(time => time > oneMinuteAgo);
    
    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0];
      const waitTime = 60000 - (now - oldestRequest);
      
      console.log(`Rate limit reached. Waiting ${Math.ceil(waitTime / 1000)}s...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      
      // Recurse to check again
      return this.checkLimit();
    }
    
    this.requests.push(now);
  }
}

const rateLimiter = new RateLimiter(30); // 30 requests per minute

export async function callHuggingFaceWithRateLimit(prompt, options = {}) {
  await rateLimiter.checkLimit();
  return callHuggingFace(prompt, options);
}