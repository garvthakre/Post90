/**
 * Specific Context Extractor
 * Extracts concrete details from commits: libraries, functions, modules, keywords
 * This makes posts specific WITHOUT hardcoding tech stacks
 */

/**
 * Extract all specific context from commits
 */
export function extractSpecificContext(commits) {
  const allLibraries = new Set();
  const allFunctions = new Set();
  const allModules = new Set();
  const allKeywords = new Set();
  
  for (const commit of commits) {
    // Extract from commit message
    const messageKeywords = extractKeywordsFromMessage(commit.message || commit.commit?.message);
    messageKeywords.forEach(k => allKeywords.add(k));
    
    // Extract from files
    if (commit.files) {
      for (const file of commit.files) {
        // Get module/path info
        const modulePath = extractModulePath(file.filename);
        if (modulePath) allModules.add(modulePath);
        
        // Parse the diff patch
        if (file.patch) {
          const lines = file.patch.split('\n')
            .filter(line => line.startsWith('+'))
            .map(line => line.slice(1).trim());
          
          // Extract imports/libraries
          const libraries = extractLibraries(lines);
          libraries.forEach(lib => allLibraries.add(lib));
          
          // Extract function/class names
          const functions = extractFunctionNames(lines);
          functions.forEach(fn => allFunctions.add(fn));
        }
      }
    }
  }
  
  return {
    libraries: Array.from(allLibraries).slice(0, 5), // Top 5 most relevant
    functions: Array.from(allFunctions).slice(0, 5),
    modules: Array.from(allModules).slice(0, 5),
    keywords: Array.from(allKeywords).slice(0, 8)
  };
}

/**
 * Extract library/package names from import statements
 */
function extractLibraries(lines) {
  const libraries = new Set();
  
  for (const line of lines) {
    // ES6 imports: import { x } from 'library'
    const es6Match = line.match(/import\s+.*\s+from\s+['"]([^'"]+)['"]/);
    if (es6Match) {
      const lib = cleanLibraryName(es6Match[1]);
      if (lib) libraries.add(lib);
      continue;
    }
    
    // CommonJS: require('library')
    const cjsMatch = line.match(/require\s*\(\s*['"]([^'"]+)['"]\s*\)/);
    if (cjsMatch) {
      const lib = cleanLibraryName(cjsMatch[1]);
      if (lib) libraries.add(lib);
      continue;
    }
    
    // Python imports: from library import x, import library
    const pyFromMatch = line.match(/from\s+([a-zA-Z0-9_]+)\s+import/);
    if (pyFromMatch) {
      libraries.add(pyFromMatch[1]);
      continue;
    }
    
    const pyImportMatch = line.match(/import\s+([a-zA-Z0-9_]+)/);
    if (pyImportMatch) {
      libraries.add(pyImportMatch[1]);
      continue;
    }
  }
  
  return Array.from(libraries);
}

/**
 * Clean library name (remove path prefixes, get package name)
 */
function cleanLibraryName(rawName) {
  // Skip relative imports
  if (rawName.startsWith('.') || rawName.startsWith('/')) {
    return null;
  }
  
  // Extract package name from scoped packages: @org/package/sub -> @org/package
  if (rawName.startsWith('@')) {
    const parts = rawName.split('/');
    return parts.slice(0, 2).join('/');
  }
  
  // Extract main package: package/sub/path -> package
  const mainPackage = rawName.split('/')[0];
  
  // Filter out common/generic names
  const skipList = ['src', 'lib', 'utils', 'components', 'helpers', 'types', 'constants'];
  if (skipList.includes(mainPackage)) {
    return null;
  }
  
  return mainPackage;
}

/**
 * Extract function and class names from code
 */
