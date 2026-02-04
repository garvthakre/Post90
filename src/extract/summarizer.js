export function summarizeChanges(file,signals) {
    return {
        file:file.filename,
        type: file.status,
        signals,
        weight: file.additions + file.deletions
    }
}