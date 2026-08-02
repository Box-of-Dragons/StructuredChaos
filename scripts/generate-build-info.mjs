/**
 * Generate js/buildInfo.js for the static Structured Chaos site.
 */

import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

function git(root, ...args) {
    return execFileSync('git', ['-C', root, ...args], {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
}

function parseArgs(argv) {
    const args = {};
    for (let i = 2; i < argv.length; i++) {
        const arg = argv[i];
        if (!arg.startsWith('--')) continue;
        const eq = arg.indexOf('=');
        if (eq !== -1) {
            args[arg.slice(2, eq)] = arg.slice(eq + 1);
            continue;
        }
        const key = arg.slice(2);
        const next = argv[i + 1];
        if (next && !next.startsWith('--')) {
            args[key] = next;
            i++;
        } else {
            args[key] = true;
        }
    }
    return args;
}

function latestVersion(root) {
    try {
        return git(root, 'describe', '--tags', '--match', 'v[0-9]*', '--abbrev=0');
    } catch {
        return 'v0.0.0';
    }
}

const args = parseArgs(process.argv);
const root = args.root ? resolve(args.root) : resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outputPath = args.output ? resolve(args.output) : resolve(root, 'js/buildInfo.js');
const version = latestVersion(root);
const commit = git(root, 'rev-parse', '--short', 'HEAD');
const commitCount = git(root, 'rev-list', '--count', 'HEAD');

const content = `window.BUILD_INFO = {\n` +
    `  version: "${version}",\n` +
    `  productionVersion: "${version}",\n` +
    `  commit: "${commit}",\n` +
    `  commitCount: "${commitCount}"\n` +
    `};\n`;

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, content, 'utf8');
console.log(`Generated ${outputPath} - version ${version}, commit ${commit}`);
