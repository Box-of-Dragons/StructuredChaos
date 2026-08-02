/* global-bar.js — shared site switcher bar for the Structured Chaos family.
 *
 * Each site includes this script and a placeholder element:
 *   <div id="global-bar" data-active="structured-chaos"></div>
 *   <script src="https://misssponto.me.uk/js/global-bar.js" defer></script>
 *
 * The script injects the bar HTML into the placeholder and marks the link
 * matching data-active (or the current hostname, if data-active is omitted)
 * as active. Keeping the markup here means the bar has one source of truth
 * across Structured Chaos, Box of Dragons, KnitStitch, and JSketcher.
 *
 * Local dev: when running on localhost, 127.0.0.1, or *.ddev.site, the bar
 * links to the local dev servers instead of the production URLs. The active
 * site always links to "/" (current origin root) so it works regardless of
 * which port the dev server landed on.
 */
(function () {
    'use strict';

    var SITES = [
        { id: 'structured-chaos', label: 'Structured Chaos', href: 'https://misssponto.me.uk/' },
        { id: 'box-of-dragons',   label: 'Box of Dragons',   href: 'https://boxofdragons.misssponto.me.uk/' },
        { id: 'knitstitch',       label: 'KnitStitch',       href: 'https://knitstitch.misssponto.me.uk/' },
        { id: 'jsketcher',        label: 'JSketcher',        href: 'https://jsketcher.misssponto.me.uk/' }
    ];

    // Local dev URL overrides — used when isLocal() returns true.
    // The active site always gets "/" instead, so port shifts (e.g. Vite
    // falling back to 5174) don't break the active link.
    var LOCAL_HREFS = {
        'structured-chaos': 'http://localhost:4000',
        'box-of-dragons':   'http://boxofdragons.ddev.site',
        'knitstitch':       'http://localhost:5173',
        'jsketcher':        'http://localhost:3001'
    };

    function isLocal() {
        var host = (location.hostname || '').toLowerCase();
        return host === 'localhost'
            || host === '127.0.0.1'
            || host.indexOf('.ddev.site') !== -1;
    }

    function resolveActiveId(placeholder) {
        var explicit = placeholder && placeholder.getAttribute('data-active');
        if (explicit) return explicit;

        var host = (location.hostname || '').toLowerCase();
        if (host === 'misssponto.me.uk' || host === 'www.misssponto.me.uk') return 'structured-chaos';
        if (host.indexOf('boxofdragons') === 0) return 'box-of-dragons';
        if (host.indexOf('knitstitch') === 0) return 'knitstitch';
        if (host.indexOf('jsketcher') === 0) return 'jsketcher';
        return '';
    }

    function resolveHref(site, activeId, local) {
        // Active site: always link to the current origin root.
        // Works on both production and local dev (handles port shifts).
        if (site.id === activeId) return '/';

        // Non-active sites: use local dev URLs when running locally,
        // production URLs otherwise.
        if (local && LOCAL_HREFS[site.id]) return LOCAL_HREFS[site.id];
        return site.href;
    }

    function render(placeholder) {
        var activeId = resolveActiveId(placeholder);
        var local = isLocal();

        var links = SITES.map(function (site) {
            var cls = 'global-bar-link' + (site.id === activeId ? ' active' : '');
            var href = resolveHref(site, activeId, local);
            return '<a class="' + cls + '" href="' + href + '">' + site.label + '</a>';
        }).join('');

        placeholder.setAttribute('role', 'navigation');
        placeholder.setAttribute('aria-label', 'Site switcher');
        placeholder.className = 'global-bar';
        placeholder.innerHTML = '<div class="shell global-bar-row">' + links + '</div>';
    }

    function init() {
        var placeholders = document.querySelectorAll('[id="global-bar"], [data-global-bar]');
        for (var i = 0; i < placeholders.length; i++) {
            render(placeholders[i]);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
