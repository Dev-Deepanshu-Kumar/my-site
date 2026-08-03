(function() {
  'use strict';

  const sections = document.querySelectorAll('.endpoint-section');

  // ── Live Uptime Counter ────────────────────────────────────────────
  const CAREER_START = new Date(2019, 11, 2);
  const GAP_DAYS = 456;

  function updateUptime() {
    const now = new Date();
    let totalMs = now - CAREER_START;
    totalMs -= GAP_DAYS * 86400000;
    const totalSecs = Math.floor(totalMs / 1000);
    const years  = Math.floor(totalSecs / (365.25 * 86400));
    const months = Math.floor((totalSecs % (365.25 * 86400)) / (30.44 * 86400));
    const days   = Math.floor((totalSecs % (30.44 * 86400)) / 86400);
    const hours  = Math.floor((totalSecs % 86400) / 3600);
    const mins   = Math.floor((totalSecs % 3600) / 60);
    const secs   = totalSecs % 60;

    const el = (id) => document.getElementById(id);
    if (el('uptime-years'))  el('uptime-years').textContent  = years;
    if (el('uptime-months')) el('uptime-months').textContent = months;
    if (el('uptime-days'))   el('uptime-days').textContent   = days;
    if (el('uptime-hours'))  el('uptime-hours').textContent  = hours;
    if (el('uptime-mins'))   el('uptime-mins').textContent   = String(mins).padStart(2, '0');
    if (el('uptime-secs'))   el('uptime-secs').textContent   = String(secs).padStart(2, '0');

    const mwUptime = el('mw-uptime');
    if (mwUptime) {
      mwUptime.textContent = `${years}y ${months}mo ${days}d`;
      mwUptime.classList.add('tick');
      setTimeout(() => mwUptime.classList.remove('tick'), 100);
    }
  }
  updateUptime();
  setInterval(updateUptime, 1000);


  // ── Rate Limit Progress ───────────────────────────────────────────
  const visitedSections    = new Set();
  const EXCLUDE_FROM_COUNT = new Set(['overview']);
  const totalEndpoints     = [...sections].filter(s => !EXCLUDE_FROM_COUNT.has(s.id)).length;

  const rateLimitObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !EXCLUDE_FROM_COUNT.has(entry.target.id)) {
        visitedSections.add(entry.target.id);
        const count = visitedSections.size;
        const pct   = (count / totalEndpoints * 100) + '%';
        const fill  = document.getElementById('ratelimit-fill');
        const text  = document.getElementById('ratelimit-text');
        if (fill) fill.style.width = pct;
        if (text) text.textContent = `${count} / ${totalEndpoints} endpoints explored`;
        const mwFill = document.getElementById('mw-ratelimit-fill');
        const mwText = document.getElementById('mw-ratelimit-text');
        if (mwFill) mwFill.style.width = pct;
        if (mwText) mwText.textContent = `${count}/${totalEndpoints}`;
      }
    });
  }, { threshold: 0.3 });
  sections.forEach(section => rateLimitObserver.observe(section));


  // ── Request Counter ────────────────────────────────────────────────
  let reqGets = 0, reqPosts = 0;

  window.bumpRequest = function(type) {
    if (type === 'POST') reqPosts++;
    else reqGets++;
    const total = reqGets + reqPosts;
    const countEl     = document.getElementById('req-count');
    const breakdownEl = document.getElementById('req-breakdown');
    if (countEl) {
      countEl.textContent = total;
      countEl.classList.add('bump');
      setTimeout(() => countEl.classList.remove('bump'), 150);
    }
    if (breakdownEl) breakdownEl.textContent = `${reqGets} GET · ${reqPosts} POST`;
    const mwReq = document.getElementById('mw-requests');
    if (mwReq) mwReq.textContent = total;
  };

  const reqScrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.reqCounted) {
        entry.target.dataset.reqCounted = 'true';
        window.bumpRequest('GET');
      }
    });
  }, { threshold: 0.5 });
  sections.forEach(s => reqScrollObserver.observe(s));

})();
