(function() {
  'use strict';

  const sections = document.querySelectorAll('.endpoint-section');
  const sidebarLinks = document.querySelectorAll('.sidebar-link[href^="#"]');

  // ── Scroll Spy ────────────────────────────────────────────────────
  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        sidebarLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { rootMargin: '-20% 0px -60% 0px', threshold: 0 });
  sections.forEach(section => spyObserver.observe(section));

  // ── Entrance animation ────────────────────────────────────────────
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -80px 0px', threshold: 0.1 });
  sections.forEach(section => revealObserver.observe(section));

  // ── Mobile Drawer ─────────────────────────────────────────────────
  const hamburger = document.getElementById('hamburger');
  const sidebar = document.getElementById('sidebar');
  let backdrop = null;

  function createBackdrop() {
    backdrop = document.createElement('div');
    backdrop.className = 'sidebar-backdrop';
    document.body.appendChild(backdrop);
    backdrop.addEventListener('click', closeDrawer);
  }
  function openDrawer() {
    sidebar.classList.add('open'); hamburger.classList.add('active');
    if (!backdrop) createBackdrop();
    backdrop.classList.add('visible'); document.body.style.overflow = 'hidden';
  }
  function closeDrawer() {
    sidebar.classList.remove('open'); hamburger.classList.remove('active');
    if (backdrop) backdrop.classList.remove('visible');
    document.body.style.overflow = '';
  }
  hamburger.addEventListener('click', () => {
    sidebar.classList.contains('open') ? closeDrawer() : openDrawer();
  });
  sidebarLinks.forEach(link => {
    link.addEventListener('click', () => { if (window.innerWidth <= 900) closeDrawer(); });
  });

  // ── Collapsible JSON Objects ──────────────────────────────────────
  window.toggleJson = function(header) { header.closest('.json-object').classList.toggle('expanded'); };
  window.toggleNestedJson = function(field) { field.classList.toggle('expanded'); };
  const firstCollapsible = document.querySelector('[data-collapsible]');
  if (firstCollapsible) firstCollapsible.classList.add('expanded');

  // ── Skill Tab Switching ───────────────────────────────────────────
  window.switchSkillTab = function(tab, btnEl) {
    document.getElementById('skill-panel-technical').style.display = tab === 'technical' ? '' : 'none';
    document.getElementById('skill-panel-soft').style.display = tab === 'soft' ? '' : 'none';
    document.querySelectorAll('.skill-tab').forEach(t => t.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');
    showToast(200, `GET /skills/${tab}`);
    bumpRequest('GET');
  };

  // ── Mobile Bottom Tabs scroll spy ────────────────────────────────
  const mobileTabObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id   = entry.target.id;
        const tabs = document.querySelectorAll('.mobile-tab');
        tabs.forEach(tab => {
          const isActive  = tab.dataset.section === id;
          const wasActive = tab.classList.contains('active');
          tab.classList.toggle('active', isActive);
          if (isActive && !wasActive) {
            tab.classList.add('just-activated');
            setTimeout(() => tab.classList.remove('just-activated'), 400);
          }
        });
      }
    });
  }, { rootMargin: '-30% 0px -50% 0px', threshold: 0 });
  sections.forEach(section => mobileTabObserver.observe(section));

  // ── Scroll Progress Bar ───────────────────────────────────────────
  const scrollBar = document.getElementById('scroll-progress-bar');
  if (scrollBar) {
    window.addEventListener('scroll', () => {
      const pct = document.documentElement.scrollHeight - window.innerHeight;
      scrollBar.style.width = (pct > 0 ? (window.scrollY / pct) * 100 : 0) + '%';
    }, { passive: true });
  }

})();
