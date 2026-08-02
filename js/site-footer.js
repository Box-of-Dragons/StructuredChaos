/* site-footer.js - shared site footer for the Structured Chaos family.
 *
 * Each site sets `window.SITE_FOOTER`, adds `<div id="site-footer"></div>`,
 * and loads this script from the root Structured Chaos site.
 *
 * Config shape:
 *   window.SITE_FOOTER = {
 *     label: 'KnitStitch',              // optional left-side text
 *     leftHtml: '<span>...</span>',      // optional trusted HTML before links
 *     links: [{ label: 'Credits', href: '/credits.html' }],
 *     buildInfoSrc: '/js/buildInfo.js'  // optional script exposing BUILD_INFO
 *   };
 */
(function () {
    'use strict';

    function esc(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    function buildVersionText(info) {
        if (!info || !info.version) return '';
        var version = String(info.version).replace(/^v/i, '');
        var commit = info.commit ? ' (' + String(info.commit) + ')' : '';
        return 'v' + version + commit;
    }

    function renderLinks(links) {
        if (!links || !links.length) return '';
        return links.map(function (link) {
            return '<a href="' + esc(link.href || '#') + '">' + esc(link.label || '') + '</a>';
        }).join('');
    }

    function render(placeholder, config) {
        var left = '';
        if (config.leftHtml) {
            left += config.leftHtml;
        } else if (config.label) {
            left += '<span>' + esc(config.label) + '</span>';
        }

        var links = renderLinks(config.links);
        if (links) {
            left += '<span class="footer-links">' + links + '</span>';
        }

        var html = '<footer class="site-footer" data-site-footer>' +
            '<div class="shell footer-row">' +
            '<div class="footer-main">' + left + '</div>' +
            '<div class="footer-version" data-footer-version>' + esc(buildVersionText(window.BUILD_INFO)) + '</div>' +
            '</div>' +
            '</footer>';

        placeholder.outerHTML = html;
    }

    function updateVersion() {
        var el = document.querySelector('[data-footer-version]');
        if (!el) return;
        el.textContent = buildVersionText(window.BUILD_INFO);
    }

    function loadBuildInfo(src) {
        if (!src || window.BUILD_INFO) {
            updateVersion();
            return;
        }

        var script = document.createElement('script');
        script.src = src;
        script.defer = true;
        script.onload = updateVersion;
        script.onerror = updateVersion;
        document.head.appendChild(script);
    }

    function init() {
        var placeholder = document.getElementById('site-footer') || document.querySelector('[data-site-footer-placeholder]');
        if (!placeholder) return;

        var config = window.SITE_FOOTER || {};
        render(placeholder, config);
        loadBuildInfo(config.buildInfoSrc);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
