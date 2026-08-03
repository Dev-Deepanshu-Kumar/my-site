(function() {
  'use strict';

  // ── Dev.to Writing Widget ─────────────────────────────────────────
  // Set to false to hide both sidebar and mobile writing widgets instantly
  const WRITING_WIDGET_ENABLED = true;

  (async function loadWriting() {
    if (!WRITING_WIDGET_ENABLED) {
      document.getElementById('writing-widget')?.style.setProperty('display', 'none');
      document.getElementById('mobile-writing-block')?.style.setProperty('display', 'none');
      return;
    }
    const list        = document.getElementById('writing-list');
    const mobileList  = document.getElementById('mobile-writing-list');
    if (!list && !mobileList) return;

    // skip on file:// — CORS won't allow it, fail silently
    if (location.protocol === 'file:') {
      const msg = '<div class="writing-dim">// live on deployed site</div>';
      if (list)       list.innerHTML = msg;
      if (mobileList) mobileList.innerHTML = msg;
      return;
    }

    try {
     const res = await fetch(
        `https://dev.to/api/articles?username=dev-deepanshu-kumar&per_page=3&_=${Date.now()}`,
        { headers: { 'Accept': 'application/json' }, cache: 'no-store' }
      );
      if (!res.ok) throw new Error(res.status);
      const articles = await res.json();

      if (!articles.length) {
        const msg = '<div class="writing-dim">// no posts yet</div>';
        if (list)       list.innerHTML = msg;
        if (mobileList) mobileList.innerHTML = msg;
        return;
      }

      const items = articles.map(a => {
        const mins = a.reading_time_minutes || '?';
        const date = new Date(a.published_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
        return `<a class="writing-item" href="${a.url}" target="_blank" rel="noopener">
          <span class="writing-title">${a.title}</span>
          <span class="writing-meta">${date} · ${mins} min read</span>
        </a>`;
      }).join('');

      const viewAll = `<a class="writing-view-all" href="https://dev.to/dev-deepanshu-kumar" target="_blank" rel="noopener">View all writings →</a>`;

      if (list)       list.innerHTML       = items + viewAll;
      if (mobileList) mobileList.innerHTML = items;  // "View all" in header on mobile
    } catch (e) {
      const msg = '<div class="writing-dim">// unavailable</div>';
      if (list)       list.innerHTML = msg;
      if (mobileList) mobileList.innerHTML = msg;
    }
  })();

})();
