# UI Reference

This document is the canonical UI reference for the Structured Chaos family of sites. It covers the shared page shell, the shared JavaScript components served from this repo, the design tokens kept in sync across all family sites, and the layout/component classes every site uses.

## Shared Page Shell

Every public page across the family follows the same shell, top to bottom:

1. **Global bar** — site switcher, rendered by `js/global-bar.js`
2. **Site header** — brand + nav + project links, rendered by `js/site-header.js`
3. **Page subheader** — bordered container holding the page title (`h1`)
4. **Page content** — one or more `.panel.panel--padded` inside a `.container`
5. **Site footer** — per-site footer

The only exception is a homepage with a hero section, which replaces the page subheader with a full-width hero.

## Shared JavaScript Components

This repo serves two shared scripts that every subdomain site loads. They are the single source of truth for the global bar and site header — editing them here updates all sites on next load.

### `js/global-bar.js` — site switcher bar

Renders the site switcher links into a placeholder element. Detects local dev and swaps in local URLs automatically.

**Usage on subdomain sites:**

```html
<div id="global-bar" data-active="knitstitch"></div>
<script>
  (function () {
    var host = location.hostname;
    var isLocal = host === 'localhost' || host === '127.0.0.1' || host.indexOf('.ddev.site') !== -1;
    var s = document.createElement('script');
    s.src = (isLocal ? 'http://localhost:4000' : 'https://misssponto.me.uk') + '/js/global-bar.js';
    s.defer = true;
    document.head.appendChild(s);
  })();
</script>
```

**Usage on this site (StructuredChaos):**

```html
<div id="global-bar" data-active="structured-chaos"></div>
<script src="/js/global-bar.js" defer></script>
```

**`data-active`** — the id of the current site (`structured-chaos`, `box-of-dragons`, `knitstitch`). If omitted, the active site is detected from the hostname.

**Local dev detection** — when running on `localhost`, `127.0.0.1`, or `*.ddev.site`, the bar links to local dev URLs instead of production. The active site always links to `/` (current origin root) so port shifts don't break it.

**Local dev URL map:**

| Site id | Local URL | Production URL |
| --- | --- | --- |
| `structured-chaos` | `http://localhost:4000` | `https://misssponto.me.uk/` |
| `box-of-dragons` | `http://boxofdragons.ddev.site` | `https://www.boxofdragons.misssponto.me.uk/` |
| `knitstitch` | `http://localhost:5173` | `https://knitstitch.misssponto.me.uk/` |

**Adding a new site to the bar:** edit the `SITES` array at the top of `js/global-bar.js`. Add the local dev URL to `LOCAL_HREFS` if the site has a local dev server. Every subdomain picks up the change on next load — no per-site edits needed.

### `js/site-header.js` — site header (brand, nav, project links)

Renders the site header from a per-page config object. The active nav item is detected automatically by matching `location.pathname`.

**Usage:**

```html
<script>window.SITE_HEADER = {
  brand: 'KnitStitch',
  nav: [
    { label: 'Home', href: '/' },
    { label: 'ReadMe', href: '/readme.html' }
  ],
  github: 'https://github.com/Box-of-Dragons/KnitStitch',
  gitlab: 'https://gitlab.com/structured-chaos/KnitStitch'
};</script>
<div id="site-header"></div>
<script src="/js/site-header.js" defer></script>
```

Subdomain sites load it from the same origin as `global-bar.js` (localhost:4000 in dev, misssponto.me.uk in production) — see the inline loader script above.

**Config shape:**

| Field | Required | Description |
| --- | --- | --- |
| `brand` | yes | The `h1` brand text (rendered in the brand font) |
| `nav` | no | Array of `{ label, href }` items. Omit to render a header with no nav. |
| `github` | no | GitHub repo URL. Omit to hide the GitHub link. |
| `gitlab` | no | GitLab repo URL. Omit to hide the GitLab link. |

**BoxOfDragons** loads `site-header.js` from the root site the same way as KnitStitch (inline loader script that picks local dev or production URL). The header config is set per-page via `window.SITE_HEADER`.

**Adding a new page's nav:** just update the `window.SITE_HEADER` config on that page. The active state is automatic. No changes to `site-header.js` itself are needed.

## Design Tokens

All three family sites share the same CSS custom properties at `:root`. When changing a token here, update the other two repos to keep the family visually consistent.

| Token file | Repo |
| --- | --- |
| `css/site.css` | StructuredChaos (this repo — canonical) |
| `web/css/site.css` | BoxOfDragons |
| `public/css/app.css` | KnitStitch |

### Core tokens

| Token | Purpose |
| --- | --- |
| `--body`, `--body-light`, `--body-dark` | Text colors |
| `--primary`, `--primary-light`, `--primary-dark` | Accent (sage green) |
| `--secondary`, `--secondary-light`, `--secondary-dark` | Background surfaces |
| `--tertiary`, `--tertiary-dark` | White surface + subtle tint |
| `--border` | Border color (derived from `--secondary-dark`) |

### Font tokens

| Token | Font |
| --- | --- |
| `--font-body` | Open Sans |
| `--font-heading` | Playfair Display |
| `--font-brand` | Dancing Script |

### Shared utility tokens

| Token | Purpose |
| --- | --- |
| `--shadow-sm` | Subtle card shadow |
| `--shadow-md` | Elevated card shadow (hover) |
| `--github-color`, `--github-hover-bg`, `--github-hover-border` | GitHub link colors |
| `--gitlab-color`, `--gitlab-hover-bg`, `--gitlab-hover-border` | GitLab link colors |

