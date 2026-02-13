import { fetchCommitsLast24Hours, fetchUserRecentActivity } from '../../src/fetch/github.js';
import {   extractSpecificContext, formatSpecificContext, getPrimaryTech } from '../../src/extract/Specificextractor.js';
import { extractCommitSignals } from '../../src/extract/index.js';
import { analyzeCommit, analyzeMultipleCommits, extractFeatureFromCommits } from '../../src/analyze/commitAnalyzer.js';
import { generatePostIdeas } from '../../src/post/ideaGenerator.js';
import { composePost } from '../../src/post/Composer.js';
import { rewritePost } from '../../src/ai/rewrite.js';
import { enrichPostWithEmojis } from '../../src/utils/emojiMapper.js';
import { generateInlineStats } from '../../src/utils/statsWidget.js';

export async function generate(req, res) {
  const {
    username,
    repo,
    tones = ['pro', 'fun', 'concise'],
    useEmojis = true,
    statsStyle = 'compact',
    postLength = 'standard',  // NEW: quick | standard | detailed
    seed = Date.now(),  
  } = req.body;

  if (!username) {
    return res.status(400).json({ success: false, error: 'GitHub username is required' });
  }
  if (!Array.isArray(tones) || tones.length === 0 || tones.length > 10) {
  return res.status(400).json({ success: false, error: 'Invalid tones' });
}
  // Map postLength to character limits
  const lengthLimits = {
    quick: { min: 300, max: 600 },
    standard: { min: 800, max: 1200 },
    detailed: { min: 1500, max: 2500 }
  };
  
  const maxLength = lengthLimits[postLength]?.max || 1200;

  try {
    // ── 1. Resolve repos to scan ──────────────────────────────
    let repos = [];
    if (repo) {
      // User specified a repo → analyze ONLY that repo
      repos = [repo];
    } else {
      // No repo specified → analyze ALL repos with activity (last 24h)
      repos = await fetchUserRecentActivity(username);
      if (repos.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'No push activity found in the last 24 hours',
        });
      }
    }

    // ── 2. Fetch commits ──────────────────────────────────────
    const allCommits = [];
    const repoStats = {};

    for (const currentRepo of repos) {
      try {
        const commits = await fetchCommitsLast24Hours(currentRepo, username);
        if (commits.length > 0) {
          commits.forEach((c) => (c._repo = currentRepo));
          allCommits.push(...commits);
          repoStats[currentRepo] = commits.length;
        }
      } catch (err) {
        console.warn(`Skipping ${currentRepo}: ${err.message}`);
      }
    }

    if (allCommits.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No commits found in the last 24 hours',
      });
    }

    // ── 3. Extract specific context (NEW!) ────────────────────
    const specificContext = extractSpecificContext(allCommits);
    console.log('📊 Extracted specific context:', specificContext);

    // ── 4. Analyse commits ────────────────────────────────────
    const commitAnalyses = [];
    for (const commit of allCommits) {
      const signals = await extractCommitSignals(commit);
      const analysis = analyzeCommit(signals);
      commitAnalyses.push({
        sha: commit.sha,
        message: commit.commit.message,
        author: commit.commit.author.name,
        date: commit.commit.author.date,
        files: commit.files,
        repo: commit._repo,
        ...analysis,
      });
    }

    const aggregatedAnalysis = analyzeMultipleCommits(commitAnalyses);
    aggregatedAnalysis.repoCount = Object.keys(repoStats).length;
    aggregatedAnalysis.repos = Object.keys(repoStats);
    
    // Add specific context to analysis (NEW!)
    aggregatedAnalysis.specificContext = specificContext;

    // ── 5. Generate post ideas ────────────────────────────────
    const postIdeas = generatePostIdeas(aggregatedAnalysis);
    const topIdeas = postIdeas.slice(0, Math.min(tones.length, postIdeas.length));

    // ── 6. Build one post per tone ────────────────────────────
    const posts = [];
    for (let i = 0; i < tones.length; i++) {
      const tone = tones[i];
      const idea = topIdeas[i % topIdeas.length];

      let basePost = composePost(idea, aggregatedAnalysis, postLength); // Pass postLength

      if (statsStyle !== 'none' && aggregatedAnalysis.repoCount > 1) {
        const inlineStats = generateInlineStats(
          aggregatedAnalysis.totalCommits,
          aggregatedAnalysis.totalFilesChanged,
        );
        const lines = basePost.split('\n');
        lines.splice(1, 0, `\n${inlineStats} across ${aggregatedAnalysis.repoCount} projects`);
        basePost = lines.join('\n');
      }

      if (useEmojis && idea.metadata?.feature) {
        const dominantSignal = Object.keys(aggregatedAnalysis.signals).sort(
          (a, b) => aggregatedAnalysis.signals[b] - aggregatedAnalysis.signals[a],
        )[0];
        basePost = enrichPostWithEmojis(basePost, {
          feature: idea.metadata.feature,
          dominantSignal,
          impact: aggregatedAnalysis.impacts?.HIGH_RISK > 0 ? 'HIGH_RISK' : 'MEDIUM_RISK',
        });
      }

      let finalContent = basePost;
      try {
        finalContent = await rewritePost({
          basePost,
          intent: idea.type,
          angle: idea.angle,
          facts: {
            commits: aggregatedAnalysis.totalCommits,
            filesChanged: aggregatedAnalysis.totalFilesChanged,
          },
          tone,
          constraints: { 
            platform: 'linkedin', 
            maxLength: maxLength,  // Use dynamic length based on postLength setting
            emoji: useEmojis 
          },
          seed,
        });
      } catch (err) {
        console.warn(`AI rewrite failed for tone "${tone}", using base post: ${err.message}`);
      }

      posts.push({
        id: i + 1,
        tone,
        content: finalContent,
        length: finalContent.length,
        hashtags: finalContent.match(/#\w+/g) || [],
      });
    }

    // ── 7. Build stats payload ────────────────────────────────
    const feature = extractFeatureFromCommits(
      commitAnalyses.map((c) => ({ message: c.message })),
    );

    return res.json({
      success: true,
      data: {
        username,
        repo: repo || undefined,
        tones,
        posts,
        stats: {
          totalCommits: aggregatedAnalysis.totalCommits,
          totalFilesChanged: aggregatedAnalysis.totalFilesChanged,
          totalWeight: aggregatedAnalysis.totalWeight,
          signals: aggregatedAnalysis.signals,
          impacts: aggregatedAnalysis.impacts,
          feature,
          repoCount: aggregatedAnalysis.repoCount,
          repos: aggregatedAnalysis.repos,
          // NEW: Include specific context in stats
          specificContext: specificContext,
        },
      },
    });
  } catch (err) {
    console.error('Generate error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Internal server error' });
  }
}