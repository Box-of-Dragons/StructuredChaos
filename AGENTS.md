# Structured Chaos Agent Notes

This repository is the umbrella site for the Structured Chaos family of projects. It is a small static site (no CMS, no build step) served from the root of `misssponto.me.uk`.

## Scope

Applies to all work in this repository. The site is served as static files by nginx directly from the repo working tree.

## Product Model

- `index.html` — landing page linking to the projects under the umbrella
- `credits.html` — credits page that renders `credits.md` client-side with `marked.js` (CDN)
- `credits.md` — canonical OSS credits, the single source of truth for all Structured Chaos projects
- `js/global-bar.js` — shared site switcher bar consumed by all subdomain sites
- `css/site.css` — site styles; design tokens are kept in sync with Box of Dragons and KnitStitch

## Running Locally

No build step. Serve the folder with any static server:

```bash
npx serve .
python -m http.server 4000
```

Or open `index.html` directly in a browser.

## Editing Credits

Edit `credits.md` directly. The credits page fetches it at runtime and renders it with `marked.js`, so changes appear on the next page load with no rebuild. Do not edit `credits.html` to change credits content — only edit it to change the page chrome or renderer.

## Shared Global Bar

`js/global-bar.js` is the single source of truth for the site switcher bar. Subdomains include it via:

```html
<div id="global-bar"></div>
<script src="https://misssponto.me.uk/js/global-bar.js" defer></script>
```

The site list lives in the `SITES` array at the top of `js/global-bar.js`. When adding a new subdomain or renaming one, update that array and every subdomain picks up the change on next load — no per-repo edits needed.

The active link is resolved by hostname match, or by `data-active="<id>"` on the placeholder if present.

## Design Tokens

`css/site.css` defines the same `--primary`, `--body`, `--secondary`, etc. tokens as Box of Dragons (`CraftCms/web/css/site.css`) and KnitStitch (`KnitStitch/public/css/app.css`). When changing a token here, update the other two repos to keep the family visually consistent.

## Repository Structure

- `index.html` — landing page
- `credits.html` — credits page
- `credits.md` — canonical OSS credits
- `css/site.css` — site styles
- `js/global-bar.js` — shared site switcher bar
- `scripts/webhook-server.mjs` — GitHub webhook listener for VPS auto-deploy
- `ecosystem.config.cjs` — PM2 config for the webhook server
- `.env.example` — template for `.env` (contains `GITHUB_WEBHOOK_SECRET`)
- `README.md` — project bootstrap notes

## VPS Deploy via GitHub Webhook

The VPS auto-deploys when GitHub receives a push to `master`.

`scripts/webhook-server.mjs` is a small Node.js HTTP server (no external dependencies) that:

1. Verifies the GitHub HMAC-SHA256 signature using `GITHUB_WEBHOOK_SECRET` from `.env`
2. Checks that the push is to `refs/heads/master`
3. Runs `git fetch origin master` + `git reset --hard origin/master`

nginx serves the working tree directly as static files. No build step, no app process to reload.

### Manual deploy (fallback)

```bash
cd /var/www/structured-chaos
git pull origin master
```

## Git Conventions

This project uses Conventional Commits. See [docs/git-rules.md](docs/git-rules.md) for the full format, version bump rules, scopes, and tagging guidance. This file is the canonical source for all Structured Chaos family repos.
