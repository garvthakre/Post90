export function classifyDocChange(lines) {
  const signals = new Set();

  for (const line of lines) {
    const c = line.content.toLowerCase();

    // headings
    if (/^#+\s/.test(c)) signals.add('doc_heading_change');

    // images / assets
    if (c.includes('github.com/user-attachments') || c.match(/\.(png|jpg|jpeg|gif|svg)$/)) {
      signals.add('doc_image_change');
    }

    // tech / stack mentions
    if (c.includes('built with') || c.includes('powered by')) {
      signals.add('doc_tech_stack_change');
    }

    // links
    if (c.startsWith('http')) {
      signals.add('doc_link_change');
    }

    // empty line cleanup
    if (c.trim() === '') {
      signals.add('doc_formatting_change');
    }
  }

  return Array.from(signals);
}