function extractFunctionNames(lines) {
  const functions = new Set();
  
  for (const line of lines) {
    // Function declarations: function myFunction(
    const funcMatch = line.match(/function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/);
    if (funcMatch) {
      functions.add(funcMatch[1]);
      continue;
    }
    
    // Arrow functions assigned to const: const myFunc = (
    const arrowMatch = line.match(/const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(?:async\s*)?\(/);
    if (arrowMatch) {
      functions.add(arrowMatch[1]);
      continue;
    }
    
    // Class declarations: class MyClass {
    const classMatch = line.match(/class\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/);
    if (classMatch) {
      functions.add(classMatch[1]);
      continue;
    }
    
    // Method definitions: async myMethod(
    const methodMatch = line.match(/(?:async\s+)?([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\([^)]*\)\s*{/);
    if (methodMatch && !methodMatch[1].startsWith('if') && !methodMatch[1].startsWith('for')) {
      functions.add(methodMatch[1]);
      continue;
    }
    
    // Python function definitions: def my_function(
    const pyFuncMatch = line.match(/def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/);
    if (pyFuncMatch) {
      functions.add(pyFuncMatch[1]);
      continue;
    }
    
    // Python class: class MyClass:
    const pyClassMatch = line.match(/class\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*:/);
    if (pyClassMatch) {
      functions.add(pyClassMatch[1]);
    }
  }
  
  // Filter out common/test names
  const filtered = Array.from(functions).filter(fn => {
    const lower = fn.toLowerCase();
    return !lower.includes('test') && 
           !lower.includes('mock') && 
           !lower.includes('example') &&
           fn.length > 3; // Skip very short names
  });
  
  return filtered;
}

/**
 * Extract meaningful module/path information from file paths
 */
function extractModulePath(filepath) {
  // Skip common noise
  if (!filepath) return null;
  
  // Remove file extension
  const withoutExt = filepath.replace(/\.[^/.]+$/, '');
  
  // Extract meaningful path segments
  const segments = withoutExt.split('/');
  
  // Skip root folders like src, lib, app
  const skipRoot = ['src', 'lib', 'dist', 'build', 'app', 'pages'];
  const filtered = segments.filter(seg => !skipRoot.includes(seg));
  
  if (filtered.length === 0) return null;
  
  // Return the most specific 2-3 segments
  if (filtered.length > 2) {
    return filtered.slice(-2).join('/');
  }
  
  return filtered.join('/');
}

/**
 * Extract meaningful keywords from commit messages
 */
function extractKeywordsFromMessage(message) {
  if (!message) return [];
  
  const keywords = new Set();
  
  // Normalize message
  const normalized = message.toLowerCase();
  
  // Technical terms pattern (common tech words)
  const techPatterns = [
    // Auth & Security
    /\b(auth|authentication|authorization|oauth|jwt|token|session|cookie|passport|bcrypt|argon2)\b/g,
    // Payments
    /\b(stripe|payment|checkout|billing|subscription|invoice|paypal|square)\b/g,
    // Databases
    /\b(postgres|mysql|mongodb|redis|prisma|sequelize|typeorm|mongoose|database|sql)\b/g,
    // APIs & Networking
    /\b(api|endpoint|route|rest|graphql|webhook|http|axios|fetch|request)\b/g,
    // Frontend
    /\b(react|vue|angular|next|nuxt|component|hook|state|redux|zustand)\b/g,
    // Backend
    /\b(express|fastify|nest|koa|middleware|server|node|deno)\b/g,
    // Testing
    /\b(jest|mocha|vitest|cypress|playwright|test|testing|unit|integration)\b/g,
    // DevOps
    /\b(docker|kubernetes|ci\/cd|github\s+actions|deployment|terraform)\b/g,
    // Other
    /\b(websocket|socket\.io|real-?time|async|promise|cache|queue)\b/g
  ];
  
  techPatterns.forEach(pattern => {
    const matches = normalized.match(pattern);
    if (matches) {
      matches.forEach(match => keywords.add(match.trim()));
    }
  });
  
  // Extract quoted strings (often feature names)
  const quotedMatch = message.match(/["']([^"']+)["']/g);
  if (quotedMatch) {
    quotedMatch.forEach(quoted => {
      const clean = quoted.replace(/["']/g, '').trim();
      if (clean.length > 3) keywords.add(clean);
    });
  }
  
  return Array.from(keywords);
}

/**
 * Generate a natural language summary of specific context
 */
export function formatSpecificContext(context) {
  const parts = [];
  
  // Libraries
  if (context.libraries.length > 0) {
    const libs = context.libraries.slice(0, 3).join(', ');
    parts.push(`using ${libs}`);
  }
  
  // Key functions/classes
  if (context.functions.length > 0) {
    const funcs = context.functions.slice(0, 2).join(' and ');
    parts.push(`built ${funcs}`);
  }
  
  // Modules worked on
  if (context.modules.length > 0) {
    const mods = context.modules.slice(0, 2).join(' and ');
    parts.push(`in ${mods}`);
  }
  
  return parts.join(', ');
}

/**
 * Get the most important tech stack item (for emphasis)
 */
export function getPrimaryTech(context) {
  // Prioritize well-known libraries
  const knownLibs = [
    'next-auth', 'nextauth', 'prisma', 'stripe', 'react', 'next', 'express',
    'fastify', 'postgresql', 'mongodb', 'redis', 'jwt', 'bcrypt'
  ];
  
  for (const lib of context.libraries) {
    if (knownLibs.some(known => lib.toLowerCase().includes(known))) {
      return lib;
    }
  }
  
  // Fallback to first library or keyword
  return context.libraries[0] || context.keywords[0] || null;
}