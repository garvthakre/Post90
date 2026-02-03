import dotenv from 'dotenv';
 
import yargs from 'yargs';

dotenv.config();

const argv = yargs.option('repo',{
    type:'string',
    demandOption:true,
    describe:'GitHub repository in the format owner/repo'
}).option('sha',{
    type:'string',
    demandOption:true,
    describe:'Commit SHA to check'
}).help().argv;

(async ()=>{
    const {repo,sha} = argv;
    console.log(`fetching Commit ${sha} from ${repo}`);
    await fetchcommit(repo,sha);
    console.log('Done');
})();