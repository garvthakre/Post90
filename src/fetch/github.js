import axios from 'axios';
import fs from 'fs-extra';    
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 *  Fetch user's recent activity events (pushes, commits)
 * This is WAY more efficient than scanning all repos!
 * GitHub Events API shows what the user actually did in last 24h
 */
async function fetchUserRecentActivity(username) {
    const url = `https://api.github.com/users/${username}/events`;
    const params = {
        per_page: 100  // Last 100 events (covers way more than 24h)
    };
    
    const headers = {
        'Accept': 'application/vnd.github.v3+json'
    };
    
    // Add auth if token available (optional for public repos)
    if (process.env.GITHUB_TOKEN) {
        headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
    }
    
    console.log(`📡 Fetching recent activity for @${username}...`);
    
    const res = await axios.get(url, {
        headers,
        params
    });
    
    const events = res.data;
    
    // Filter to last 24 hours
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    const recentEvents = events.filter(event => {
        const eventTime = new Date(event.created_at).getTime();
        return eventTime > oneDayAgo;
    });
    
    // Extract repos where user pushed commits
    const reposWithActivity = new Set();
    
    for (const event of recentEvents) {
        // PushEvent = commits pushed
        if (event.type === 'PushEvent') {
            reposWithActivity.add(event.repo.name);
        }
        // CreateEvent with commits
        else if (event.type === 'CreateEvent' && event.payload.ref_type === 'repository') {
            reposWithActivity.add(event.repo.name);
        }
    }
    
    const repos = Array.from(reposWithActivity);
    
    console.log(`✅ Found activity in ${repos.length} repositories in last 24h`);
    console.log(`   (Scanned ${recentEvents.length} events instead of all repos)`);
    
    return repos;
}

async function fetchCommit(repo, sha) {
    const url = `https://api.github.com/repos/${repo}/commits/${sha}`;
    
    const headers = {
        'Accept': 'application/vnd.github.v3+json'
    };
    
    // Add auth if token available (optional for public repos)
    if (process.env.GITHUB_TOKEN) {
        headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
    }
    
    const res = await axios.get(url, { headers });
    
    const outputDir = path.join(__dirname,'../../data/raw');
    await fs.ensureDir(outputDir);
    const filepath = path.join(outputDir,`${repo.replace('/','_')}_${sha}.json`);
    await fs.writeJson(filepath,res.data,{spaces:2});
    console.log(`Commit data saved to ${filepath}`);
    return filepath;
}

async function fetchCommitsLast24Hours(repo, author = null) {
    // Calculate timestamp for 24 hours ago
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const url = `https://api.github.com/repos/${repo}/commits`;
    const params = {
        since: since,
        per_page: 100
    };
    
    if (author) {
        params.author = author;
    }
    
    console.log(`Fetching commits from ${repo}${author ? ` by @${author}` : ''}...`);
    
    const headers = {
        'Accept': 'application/vnd.github.v3+json'
    };
    
    // Add auth if token available (optional for public repos)
    if (process.env.GITHUB_TOKEN) {
        headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
    }
    
    const res = await axios.get(url, {
        headers,
        params
    });
    
    const commits = res.data;
    
    if (commits.length === 0) {
        console.log(`     ⊘ No commits found`);
        return [];
    }
    
    console.log(`     ✓ Found ${commits.length} commits`);
    
    // Fetch detailed info for each commit
    const detailedCommits = [];
    for (const commit of commits) {
        const detailUrl = `https://api.github.com/repos/${repo}/commits/${commit.sha}`;
        const detailRes = await axios.get(detailUrl, { headers });
        detailedCommits.push(detailRes.data);
        
        // Save individual commit
        const outputDir = path.join(__dirname,'../../data/raw');
        await fs.ensureDir(outputDir);
        const filepath = path.join(outputDir,`${repo.replace('/','_')}_${commit.sha}.json`);
        await fs.writeJson(filepath, detailRes.data, {spaces:2});
    }
    
    // Save aggregated commits
    const outputDir = path.join(__dirname,'../../data/raw');
    await fs.ensureDir(outputDir);
    const aggregatedPath = path.join(outputDir, `${repo.replace('/','_')}_last24h.json`);
    await fs.writeJson(aggregatedPath, detailedCommits, {spaces:2});
    
    return detailedCommits;
}

/**
 * OLD METHOD: Fetch all user repos (kept for backward compatibility)
 * This is slower - prefer fetchUserRecentActivity() instead
 */
async function fetchUserRepos(username) {
    const url = `https://api.github.com/users/${username}/repos`;
    const params = {
        type: 'owner',
        sort: 'updated',
        per_page: 100
    };
    
    const headers = {
        'Accept': 'application/vnd.github.v3+json'
    };
    
    if (process.env.GITHUB_TOKEN) {
        headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
    }
    
    console.log(`Fetching all repositories for user ${username}...`);
    
    const res = await axios.get(url, {
        headers,
        params
    });
    
    const repos = res.data.map(repo => repo.full_name);
    console.log(`Found ${repos.length} repositories`);
    
    return repos;
}

export { 
    fetchCommit, 
    fetchCommitsLast24Hours, 
    fetchUserRepos,
    fetchUserRecentActivity   
};