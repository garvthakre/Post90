/**
 * API Client for POST90 Backend
 * Handles all communication with the Node.js backend
 */

const  API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://your-api-domain.com/api' 
    : 'http://localhost:3001/api');

const TIMEOUT_MS = 30000; 
export interface GeneratePostsRequest {
  username: string;
  repo?: string;
  tones: string[];
  useEmojis: boolean;
  statsStyle: string;
  seed?: number;  
}

export interface Post {
  id: number;
  tone: string;
  content: string;
  length: number;
  hashtags: string[];
}

export interface CommitStats {
  totalCommits: number;
  totalFilesChanged: number;
  totalWeight: number;
  signals: { [key: string]: number };
  impacts: {
    HIGH_RISK: number;
    MEDIUM_RISK: number;
    LOW_RISK: number;
  };
  feature: string;
  repoCount: number;
  repos: string[];
}

export interface GeneratePostsResponse {
  success: boolean;
  data: {
    username: string;
    repo?: string;
    tones: string[];
    posts: Post[];
    stats: CommitStats;
  };
  error?: string;
}

async function fetchWithTimeout(url: string, options: RequestInit = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeout);
    return response;
  } catch (error) {
    clearTimeout(timeout);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout - please try again');
    }
    throw error;
  }
}

export async function generatePosts(
  request: GeneratePostsRequest
): Promise<GeneratePostsResponse> {
  const response = await fetchWithTimeout(`${API_BASE_URL}/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || 
      errorData.error || 
      `HTTP ${response.status}: ${response.statusText}`
    );
  }

  return response.json();
}

/**
 * Health check endpoint
 */
export async function healthCheck(): Promise<{ status: string; timestamp: string }> {
  const response = await fetch(`${API_BASE_URL}/health`);
  
  if (!response.ok) {
    throw new Error('Backend is not responding');
  }
  
  return response.json();
}

/**
 * Validate GitHub username
 */
export async function validateGitHubUsername(
  username: string
): Promise<{ valid: boolean; message?: string }> {
  const response = await fetch(
    `${API_BASE_URL}/validate-username?username=${encodeURIComponent(username)}`
  );
  
  if (!response.ok) {
    throw new Error('Failed to validate username');
  }
  
  return response.json();
}

