/* ═══════════════════════════════════════════════════════════════════
   Portfolio v2 — Interactivity
   ═══════════════════════════════════════════════════════════════════ */

(function() {
  'use strict';

  // ── Dev.to Writing Widget ─────────────────────────────────────────
  (async function loadWriting() {
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
        'https://dev.to/api/articles?username=dev-deepanshu-kumar&per_page=3',
        { headers: { 'Accept': 'application/json' } }
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

  // ── Boot Sequence ─────────────────────────────────────────────────
  const bootOverlay = document.getElementById('boot-overlay');
  const bootLines = bootOverlay.querySelectorAll('.boot-line');

  bootLines.forEach(line => {
    const delay = parseInt(line.dataset.delay) || 0;
    setTimeout(() => line.classList.add('show'), delay);
  });

  // End boot after all lines shown + brief pause
  setTimeout(() => {
    bootOverlay.classList.add('done');
    // Remove from DOM after transition
    setTimeout(() => bootOverlay.remove(), 600);
  }, 3200);


  // ── Hero Terminal Typing ────────────────────────────────────────────
  const heroCmd = document.getElementById('hero-cmd');
  const heroResponse = document.getElementById('hero-response');
  const heroText = 'curl https://deepanshu-kumar.dev';

  function typeHero() {
    let i = 0;
    const cursor = document.querySelector('.hero-cursor');

    function typeChar() {
      if (i < heroText.length) {
        heroCmd.textContent += heroText[i];
        i++;
        setTimeout(typeChar, 35 + Math.random() * 25);
      } else {
        // Done typing — show response lines
        if (cursor) cursor.style.display = 'none';
        setTimeout(revealResponse, 300);
      }
    }

    function revealResponse() {
      const lines = heroResponse.querySelectorAll('.hero-resp-line');
      lines.forEach((line, idx) => {
        setTimeout(() => line.classList.add('show'), idx * 150);
      });
    }

    // Start after boot sequence ends
    setTimeout(typeChar, 3500);
  }
  typeHero();


  // ── Typed Motto (x-motto header) ─────────────────────────────────
  function typedMotto() {
    const phrases = [
      'C# · .NET · ASP.NET Core',
      'Backend Engineer · Problem Solver',
      'REST APIs · Microservices',
      'From monolith to microservices — one PR at a time.',
      'I ask why before I ask how.',
      'Good APIs are invisible. Bad ones haunt you.',
      'Build it right. Then build it fast.',
      "I don't chase clever code. I chase clear code.",
      "I like software that's easy to change.",
      'I fix causes, not symptoms.',
      'The best fix is the one nobody notices.',
      'Async by default. Thoughtful by choice.',
      'Understanding the problem before writing the solution.',
      'I care as much about maintainability as functionality.',
      'If it\'s flaky, I\'ll find out why.',
      'I read the error logs, not just the tickets.',
    ];

    // Shuffle
    for (let i = phrases.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [phrases[i], phrases[j]] = [phrases[j], phrases[i]];
    }

    const el = document.getElementById('hero-typed');
    const cursor = document.querySelector('.hero-typed-cursor');
    if (!el) return;

    let phraseIdx = 0, charIdx = 0, isDeleting = false, pause = 0;

    function tick() {
      if (pause > 0) { pause--; setTimeout(tick, 40); return; }

      const current = phrases[phraseIdx];

      if (!isDeleting) {
        el.textContent = current.slice(0, charIdx + 1);
        charIdx++;
        if (charIdx >= current.length) {
          isDeleting = true;
          pause = 50; // pause at full text
        }
        setTimeout(tick, 40 + Math.random() * 30);
      } else {
        el.textContent = current.slice(0, charIdx - 1);
        charIdx--;
        if (charIdx <= 0) {
          isDeleting = false;
          phraseIdx = (phraseIdx + 1) % phrases.length;
          pause = 10;
        }
        setTimeout(tick, 25);
      }
    }

    // Start after hero response lines show (~5.5s from page load)
    setTimeout(tick, 5500);
  }
  typedMotto();


  // ── Scroll Spy + Entrance Animations ─────────────────────────────

  const sections = document.querySelectorAll('.endpoint-section');
  const sidebarLinks = document.querySelectorAll('.sidebar-link[href^="#"]');

  // Scroll spy — highlight active sidebar link
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

  // Entrance animation — sections fade in on scroll
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target); // once only
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
    sidebar.classList.add('open');
    hamburger.classList.add('active');
    if (!backdrop) createBackdrop();
    backdrop.classList.add('visible');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    sidebar.classList.remove('open');
    hamburger.classList.remove('active');
    if (backdrop) backdrop.classList.remove('visible');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () => {
    sidebar.classList.contains('open') ? closeDrawer() : openDrawer();
  });

  // Close drawer when sidebar link clicked (mobile)
  sidebarLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 900) closeDrawer();
    });
  });


  // ── Collapsible JSON Objects ──────────────────────────────────────

  window.toggleJson = function(header) {
    const obj = header.closest('.json-object');
    obj.classList.toggle('expanded');
  };

  window.toggleNestedJson = function(field) {
    field.classList.toggle('expanded');
  };

  // Auto-expand first role on load
  const firstCollapsible = document.querySelector('[data-collapsible]');
  if (firstCollapsible) firstCollapsible.classList.add('expanded');


  // ── Skill Tab Switching ───────────────────────────────────────────
  window.switchSkillTab = function(tab, btnEl) {
    // Toggle panels
    document.getElementById('skill-panel-technical').style.display = tab === 'technical' ? '' : 'none';
    document.getElementById('skill-panel-soft').style.display = tab === 'soft' ? '' : 'none';
    // Toggle active tab button
    document.querySelectorAll('.skill-tab').forEach(t => t.classList.remove('active'));
    btnEl.classList.add('active');
    // HTTP toast
    showToast(200, `GET /skills/${tab}`);
    bumpRequest('GET');
  };


  // ── Mobile Bottom Tabs ────────────────────────────────────────────
  const mobileTabs = document.querySelectorAll('.mobile-tab');

  // Sync mobile tabs with scroll spy + bump animation
  const mobileTabObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        mobileTabs.forEach(tab => {
          const isActive = tab.dataset.section === id;
          const wasActive = tab.classList.contains('active');
          tab.classList.toggle('active', isActive);
          // Bump animation when newly activated
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
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      scrollBar.style.width = pct + '%';
    }, { passive: true });
  }


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

  // Fire on mobile tab clicks
  mobileTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      const isPost = tab.querySelector('.method-post') !== null;
      fireRequestFly(tab, isPost);
    });
  });


  // ── Live Uptime Counter ────────────────────────────────────────────
  // Career start: Dec 2, 2019
  const CAREER_START = new Date(2019, 11, 2);
  // Gap period (excluded): Jan 2021 – Mar 2022 = ~456 days
  const GAP_DAYS = 456;

  function updateUptime() {
    const now = new Date();
    let totalMs = now - CAREER_START;
    totalMs -= GAP_DAYS * 86400000; // subtract gap

    const totalSecs = Math.floor(totalMs / 1000);
    const years = Math.floor(totalSecs / (365.25 * 86400));
    const months = Math.floor((totalSecs % (365.25 * 86400)) / (30.44 * 86400));
    const days = Math.floor((totalSecs % (30.44 * 86400)) / 86400);
    const hours = Math.floor((totalSecs % 86400) / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;

    const el = (id) => document.getElementById(id);
    if (el('uptime-years')) el('uptime-years').textContent = years;
    if (el('uptime-months')) el('uptime-months').textContent = months;
    if (el('uptime-days')) el('uptime-days').textContent = days;
    if (el('uptime-hours')) el('uptime-hours').textContent = hours;
    if (el('uptime-mins')) el('uptime-mins').textContent = String(mins).padStart(2, '0');
    if (el('uptime-secs')) el('uptime-secs').textContent = String(secs).padStart(2, '0');

    // Mobile compact uptime with tick
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
  const visitedSections = new Set();
  const totalEndpoints = 6;

  const rateLimitObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        visitedSections.add(entry.target.id);
        const count = visitedSections.size;
        const pct = (count / totalEndpoints * 100) + '%';
        const fill = document.getElementById('ratelimit-fill');
        const text = document.getElementById('ratelimit-text');
        if (fill) fill.style.width = pct;
        if (text) text.textContent = `${count} / ${totalEndpoints} endpoints explored`;
        // Mobile widget sync
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

  function bumpRequest(type) {
    if (type === 'POST') reqPosts++;
    else reqGets++;
    const total = reqGets + reqPosts;
    const countEl = document.getElementById('req-count');
    const breakdownEl = document.getElementById('req-breakdown');
    if (countEl) {
      countEl.textContent = total;
      countEl.classList.add('bump');
      setTimeout(() => countEl.classList.remove('bump'), 150);
    }
    if (breakdownEl) breakdownEl.textContent = `${reqGets} GET · ${reqPosts} POST`;
    // Mobile widget sync
    const mwReq = document.getElementById('mw-requests');
    if (mwReq) mwReq.textContent = total;
  }

  // Hook into existing interactions
  // Scroll → GET, Validator run → POST, Skill click → GET
  const reqScrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.reqCounted) {
        entry.target.dataset.reqCounted = 'true';
        bumpRequest('GET');
      }
    });
  }, { threshold: 0.5 });
  sections.forEach(s => reqScrollObserver.observe(s));


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


  // ── Skill Terminal (man page) ─────────────────────────────────────
  const SKILL_DATA = {
    "C#": { synopsis: "Primary language · 5+ years daily", usage: "All backend services, APIs, shared libraries, Azure Functions", where: "Siemens, IndiaLends, Telebu", see: "ASP.NET Core, .NET Core, LINQ" },
    "SQL": { synopsis: "Query language for relational databases", usage: "Stored procedures, query optimization, migrations, reporting", where: "All companies — SQL Server primary", see: "T-SQL, Dapper, EF Core" },
    "JavaScript": { synopsis: "Frontend & scripting", usage: "jQuery UI components, Azure Function triggers, this portfolio", where: "IndiaLends (frontend), Siemens (DevExpress)", see: "jQuery, Vue.js" },
    "ASP.NET Core": { synopsis: "Web framework for .NET", usage: "REST APIs, Minimal APIs, MVC endpoints, middleware pipelines", where: "Siemens (dashboard satellite, P&S microservice)", see: "Minimal APIs, REST, OIDC" },
    ".NET Core": { synopsis: "Cross-platform runtime", usage: "All new services since 2022, shared libraries, container targets", where: "Siemens, IndiaLends", see: "ASP.NET Core, Docker" },
    "Minimal APIs": { synopsis: ".NET 8 lightweight API pattern", usage: "Dashboard satellite service, P&S microservice endpoints", where: "Siemens — new services", see: "ASP.NET Core, REST" },
    "REST": { synopsis: "API design pattern", usage: "All service interfaces — resource-oriented, versioned, documented", where: "All companies", see: "Swagger/OpenAPI, JSON" },
    "CQRS / MediatR": { synopsis: "Command/Query separation + mediator", usage: "P&S microservice — separate read/write models", where: "Siemens", see: "DDD, Clean Architecture" },
    "DDD": { synopsis: "Domain-Driven Design", usage: "Aggregate design, bounded contexts, ubiquitous language in P&S service", where: "Siemens (P&S microservice)", see: "Clean Architecture, CQRS" },
    "Clean Architecture": { synopsis: "Layered dependency inversion", usage: "Service structure: Domain → Application → Infrastructure → API", where: "Siemens — all new services", see: "DDD, CQRS / MediatR" },
    "Microservices": { synopsis: "Independently deployable services", usage: "Dashboard satellite (Strangler Fig), P&S service, credential service", where: "Siemens — platform modernisation", see: "Docker, REST, DDD" },
    "BDD": { synopsis: "Behaviour-Driven Development", usage: "SpecFlow/ReqnRoll scenarios, Given-When-Then test structure", where: "Siemens — all new services", see: "NUnit, SpecFlow, Moq" },
    "Azure Functions": { synopsis: "Serverless compute", usage: "HTTP triggers (webhooks), Queue/Blob/Timer triggers for async workflows", where: "IndiaLends — document processing, scheduled reports", see: "Service Bus, Blob Storage" },
    "Entity Framework": { synopsis: "ORM for .NET (EF6 legacy)", usage: "Existing monolith data access layer — 170+ project codebase", where: "Siemens (legacy platform)", see: "EF Core, Dapper, LINQ" },
    "EF Core": { synopsis: "Modern ORM for .NET Core", usage: "New service data layers, migrations, code-first models", where: "Siemens (new services)", see: "Dapper, LINQ, PostgreSQL" },
    "Dapper": { synopsis: "Micro-ORM — raw SQL performance", usage: "Replaced EF for dashboard — 3x faster queries via stored procs", where: "Siemens (dashboard optimization)", see: "T-SQL, SQL Server" },
    "LINQ": { synopsis: "Language-integrated query", usage: "Collection transformations, EF queries, data pipeline operations", where: "All companies", see: "EF Core, C#" },
    "T-SQL": { synopsis: "SQL Server dialect", usage: "Stored procedures, views, performance tuning, index optimization", where: "Siemens, IndiaLends", see: "SQL Server, Dapper" },
    "SQL Server": { synopsis: "Primary relational database", usage: "Multi-tenant schemas, stored procs, maintenance jobs, Always On AG", where: "Siemens, IndiaLends", see: "T-SQL, Dapper, EF Core" },
    "PostgreSQL": { synopsis: "Open-source relational DB", usage: "New microservice data stores, container-friendly deployments", where: "Siemens (new services)", see: "EF Core, Docker" },
    "Redis": { synopsis: "In-memory cache / data store", usage: "Session caching, credential caching (shared library), distributed lock", where: "Siemens (shared NuGet library)", see: "AWS Secrets Manager, Resiliency" },
    "Azure App Service": { synopsis: "PaaS web hosting", usage: "Production deployment target for monolith and satellites", where: "Siemens, IndiaLends", see: "Docker, Azure DevOps" },
    "Service Bus": { synopsis: "Enterprise message broker", usage: "Async event-driven workflows, decoupled service communication", where: "IndiaLends (financial workflows)", see: "Azure Functions, Queue triggers" },
    "Blob Storage": { synopsis: "Azure object storage", usage: "Document storage, report generation output, file upload handling", where: "IndiaLends", see: "Azure Functions" },
    "AWS Secrets Manager": { synopsis: "Cloud secret management", usage: "Secure DB credential resolution, region-aware rotation in shared library", where: "Siemens (container migration)", see: "Redis, Resiliency Patterns" },
    "Docker": { synopsis: "Container runtime", usage: "Local dev environments, Linux container targets for platform migration", where: "Siemens (Windows→Linux migration)", see: "Microservices, .NET Core" },
    "OIDC / OAuth2": { synopsis: "Auth protocol standards", usage: "Enterprise SSO integration, token validation middleware", where: "Siemens (Auth0 ecosystem)", see: "JWT, Auth0, Cookie Auth" },
    "JWT": { synopsis: "JSON Web Tokens", usage: "API authentication, claims-based authorization, token refresh flows", where: "Siemens, IndiaLends", see: "OIDC, Auth0" },
    "Auth0": { synopsis: "Identity platform", usage: "Centralised auth service, tenant isolation, session management", where: "Siemens", see: "OIDC, JWT" },
    "VAPT Remediation": { synopsis: "Vulnerability & Penetration Testing fixes", usage: "Remediated findings from security assessments — XSS, CSRF, injection", where: "IndiaLends", see: "Auth, Security" },
    "Azure DevOps": { synopsis: "CI/CD + project management", usage: "Build pipelines, release gates, Azure Repos, work items", where: "IndiaLends, Siemens (boards)", see: "Jenkins, TeamCity" },
    "Jenkins": { synopsis: "CI/CD automation server", usage: "Production release pipelines, automated testing gates", where: "Siemens", see: "TeamCity, SonarQube" },
    "TeamCity": { synopsis: "JetBrains CI/CD", usage: "Build configurations, NuGet package publishing to MyGet", where: "Siemens", see: "Jenkins, MyGet" },
    "SonarQube": { synopsis: "Static code analysis", usage: "Code quality gates — coverage, duplication, complexity, vulnerabilities", where: "Siemens (CI pipeline)", see: "Snyk, Jenkins" },
    "Snyk": { synopsis: "Dependency vulnerability scanning", usage: "NuGet package security, container image scanning in CI", where: "Siemens", see: "SonarQube, Docker" },
    "Grafana": { synopsis: "Observability dashboards", usage: "Production monitoring — API latency, error rates, resource usage", where: "Siemens (production)", see: "Datadog" },
    "Datadog": { synopsis: "APM & monitoring platform", usage: "Distributed tracing, log aggregation, alerting on production issues", where: "Siemens", see: "Grafana" },
    "NUnit": { synopsis: "Unit testing framework", usage: "All unit + integration tests, parameterized test cases", where: "Siemens", see: "Moq, SpecFlow" },
    "SpecFlow": { synopsis: "BDD framework for .NET", usage: "Given-When-Then feature files, stakeholder-readable test specs", where: "Siemens", see: "ReqnRoll, NUnit" },
    "ReqnRoll": { synopsis: "SpecFlow successor (OSS)", usage: "Migration from SpecFlow, new BDD scenarios post-2024", where: "Siemens (new services)", see: "SpecFlow, NUnit" },
    "Moq": { synopsis: "Mocking framework", usage: "Dependency isolation in unit tests, verify interactions", where: "Siemens", see: "NUnit, BDD" },
  };

  document.querySelectorAll('.skill-tag').forEach(tag => {
    tag.style.cursor = 'pointer';
    tag.addEventListener('click', () => {
      // Deselect all, select this
      document.querySelectorAll('.skill-tag.selected').forEach(t => t.classList.remove('selected'));
      tag.classList.add('selected');
      bumpRequest('GET');
      const name = tag.textContent.trim();
      const data = SKILL_DATA[name];
      const terminal = document.getElementById('skill-terminal');
      const title = document.getElementById('skill-terminal-title');
      const body = document.getElementById('skill-terminal-body');

      if (!data) {
        title.textContent = `$ man ${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
        body.innerHTML = `<span class="man-dim">No manual entry for ${name}</span>`;
        terminal.classList.add('active');
        return;
      }

      title.textContent = `$ man ${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      body.innerHTML = `
        <div class="man-section">
          <div class="man-heading">NAME</div>
          <div class="man-content">${name}</div>
        </div>
        <div class="man-section">
          <div class="man-heading">SYNOPSIS</div>
          <div class="man-content">${data.synopsis}</div>
        </div>
        <div class="man-section">
          <div class="man-heading">USAGE</div>
          <div class="man-content man-content--gold">${data.usage}</div>
        </div>
        <div class="man-section">
          <div class="man-heading">WHERE</div>
          <div class="man-content man-content--green">${data.where}</div>
        </div>
        <div class="man-section">
          <div class="man-heading">SEE ALSO</div>
          <div class="man-content man-ref">${data.see}</div>
        </div>
      `;
      terminal.classList.add('active');
      terminal.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  });


  // ── Console Easter Egg ────────────────────────────────────────────
  console.log('%c' + `
  ╔═══════════════════════════════════════════════════════════╗
  ║                                                           ║
  ║   Hey! You opened DevTools. I like you already.           ║
  ║                                                           ║
  ║   🔧  Deepanshu Kumar                                     ║
  ║   💼  Backend Engineer · .NET · 5+ years                  ║
  ║   📍  Noida, India                                        ║
  ║                                                           ║
  ║   If you're hiring:                                       ║
  ║   → deepanshu.kumar@outlook.in                            ║
  ║   → linkedin.com/in/deepanshu-kumar-dev                   ║
  ║                                                           ║
  ║   This site: Zero dependencies. Vanilla JS. No framework. ║
  ║   Because sometimes the best architecture is the simplest. ║
  ║                                                           ║
  ╚═══════════════════════════════════════════════════════════╝
  `, 'color: #1ecbe1; font-family: monospace; font-size: 11px;');

  console.log('%cGET /hire-me → 200 OK', 'color: #49cc90; font-weight: bold; font-size: 14px;');


  // ── PAN Name Validator (Simplified for prototype) ─────────────────
  // Full weighted ensemble algorithm — Jaro-Winkler + Damerau-Levenshtein
  // + Dice/Sorensen + token sort

  window.runValidator = function() {
    const rawName1 = document.getElementById('vld-name1').value.trim();
    const rawName2 = document.getElementById('vld-name2').value.trim();
    const threshold = parseInt(document.getElementById('vld-threshold').value) || 72;
    const animate = document.getElementById('vld-animate').checked;
    const resultEl = document.getElementById('vld-result');
    const statusEl = document.getElementById('vld-status');
    const bodyEl = document.getElementById('vld-response-body');
    const traceEl = document.getElementById('pipeline-trace');
    const traceBody = document.getElementById('trace-body');
    const elapsedEl = document.getElementById('trace-elapsed');
    const btn = document.getElementById('vld-btn');

    bumpRequest('POST');

    if (!rawName1 || !rawName2) {
      resultEl.style.display = 'block';
      traceEl.style.display = 'none';
      statusEl.textContent = '400 Bad Request';
      statusEl.style.color = '#f87171';
      bodyEl.textContent = JSON.stringify({ error: "Both fields required", status: 400 }, null, 2);
      return;
    }

    const name1 = rawName1.toUpperCase();
    const name2 = rawName2.toUpperCase();

    // Strip titles
    const TITLES = /^(DR|MR|MRS|MS|SHRI|SMT|PROF)\.?\s+/i;
    const afterTitle1 = name1.replace(TITLES, '');
    const afterTitle2 = name2.replace(TITLES, '');
    const titlesFound = name1 !== afterTitle1 || name2 !== afterTitle2;

    // Expand common prefixes/suffixes
    const EXPANSIONS = {
      'MD': 'MOHAMMAD', 'MOHD': 'MOHAMMAD', 'MHD': 'MOHAMMAD',
      'PT': 'PANDIT', 'PD': 'PANDIT',
      'KR': 'KUMAR', 'KMR': 'KUMAR',
      'CH': 'CHANDRA', 'CHDR': 'CHANDRA',
      'SK': 'SHEIKH', 'SH': 'SHEIKH',
      'SM': 'SAMAN', 'SRI': 'SHRI',
      'RAM': 'RAMA', 'DEV': 'DEVI',
      'JR': 'JUNIOR', 'SR': 'SENIOR',
    };

    function expandAbbrevs(name) {
      const tokens = name.split(/\s+/);
      const expanded = tokens.map(t => EXPANSIONS[t] || t);
      return expanded.join(' ');
    }

    const expanded1 = expandAbbrevs(afterTitle1);
    const expanded2 = expandAbbrevs(afterTitle2);
    const expansionsApplied = expanded1 !== afterTitle1 || expanded2 !== afterTitle2;
    const stripped1 = expanded1;
    const stripped2 = expanded2;

    // Fast paths
    const isExact = stripped1 === stripped2;
    const tokens1 = stripped1.split(/\s+/).filter(Boolean);
    const tokens2 = stripped2.split(/\s+/).filter(Boolean);
    const isReversed = !isExact && tokens1.slice().reverse().join(' ') === tokens2.join(' ');

    // Abbreviation check — recursive permutation approach (matches original repo)
    // Generates all permutations of tokens + partial-initial variants, checks if
    // the shorter name (no spaces) exists in that set.

    function* _perms(arr, r) {
      if (!r) { yield []; return; }
      for (let i = 0; i < arr.length; i++)
        for (const p of _perms(arr.filter((_, j) => j !== i), r - 1)) yield [arr[i], ...p];
    }

    function _abbrevs(nm) {
      const tk = nm.split(' '), out = new Set();
      for (let r = 0; r <= tk.length; r++)
        for (const p of _perms(tk, r)) out.add(p.join(''));
      return out;
    }

    function _abbrevPnC(nm) {
      const tk = nm.split(' '), out = new Set();
      // it <= tk.length: allows replacing ALL tokens with initials (e.g. "DK" from "DEEPANSHU KUMAR")
      for (let it = 1; it <= tk.length; it++) {
        for (let i = 0; i <= tk.length - it; i++) {
          const t = [...tk];
          for (let j = i; j < i + it; j++) t[j] = tk[j][0] || '';
          for (const a of _abbrevs(t.join(' '))) out.add(a);
        }
      }
      return out;
    }

    const longer = stripped1.length >= stripped2.length ? stripped1 : stripped2;
    const shorter = (stripped1.length >= stripped2.length ? stripped2 : stripped1).replace(/ /g, '');
    const abbrevSet = _abbrevs(longer);
    const abbrevPnCSet = _abbrevPnC(longer);
    const hasAbbrev = abbrevSet.has(shorter) || abbrevPnCSet.has(shorter);
    // Collect a sample of generated abbreviations for the trace display (filter empty strings)
    const abbrevSamples = [...new Set([...abbrevSet, ...abbrevPnCSet])].filter(a => a.length > 0).slice(0, 12);

    // Generate phonetic variations (Indian names)
    function getVariations(name) {
      const vars = [name];
      const rules = [
        [/PH/g, 'F'], [/EE/g, 'I'], [/OO/g, 'U'],
        [/TH/g, 'T'], [/DH/g, 'D'], [/SH/g, 'S'],
        [/GH/g, 'G'], [/KH/g, 'K'], [/BH/g, 'B'],
        [/AA/g, 'A'], [/EE/g, 'I'], [/Y$/g, 'I'],
        [/W/g, 'V'], [/Z/g, 'J'],
      ];
      rules.forEach(([pat, rep]) => {
        const v = name.replace(pat, rep);
        if (v !== name && !vars.includes(v)) vars.push(v);
      });
      return vars;
    }
    const variations1 = getVariations(stripped1);
    const variations2 = getVariations(stripped2);

    // Find which variation pairs are closest
    let bestVarPair = null;
    let bestVarScore = 0;
    variations1.forEach(v1 => {
      variations2.forEach(v2 => {
        const s = jaroWinkler(v1, v2);
        if (s > bestVarScore) { bestVarScore = s; bestVarPair = [v1, v2]; }
      });
    });

    // Calculate scores
    const jw = jaroWinkler(stripped1, stripped2);
    const dl = 1 - (damerauLevenshtein(stripped1, stripped2) / Math.max(stripped1.length, stripped2.length));
    const dice = diceCoefficient(stripped1, stripped2);
    const tokenSort = tokenSortRatio(stripped1, stripped2);
    const composite = Math.round((jw * 0.35 + dl * 0.25 + dice * 0.20 + tokenSort * 0.20) * 100);
    const isMatch = composite >= threshold;
    const band = Math.abs(composite - threshold) <= 5;

    const finalResult = {
      match: isMatch,
      composite_score: composite,
      threshold: threshold,
      verdict: isMatch ? "MATCH" : (band ? "REVIEW_BAND" : "REJECT"),
      fallback_required: band,
      algorithms: {
        jaro_winkler: { score: Math.round(jw * 100), weight: 0.35 },
        damerau_levenshtein: { score: Math.round(dl * 100), weight: 0.25 },
        dice_coefficient: { score: Math.round(dice * 100), weight: 0.20 },
        token_sort: { score: Math.round(tokenSort * 100), weight: 0.20 }
      },
      input: { name_on_pan: stripped1, name_provided: stripped2 }
    };

    function showResult() {
      statusEl.textContent = '200 OK';
      statusEl.style.color = 'var(--method-get)';
      resultEl.style.display = 'block';
      bodyEl.textContent = JSON.stringify(finalResult, null, 2);
      btn.disabled = false;
      btn.textContent = 'Send Request';
      // Scroll to the response
      setTimeout(() => {
        resultEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }

    // Quick mode
    if (!animate) {
      traceEl.style.display = 'none';
      showResult();
      return;
    }

    // ── Animated trace mode ───────────────────────────────────────
    btn.disabled = true;
    btn.textContent = 'Processing...';
    resultEl.style.display = 'none';
    traceEl.style.display = 'block';
    traceBody.innerHTML = '';

    let elapsed = 0;
    const timer = setInterval(() => {
      elapsed += 50;
      if (elapsedEl) elapsedEl.textContent = elapsed + 'ms';
    }, 50);

    // Build trace steps as an array of {delay, html}
    const trace = [];
    let delay = 0;
    const STEP = 350;

    // Step 1: Normalize
    delay += STEP;
    trace.push({ delay, html: `
      <div class="trace-step">
        <div class="trace-label"><span class="trace-icon trace-icon--done"></span><span class="trace-action">Normalize — uppercase, trim whitespace</span></div>
        <div class="trace-data trace-data--highlight">
          <span class="trace-dim">pan →</span> <span class="trace-val">"${name1}"</span><br>
          <span class="trace-dim">provided →</span> <span class="trace-val">"${name2}"</span>
        </div>
      </div>
    `});

    // Step 2: Strip titles (only show if titles found)
    if (titlesFound) {
      delay += STEP;
      trace.push({ delay, html: `
        <div class="trace-step">
          <div class="trace-label"><span class="trace-icon trace-icon--done"></span><span class="trace-action">Strip titles — Dr., Mr., Shri, Smt.</span></div>
          <div class="trace-data trace-data--highlight">
            <span class="trace-dim">cleaned →</span> <span class="trace-val">"${afterTitle1}"</span> vs <span class="trace-val">"${afterTitle2}"</span>
          </div>
        </div>
      `});
    }

    // Step 2b: Expand abbreviations (Md→Mohammad, Kr→Kumar, etc.)
    if (expansionsApplied) {
      delay += STEP;
      trace.push({ delay, html: `
        <div class="trace-step">
          <div class="trace-label"><span class="trace-icon trace-icon--done"></span><span class="trace-action">Expand prefixes/suffixes — Md, Kr, Pt, Ch, Sk</span></div>
          <div class="trace-data trace-data--highlight">
            ${afterTitle1 !== expanded1 ? `<span class="trace-dim">"${afterTitle1}" →</span> <span class="trace-val">"${expanded1}"</span><br>` : ''}
            ${afterTitle2 !== expanded2 ? `<span class="trace-dim">"${afterTitle2}" →</span> <span class="trace-val">"${expanded2}"</span>` : ''}
            ${afterTitle1 === expanded1 && afterTitle2 !== expanded2 ? '' : afterTitle1 !== expanded1 && afterTitle2 === expanded2 ? '' : ''}
          </div>
        </div>
      `});
    } else {
      delay += STEP;
      trace.push({ delay, html: `
        <div class="trace-step">
          <div class="trace-label"><span class="trace-icon trace-icon--skip"></span><span class="trace-action">Expand prefixes/suffixes — <span class="trace-dim">none found</span></span></div>
        </div>
      `});
    }

    // Step 3: Exact match check
    delay += STEP;
    if (isExact) {
      trace.push({ delay, html: `
        <div class="trace-step">
          <div class="trace-label"><span class="trace-icon trace-icon--hit"></span><span class="trace-action">Fast-path: Exact match — <span class="trace-green">HIT!</span></span></div>
          <div class="trace-data trace-data--green">
            <span class="trace-green">✓ Names are identical. Short-circuit → 100% match</span>
          </div>
        </div>
      `});
      // Short circuit — show result after this
      runTrace(trace, traceBody, () => { clearInterval(timer); finalResult.composite_score = 100; finalResult.match = true; finalResult.verdict = "MATCH"; showResult(); });
      return;
    } else {
      trace.push({ delay, html: `
        <div class="trace-step">
          <div class="trace-label"><span class="trace-icon trace-icon--skip"></span><span class="trace-action">Fast-path: Exact match — <span class="trace-dim">no hit</span></span></div>
        </div>
      `});
    }

    // Step 4: Reversed order
    delay += STEP;
    if (isReversed) {
      trace.push({ delay, html: `
        <div class="trace-step">
          <div class="trace-label"><span class="trace-icon trace-icon--hit"></span><span class="trace-action">Fast-path: Reversed word order — <span class="trace-green">HIT!</span></span></div>
          <div class="trace-data trace-data--green">
            <span class="trace-dim">"${tokens1.join(' ')}"</span> = <span class="trace-dim">"${tokens2.join(' ')}"</span> reversed<br>
            <span class="trace-green">✓ Match confirmed via word reorder</span>
          </div>
        </div>
      `});
      runTrace(trace, traceBody, () => { clearInterval(timer); finalResult.composite_score = 98; finalResult.match = true; finalResult.verdict = "MATCH"; showResult(); });
      return;
    } else {
      trace.push({ delay, html: `
        <div class="trace-step">
          <div class="trace-label"><span class="trace-icon trace-icon--skip"></span><span class="trace-action">Fast-path: Reversed word order — <span class="trace-dim">no hit</span></span></div>
        </div>
      `});
    }

    // Step 5: Abbreviation (recursive permutation)
    delay += STEP;
    const abbrevDisplay = abbrevSamples.map((a, i) =>
      `<span class="trace-var${a === shorter ? ' trace-var--match' : ''}" style="animation-delay:${i * 60}ms">${a}</span>`
    ).join('');

    trace.push({ delay, html: `
      <div class="trace-step">
        <div class="trace-label"><span class="trace-icon ${hasAbbrev ? 'trace-icon--hit' : 'trace-icon--skip'}"></span><span class="trace-action">Fast-path: Abbreviation (recursive permutations) — <span class="${hasAbbrev ? 'trace-green' : 'trace-dim'}">${hasAbbrev ? 'HIT!' : 'no hit'}</span></span></div>
        <div class="trace-data ${hasAbbrev ? 'trace-data--green' : ''}">
          <span class="trace-dim">Generated from "${longer}":</span>
          <div class="trace-variations">${abbrevDisplay}</div>
          <div style="margin-top:6px;">
            <span class="trace-dim">Looking for:</span> <span class="trace-hl">"${shorter}"</span>
            ${hasAbbrev ? '<span class="trace-green" style="margin-left:8px;">✓ Found in set!</span>' : '<span class="trace-dim" style="margin-left:8px;">— not in set</span>'}
          </div>
        </div>
      </div>
    `});

    // Step 6: Phonetic variations
    delay += STEP;
    const phoneticIsExact = Math.round(bestVarScore * 100) === 100;
    const varHtml = variations1.length > 1 || variations2.length > 1
      ? `<div class="trace-data ${phoneticIsExact ? 'trace-data--green' : 'trace-data--highlight'}">
          <span class="trace-dim">Variations of "${stripped1}":</span>
          <div class="trace-variations" id="trace-vars">
            ${variations1.map((v, i) => `<span class="trace-var${bestVarPair && v === bestVarPair[0] ? ' trace-var--match' : ''}" style="animation-delay:${i * 80}ms">${v}</span>`).join('')}
          </div>
          <span class="trace-dim" style="margin-top:6px;display:block;">Variations of "${stripped2}":</span>
          <div class="trace-variations">
            ${variations2.map((v, i) => `<span class="trace-var${bestVarPair && v === bestVarPair[1] ? ' trace-var--match' : ''}" style="animation-delay:${(i + variations1.length) * 80}ms">${v}</span>`).join('')}
          </div>
          ${bestVarPair ? `<div style="margin-top:6px;"><span class="trace-dim">Best phonetic pair:</span> <span class="trace-hl">"${bestVarPair[0]}"</span> ↔ <span class="trace-hl">"${bestVarPair[1]}"</span> <span class="${phoneticIsExact ? 'trace-green' : 'trace-gold'}">${Math.round(bestVarScore * 100)}%</span></div>` : ''}
          ${phoneticIsExact ? '<div style="margin-top:6px;"><span class="trace-green">✓ Phonetic variation is exact match — short-circuit!</span></div>' : ''}
        </div>` : '';

    trace.push({ delay, html: `
      <div class="trace-step">
        <div class="trace-label"><span class="trace-icon ${phoneticIsExact ? 'trace-icon--hit' : 'trace-icon--done'}"></span><span class="trace-action">Generating phonetic variations (Indian name rules)${phoneticIsExact ? ' — <span class="trace-green">HIT!</span>' : ''}</span></div>
        ${varHtml}
      </div>
    `});

    // Short-circuit if phonetic match is 100%
    if (phoneticIsExact) {
      finalResult.composite_score = 100;
      finalResult.match = true;
      finalResult.verdict = "MATCH";
      finalResult.reason = "phonetic_exact";
      runTrace(trace, traceBody, () => { clearInterval(timer); showResult(); });
      return;
    }

    // Step 7-10: Algorithm scores with bars
    const algos = [
      { name: 'Jaro-Winkler', desc: 'prefix-weighted char similarity', score: Math.round(jw * 100), weight: '35%' },
      { name: 'Damerau-Levenshtein', desc: 'edit distance (normalized)', score: Math.round(dl * 100), weight: '25%' },
      { name: 'Dice Coefficient', desc: 'bigram overlap', score: Math.round(dice * 100), weight: '20%' },
      { name: 'Token Sort', desc: 'order-independent comparison', score: Math.round(tokenSort * 100), weight: '20%' },
    ];

    algos.forEach(algo => {
      delay += STEP;
      const barColor = algo.score >= threshold ? 'trace-bar-fill--green' : (algo.score >= threshold - 10 ? '' : 'trace-bar-fill--gold');
      trace.push({ delay, html: `
        <div class="trace-step">
          <div class="trace-label"><span class="trace-icon trace-icon--done"></span><span class="trace-action">${algo.name} <span class="trace-dim">(${algo.desc})</span></span></div>
          <div class="trace-data">
            <div class="trace-score-bar">
              <div class="trace-bar-track"><div class="trace-bar-fill ${barColor}" style="width:${algo.score}%"></div></div>
              <span class="trace-bar-val">${algo.score}%</span>
              <span class="trace-dim">× ${algo.weight}</span>
            </div>
          </div>
        </div>
      `});
    });

    // Step 11: Composite
    delay += STEP;
    const verdictColor = isMatch ? 'trace-green' : (band ? 'trace-gold' : 'trace-red');
    const verdictText = isMatch ? '✓ MATCH' : (band ? '⚠ REVIEW BAND (fallback to API)' : '✗ REJECT');
    trace.push({ delay, html: `
      <div class="trace-step">
        <div class="trace-label"><span class="trace-icon trace-icon--done"></span><span class="trace-action">Weighted composite score</span></div>
        <div class="trace-data trace-data--${isMatch ? 'green' : (band ? 'gold' : 'red')}">
          <div class="trace-score-bar">
            <div class="trace-bar-track"><div class="trace-bar-fill ${isMatch ? 'trace-bar-fill--green' : ''}" style="width:${composite}%"></div></div>
            <span class="trace-bar-val" style="font-size:14px;">${composite}%</span>
            <span class="trace-dim">threshold: ${threshold}%</span>
          </div>
          <div style="margin-top:8px;font-size:13px;"><span class="${verdictColor}">${verdictText}</span></div>
        </div>
      </div>
    `});

    // Run the trace
    runTrace(trace, traceBody, () => { clearInterval(timer); showResult(); });
  };

  function runTrace(steps, container, onDone) {
    steps.forEach((step, i) => {
      setTimeout(() => {
        container.insertAdjacentHTML('beforeend', step.html);
        // Auto-scroll to bottom
        container.scrollTop = container.scrollHeight;
        // Trigger bar fill animation (bars start at 0 width via CSS)
        const bars = container.querySelectorAll('.trace-bar-fill');
        bars.forEach(b => { const w = b.style.width; b.style.width = '0'; requestAnimationFrame(() => b.style.width = w); });
        // If last step, call onDone
        if (i === steps.length - 1) setTimeout(onDone, 500);
      }, step.delay);
    });
  }

  // ── Algorithm implementations ────────────────────────────────────

  function jaroWinkler(s1, s2) {
    if (s1 === s2) return 1;
    const len1 = s1.length, len2 = s2.length;
    const maxDist = Math.floor(Math.max(len1, len2) / 2) - 1;
    const match1 = new Array(len1).fill(false);
    const match2 = new Array(len2).fill(false);
    let matches = 0, transpositions = 0;

    for (let i = 0; i < len1; i++) {
      const start = Math.max(0, i - maxDist);
      const end = Math.min(i + maxDist + 1, len2);
      for (let j = start; j < end; j++) {
        if (match2[j] || s1[i] !== s2[j]) continue;
        match1[i] = match2[j] = true;
        matches++;
        break;
      }
    }
    if (matches === 0) return 0;

    let k = 0;
    for (let i = 0; i < len1; i++) {
      if (!match1[i]) continue;
      while (!match2[k]) k++;
      if (s1[i] !== s2[k]) transpositions++;
      k++;
    }

    const jaro = (matches / len1 + matches / len2 + (matches - transpositions / 2) / matches) / 3;
    let prefix = 0;
    for (let i = 0; i < Math.min(4, Math.min(len1, len2)); i++) {
      if (s1[i] === s2[i]) prefix++;
      else break;
    }
    return jaro + prefix * 0.1 * (1 - jaro);
  }

  function damerauLevenshtein(s1, s2) {
    const len1 = s1.length, len2 = s2.length;
    const d = Array.from({length: len1 + 1}, () => new Array(len2 + 1).fill(0));
    for (let i = 0; i <= len1; i++) d[i][0] = i;
    for (let j = 0; j <= len2; j++) d[0][j] = j;

    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = s1[i-1] === s2[j-1] ? 0 : 1;
        d[i][j] = Math.min(
          d[i-1][j] + 1,
          d[i][j-1] + 1,
          d[i-1][j-1] + cost
        );
        if (i > 1 && j > 1 && s1[i-1] === s2[j-2] && s1[i-2] === s2[j-1]) {
          d[i][j] = Math.min(d[i][j], d[i-2][j-2] + cost);
        }
      }
    }
    return d[len1][len2];
  }

  function diceCoefficient(s1, s2) {
    if (s1.length < 2 || s2.length < 2) return 0;
    const bigrams1 = new Set();
    const bigrams2 = new Set();
    for (let i = 0; i < s1.length - 1; i++) bigrams1.add(s1.slice(i, i + 2));
    for (let i = 0; i < s2.length - 1; i++) bigrams2.add(s2.slice(i, i + 2));
    let intersection = 0;
    bigrams1.forEach(b => { if (bigrams2.has(b)) intersection++; });
    return (2 * intersection) / (bigrams1.size + bigrams2.size);
  }

  function tokenSortRatio(s1, s2) {
    const sorted1 = s1.split(/\s+/).sort().join(' ');
    const sorted2 = s2.split(/\s+/).sort().join(' ');
    return jaroWinkler(sorted1, sorted2);
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
