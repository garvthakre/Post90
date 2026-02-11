import axios from 'axios';
import fs from 'fs-extra';    
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


async function fetchCommit(repo,sha) {
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
    
    console.log(`Fetching commits from ${repo} since ${since}${author ? ` by ${author}` : ''}`);
    
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
    console.log(`Found ${commits.length} commits in the last 24 hours`);
    
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
    console.log(`Aggregated commits saved to ${aggregatedPath}`);
    
    return detailedCommits;
}

async function fetchUserRepos(username) {
    const url = `https://api.github.com/users/${username}/repos`;
    const params = {
        type: 'owner',  // Only repos owned by user
        sort: 'updated',
        per_page: 100
    };
    
    const headers = {
        'Accept': 'application/vnd.github.v3+json'
    };
    
    // Add auth if token available (optional for public repos)
    if (process.env.GITHUB_TOKEN) {
        headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
    }
    
    console.log(`Fetching repositories for user ${username}...`);
    
    const res = await axios.get(url, {
        headers,
        params
    });
    
    // Return array of repo full names (e.g., "username/repo-name")
    const repos = res.data.map(repo => repo.full_name);
    console.log(`Found ${repos.length} repositories`);
    
    return repos;
}

export { fetchCommit, fetchCommitsLast24Hours, fetchUserRepos };