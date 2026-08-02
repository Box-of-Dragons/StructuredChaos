/* site-header.js — shared site header for the Structured Chaos family.
 *
 * Renders the brand, navigation, and project links (GitHub/GitLab) from a
 * per-page config object. Each page sets `window.SITE_HEADER` before this
 * script loads, then includes a placeholder:
 *
 *   <script>window.SITE_HEADER = { brand: '...', nav: [...], github: '...', gitlab: '...' };</script>
 *   <div id="site-header"></div>
 *   <script src="https://misssponto.me.uk/js/site-header.js" defer></script>
 *
 * The active nav item is detected by matching the current path. CraftCms
 * does NOT use this script — its nav is database-driven via Craft globals,
 * so it keeps its own site-header.twig partial.
 *
 * Config shape:
 *   window.SITE_HEADER = {
 *     brand:  'KnitStitch',                       // required — h1 brand text
 *     nav:    [                                    // optional — nav items
 *       { label: 'Home', href: '/' },
 *       { label: 'ReadMe', href: '/readme.html' },
 *       { label: 'CAD', localHref: 'http://localhost:3000/', liveHref: 'https://jsketcher.misssponto.me.uk/' }
 *     ],
 *     github: 'https://github.com/Box-of-Dragons/KnitStitch',  // optional
 *     gitlab: 'https://gitlab.com/structured-chaos/KnitStitch'  // optional
 *   };
 */
(function () {
    'use strict';

    var GITHUB_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
        '<path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.86 8.37 6.84 9.73.5.09.66-.22.66-.49v-1.73c-2.78.62-3.37-1.16-3.37-1.16-.46-1.2-1.12-1.52-1.12-1.52-.91-.63.07-.62.07-.62 1.01.07 1.54 1.07 1.54 1.07.9 1.58 2.35 1.12 2.92.86.09-.66.35-1.12.64-1.38-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.04 1.03-2.76-.1-.26-.45-1.31.1-2.73 0 0 .84-.27 2.75 1.05a9.12 9.12 0 0 1 5 0C16.78 6.07 17.62 6.34 17.62 6.34c.55 1.42.2 2.47.1 2.73.64.72 1.03 1.64 1.03 2.76 0 3.94-2.35 4.81-4.58 5.06.36.32.69.95.69 1.92v2.84c0 .27.16.59.67.49A10.27 10.27 0 0 0 22 12.25C22 6.58 17.52 2 12 2z"/></svg>';

    var GITLAB_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
        '<path d="M12 21.5 4.1 15.8c-.3-.2-.4-.6-.3-1l1.9-5.8h12.6l1.9 5.8c.1.4 0 .8-.3 1L12 21.5z"/>' +
        '<path d="m12 21.5 2.8-8.5H9.2L12 21.5z"/>' +
        '<path d="M12 21.5 4.1 15.8l7.9-2.8 0 8.5z"/>' +
        '<path d="M12 21.5 19.9 15.8l-7.9-2.8 0 8.5z"/>' +
        '<path d="m9.2 13 2.8-8.7L14.8 13H9.2z"/>' +
        '<path d="M4.4 14.8 6.2 9l3 4.2-4.8 1.6z"/>' +
        '<path d="M19.6 14.8 17.8 9l-3 4.2 4.8 1.6z"/></svg>';

    var CHEVRON_ICON = '<svg class="site-header-toggle-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
        '<path d="m16 14-4-4-4 4"/></svg>';

    function isLocal() {
        var host = (location.hostname || '').toLowerCase();
        return host === 'localhost'
            || host === '127.0.0.1'
            || host.indexOf('.ddev.site') !== -1;
    }

    function resolveNavHref(item) {
        if (isLocal() && item.localHref) return item.localHref;
        if (!isLocal() && item.liveHref) return item.liveHref;
        return item.href || item.liveHref || item.localHref || '#';
    }

    function getPathFromHref(href) {
        try {
            return new URL(href, location.origin).pathname;
        } catch (e) {
            return href;
        }
    }

    function isNavActive(href) {
        var path = location.pathname;
        var hrefPath = getPathFromHref(href);
        if (hrefPath === '/') return path === '/' || path === '/index.html';
        // Normalize: ensure path starts with / and compare exact or prefix match
        var normalized = hrefPath.charAt(0) === '/' ? hrefPath : '/' + hrefPath;
        return path === normalized || path.indexOf(normalized + '/') === 0;
    }

    function escAttr(value) {
        return String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function renderNav(nav) {
        if (!nav || !nav.length) return '';
        var items = nav.map(function (item) {
            var href = resolveNavHref(item);
            var cls = 'main-nav-link' + (isNavActive(href) ? ' active' : '');
            return '<div class="main-nav-item">' +
                '<a class="' + cls + '" href="' + escAttr(href) + '">' +
                escAttr(item.label) +
                '</a></div>';
        }).join('');
        return '<nav class="main-nav" aria-label="Main navigation">' + items + '</nav>';
    }

    function renderProjectLinks(config) {
        var links = '';
        if (config.github) {
            links += '<a class="project-link project-link--github" href="' + escAttr(config.github) + '" target="_blank" rel="noopener noreferrer" aria-label="Open the project on GitHub">' +
                GITHUB_ICON + '<span>GitHub</span></a>';
        }
        if (config.gitlab) {
            links += '<a class="project-link project-link--gitlab" href="' + escAttr(config.gitlab) + '" target="_blank" rel="noopener noreferrer" aria-label="Open the project on GitLab">' +
                GITLAB_ICON + '<span>GitLab</span></a>';
        }
        if (!links) return '';
        return '<div class="header-project-links" aria-label="Project links">' + links + '</div>';
    }

    function render(placeholder, config) {
        var brand = config.brand || '';
        var html = '<header class="site-header" data-site-header>' +
            '<div class="site-header__content shell header-row">' +
            '<h1 class="brand">' + escAttr(brand) + '</h1>' +
            renderNav(config.nav) +
            renderProjectLinks(config) +
            '</div>' +
            '<div class="site-header__handle">' +
            '<button class="site-header-toggle" type="button" aria-label="Collapse site header" aria-expanded="true">' +
            CHEVRON_ICON +
            '</button>' +
            '</div></header>';
        placeholder.outerHTML = html;
    }

    function readCollapsedState() {
        try {
            return localStorage.getItem('structured-chaos:site-header-collapsed') === '1';
        } catch (e) {
            return false;
        }
    }

    function writeCollapsedState(collapsed) {
        try {
            if (collapsed) {
                localStorage.setItem('structured-chaos:site-header-collapsed', '1');
            } else {
                localStorage.removeItem('structured-chaos:site-header-collapsed');
            }
        } catch (e) {
            // Collapsed state is still applied for the current session.
        }
    }

    function applyCollapsedState(header, collapsed) {
        var button = header && header.querySelector('.site-header-toggle');
        if (!header || !button) return;
        header.classList.toggle('site-header--collapsed', collapsed);
        button.setAttribute('aria-expanded', String(!collapsed));
        button.setAttribute('aria-label', collapsed ? 'Expand site header' : 'Collapse site header');
        writeCollapsedState(collapsed);
    }

    function init() {
        var placeholder = document.getElementById('site-header');
        if (!placeholder) return;
        var config = window.SITE_HEADER || {};
        render(placeholder, config);

        var header = document.querySelector('[data-site-header]');
        if (!header) return;
        applyCollapsedState(header, readCollapsedState());

        var button = header.querySelector('.site-header-toggle');
        if (!button) return;
        button.addEventListener('click', function () {
            applyCollapsedState(header, !header.classList.contains('site-header--collapsed'));
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