## Layout Classes

### `.shell`

The centered max-width wrapper (1080px) used on every page. All content sits inside a `.shell`.

### `.page-layout`

Two-column grid: main content + sidebar. Collapses to one column below 900px.

```html
<div class="shell page-layout">
  <div class="container">...</div>
  <aside class="sidebar sidebar--sticky">...</aside>
</div>
```

### `.container`

The surface wrapper that holds panels. Has a subtle background and border.

### `.container-sections`, `.container-section--headed`

Sidebar group boxes with a grey header bar and white content body.

```html
<aside class="sidebar sidebar--sticky">
  <div class="container-sections">
    <section class="container-section--headed">
      <div class="container-section-header">Source</div>
      <div class="container-section-body">...</div>
    </section>
  </div>
</aside>
```

## Component Classes

### Page subheader

Bordered, rounded, centered container holding the page title. Used on every non-homepage page.

```html
<section class="page-subheader">
  <div class="shell">
    <div class="page-subheader-inner">
      <h1>Page Title</h1>
    </div>
  </div>
</section>
```

### Panels

White content boxes inside a `.container`. Every headed section in the content column should live inside its own panel.

| Class | Purpose |
| --- | --- |
| `.panel` | Base — white bg, border, 6px radius, flex column |
| `.panel--padded` | 24px padding + 16px bottom margin for stacking |
| `.panel--image-top` | Padding: 0, for panels with a top image |
| `.panel-body` | Padded content wrapper inside an image-top panel |
| `.panel-heading` | Heading wrapper inside a panel body |
| `.panel-excerpt` | 3-line clamped excerpt |
| `.panel-chips` | Chip row inside a panel body |

```html
<div class="container">
  <div class="panel panel--padded">
    <h2>Section heading</h2>
    <p>Section content...</p>
  </div>
  <div class="panel panel--padded">
    <h2>Another section</h2>
    <p>More content...</p>
  </div>
</div>
```

### Image-top panels (cards)

Used for project cards on the homepage and post cards on the archive.

```html
<article class="panel panel--image-top">
  <img class="thumb" src="..." alt="...">
  <div class="panel-body">
    <h3>Title</h3>
    <p class="body">Excerpt</p>
  </div>
</article>
```

### `.thumb`

4/3 aspect ratio cover image that fills its container. Used inside image-top panels.

### Buttons

| Class | Purpose |
| --- | --- |
| `.button` | Base button |
| `.button-primary` | Solid primary-color button |
| `.button-secondary` | Outlined button |

### Main navigation

Rendered by `site-header.js` from the `nav` config. Active state is automatic.

| Class | Purpose |
| --- | --- |
| `.main-nav` | Nav container (centered in header grid) |
| `.main-nav-item` | Nav item wrapper |
| `.main-nav-link` | Nav link (uppercase, bold) |
| `.main-nav-link.active` | Active nav link (primary color) |

### Project links

GitHub/GitLab link buttons in the site header. Rendered by `site-header.js` from the `github`/`gitlab` config.

| Class | Purpose |
| --- | --- |
| `.header-project-links` | Container (right-aligned in header grid) |
| `.project-link` | Base link button |
| `.project-link--github` | GitHub variant (dark icon) |
| `.project-link--gitlab` | GitLab variant (orange icon) |

## Markdown Page Pattern

Pages that render markdown (credits, readme, roadmap, changelog) follow this pattern:

1. Page subheader with the page title
2. A `.container` holding multiple `.panel.panel--padded` — one per heading section
3. A `wrapContentInPanels()` function splits the rendered markdown at each heading

This is the convention documented in KnitStitch's `AGENTS.md`:

> By default, every headed section in the content column should live inside its own `.panel` (typically `.panel.panel--padded`) which is wrapped by a `.container`. Only deviate when a design explicitly calls for something different. The markdown doc pages follow this by splitting each rendered heading and its following content into a separate panel.

The `wrapContentInPanels()` implementation lives in:
- `credits.html` inline script (this repo)
- `public/js/md-page.js` (KnitStitch)

Both are identical. If the logic needs to change, update both.

## CSS Selector Simplicity

Prefer generic element selectors for common semantic elements. Class-qualified selectors like `.panel h3`, `.body p`, or `.card h3` should be avoided unless there is a specific reason to scope the style.

- prefer `h3` over `.panel h3`, `.title h3`, `.table h3`
- prefer `p` over `.body p`, `.panel-content p`
- prefer `a` over `.list a` when the link is already in a generic context
- prefer `ul`/`ol` over `.bullet-list`, `.number-list` — generic lists are styled by default
- use shared CSS classes (`.subtitle`, `.caption`, `.body`, `.card-heading`, `.card-excerpt`) when a component needs distinct styling, rather than scoping element selectors under a parent class

## Per-Site Variations

### StructuredChaos (this repo)

- Static HTML/CSS/JS, no build step
- Loads `global-bar.js` and `site-header.js` from same origin (`/js/...`)
- `css/site.css` is the canonical token source

### BoxOfDragons

- Plain PHP, PDO/MySQL
- Uses both `global-bar.js` and `site-header.js` via the inline loader script in the page shell
- `web/css/site.css` contains BoD-specific overrides; shared tokens come from `css/shared.css` on the root site

### KnitStitch

- Vite + Konva.js
- Uses both `global-bar.js` and `site-header.js` via the inline loader script in `public/pages/partials/header.html`
- `public/css/app.css` mirrors the shared tokens
- Has additional app-specific styles (ribbon bars, canvas, sketch tools) not shared with other sites
