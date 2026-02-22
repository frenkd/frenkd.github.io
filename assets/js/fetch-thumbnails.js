/**
 * Fetches og/image_src meta tags from external article URLs via a CORS proxy
 * and populates thumbnail placeholders. Fails silently — hides the placeholder
 * if no image is found or the fetch fails.
 *
 * Exposed as window.fetchThumbnails(scope) so dynamic content (Substack feed,
 * etc.) can call it after injecting new elements into the DOM.
 */
(function () {
  var PROXY = 'https://api.allorigins.win/get?url=';

  var PATTERNS = [
    /name="image_src"[^>]*content="([^"]+)"/i,
    /content="([^"]+)"[^>]*name="image_src"/i,
    /property="og:image"[^>]*content="([^"]+)"/i,
    /content="([^"]+)"[^>]*property="og:image"/i,
  ];

  function extractImageUrl(html) {
    for (var i = 0; i < PATTERNS.length; i++) {
      var m = html.match(PATTERNS[i]);
      if (m && m[1] && m[1].startsWith('http')) return m[1];
    }
    return null;
  }

  function processRow(row) {
    var articleUrl = row.getAttribute('data-fetch-thumb');
    if (!articleUrl) return;

    var thumbWrap = row.querySelector('.item-thumb-wrap');
    var img       = row.querySelector('.item-thumb');
    if (!thumbWrap || !img) return;

    // Already processed or rss2json provided a thumbnail that loaded
    if (row.hasAttribute('data-thumb-processed')) return;
    row.setAttribute('data-thumb-processed', '1');

    // If rss2json gave us a src, wait briefly for the img onload to fire
    // before deciding to fetch — avoids a redundant proxy request
    if (img.src && !img.src.endsWith('/fetch-thumbnails.js')) {
      if (img.complete && img.naturalWidth > 0) {
        img.setAttribute('data-loaded', '1');
        return;
      }
      // Give the browser 400ms to load the rss2json thumbnail
      setTimeout(function () {
        if (img.hasAttribute('data-loaded')) return; // loaded in time
        doFetch(articleUrl, thumbWrap, img);
      }, 400);
      return;
    }

    doFetch(articleUrl, thumbWrap, img);
  }

  function doFetch(articleUrl, thumbWrap, img) {
    fetch(PROXY + encodeURIComponent(articleUrl))
      .then(function (r) {
        if (!r.ok) throw new Error('proxy error');
        return r.json();
      })
      .then(function (data) {
        var imageUrl = extractImageUrl(data.contents || '');
        if (!imageUrl) { fail(thumbWrap); return; }
        img.src = imageUrl;
        // Match declared dimensions to the wrapper shape
        if (thumbWrap.classList.contains('item-thumb-square')) {
          img.width = 64; img.height = 64;
        }
        img.onload  = function () { img.setAttribute('data-loaded', '1'); };
        img.onerror = function () { fail(thumbWrap); };
      })
      .catch(function () { fail(thumbWrap); });
  }

  function fail(thumbWrap) {
    var fallback = thumbWrap.getAttribute('data-fallback');
    if (fallback) {
      var img = thumbWrap.querySelector('.item-thumb');
      if (img) {
        img.onerror = function () { thumbWrap.setAttribute('data-failed', '1'); };
        img.onload  = function () { img.setAttribute('data-loaded', '1'); };
        img.src = fallback;
        return;
      }
    }
    thumbWrap.setAttribute('data-failed', '1');
  }

  function run(scope) {
    (scope || document).querySelectorAll('[data-fetch-thumb]').forEach(processRow);
  }

  // Expose so feed scripts can call after injecting elements
  window.fetchThumbnails = run;

  // Run on DOMContentLoaded for static elements (Finance Magazine articles)
  document.addEventListener('DOMContentLoaded', function () { run(); });
})();
