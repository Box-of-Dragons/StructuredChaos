# Structured Chaos

The umbrella site for the Structured Chaos family of projects, served at the root of `misssponto.me.uk`. It is a small static site (no CMS, no build step) that provides:

- a landing page linking to the projects under the umbrella
- the canonical [credits.md](./credits.md) — the single source of truth for open source software, libraries, fonts, and tools used across all Structured Chaos projects
- the shared `js/global-bar.js` site switcher consumed by all subdomain sites
- the shared `js/site-header.js` title/nav header consumed by all subdomain sites
- the canonical `css/shared.css` stylesheet for shared tokens and shell components

## Projects under the umbrella

| Site | Repo | Stack |
| --- | --- | --- |
| Box of Dragons | `BoxOfDragons` | PHP, PDO, MySQL |
| KnitStitch Grid | `KnitStitch` | Vite, Konva.js, SolveSpace WASM |
| JSketcher | `JSketcher` | Static browser CAD app, WebGL, WebAssembly |
| Account service | `better-auth` | Next.js, Better Auth |

## Repository structure

```
index.html              Landing page
credits.html            Credits page (renders credits.md client-side)
credits.md              Canonical OSS credits — source of truth
css/shared.css          Canonical shared styles, tokens, global bar, site header
css/site.css            StructuredChaos-specific styles
js/global-bar.js        Shared site switcher bar, consumed by all subdomains
js/site-header.js       Shared brand/nav/project-links header, consumed by all subdomains
docs/ui.md              Canonical UI reference for shared shell/components
scripts/webhook-server.mjs   GitHub webhook listener for VPS auto-deploy
ecosystem.config.cjs    PM2 config for the webhook server
.env.example            Template for .env (GITHUB_WEBHOOK_SECRET)
```

## Running locally

No build step. Open `index.html` directly, or serve the folder with any static server:

```bash
python -m http.server 4000
```

The shared VS Code run profiles live in `E:\CodingProjects\Web\Web.code-workspace`. Open that workspace and use `Start All (Family Sites)` to run the family sites together.

## Editing credits

Edit `credits.md` directly. The credits page fetches it at runtime and renders it with `marked.js` (CDN), so changes appear on the next page load with no rebuild.

## Shared global bar

`js/global-bar.js` is the single source of truth for the site switcher bar that appears at the top of every Structured Chaos site. Subdomains include it like this:

```html
<div id="global-bar"></div>
<script src="https://misssponto.me.uk/js/global-bar.js" defer></script>
```

The script auto-detects the active site from `location.hostname`, or you can pin it with `data-active="knitstitch"` on the placeholder.

## Shared site header

`js/site-header.js` renders the shared title/nav/project-links header. The title area includes the shared collapse pull-tab, and the collapsed state is persisted in browser local storage.

Site nav links may define `href`, `localHref`, and `liveHref`. The script chooses local URLs on `localhost`, `127.0.0.1`, or `*.ddev.site`, and production URLs otherwise.

Header styling belongs in `css/shared.css`. Site-specific CSS should only handle local layout or app content, not restyle the global bar, title header, nav, project links, or collapse tab.

## VPS deploy via GitHub webhook

The VPS auto-deploys when GitHub receives a push to `master`.

`scripts/webhook-server.mjs` is a small Node.js HTTP server (no external dependencies) that:

1. Verifies the GitHub HMAC-SHA256 signature using `GITHUB_WEBHOOK_SECRET` from `.env`
2. Checks that the push is to `refs/heads/master`
3. Runs `git fetch origin master` + `git reset --hard origin/master`

The site is served by nginx directly from the repo working tree — no build step, no app process.

### Setup

1. Set `GITHUB_WEBHOOK_SECRET` in `.env` on the VPS
2. `pm2 start ecosystem.config.cjs && pm2 save && pm2 startup`
3. Configure nginx:
   - `location /webhook { proxy_pass http://127.0.0.1:3003; }`
   - `location / { root /var/www/structured-chaos; index index.html; try_files $uri $uri/ =404; }`
4. In GitHub repo settings → Webhooks → Add webhook:
   - Payload URL: `https://misssponto.me.uk/webhook`
   - Content type: `application/json`
   - Secret: same value as `GITHUB_WEBHOOK_SECRET`
   - Events: Just the push event

### Manual deploy (fallback)

```bash
cd /var/www/structured-chaos
git pull origin master
```
