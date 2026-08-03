/**
 * interactions.js — toasts, request fly, ticker, title, latency, command palette,
 *                   lightbox, proof toggles, console easter egg
 *
 * Exports (window globals used by other modules):
 *   window.showToast(status, message)       — called by nav.js, validator.js
 *   window.openPalette()                    — called by HTML onclick
 *   window.openExperienceRecognition(e)     — called by HTML onclick
 *   window.toggleRecProof(btn)              — called by HTML onclick
 *   window.toggleProof(btn)                 — called by HTML onclick
 *
 * Globals consumed:
 *   window.bumpRequest(type)               — defined in uptime.js
 *   window.switchSkillTab(tab, btnEl)      — defined in nav.js
 *
 * To add a command palette entry: add an object to CMD_ITEMS[].
 */
(function() {
  'use strict';

  const sections = document.querySelectorAll('.endpoint-section');
  const sidebarLinks = document.querySelectorAll('.sidebar-link[href^="#"]');

  // ── Request Fly Animation ─────────────────────────────────────────
  // When clicking sidebar/tab links, fire a "request" visual

  const flyEl = document.getElementById('request-fly');

  function fireRequestFly(fromEl, isPost) {
    if (!flyEl || !fromEl) return;
    const rect = fromEl.getBoundingClientRect();
    flyEl.style.left = rect.left + rect.width / 2 - 20 + 'px';
    flyEl.style.top = rect.top + 'px';
    flyEl.textContent = isPost ? 'POST' : 'GET';
    flyEl.className = 'request-fly active' + (isPost ? ' post-fly' : '');

    // Reset for next use
    setTimeout(() => { flyEl.className = 'request-fly'; }, 600);
  }

  // Fire on sidebar link clicks
  sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const isPost = link.textContent.includes('POST');
      fireRequestFly(link, isPost);
    });
  });

  // Fire on mobile tab clicks — delegate to nav so it works after dynamic render
  const mobileTabsNav = document.getElementById('mobile-tabs');
  if (mobileTabsNav) {
    mobileTabsNav.addEventListener('click', (e) => {
      const tab = e.target.closest('.mobile-tab');
      if (!tab) return;
      const isPost = tab.querySelector('.method-post') !== null;
      fireRequestFly(tab, isPost);
    });
  }

  // ── HTTP Status Toasts ────────────────────────────────────────────
  const httpToast = document.getElementById('http-toast');
  let toastTimer = null;

  function showToast(status, message) {
    if (!httpToast) return;
    const cls = status < 300 ? '--200' : status < 400 ? '--301' : '--404';
    httpToast.innerHTML = `<span class="toast-status toast-status${cls}">${status}</span>${message}`;
    httpToast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => httpToast.classList.remove('show'), 2500);
  }

  // Show 200 when scrolling into a section
  const toastObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.toasted) {
        entry.target.dataset.toasted = 'true';
        const path = entry.target.id === 'overview' ? '/' : '/' + entry.target.id;
        showToast(200, `GET ${path}`);
      }
    });
  }, { threshold: 0.5 });

  sections.forEach(section => toastObserver.observe(section));


  // ── HTTP Status Ticker ───────────────────────────────────────────
  const TICKER_CODES = [
    { code: '200 OK',                    cls: 's2xx' },
    { code: '201 Created',               cls: 's2xx' },
    { code: '204 No Content',            cls: 's2xx' },
    { code: '206 Partial Content',       cls: 's2xx' },
    { code: '301 Moved Permanently',     cls: 's3xx' },
    { code: '304 Not Modified',          cls: 's3xx' },
    { code: '400 Bad Request',           cls: 's4xx' },
    { code: '401 Unauthorized',          cls: 's4xx' },
    { code: '403 Forbidden',             cls: 's4xx' },
    { code: '404 Not Found',             cls: 's4xx' },
    { code: '409 Conflict',              cls: 's4xx' },
    { code: '422 Unprocessable Entity',  cls: 's4xx' },
    { code: '429 Too Many Requests',     cls: 's4xx' },
    { code: '500 Internal Server Error', cls: 's5xx' },
    { code: '502 Bad Gateway',           cls: 's5xx' },
    { code: '503 Service Unavailable',   cls: 's5xx' },
    { code: '504 Gateway Timeout',       cls: 's5xx' },
  ];

  const tickerTrack = document.getElementById('status-ticker-track');
  if (tickerTrack) {
    // Double the list for seamless infinite scroll
    const items = [...TICKER_CODES, ...TICKER_CODES]
      .map(({ code, cls }) =>
        `<span class="status-ticker-item ${cls}">${code}</span>`)
      .join('');
    tickerTrack.innerHTML = items;
  }

  // ── x-response-time header ───────────────────────────────────────
  const rtEl = document.getElementById('hero-response-time');
  if (rtEl) {
    const paint = performance.getEntriesByType('navigation')[0];
    const ms = paint
      ? Math.round(paint.domContentLoadedEventEnd - paint.startTime)
      : Math.round(performance.now());
    // Reveal after hero types in
    setTimeout(() => { rtEl.textContent = ms + 'ms'; }, 3800);
  }


  // ── Page title follows scroll ─────────────────────────────────────
  const sectionTitles = {
    'overview':        'Overview',
    'experience':      'GET /experience',
    'skills':          'GET /skills',
    'validator':       'POST /validate/pan-name',
    'recommendations': 'GET /recommendations',
    'education':       'GET /education',
  };
  const baseTitle = 'deepanshu-kumar.dev';

  const titleObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const label = sectionTitles[entry.target.id];
        document.title = label ? `${label} — ${baseTitle}` : baseTitle;
      }
    });
  }, { threshold: 0.3 });

  Object.keys(sectionTitles).forEach(id => {
    const el = document.getElementById(id);
    if (el) titleObserver.observe(el);
  });


  // ── Skills as latency ─────────────────────────────────────────────
  document.querySelectorAll('.skill-tag[data-ms]').forEach(tag => {
    const ms = parseInt(tag.dataset.ms);
    // colour tier
    tag.classList.remove('skill-tag--primary');
    if (ms < 20)       tag.classList.add('skill-lat--fast');
    else if (ms < 60)  tag.classList.add('skill-lat--mid');
    else               tag.classList.add('skill-lat--slow');

    // tooltip on hover
    tag.setAttribute('title', `${ms}ms`);
    tag.addEventListener('mouseenter', function() {
      let tip = this.querySelector('.lat-tip');
      if (!tip) {
        tip = document.createElement('span');
        tip.className = 'lat-tip';
        this.appendChild(tip);
      }
      tip.textContent = ms + 'ms';
    });
    tag.addEventListener('mouseleave', function() {
      this.querySelector('.lat-tip')?.remove();
    });
  });


  // ── Command Palette ───────────────────────────────────────────────
  const cmdBackdrop = document.getElementById('cmd-backdrop');
  const cmdPalette  = document.getElementById('cmd-palette');
  const cmdInput    = document.getElementById('cmd-input');
  const cmdResults  = document.getElementById('cmd-results');

  const CMD_ITEMS = [
    { label: 'Overview',               sub: 'Introduction',              id: 'overview',        icon: '◉' },
    { label: 'GET /experience',        sub: 'Work history',              id: 'experience',      icon: 'GET' },
    { label: 'GET /skills/technical',  sub: 'Tech stack & tools',        id: 'skills',          icon: 'GET', tab: 'technical' },
    { label: 'GET /skills/soft',       sub: 'Soft skills with proof',    id: 'skills',          icon: 'GET', tab: 'soft' },
    { label: 'POST /validate/pan-name',sub: 'Live fuzzy name demo',      id: 'validator',       icon: 'POST' },
    { label: 'GET /recommendations',   sub: 'Peer & manager recs',       id: 'recommendations', icon: 'GET' },
    { label: 'GET /education',         sub: 'Academic credentials',      id: 'education',       icon: 'GET' },
    { label: 'Download Resume',        sub: 'Deepanshu_Kumar_Resume.pdf',href: 'Deepanshu_Kumar_Resume.pdf', icon: '↓', download: true },
    { label: 'Email',                  sub: 'Deepanshu.Kumar@Outlook.in',href: 'mailto:Deepanshu.Kumar@Outlook.in', icon: '✉' },
    { label: 'GitHub',                 sub: 'Dev-Deepanshu-Kumar',       href: 'https://github.com/Dev-Deepanshu-Kumar', icon: '◈' },
    { label: 'LinkedIn',               sub: 'deepanshu-kumar-dev',       href: 'https://linkedin.com/in/deepanshu-kumar-dev', icon: '⬡' },
    { label: 'API: portfolio.json',    sub: 'curl this site',            href: '/api/portfolio.json', icon: '{}' },
  ];

  window.openPalette = function() {
    cmdPalette.classList.add('open');
    cmdBackdrop.classList.add('open');
    cmdInput.value = '';
    renderCmdResults('');
    setTimeout(() => cmdInput.focus(), 50);
    document.body.style.overflow = 'hidden';
  }

  function closePalette() {
    cmdPalette.classList.remove('open');
    cmdBackdrop.classList.remove('open');
    document.body.style.overflow = '';
  }

  function renderCmdResults(query) {
    const q = query.toLowerCase().trim();
    const filtered = q
      ? CMD_ITEMS.filter(i =>
          i.label.toLowerCase().includes(q) ||
          i.sub.toLowerCase().includes(q))
      : CMD_ITEMS;

    if (!filtered.length) {
      cmdResults.innerHTML = '<div class="cmd-empty">No results</div>';
      return;
    }

    cmdResults.innerHTML = filtered.map((item, idx) => {
      const isGet  = item.icon === 'GET';
      const isPost = item.icon === 'POST';
      const iconCls = isGet ? 'cmd-icon cmd-icon--get' : isPost ? 'cmd-icon cmd-icon--post' : 'cmd-icon';
      return `<div class="cmd-item" data-idx="${idx}" data-original-idx="${CMD_ITEMS.indexOf(item)}">
        <span class="${iconCls}">${item.icon}</span>
        <span class="cmd-item-label">${item.label}</span>
        <span class="cmd-item-sub">${item.sub}</span>
        <span class="cmd-enter">↵</span>
      </div>`;
    }).join('');

    // activate first
    cmdResults.querySelector('.cmd-item')?.classList.add('active');

    // click handler
    cmdResults.querySelectorAll('.cmd-item').forEach(el => {
      el.addEventListener('click', () => executeCmdItem(CMD_ITEMS[parseInt(el.dataset.originalIdx)]));
      el.addEventListener('mouseenter', () => {
        cmdResults.querySelectorAll('.cmd-item').forEach(e => e.classList.remove('active'));
        el.classList.add('active');
      });
    });
  }

  function executeCmdItem(item) {
    closePalette();
    if (item.href) {
      if (item.download) {
        const a = document.createElement('a');
        a.href = item.href; a.download = ''; a.click();
      } else {
        window.open(item.href, item.href.startsWith('http') ? '_blank' : '_self');
      }
      return;
    }
    if (item.id) {
      const el = document.getElementById(item.id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (item.tab) setTimeout(() => switchSkillTab(item.tab, null), 400);
      }
    }
  }

  cmdInput.addEventListener('input', e => renderCmdResults(e.target.value));

  cmdInput.addEventListener('keydown', e => {
    const items = [...cmdResults.querySelectorAll('.cmd-item')];
    const activeIdx = items.findIndex(i => i.classList.contains('active'));
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = items[(activeIdx + 1) % items.length];
      items.forEach(i => i.classList.remove('active'));
      next?.classList.add('active');
      next?.scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = items[(activeIdx - 1 + items.length) % items.length];
      items.forEach(i => i.classList.remove('active'));
      prev?.classList.add('active');
      prev?.scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter') {
      const active = cmdResults.querySelector('.cmd-item.active');
      if (active) executeCmdItem(CMD_ITEMS[parseInt(active.dataset.originalIdx)]);
    } else if (e.key === 'Escape') {
      closePalette();
    }
  });

  cmdBackdrop.addEventListener('click', closePalette);

  // trigger: / key or Ctrl+K
  document.addEventListener('keydown', e => {
    const tag = document.activeElement.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    if (e.key === '/' || (e.ctrlKey && e.key === 'k')) {
      e.preventDefault();
      cmdPalette.classList.contains('open') ? closePalette() : openPalette();
    }
    if (e.key === 'Escape') closePalette();
  });

  // hint in topbar — press / to search
  const topbarRight = document.querySelector('.topbar-right');
  if (topbarRight) {
    const hint = document.createElement('button');
    hint.className = 'cmd-topbar-hint';
    hint.innerHTML = '<span class="cmd-hint-slash">/</span> search';
    hint.onclick = openPalette;
    topbarRight.insertBefore(hint, topbarRight.firstChild);
  }


  // ── Lightbox ──────────────────────────────────────────────────────
  const lightbox    = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close');

  function openLightbox(src, alt) {
    lightboxImg.src = src;
    lightboxImg.alt = alt || '';
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    // clear src after transition so old image doesn't flash on reopen
    setTimeout(() => { lightboxImg.src = ''; }, 260);
  }

  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

  // delegate: any img with data-zoomable OR inside .rec-proof-img / .recog-screenshot-item
  document.addEventListener('click', e => {
    const img = e.target.closest('img.rec-proof-img, .recog-screenshot-item img');
    if (img) openLightbox(img.src, img.alt);
  });

  // ── Open Siemens recognition from soft-skills ────────────────────
  window.openExperienceRecognition = function(e) {
    e.preventDefault();

    // Find the Siemens json-object (first one in #experience)
    const experienceSection = document.getElementById('experience');
    const siemensBlock = experienceSection.querySelector('.json-object');

    // Expand Siemens block if not already open
    if (!siemensBlock.classList.contains('expanded')) {
      siemensBlock.classList.add('expanded');
    }

    // Find the recognition nested field inside it
    const recogField = siemensBlock.querySelector('.json-field--collapsible');

    // Expand recognition if not already open
    if (recogField && !recogField.classList.contains('expanded')) {
      recogField.classList.add('expanded');
    }

    // Scroll to the recognition field after a short delay (let DOM expand)
    setTimeout(() => {
      if (recogField) {
        recogField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 80);
  };

  // ── Recommendation LinkedIn proof toggle ─────────────────────────
  window.toggleRecProof = function(btn) {
    const collapse = btn.nextElementSibling;
    const isOpen = collapse.classList.toggle('rec-proof-collapse--open');
    btn.setAttribute('aria-expanded', isOpen);
    btn.classList.toggle('rec-proof-btn--open', isOpen);
    const arrow = btn.querySelector('.rec-proof-arrow');
    if (arrow) arrow.textContent = isOpen ? '↓' : '→';
  };

  // ── Recognition proof toggle ──────────────────────────────────────
  window.toggleProof = function(btn) {
    const strip = document.getElementById('recog-proof-strip');
    if (!strip) return;
    const isOpen = strip.classList.toggle('recog-proof-strip--open');
    btn.classList.toggle('recog-proof-btn--open', isOpen);
    const arrow = btn.querySelector('.recog-proof-arrow');
    if (arrow) arrow.textContent = isOpen ? '↓' : '→';
  };
})();
