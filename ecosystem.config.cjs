/**
 * PM2 ecosystem config for the Structured Chaos umbrella site.
 *
 * One process:
 *   - structured-chaos-webhook: the GitHub webhook listener (scripts/webhook-server.mjs)
 *
 * The site itself is static HTML/CSS/JS served directly by nginx from the
 * repo working tree — no app process to manage. The webhook server just
 * runs `git fetch` + `git reset --hard origin/master` on push to master.
 *
 * Usage:
 *   pm2 start ecosystem.config.cjs
 *   pm2 save
 *   pm2 startup   # follow the printed instructions to enable boot-time startup
 *
 * nginx should proxy:
 *   /webhook  -> 127.0.0.1:3003  (webhook server)
 *   /         -> /var/www/structured-chaos  (static files)
 */
const { existsSync, readdirSync, statSync } = require('node:fs');
const { join } = require('node:path');

function resolveNvmBin() {
  const candidates = [
    join(process.env.HOME || '/home/structured-chaos', '.nvm/versions/node'),
    '/home/misssponto-auth/.nvm/versions/node',
  ];
  for (const dir of candidates) {
    if (!existsSync(dir)) continue;
    for (const entry of readdirSync(dir)) {
      const bin = join(dir, entry, 'bin');
      if (existsSync(bin) && statSync(bin).isDirectory()) return bin;
    }
  }
  return null;
}

const nvmBin = resolveNvmBin();
const nodePath = nvmBin
  ? `${nvmBin}:${process.env.PATH || ''}`
  : process.env.PATH || '';

module.exports = {
  apps: [
    {
      name: 'structured-chaos-webhook',
      script: 'scripts/webhook-server.mjs',
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '100M',
      env: {
        WEBHOOK_PORT: 3003,
        PATH: nodePath,
      },
    },
  ],
};
