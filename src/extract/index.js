import parsePatch from './diffParser.js';
import { classifyChange } from './changeClassifier.js';
import { summarizeChanges } from './summarizer.js';
import { classifyDocChange } from './docClassifier.js';

export async function extractCommitSignals(commit) {
  const summaries = [];

  for (const file of commit.files) {
    console.log('FILE:', file.filename);
    console.log('HAS PATCH?', Boolean(file.patch));

    if (!file.patch) continue;

    const lines = parsePatch(file.patch);
    console.log('PARSED LINES:', lines.length);

    const ext = file.filename.split('.').pop().toLowerCase();
    let signals = [];

    if (['js', 'ts'].includes(ext)) {
      signals = classifyChange(lines);
    } 
    else if (ext === 'md') {
      console.log('USING DOC CLASSIFIER');
      console.log(lines.map(l => l.content));
      signals = classifyDocChange(lines);
    }

    if (signals.length === 0) continue;

    const summary = summarizeChanges(file, signals);
    summaries.push(summary);

    console.log('SIGNALS:', signals);
    console.log('SUMMARY:', summary);
  }

  return summaries;
}
