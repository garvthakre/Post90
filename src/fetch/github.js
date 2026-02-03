import axios from 'axios';
import fs from 'fs-extra';    
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


async function fetchCommit(repo,sha) {
    const url = `https://api.github.com/repos/${repo}/commits/${sha}`;
    const res = await axios.get(url, {
        headers: {
            'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json'
        }
    });
    const outputDir = path.join(__dirname,'../../data/raw');
    await fs.ensureDir(outputDir);
    const filepath = path.join(outputDir,`${repo.replace('/','_')}_${sha}.json`);
    await fs.writeJson(filepath,res.data,{spaces:2});
    console.log(`Commit data saved to ${filepath}`);
    
}
 export {fetchCommit};