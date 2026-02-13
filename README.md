# Post90

Transform your GitHub commits into authentic LinkedIn posts.

## Overview

Post90 analyzes your GitHub commit history and generates LinkedIn-ready posts that tell the real story behind your code. No corporate jargon—just authentic developer content.

## Features

- **Commit Analysis**: Extracts technical signals from your commit diffs (async patterns, error handling, networking, tests, etc.)
- **Smart Post Generation**: Creates context-aware posts based on what you actually built
- **Multiple Tones**: Professional, dev-life, fun, concise, detailed, optimistic
- **Three Length Options**: Quick (300-600), Standard (800-1200), Detailed (1500-2500 chars)
- **Daily Summaries**: Aggregate last 24 hours of commits into a single post
- **AI Polish** (optional): Uses Groq API to refine posts while keeping them authentic
- **Web Interface**: Modern Next.js UI with real-time generation and comparison

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file:

```env
# Required
GROQ_API_KEY=your_groq_api_key

# Optional
GITHUB_TOKEN=your_github_token
NODE_ENV=development
PORT=3001
CORS_ORIGINS=http://localhost:3000
```

Frontend config in `ui/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Usage

### Web Interface

Start backend:
```bash
npm run dev
```

Start frontend (in another terminal):
```bash
cd ui
npm run dev
```

Open `http://localhost:3000` and enter your GitHub username.

### Command Line

```bash
# Analyze all repos with activity in last 24h
npm start -- --author garvthakre

# Analyze specific repository
npm start -- --repo garvthakre/post90 --author garvthakre --mode daily

# Generate with specific tone
npm start -- --author garvthakre --tone fun

# Generate multiple variations
npm start -- --author garvthakre --variations 5 --tones "pro,fun,concise"

# Skip AI rewrite (faster)
npm start -- --author garvthakre --skip-ai
```

## How It Works

1. **Fetch**: Pulls commit data from GitHub API
2. **Extract**: Parses diffs to identify code change patterns
3. **Analyze**: Detects features, problems, and solutions from commits
4. **Generate**: Creates post ideas ranked by relevance
5. **Compose**: Builds LinkedIn-ready posts with hooks, insights, and CTAs
6. **Polish** (optional): AI refinement while maintaining authenticity

## Project Structure

```
src/
├── ai/           # AI providers and post rewriting
├── analyze/      # Commit analysis and feature extraction
├── extract/      # Diff parsing and signal classification
├── fetch/        # GitHub API integration
├── post/         # Post generation and composition
└── utils/        # Emoji mapping and stats widgets

server/
├── config/       # Environment and CORS setup
├── controllers/  # API route handlers
├── middleware/   # Security and rate limiting
└── routes/       # Express routes

ui/
└── app/
    ├── components/   # React components
    ├── Post/         # Generation page
    └── lib/          # API client and hooks
```

## API

### POST `/api/generate`

```json
{
  "username": "garvthakre",
  "repo": "garvthakre/post90",
  "tones": ["pro", "fun"],
  "postLength": "standard",
  "useEmojis": true,
  "statsStyle": "compact"
}
```

### GET `/api/health`
Check server status.

### GET `/api/validate-username?username=garvthakre`
Validate GitHub username.

## Example Output

**Professional Tone:**
```
Built authentication system that handles concurrent login sessions without race conditions.

The challenge: Managing concurrent login sessions without race conditions

Implemented token refresh logic with automatic retry and race condition handling

Impact: Users can now stay logged in reliably across devices

Key learning: Token refresh is trickier than it looks - you need to handle edge cases 
like expired refresh tokens and concurrent requests trying to refresh simultaneously.

How do you handle session management in your apps?

#WebDev #Auth #Security #JWT #OAuth
```

## License

MIT

## Contributing

Issues and PRs welcome. Keep it simple and authentic.

## Contact

- Twitter: [@garvthakre](https://twitter.com/garvthakre)
- GitHub: [@garvthakre](https://github.com/garvthakre)
- Email: garvthakre0@gmail.com




