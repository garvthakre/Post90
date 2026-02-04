import {parsPatch} from './diffParser.js';
import { classifyChange } from './changeClassifier.js';
import { summarizeChanges } from './summarizer.js';

export async function extractCommitSignals(commit) {
  const summaries = [];

  for (const file of commit.files) {
         

    console.log('FILE:', file.filename);
    console.log('HAS PATCH?', Boolean(file.patch));

    if (!file.patch) continue;

    const lines =  await parsPatch(file.patch);
    console.log('PARSED LINES:', lines.length);

    const signals = classifyChange(lines);
    console.log('CLASSIFIED SIGNALS:', signals);

    if (signals.length === 0) continue;

    const summary = summarizeChanges(file, signals);
    summaries.push(summary);
  }

  return summaries;
}
