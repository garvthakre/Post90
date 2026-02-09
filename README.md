# Post90

Transform your GitHub commits into authentic LinkedIn posts.

## Overview

Post90 analyzes your GitHub commit history and generates LinkedIn-ready posts that tell the real story behind your code. No corporate jargon—just authentic developer content.

## Features

- **Commit Analysis**: Extracts technical signals from your commit diffs (async patterns, error handling, networking, tests, etc.)
- **Smart Post Generation**: Creates context-aware posts based on what you actually built
- **Multiple Tones**: Professional, dev-life, fun, concise, detailed, optimistic
- **Daily Summaries**: Aggregate last 24 hours of commits into a single post
- **AI Polish** (optional): Uses Groq API to refine posts while keeping them authentic

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file:

```env
GITHUB_TOKEN=your_github_token
GROQ_API_KEY=your_groq_api_key  # Optional, for AI rewrite
```

## Usage

### Single Commit
```bash
npm start -- --repo owner/repo --sha abc123 --mode single
```

### Daily Summary (Last 24 Hours)
```bash
npm start -- --repo owner/repo --mode daily
```

### Filter by Author
```bash
npm start -- --repo owner/repo --author username --mode daily
```

### Skip AI Rewrite (Faster)
```bash
npm start -- --repo owner/repo --mode daily --skip-ai
```

### Custom Tone
```bash
npm start -- --repo owner/repo --mode daily --tone devlife
```

Available tones: `pro`, `devlife`, `fun`, `concise`, `detailed`, `optimistic`

## How It Works

1. **Fetch**: Pulls commit data from GitHub API
2. **Extract**: Parses diffs to identify code change patterns
3. **Analyze**: Detects features, problems, and solutions from commits
4. **Generate**: Creates post ideas ranked by relevance
5. **Compose**: Builds LinkedIn-ready posts with hooks, insights, and CTAs
6. **Polish** (optional): AI refinement while maintaining authenticity

## Example Output

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

## Project Structure

```
src/
├── ai/           # AI providers and post rewriting
├── analyze/      # Commit analysis and feature extraction
├── extract/      # Diff parsing and signal classification
├── fetch/        # GitHub API integration
└── post/         # Post generation and composition
```

## License

MIT

## Contributing

Issues and PRs welcome. Keep it simple and authentic.