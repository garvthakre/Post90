export function summarizeChanges(file,signals) {
    //generate a summary object for each file change
    return {
        file:file.filename,
        type: file.status,
        signals,
        weight: file.additions + file.deletions
    }
}