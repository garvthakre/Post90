import dotenv from 'dotenv';
import yargs from 'yargs';
import fs from 'fs';
import { hideBin } from 'yargs/helpers';
import { fetchCommit } from './fetch/github.js';
import { extractCommitSignals } from './extract/index.js';

dotenv.config();
 

  

const argv = yargs(hideBin(process.argv))
  .option('repo', {
    type: 'string',
    demandOption: true,
    describe: 'GitHub repository in the format owner/repo'
  })
  .option('sha', {
    type: 'string',
    demandOption: true,
    describe: 'Commit SHA to check'
  })
  .help()
  .parse();

(async () => {
  const { repo, sha } = argv

  console.log(`Fetching commit ${sha} from ${repo}`)
  const rawPath = await fetchCommit(repo, sha)

  console.log(`Reading raw commit data from ${rawPath}`)
  const rawCommit = JSON.parse(fs.readFileSync(rawPath, 'utf-8'))

  console.log('Extracting signals...')
  const signals = extractCommitSignals(rawCommit)

  console.log('\n EXTRACTED SIGNALS :\n')
  console.log(JSON.stringify(signals, null, 2))
  console.log('Done');
})();
