document.addEventListener('DOMContentLoaded', function () {
  var feedEl = document.getElementById('substack-feed');
  if (!feedEl) return;

  var substackUrl = feedEl.getAttribute('data-substack-url');
  if (!substackUrl) return;

  var feedUrl = substackUrl.replace(/\/$/, '') + '/feed';
  var proxyUrl = 'https://api.allorigins.win/get?url=' + encodeURIComponent(feedUrl);

  var settled = false;
  var fallbackTimer = setTimeout(function () {
    if (!settled) { settled = true; displayError(); }
  }, 7000);

  fetch(proxyUrl)
    .then(function (r) {
      if (!r.ok) throw new Error('proxy ' + r.status);
      return r.json();
    })
    .then(function (data) {
      if (settled) return; // timeout already showed fallback
      settled = true;
      clearTimeout(fallbackTimer);
      var xml = data.contents || '';
      if (!xml) throw new Error('empty feed');
      var doc = new DOMParser().parseFromString(xml, 'text/xml');
      var items = Array.from(doc.querySelectorAll('item'));
      if (!items.length) throw new Error('no items');
      renderPosts(items.slice(0, 5));
    })
    .catch(function (err) {
      if (settled) return;
      settled = true;
      clearTimeout(fallbackTimer);
      console.error('Substack feed error:', err);
      displayError();
    });

  function getText(el, tag) {
    var node = el.querySelector(tag);
    return node ? (node.textContent || '').trim() : '';
  }

  function parseItem(item) {
    var title = getText(item, 'title');
    var link = getText(item, 'link') || getText(item, 'guid');
    var pubDate = getText(item, 'pubDate');
    var desc = getText(item, 'description');

    // Enclosure image (direct S3 URL — no proxy needed)
    var thumbUrl = '';
    var enclosure = item.querySelector('enclosure');
    if (enclosure) {
      var u = enclosure.getAttribute('url') || '';
      if (u && !u.includes('youtube.com')) thumbUrl = u;
    }
    // Fallback: first img src from content:encoded
    if (!thumbUrl) {
      var encoded = getText(item, 'encoded');
      var m = encoded.match(/src="(https:\/\/substack-post-media\.s3\.amazonaws\.com\/[^"]+)"/);
      if (m) thumbUrl = m[1];
    }

    var date = pubDate ? new Date(pubDate) : null;
    var shortDate = date
      ? date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      : '';

    var tmp = document.createElement('div');
    tmp.innerHTML = desc;
    var excerpt = (tmp.textContent || '').trim().replace(/\s+/g, ' ');
    if (excerpt.length > 150) excerpt = excerpt.slice(0, 150) + '…';

    return { title: title, link: link, shortDate: shortDate, excerpt: excerpt, thumbUrl: thumbUrl };
  }

  function renderPosts(items) {
    var container = document.getElementById('substack-posts');
    if (!container) return;
    container.innerHTML = '';

    var parsed = items.map(parseItem);

    // ── Phase 1: render text immediately, images start empty (shimmer) ──
    parsed.forEach(function (post) {
      var row = document.createElement('div');
      row.className = 'item-row item-row-media';
      // Only use data-fetch-thumb proxy if there is no direct enclosure URL
      if (!post.thumbUrl) row.setAttribute('data-fetch-thumb', post.link);

      row.innerHTML =
        '<a href="' + post.link + '" target="_blank" rel="noopener"' +
        ' class="item-thumb-wrap"' +
        ' data-fallback="/assets/images/fallbacks/substack.png"' +
        ' tabindex="-1" aria-hidden="true">' +
        '<img class="item-thumb" src="" alt=""' +
        ' width="96" height="54" decoding="async"' +
        ' onload="this.setAttribute(\'data-loaded\',\'1\')"' +
        ' onerror="this.onerror=null;this.src=\'/assets/images/fallbacks/substack.png\';this.setAttribute(\'data-loaded\',\'1\')">' +
        '</a>' +
        '<div class="item-thumb-body">' +
        '<div class="item-header">' +
        '<span class="item-title">' + post.title + '</span>' +
        '<span class="item-meta">' + post.shortDate + '</span>' +
        '</div>' +
        '<p class="item-desc">' + post.excerpt + '</p>' +
        '<a href="' + post.link + '" class="item-link" style="font-size:.8125rem" target="_blank">' +
        'Read post' +
        '<svg style="display:inline;vertical-align:middle;opacity:.6;margin-left:3px" width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>' +
        '</a>' +
        '</div>';

      container.appendChild(row);
    });

    // ── Phase 2: load images after text is painted ──
    requestAnimationFrame(function () {
      var rows = container.querySelectorAll('.item-row');
      parsed.forEach(function (post, i) {
        var img = rows[i] && rows[i].querySelector('.item-thumb');
        if (!img) return;
        if (post.thumbUrl) {
          // Direct S3 URL — browser loads it natively, no proxy needed
          img.src = post.thumbUrl;
        }
        // Items without a thumbUrl already have data-fetch-thumb set;
        // fetchThumnails (called below) will proxy-fetch them.
      });

      if (window.fetchThumbnails) window.fetchThumbnails(container);
    });
  }

  function displayError() {
    var container = document.getElementById('substack-posts');
    if (!container) return;
    container.innerHTML =
      '<a href="' + substackUrl + '/archive" target="_blank" rel="noopener" style="color:var(--text-muted);text-decoration:underline;text-underline-offset:2px">View on Substack ↗</a>';
  }
});
