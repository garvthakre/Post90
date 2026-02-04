import { parsePatch } from '../utils/patchParser.js';
import { classifyChange } from './classifier.js';
import { summarizeChanges } from './summarizer.js';


export function extractCommitSignals(commit){
    const summaries = [];

    for(const file of commit.files){
        const lines = parsePatch(file.patch);
        const signals = classifyChange(lines);
        if(signals.length === 0) continue;
        summaries.push(summarizeChanges(file,signals));
    }
    return summaries;
}