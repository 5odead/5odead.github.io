(function () {
  const input = document.getElementById('search-input');
  const results = document.getElementById('search-results');
  if (!input || !results) return;

  let data = [];

  function render(list) {
    if (!list.length) {
      results.innerHTML = '<p style="color:var(--text-muted);font-family:\'JetBrains Mono\',monospace;font-size:.85rem;">// no matches</p>';
      return;
    }
    results.innerHTML = list.map(function (p) {
      const tags = (p.tags || []).map(function (t) { return '<span class="tag">' + escapeHtml(t) + '</span>'; }).join('');
      return '<article class="post-card">' +
        '<h2 class="card-title"><a href="' + p.url + '">' + escapeHtml(p.title) + '</a></h2>' +
        '<div class="post-meta"><time>' + escapeHtml(p.date) + '</time></div>' +
        (p.description ? '<p class="card-desc">' + escapeHtml(p.description) + '</p>' : '') +
        (tags ? '<div class="tags">' + tags + '</div>' : '') +
        '</article>';
    }).join('');
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }

  function filter(q) {
    q = q.trim().toLowerCase();
    if (!q) { render(data); return; }
    const out = data.filter(function (p) {
      const hay = (p.title + ' ' + (p.description || '') + ' ' + (p.tags || []).join(' ')).toLowerCase();
      return hay.indexOf(q) !== -1;
    });
    render(out);
  }

  fetch(document.querySelector('base') ? 'search.json' : '/search.json')
    .then(function (r) { return r.json(); })
    .then(function (json) {
      data = json;
      render(data);
      const params = new URLSearchParams(window.location.search);
      const q = params.get('q');
      if (q) { input.value = q; filter(q); }
    })
    .catch(function () {
      results.innerHTML = '<p style="color:var(--text-muted);">// failed to load index</p>';
    });

  input.addEventListener('input', function (e) { filter(e.target.value); });
})();
