/**
 * webhook-server.mjs — GitHub webhook listener for VPS auto-deploy.
 *
 * A small Node.js HTTP server that listens for GitHub push events,
 * verifies the HMAC-SHA256 signature, and runs the deploy commands
 * for the Structured Chaos static site:
 *   git fetch + reset --hard origin/master.
 *
 * The site is served by nginx directly from the repo working tree, so
 * there is no build step and no app process to reload.
 *
 * No dependencies — uses only Node.js built-ins (http, crypto, child_process).
 *
 * Setup:
 *   1. Set GITHUB_WEBHOOK_SECRET in .env on the VPS
 *   2. Run this server with PM2:
 *        pm2 start ecosystem.config.cjs
 *        pm2 save
 *        pm2 startup
 *   3. Configure nginx to serve the repo root for misssponto.me.uk and
 *      proxy /webhook to this server:
 *        location /webhook {
 *          proxy_pass http://127.0.0.1:3003;
 *          proxy_set_header X-Forwarded-For $remote_addr;
 *        }
 *        location / {
 *          root /var/www/structured-chaos;
 *          index index.html;
 *          try_files $uri $uri/ =404;
 *        }
 *   4. In GitHub repo settings → Webhooks → Add webhook:
 *        - Payload URL: https://misssponto.me.uk/webhook
 *        - Content type: application/json
 *        - Secret: same value as GITHUB_WEBHOOK_SECRET
 *        - Events: Just the push event
 *   5. Ensure the VPS repo has the GitHub remote configured and SSH keys set up
 */

import { createServer } from 'node:http';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gunzipSync } from 'node:zlib';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');
const PORT = process.env.WEBHOOK_PORT || 3003;

// --- Load .env ---
function loadEnv() {
  const envPath = join(REPO_ROOT, '.env');
  if (!existsSync(envPath)) {
    console.error('No .env file found at', envPath);
    process.exit(1);
  }
  const vars = {};
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (trimmed === '' || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    vars[key] = val;
  }
  return vars;
}

const env = loadEnv();
const SECRET = env.GITHUB_WEBHOOK_SECRET || '';
if (SECRET === '') {
  console.error('GITHUB_WEBHOOK_SECRET not set in .env');
  process.exit(1);
}

// --- Build PATH with nvm Node.js binaries ---
function buildPath() {
  const extraPaths = ['/usr/local/bin', '/usr/bin', '/bin', '/usr/local/git/bin', '/opt/git/bin'];
  const home = process.env.HOME || `/home/${process.env.USER || 'structuredchaos'}`;
  const nvmDirs = [
    join(home, '.nvm/versions/node'),
    '/home/misssponto-auth/.nvm/versions/node',
  ];
  for (const nvmDir of nvmDirs) {
    if (existsSync(nvmDir)) {
      for (const entry of readdirSync(nvmDir)) {
        const nvmBin = join(nvmDir, entry, 'bin');
        if (existsSync(nvmBin) && statSync(nvmBin).isDirectory()) {
          extraPaths.push(nvmBin);
        }
      }
    }
  }
  let path = process.env.PATH || '';
  for (const p of extraPaths) {
    if (existsSync(p) && !path.includes(p)) {
      path += `:${p}`;
    }
  }
  return path;
}

const DEPLOY_ENV = { ...process.env, ...env, PATH: buildPath() };

// --- Deploy commands ---
// Static site: just pull. nginx serves the working tree directly.
const DEPLOY_COMMANDS = [
  ['git', ['fetch', 'origin', 'master']],
  ['git', ['reset', '--hard', 'origin/master']],
];

function runDeploy() {
  const output = [];
  for (const [cmd, args] of DEPLOY_COMMANDS) {
    const label = `$ ${cmd} ${args.join(' ')}`;
    output.push(label);
    try {
      const result = execFileSync(cmd, args, {
        cwd: REPO_ROOT,
        env: DEPLOY_ENV,
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: 60000,
      });
      if (result.trim()) output.push(result.trim());
    } catch (err) {
      const stderr = err.stderr ? err.stderr.trim() : '';
      const stdout = err.stdout ? err.stdout.trim() : '';
      if (stdout) output.push(stdout);
      if (stderr) output.push(stderr);
      return { status: 'failed', exitCode: err.status || 1, output };
    }
  }
  return { status: 'deployed', output };
}

// --- HTTP server ---
const server = createServer((req, res) => {
  if (req.method !== 'POST') {
    res.writeHead(405, { Allow: 'POST', 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  const chunks = [];
  req.on('data', (chunk) => { chunks.push(chunk); });
  req.on('end', () => {
    const rawBody = Buffer.concat(chunks);

    const signatureHeader = req.headers['x-hub-signature-256'] || '';
    if (signatureHeader === '') {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing signature header' }));
      return;
    }

    const expectedSig = 'sha256=' + createHmac('sha256', SECRET).update(rawBody).digest('hex');
    const sigBuffer = Buffer.from(signatureHeader);
    const expectedBuffer = Buffer.from(expectedSig);

    if (sigBuffer.length !== expectedBuffer.length || !timingSafeEqual(sigBuffer, expectedBuffer)) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid signature' }));
      return;
    }

    let bodyBytes = rawBody;
    if (req.headers['content-encoding'] === 'gzip') {
      try {
        bodyBytes = gunzipSync(rawBody);
      } catch {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to decompress gzip payload' }));
        return;
      }
    }

    let jsonBody;
    const contentType = req.headers['content-type'] || '';
    if (contentType.includes('application/x-www-form-urlencoded')) {
      const bodyStr = bodyBytes.toString('utf8');
      const match = bodyStr.match(/(?:^|&)payload=([^&]*)/);
      if (!match) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Missing payload field in form-encoded body' }));
        return;
      }
      jsonBody = decodeURIComponent(match[1]);
    } else {
      jsonBody = bodyBytes.toString('utf8');
    }

    let data;
    try {
      data = JSON.parse(jsonBody);
    } catch {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
      return;
    }

    if (data.ref !== 'refs/heads/master') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ignored', reason: 'not master branch' }));
      return;
    }

    console.log(`[${new Date().toISOString()}] Deploy triggered by push to master`);
    const result = runDeploy();
    const status = result.status === 'deployed' ? 200 : 500;
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result));
    console.log(`[${new Date().toISOString()}] Deploy ${result.status}`);
    if (result.output) console.log(result.output.join('\n'));
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Structured Chaos webhook server listening on 127.0.0.1:${PORT}`);
});
