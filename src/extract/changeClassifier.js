export function classifyChange(lines) {
    
    let signals = new Set();
    for (const line of lines) {
        const c = line.content;
        if(/async|await/.test(c)) signals.add('async_change');
        if(/try\s*{/.test(c) || /catch\s*\(.*\)\s*{/.test(c) || /finally\s*{/.test(c)) signals.add('error_handling_change');
        if(/fetch\(|axios\.|http\.get\(|http\.post\(/.test(c)) signals.add('networking_change');
        if(/process\.env/.test(c)) signals.add('env_variable_change');
        if(/describe\(|it\(|test\(/.test(c)) signals.add('test_change');
        if(/function\s+\w+\s*\(.*\)\s*{/.test(c) || /\(.*\)\s*=>\s*{/.test(c)) signals.add('function_change');
        if(/class\s+\w+\s*{/.test(c)) signals.add('class_change');
        if(/import\s+.*\s+from\s+['"].*['"]/.test(c) || /require\(['"].*['"]\)/.test(c)) signals.add('import_change');
        if(/console\.log\(|console\.error\(|console\.warn\(/.test(c)) signals.add('logging_change');
        if(/\/\/\s*TODO|\/\/\s*FIXME/.test(c)) signals.add('todo_fixme_change');
        if(/new\s+Promise\(|\.then\(|\.catch\(/.test(c)) signals.add('promise_change');

    }
    return Array.from(signals);
}