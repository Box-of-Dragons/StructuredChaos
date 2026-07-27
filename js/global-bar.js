/* global-bar.js — shared site switcher bar for the Structured Chaos family.
 *
 * Each site includes this script and a placeholder element:
 *   <div id="global-bar" data-active="structured-chaos"></div>
 *   <script src="https://misssponto.me.uk/js/global-bar.js" defer></script>
 *
 * The script injects the bar HTML into the placeholder and marks the link
 * matching data-active (or the current hostname, if data-active is omitted)
 * as active. Keeping the markup here means the bar has one source of truth
 * across Structured Chaos, Box of Dragons, KnitStitch, and the account site.
 */
(function () {
    'use strict';

    var SITES = [
        { id: 'structured-chaos', label: 'Structured Chaos', href: 'https://misssponto.me.uk/' },
        { id: 'box-of-dragons',   label: 'Box of Dragons',   href: 'https://boxofdragons.misssponto.me.uk/' },
        { id: 'knitstitch',       label: 'KnitStitch',       href: 'https://knitstitch.misssponto.me.uk/' },
        { id: 'account',          label: 'Account',          href: 'https://www.auth.misssponto.me.uk/' }
    ];

    function resolveActiveId(placeholder) {
        var explicit = placeholder && placeholder.getAttribute('data-active');
        if (explicit) return explicit;

        var host = (location.hostname || '').toLowerCase();
        if (host === 'misssponto.me.uk' || host === 'www.misssponto.me.uk') return 'structured-chaos';
        if (host.indexOf('boxofdragons') === 0) return 'box-of-dragons';
        if (host.indexOf('knitstitch') === 0) return 'knitstitch';
        if (host.indexOf('auth') === 0) return 'account';
        return '';
    }

    function render(placeholder) {
        var activeId = resolveActiveId(placeholder);
        var links = SITES.map(function (site) {
            var cls = 'global-bar-link' + (site.id === activeId ? ' active' : '');
            return '<a class="' + cls + '" href="' + site.href + '">' + site.label + '</a>';
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
