# Structured Chaos Agent Notes

This repository is the umbrella site for the Structured Chaos family of projects. It is a small static site (no CMS, no build step) served from the root of `misssponto.me.uk`.

## Scope

Applies to all work in this repository. The site is served as static files by nginx directly from the repo working tree.

## Product Model

- `index.html` — landing page linking to the projects under the umbrella
- `credits.html` — credits page that renders `credits.md` client-side with `marked.js` (CDN)
- `credits.md` — canonical OSS credits, the single source of truth for all Structured Chaos projects
- `js/global-bar.js` — shared site switcher bar consumed by all subdomain sites
- `js/site-header.js` — shared site header (brand, nav, project links) consumed by subdomain sites
- `css/shared.css` — canonical stylesheet for the whole family (design tokens, base styles, typography, layout primitives, all shared components: global bar, site header, panels, chips, color pairs, buttons, forms, lists, gallery, footer, responsive breakpoints). Every family site loads it before its own site-specific CSS.
- `css/site.css` — StructuredChaos-specific overrides and unique components (landing cards, markdown body); loads after `css/shared.css`
- `docs/ui.md` — canonical UI reference for the family (shared shell, JS components, tokens, layout/component classes)

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

`js/global-bar.js` is the single source of truth for the site switcher bar. Subdomains include it via an inline loader script that picks the local dev server or production URL based on `location.hostname`. See [docs/ui.md](docs/ui.md) for the full usage pattern, local dev URL map, and how to add new sites to the bar.

The site list lives in the `SITES` array at the top of `js/global-bar.js`. When adding a new subdomain or renaming one, update that array and every subdomain picks up the change on next load — no per-repo edits needed.

The active link is resolved by hostname match, or by `data-active="<id>"` on the placeholder if present.

## Shared Site Header

`js/site-header.js` renders the site header (brand, nav, GitHub/GitLab links) from a per-page `window.SITE_HEADER` config object. Subdomain sites load it the same way as `global-bar.js`. See [docs/ui.md](docs/ui.md) for the config shape and usage.

The title area is collapsible. The pull-tab, chevron, collapsed state, and spacing behavior are shared chrome owned by `js/site-header.js` and `css/shared.css`; do not duplicate or override those styles in subdomain-specific CSS.

## Shared CSS

`css/shared.css` is the canonical stylesheet for the whole family. It contains design tokens (`--primary`, `--body`, `--secondary`, color pairs, shadows, type scale), base styles, typography, layout primitives, and all shared components (global bar, site header, navigation, panels, chips, color pairs, buttons, forms, lists, gallery, footer, responsive breakpoints).

Every family site loads it before its own site-specific CSS:

- **StructuredChaos**: `<link rel="stylesheet" href="/css/shared.css">` then `<link rel="stylesheet" href="/css/site.css">`
- **Box of Dragons**: loaded from the root site via PHP (`shared_assets_base() . '/css/shared.css'`) then `/css/site.css`
- **KnitStitch**: loaded from the root site (local: `localhost:4000`, prod: `misssponto.me.uk`) then its own `app.css`
- **JSketcher**: loaded from the root site (local: `localhost:4000`, prod: `misssponto.me.uk`) then `web/css/site-shell.css` or `dist/css/site-shell.css`

When changing a token or component in `css/shared.css`, every site picks it up on next load — no per-repo edits needed. Site-specific CSS files only contain layout overrides (e.g. `.shell` max-width) and components unique to that site.

## Repository Structure

- `index.html` — landing page
- `credits.html` — credits page
- `credits.md` — canonical OSS credits
- `css/shared.css` — canonical family stylesheet (tokens, base, components)
- `css/site.css` — StructuredChaos overrides and unique components (landing cards, markdown body)
- `js/global-bar.js` — shared site switcher bar
- `js/site-header.js` — shared site header (brand, nav, project links)
- `docs/ui.md` — canonical UI reference for the family
- `docs/git-rules.md` — canonical git rules for the family
- `scripts/family-release.mjs` — canonical release planner (conventional-commit versioning, shared by all family repos)
- `.github/workflows/family-release.yml` — reusable release workflow (plan → tag → GitHub Release); family repos call it via thin `release.yml` callers
- `.github/workflows/family-deploy.yml` — reusable SSH deploy workflow (git reset + repo's `scripts/deploy.sh`)
- `scripts/webhook-server.mjs` — GitHub webhook listener for VPS auto-deploy
- `ecosystem.config.cjs` — PM2 config for the webhook server
- `.env.example` — template for `.env` (contains `GITHUB_WEBHOOK_SECRET`)
- `README.md` — project bootstrap notes

## Deploy

Deploys run as part of the manual **Release** workflow (Actions → Release → Run workflow): it tags the release, creates the GitHub Release, then SSHes to the VPS and runs `git fetch` + `git reset --hard`. No build step — nginx serves the working tree.

Pushes no longer deploy — the GitHub webhook was removed. `scripts/webhook-server.mjs`, `ecosystem.config.cjs`, and the PM2 process on the VPS are legacy and can be decommissioned.

### Manual deploy (fallback)

```bash
cd /var/www/structured-chaos
git pull origin master
```

## Git Conventions

This project uses Conventional Commits. See [docs/git-rules.md](docs/git-rules.md) for the full format, version bump rules, scopes, and tagging guidance. This file is the canonical source for all Structured Chaos family repos.
