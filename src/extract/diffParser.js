export async function parsPatch(patch) {
    //this is used to extract added and removed lines from a git diff patch 
    // ,it will keep the lines starting with + or - and ignore the rest
    if(!patch) return [];
    const lines = patch.split('\n');
    return lines.filter(line => line.startsWith('+') || line.startsWith('-'))
        .map(line => ({
            type: line.startsWith('+') ? 'addition' : 'deletion',
            content: line.slice(1).trim()
        }))
    
}

 