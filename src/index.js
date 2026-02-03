import dotenv from 'dotenv';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { fetchCommit } from './fetch/github.js';

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
  const { repo, sha } = argv;
  console.log(`Fetching commit ${sha} from ${repo}`);
  await fetchCommit(repo, sha);
  console.log('Done');
})();
