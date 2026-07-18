
    function particleSystem() {
      const canvas = document.getElementById('particle-canvas');
      const ctx    = canvas.getContext('2d');
      let W, H, particles = [];
      let mouseX = -9999, mouseY = -9999;

      const PARTICLE_COUNT     = 80;
      const LINE_MAX_DIST      = 130;
      const MOUSE_REPEL_RADIUS = 160;

      function resizeCanvas() {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
      }

      class Particle {
        constructor(spawnAnywhere) {
          this.reset(spawnAnywhere);
        }

        reset(spawnAnywhere) {
          this.x     = Math.random() * W;
          this.y     = spawnAnywhere ? Math.random() * H : -10;
          this.vx    = (Math.random() - 0.5) * 0.35;
          this.vy    = Math.random() * 0.3 + 0.1;
          this.r     = Math.random() * 1.5 + 0.5;
          this.alpha = Math.random() * 0.5 + 0.15;
          const roll = Math.random();
          this.color = roll > 0.6 ? '#2b9cba' : roll > 0.3 ? '#e8aa4a' : '#1ecbe1';
        }

        update() {
          const dx   = this.x - mouseX;
          const dy   = this.y - mouseY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < MOUSE_REPEL_RADIUS) {
            const force = (MOUSE_REPEL_RADIUS - dist) / MOUSE_REPEL_RADIUS * 0.8;
            this.vx += (dx / dist) * force * 0.05;
            this.vy += (dy / dist) * force * 0.05;
          }

          this.vx *= 0.99;
          this.vy *= 0.99;
          this.x  += this.vx;
          this.y  += this.vy;

          if (this.y > H + 10 || this.x < -50 || this.x > W + 50) {
            this.reset(false);
          }
        }

        draw() {
          ctx.save();
          ctx.globalAlpha = this.alpha;
          ctx.fillStyle   = this.color;
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      function drawConnectingLines() {
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx   = particles[i].x - particles[j].x;
            const dy   = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < LINE_MAX_DIST) {
              const alpha = (1 - dist / LINE_MAX_DIST) * 0.12;
              ctx.save();
              ctx.globalAlpha = alpha;
              ctx.strokeStyle = '#2b9cba';
              ctx.lineWidth   = 0.6;
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.stroke();
              ctx.restore();
            }
          }
        }
      }

      function animationLoop() {
        ctx.clearRect(0, 0, W, H);
        particles.forEach(p => { p.update(); p.draw(); });
        drawConnectingLines();
        requestAnimationFrame(animationLoop);
      }

      window.addEventListener('resize', () => {
        resizeCanvas();
        particles = [];
        for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle(true));
      });
      document.addEventListener('mousemove',  e  => { mouseX = e.clientX; mouseY = e.clientY; });
      document.addEventListener('mouseleave', () => { mouseX = -9999; mouseY = -9999; });

      resizeCanvas();
      for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle(true));
      animationLoop();
    }


    function typedTitleEffect() {
      const phrases = [
        'C# · .NET · ASP.NET Core',
        'Enterprise SaaS · 5+ Years',
        'Clean Architecture · DDD',
        'REST APIs · Microservices',
        'I read the error logs, not just the tickets.',
        'Async by default. Thoughtful by choice.',
        'From monolith to microservices — one PR at a time.',
        'I care about the why, not just the what.',
        'Coffee-driven development. Deadline-aware.',
        'Building things that scale.',
      ];

      const el = document.getElementById('typed-text');
      let phraseIndex = 0;
      let charIndex   = 0;
      let isDeleting  = false;
      let pauseFrames = 0;

      function tick() {
        const currentPhrase = phrases[phraseIndex];

        if (pauseFrames > 0) {
          pauseFrames--;
          setTimeout(tick, 40);
          return;
        }

        if (!isDeleting) {
          el.textContent = currentPhrase.slice(0, charIndex + 1);
          charIndex++;
          if (charIndex >= currentPhrase.length) {
            isDeleting  = true;
            pauseFrames = 55;
          }
          setTimeout(tick, 70);
        } else {
          el.textContent = currentPhrase.slice(0, charIndex - 1);
          charIndex--;
          if (charIndex <= 0) {
            isDeleting  = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            pauseFrames = 12;
          }
          setTimeout(tick, 35);
        }
      }

      setTimeout(tick, 1000);
    }


    function navBehaviours() {
      const navbar    = document.getElementById('navbar');
      const hamburger = document.getElementById('nav-hamburger');
      const drawer    = document.getElementById('nav-drawer');

      window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 20);
      });

      hamburger.addEventListener('click', () => {
        drawer.classList.toggle('open');
      });
    }

    function closeDrawer() {
      document.getElementById('nav-drawer').classList.remove('open');
    }


    function scrollReveal() {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('visible');

          const statNum = entry.target.querySelector('[data-target]');
          if (statNum && !statNum.dataset.animated) {
            statNum.dataset.animated = '1';
            animateStatNumber(statNum);
          }
        });
      }, { threshold: 0.12 });

      document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    }


    function animateStatNumber(el) {
      const target = parseInt(el.dataset.target, 10);
      const suffix = el.dataset.suffix || '';
      let startTime = null;
      const DURATION = 1400;

      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / DURATION, 1);
        const eased    = 1 - Math.pow(1 - progress, 3);

        el.textContent = Math.floor(eased * target) + (progress < 1 ? '' : suffix);
        if (progress < 1) requestAnimationFrame(step);
      }

      requestAnimationFrame(step);
    }


    function toggleExpCard(cardElement) {
      cardElement.classList.toggle('exp-card--expanded');
    }

    function flipCard(wrapperElement) {
      wrapperElement.classList.toggle('flipped');
    }


    // Update start/end dates here when employment changes.
    // month is 0-indexed: Jan=0, Dec=11. end: null means still active.
    const CAREER_PERIODS = [
      {
        label: 'Telebu Communications (Tabiib)',
        start: new Date(2019, 11, 2),
        end:   new Date(2020, 11, 31),
      },
      {
        label: 'IndiaLends',
        start: new Date(2022, 3, 18),
        end:   new Date(2023, 11, 20),
      },
      {
        label: 'Siemens — Asset Management Software',
        start: new Date(2024, 0, 2),
        end:   null,
      },
    ];

    function careerTimer() {
      const periodsContainer = document.getElementById('timer-periods-container');
      const totalContainer   = document.getElementById('timer-total-display');
      const periodsLatestFirst = [...CAREER_PERIODS].reverse();

      const periodRows = periodsLatestFirst.map((period, i) => {
        const isActive = period.end === null;

        const row = document.createElement('div');
        row.innerHTML = `
          ${ i > 0 ? '<div class="timer-divider"></div>' : '' }
          <div class="timer-period">
            <div>
              <div class="timer-period-label">
                ${ isActive ? '<span style="color:var(--color-gold)">▶ </span>' : '' }
                ${ period.label }
              </div>
              <div class="timer-period-dates">
                ${ formatDate(period.start) } → ${ isActive ? 'Present' : formatDate(period.end) }
              </div>
            </div>
            <div class="timer-display" id="timer-period-${ i }"></div>
          </div>
        `;
        periodsContainer.appendChild(row);
        return document.getElementById(`timer-period-${ i }`);
      });

      function render() {
        const now   = new Date();
        let totalMs = 0;

        periodsLatestFirst.forEach((period, i) => {
          const endDate = period.end === null ? now : period.end;
          const ms      = Math.max(0, endDate - period.start);
          totalMs      += ms;
          renderUnits(periodRows[i], ms);
        });

        renderUnits(totalContainer, totalMs);
      }

      render();
      setInterval(render, 1000);
    }

    function renderUnits(container, ms) {
      const totalSeconds = Math.floor(ms / 1000);
      const totalMinutes = Math.floor(totalSeconds / 60);
      const totalHours   = Math.floor(totalMinutes / 60);
      const totalDays    = Math.floor(totalHours   / 24);
      const totalMonths  = Math.floor(totalDays    / 30.4375);
      const years        = Math.floor(totalMonths  / 12);
      const months       = totalMonths % 12;
      const days         = totalDays   % Math.round(30.4375);
      const hours        = totalHours  % 24;
      const minutes      = totalMinutes % 60;
      const seconds      = totalSeconds % 60;

      const units = [
        { v: years,   l: 'Yrs'  },
        { v: months,  l: 'Mos'  },
        { v: days,    l: 'Days' },
        { v: hours,   l: 'Hrs'  },
        { v: minutes, l: 'Min'  },
        { v: seconds, l: 'Sec'  },
      ];

      container.innerHTML = units.map(u => `
        <div class="timer-unit">
          <span class="timer-value">${ String(u.v).padStart(2, '0') }</span>
          <span class="timer-unit-label">${ u.l }</span>
        </div>
      `).join('');
    }

    function formatDate(date) {
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    }


    // Weighted ensemble matcher — ported from C# production system.
    // Algorithm names are intentionally obfuscated; implementation details not exposed.
    const _nv = (function() {
      const _W     = [0.30, 0.08, 0.20, 0.30, 0.06, 0.06];
      const _clean = s => s.toUpperCase().replace(/[^A-Z0-9 ]/g, '');

      function _E2(a, b) {
        if (a === b) return 1;
        const l1 = a.length, l2 = b.length;
        if (!l1 || !l2) return 0;
        const wn = Math.max(Math.floor(Math.max(l1, l2) / 2) - 1, 0);
        const f1 = new Array(l1).fill(false), f2 = new Array(l2).fill(false);
        let mc = 0;
        for (let i = 0; i < l1; i++) {
          const lo = Math.max(0, i - wn), hi = Math.min(i + wn + 1, l2);
          for (let j = lo; j < hi; j++) {
            if (f2[j] || a[i] !== b[j]) continue;
            f1[i] = f2[j] = true; mc++; break;
          }
        }
        if (!mc) return 0;
        let t = 0, k = 0;
        for (let i = 0; i < l1; i++) {
          if (!f1[i]) continue;
          while (!f2[k]) k++;
          if (a[i] !== b[k]) t++;
          k++;
        }
        const jv = (mc / l1 + mc / l2 + (mc - t / 2) / mc) / 3;
        let p = 0;
        for (let i = 0; i < Math.min(4, Math.min(l1, l2)); i++) {
          if (a[i] === b[i]) p++; else break;
        }
        return jv + p * 0.1 * (1 - jv);
      }

      function _E4(a, b) {
        const l1 = a.length, l2 = b.length, d = [];
        for (let i = 0; i <= l1; i++) {
          d[i] = [];
          for (let j = 0; j <= l2; j++) d[i][j] = i ? j ? 0 : i : j;
        }
        for (let i = 1; i <= l1; i++) {
          for (let j = 1; j <= l2; j++) {
            const c = a[i - 1] === b[j - 1] ? 0 : 1;
            d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + c);
            if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1])
              d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + c);
          }
        }
        return 1 - d[l1][l2] / Math.max(l1, l2, 1);
      }

      function _E1(a, b, n = 2) {
        if (a === b) return 1;
        if (a.length < n || b.length < n) return 0;
        const g   = s => { const r = []; for (let i = 0; i <= s.length - n; i++) r.push(s.slice(i, i + n)); return r; };
        const ga  = g(a), gb = g(b), cnt = {};
        gb.forEach(x => cnt[x] = (cnt[x] || 0) + 1);
        let sh = 0;
        ga.forEach(x => { if (cnt[x] > 0) { sh++; cnt[x]--; } });
        return 2 * sh / (ga.length + gb.length);
      }

      function _E6(a, b) {
        if (a === b) return 1;
        if (a.length < 2 || b.length < 2) return 0;
        const bv = s => { const v = {}; for (let i = 0; i < s.length - 1; i++) { const k = s.slice(i, i + 2); v[k] = (v[k] || 0) + 1; } return v; };
        const v1 = bv(a), v2 = bv(b);
        let dot = 0, m1 = 0, m2 = 0;
        Object.keys(v1).forEach(k => { dot += v1[k] * (v2[k] || 0); m1 += v1[k] * v1[k]; });
        Object.keys(v2).forEach(k => { m2 += v2[k] * v2[k]; });
        return (!m1 || !m2) ? 0 : dot / (Math.sqrt(m1) * Math.sqrt(m2));
      }

      function _E3(a, b) {
        const w1 = a.split(' ').filter(Boolean), w2 = b.split(' ').filter(Boolean);
        if (w1.length > 1 || w2.length > 1) {
          const s1 = new Set(w1), s2 = new Set(w2);
          const inter = [...s1].filter(x => s2.has(x)).length;
          return inter / (s1.size + s2.size - inter);
        }
        const g = s => { const r = new Set(); for (let i = 0; i < s.length - 1; i++) r.add(s.slice(i, i + 2)); return r; };
        const g1 = g(a), g2 = g(b);
        const inter = [...g1].filter(x => g2.has(x)).length;
        const union = g1.size + g2.size - inter;
        return union === 0 ? 0 : inter / union;
      }

      function _norm(s) {
        let x = s.toLowerCase();
        x = x.replace(/ee|ii|ea/g, 'i').replace(/aa/g, 'a').replace(/oo|uu/g, 'u');
        x = x.replace(/dh/g, 'd').replace(/gh/g, 'g').replace(/kh/g, 'k').replace(/th/g, 't').replace(/bh/g, 'b');
        x = x.replace(/ph/g, 'f').replace(/w/g, 'v').replace(/z/g, 'j');
        x = x.replace(/c(?!h)/g, 'k');
        x = x.replace(/(.)\1+/g, '$1');
        if (x.length > 3 && x.endsWith('a')) x = x.slice(0, -1);
        return x;
      }

      function _E5(a, b) {
        return (a.length <= 1 || b.length <= 1) ? 0 : _E2(_norm(a), _norm(b));
      }

      function _san(n) {
        const va = { 'MD': 'MOHAMMAD', 'MOHD': 'MOHAMMAD', 'KR': 'KUMAR', 'KRI': 'KUMARI', 'PT': 'PANDIT' };
        const st = ['DR', 'MR', 'MRS', 'JR', 'SR', 'SHRI', 'SMT', 'ADV', 'MS', 'MISS', 'SIR', 'MLA', 'MP'];
        let w = n.split(' ');
        if (va[w[0]]) w[0] = va[w[0]];
        if (va[w[w.length - 1]]) w[w.length - 1] = va[w[w.length - 1]];
        n = w.join(' ');
        st.forEach(p => {
          if (n.startsWith(p + ' ')) n = n.slice(p.length + 1);
          if (n.endsWith(' ' + p))   n = n.slice(0, -(p.length + 1));
        });
        return n.trim();
      }

      function _dedup(ws) {
        return ws.reduce((a, w) => (!a.length || a[a.length - 1] !== w) ? (a.push(w), a) : a, []);
      }

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
        for (let it = 1; it < tk.length; it++) {
          for (let i = 0; i <= tk.length - it; i++) {
            const t = [...tk];
            for (let j = i; j < i + it; j++) t[j] = tk[j][0] || '';
            for (const a of _abbrevs(t.join(' '))) out.add(a);
          }
        }
        return out;
      }

      function _composite(n1, n2) {
        const a = n1.replace(/ /g, ''), b = n2.replace(/ /g, '');
        const sc = [_E4(a, b), _E1(a, b), _E5(a, b), _E2(a, b), _E6(a, b), _E3(n1, n2)];
        return {
          combined: sc.reduce((s, v, i) => s + v * _W[i], 0),
          algos: { 'Lens-A': sc[3], 'Lens-B': sc[2], 'Lens-C': sc[1], 'Lens-D': sc[0], 'Lens-E': sc[4], 'Lens-F': sc[5] }
        };
      }

      return {
        score(r1, r2, thr) {
          const threshold = typeof thr === 'number' ? thr / 100 : 0.72;
          let n1 = _clean(r1).trim(), n2 = _clean(r2).trim();
          if (!n1 || !n2) return { match: false, fuzzy: 0, special: false, reason: 'empty', algos: {} };
          if (n1 === n2)  return { match: true,  fuzzy: 1, special: true,  reason: 'exact',  algos: {} };
          let s1 = _san(n1), s2 = _san(n2);
          const w1 = _dedup(s1.split(' ')), w2 = _dedup(s2.split(' '));
          if (w1.length === w2.length && [...w1].reverse().join('') === w2.join(''))
            return { match: true, fuzzy: 1, special: true, reason: 'reversed', algos: {} };
          if (w1.length === 2 && w2.length === 2) {
            const cm = w1.find(x => w2.includes(x));
            const hi = [...w1, ...w2].some(x => x.length === 1);
            if (cm && !hi) {
              const f = _composite(w1.filter(x => x !== cm).join(''), w2.filter(x => x !== cm).join(''));
              return { match: f.combined >= threshold, fuzzy: f.combined, special: false, reason: '', algos: f.algos };
            }
          }
          const lg = n1.length >= n2.length ? n1 : n2;
          const sh = (n1.length >= n2.length ? n2 : n1).replace(/ /g, '');
          if (_abbrevs(lg).has(sh))    return { match: true, fuzzy: 1, special: true, reason: 'abbreviation', algos: {} };
          if (_abbrevPnC(lg).has(sh))  return { match: true, fuzzy: 1, special: true, reason: 'abbreviation', algos: {} };
          const f = _composite(s1, s2);
          return { match: f.combined >= threshold, fuzzy: f.combined, special: false, reason: '', algos: f.algos };
        }
      };
    })();


    function toggleStory(btn) {
      const panel = document.getElementById('story-panel');
      const open  = panel.classList.toggle('open');
      btn.innerHTML = open
        ? '<span>📖</span> Hide story'
        : '<span>📖</span> The story behind this';
    }


    function initKnob() {
      const wrap   = document.getElementById('knob-wrap');
      const valEl  = document.getElementById('knob-val');
      const hidden = document.getElementById('vld-threshold');
      if (!wrap) return;

      const MIN = 50, MAX = 90, DEFAULT = 72;
      const ARC_DEG   = 240;
      const START_DEG = 150;
      let currentVal  = DEFAULT;

      const NS  = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('viewBox', '0 0 72 72');
      svg.classList.add('knob-svg');

      const trackPath = document.createElementNS(NS, 'path');
      trackPath.setAttribute('fill', 'none');
      trackPath.setAttribute('stroke', 'rgba(255,255,255,0.07)');
      trackPath.setAttribute('stroke-width', '4');
      trackPath.setAttribute('stroke-linecap', 'round');

      const activePath = document.createElementNS(NS, 'path');
      activePath.setAttribute('fill', 'none');
      activePath.setAttribute('stroke', 'url(#knobGrad)');
      activePath.setAttribute('stroke-width', '4');
      activePath.setAttribute('stroke-linecap', 'round');

      const defs = document.createElementNS(NS, 'defs');
      const grad = document.createElementNS(NS, 'linearGradient');
      grad.setAttribute('id', 'knobGrad');
      grad.setAttribute('x1', '0%'); grad.setAttribute('y1', '0%');
      grad.setAttribute('x2', '100%'); grad.setAttribute('y2', '100%');
      const s1 = document.createElementNS(NS, 'stop');
      s1.setAttribute('offset', '0%'); s1.setAttribute('stop-color', '#2b9cba');
      const s2 = document.createElementNS(NS, 'stop');
      s2.setAttribute('offset', '100%'); s2.setAttribute('stop-color', '#e8aa4a');
      grad.appendChild(s1); grad.appendChild(s2); defs.appendChild(grad);

      const body = document.createElementNS(NS, 'circle');
      body.setAttribute('cx', '36'); body.setAttribute('cy', '36'); body.setAttribute('r', '22');
      body.setAttribute('fill', 'rgba(20,29,48,0.95)');
      body.setAttribute('stroke', 'rgba(43,90,102,0.5)'); body.setAttribute('stroke-width', '1.5');

      const dot = document.createElementNS(NS, 'circle');
      dot.setAttribute('r', '3');
      dot.setAttribute('fill', '#1ecbe1');

      const filter = document.createElementNS(NS, 'filter');
      filter.setAttribute('id', 'knobGlow');
      const fe = document.createElementNS(NS, 'feGaussianBlur');
      fe.setAttribute('stdDeviation', '2'); fe.setAttribute('result', 'blur');
      filter.appendChild(fe);
      defs.appendChild(filter);

      const glowCircle = document.createElementNS(NS, 'circle');
      glowCircle.setAttribute('cx', '36'); glowCircle.setAttribute('cy', '36');
      glowCircle.setAttribute('r', '22');
      glowCircle.setAttribute('fill', 'none');
      glowCircle.setAttribute('stroke', 'rgba(43,156,186,0.0)');
      glowCircle.setAttribute('stroke-width', '8');
      glowCircle.setAttribute('filter', 'url(#knobGlow)');
      glowCircle.setAttribute('id', 'knob-glow');

      svg.appendChild(defs);
      svg.appendChild(trackPath);
      svg.appendChild(activePath);
      svg.appendChild(glowCircle);
      svg.appendChild(body);
      svg.appendChild(dot);
      wrap.appendChild(svg);

      function toRad(d) { return d * Math.PI / 180; }

      function polarPoint(cx, cy, r, deg) {
        const rad = toRad(deg - 90);
        return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
      }

      function arcPath(cx, cy, r, startDeg, endDeg) {
        const s     = polarPoint(cx, cy, r, startDeg);
        const e     = polarPoint(cx, cy, r, endDeg);
        const sweep = ((endDeg - startDeg) + 360) % 360;
        const large = sweep > 180 ? 1 : 0;
        return `M${s.x.toFixed(3)},${s.y.toFixed(3)} A${r},${r},0,${large},1,${e.x.toFixed(3)},${e.y.toFixed(3)}`;
      }

      function render(val) {
        const t       = (val - MIN) / (MAX - MIN);
        const endDeg  = START_DEG + t * ARC_DEG;
        const endFull = START_DEG + ARC_DEG;

        trackPath.setAttribute('d', arcPath(36, 36, 28, START_DEG, endFull));
        activePath.setAttribute('d', arcPath(36, 36, 28, START_DEG, endDeg));

        const dp = polarPoint(36, 36, 16, endDeg);
        dot.setAttribute('cx', dp.x.toFixed(3));
        dot.setAttribute('cy', dp.y.toFixed(3));

        valEl.textContent = val + '%';
        hidden.value      = val;

        glowCircle.setAttribute('stroke', `rgba(43,156,186,${(t * 0.35).toFixed(2)})`);
      }

      render(DEFAULT);

      let dragging = false, lastAngle = null;

      function angleFromCentre(e) {
        const r  = wrap.getBoundingClientRect();
        const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        const px = e.touches ? e.touches[0].clientX : e.clientX;
        const py = e.touches ? e.touches[0].clientY : e.clientY;
        return Math.atan2(py - cy, px - cx) * 180 / Math.PI;
      }

      function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

      function onDragStart(e) { dragging = true; lastAngle = angleFromCentre(e); e.preventDefault(); }

      function onDragMove(e) {
        if (!dragging) return;
        const angle = angleFromCentre(e);
        let delta   = angle - lastAngle;
        if (delta >  180) delta -= 360;
        if (delta < -180) delta += 360;
        lastAngle  = angle;
        const step = delta * (MAX - MIN) / ARC_DEG;
        currentVal = clamp(Math.round(currentVal + step), MIN, MAX);
        render(currentVal);
        e.preventDefault();
      }

      function onDragEnd() { dragging = false; lastAngle = null; }

      wrap.addEventListener('mousedown',  onDragStart);
      wrap.addEventListener('touchstart', onDragStart, { passive: false });
      window.addEventListener('mousemove',  onDragMove);
      window.addEventListener('touchmove',  onDragMove, { passive: false });
      window.addEventListener('mouseup',    onDragEnd);
      window.addEventListener('touchend',   onDragEnd);

      wrap.addEventListener('wheel', e => {
        e.preventDefault();
        currentVal = clamp(currentVal + (e.deltaY < 0 ? 1 : -1), MIN, MAX);
        render(currentVal);
      }, { passive: false });
    }


    function runValidator() {
      const n1  = document.getElementById('vld-name1').value.trim();
      const n2  = document.getElementById('vld-name2').value.trim();
      if (!n1 || !n2) return;
      const thr = parseInt(document.getElementById('vld-threshold').value, 10);

      const btn = document.getElementById('vld-btn');
      btn.disabled = true;
      setTimeout(() => btn.disabled = false, 600);

      const res = _nv.score(n1, n2, thr);

      ['vld-name1', 'vld-name2'].forEach(id => {
        const el = document.getElementById(id);
        el.classList.remove('input-match', 'input-nomatch');
        el.classList.add(res.match ? 'input-match' : 'input-nomatch');
      });

      document.getElementById('vld-verdict').className = 'verdict-banner ' + (res.match ? 'match' : 'nomatch');
      document.getElementById('vld-icon').textContent  = res.match ? '✅' : '❌';
      document.getElementById('vld-verdict-title').textContent = res.match ? 'Names Match' : 'Names Do Not Match';

      let sub = '';
      if (res.special) {
        const lbl = { exact: 'Exact match', reversed: 'Name parts in reversed order', abbreviation: 'One name is an abbreviation of the other' };
        sub = lbl[res.reason] || 'Deterministic match';
      } else {
        sub = `Composite score: ${Math.round(res.fuzzy * 100)}% (threshold ${thr}%)`;
      }
      document.getElementById('vld-verdict-sub').textContent = sub;

      const rrow = document.getElementById('vld-reason-row');
      if (res.special) { rrow.style.display = 'block'; rrow.innerHTML = `<span class="match-reason-chip">⚡ ${sub}</span>`; }
      else rrow.style.display = 'none';

      const pct   = Math.round(res.fuzzy * 100);
      const gfill = document.getElementById('vld-gauge-combined');
      const gval  = document.getElementById('vld-gauge-combined-val');
      gfill.className    = 'score-gauge-fill ' + (pct >= thr ? 'high' : pct >= thr * 0.75 ? 'medium' : 'low');
      gval.textContent   = pct + '%';
      gval.style.color   = pct >= thr ? '#5bd4a0' : pct >= (thr * 0.75) ? 'var(--color-gold-light)' : '#e07a7a';
      setTimeout(() => gfill.style.width = Math.min(pct, 100) + '%', 50);

      const track = gfill.parentElement;
      let marker  = track.querySelector('.thr-marker');
      if (!marker) {
        marker = document.createElement('div');
        marker.className   = 'thr-marker';
        marker.style.cssText = 'position:absolute;top:0;bottom:0;width:2px;background:rgba(232,170,74,0.7);border-radius:1px;';
        track.style.position = 'relative';
        track.appendChild(marker);
      }
      marker.style.left = Math.min(thr, 100) + '%';

      const grid = document.getElementById('vld-algo-grid');
      grid.innerHTML = '';
      Object.entries(res.algos).forEach(([name, val]) => {
        const p    = Math.round(val * 100);
        const card = document.createElement('div');
        card.className = 'algo-card';
        card.innerHTML = `<div class="algo-name">${name}</div>
          <div class="algo-bar-track"><div class="algo-bar-fill" style="width:0%" data-pct="${p}"></div></div>
          <div class="algo-score-val">${p}%</div>`;
        grid.appendChild(card);
      });
      setTimeout(() => grid.querySelectorAll('.algo-bar-fill').forEach(el => { el.style.width = Math.min(+el.dataset.pct, 100) + '%'; }), 80);

      document.getElementById('vld-result').classList.add('visible');
    }

    ['vld-name1', 'vld-name2'].forEach(id => {
      document.getElementById(id)?.addEventListener('keydown', e => { if (e.key === 'Enter') runValidator(); });
    });


    function initSourceTooltip() {
      const btn = document.getElementById('src-info-btn');
      if (!btn) return;

      // Appended to body so it escapes any overflow:hidden ancestor
      const tip = document.createElement('div');
      tip.id = 'src-tooltip';
      tip.innerHTML = `
        <div style="font-size:11px;font-weight:700;letter-spacing:1px;
                    text-transform:uppercase;color:var(--color-accent);margin-bottom:8px;">
          About this code
        </div>
        The GitHub repo is a <strong style="color:#d0dce8;">portfolio-adapted version</strong>
        of the original production system. Core matching algorithms are unchanged.
        The interactive console, config system, and file structure were added
        specifically for this public showcase.
        <div class="tip-arrow"></div>`;

      tip.style.cssText = `
        position:fixed; width:260px; background:rgba(10,14,26,0.98);
        border:1px solid rgba(43,90,102,0.6); border-radius:12px;
        padding:14px 16px; font-size:12.5px; line-height:1.65;
        color:var(--color-muted); opacity:0; pointer-events:none;
        transition:opacity 0.2s; z-index:9999;
        box-shadow:0 12px 40px rgba(0,0,0,0.6);`;

      const style = document.createElement('style');
      style.textContent = `.tip-arrow {
        position:absolute; bottom:-6px; right:14px;
        width:10px; height:10px; background:rgba(10,14,26,0.98);
        border-right:1px solid rgba(43,90,102,0.6);
        border-bottom:1px solid rgba(43,90,102,0.6);
        transform:rotate(45deg); }`;
      document.head.appendChild(style);
      document.body.appendChild(tip);

      function showTip() {
        const r   = btn.getBoundingClientRect();
        const tipW = 260;
        let left   = r.right - tipW;
        if (left < 8) left = 8;
        tip.style.left         = left + 'px';
        tip.style.top          = (r.top - tip.offsetHeight - 10) + 'px';
        tip.style.opacity      = '1';
        tip.style.pointerEvents = 'auto';
        btn.style.borderColor  = 'var(--color-accent)';
        btn.style.color        = 'var(--color-accent-light)';
        requestAnimationFrame(() => { tip.style.top = (r.top - tip.offsetHeight - 10) + 'px'; });
      }

      function hideTip() {
        tip.style.opacity       = '0';
        tip.style.pointerEvents = 'none';
        btn.style.borderColor   = 'rgba(122,143,166,0.35)';
        btn.style.color         = 'var(--color-muted)';
      }

      let pinned = false;
      btn.addEventListener('mouseenter', showTip);
      btn.addEventListener('mouseleave', () => { if (!pinned) hideTip(); });
      btn.addEventListener('click', () => { pinned = !pinned; pinned ? showTip() : hideTip(); });
      document.addEventListener('click', e => { if (pinned && e.target !== btn) { pinned = false; hideTip(); } });
    }


    (function() {
      const el = document.getElementById('resume-updated');
      if (!el) return;
      const now = new Date();
      el.textContent = 'Updated ' + now.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
    })();


    function scrollProgressBar() {
      const bar = document.createElement('div');
      bar.id = 'scroll-progress';
      bar.style.cssText = `
        position: fixed; top: 0; left: 0; height: 3px; width: 0%;
        background: linear-gradient(90deg, #2b9cba, #1ecbe1, #e8aa4a);
        z-index: 10000; transition: width 0.1s linear;
        border-radius: 0 2px 2px 0;
        box-shadow: 0 0 8px rgba(30,203,225,0.5);
      `;
      document.body.appendChild(bar);

      window.addEventListener('scroll', () => {
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const pct       = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
        bar.style.width = Math.min(pct, 100) + '%';
      }, { passive: true });
    }


    function cardTilt() {
      const TILT_MAX = 8;
      const selectors = ['.highlight-card', '.stat-card', '.edu-card', '.soft-skill-card'];

      document.querySelectorAll(selectors.join(',')).forEach(card => {
        card.style.transformStyle = 'preserve-3d';
        card.style.transition     = 'transform 0.1s ease, box-shadow 0.2s ease';
        card.style.willChange     = 'transform';

        card.addEventListener('mousemove', e => {
          const rect = card.getBoundingClientRect();
          const dx   = (e.clientX - (rect.left + rect.width  / 2)) / (rect.width  / 2);
          const dy   = (e.clientY - (rect.top  + rect.height / 2)) / (rect.height / 2);
          card.style.transform = `perspective(600px) rotateX(${(-dy * TILT_MAX).toFixed(2)}deg) rotateY(${(dx * TILT_MAX).toFixed(2)}deg) scale(1.03)`;
          card.style.boxShadow = `0 16px 40px rgba(30,203,225,0.15), 0 0 0 1px rgba(30,203,225,0.12)`;
        });

        card.addEventListener('mouseleave', () => {
          card.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg) scale(1)';
          card.style.boxShadow = '';
        });
      });
    }


    // Picks the last section whose top has crossed 40% of viewport height.
    // Clears all highlights at true page bottom.
    function activeNavHighlight() {
      const sectionIds = ['section-validator', 'section-about', 'section-skills', 'section-experience', 'section-education'];
      const navLinks   = document.querySelectorAll('.nav-links a');

      function update() {
        const triggerY   = window.innerHeight * 0.4;
        const pageBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 10;
        let activeId     = null;

        if (!pageBottom) {
          sectionIds.forEach(id => {
            const el = document.getElementById(id);
            if (el && el.getBoundingClientRect().top <= triggerY) activeId = id;
          });
        }

        navLinks.forEach(link => {
          const matches      = activeId && link.getAttribute('href') === '#' + activeId;
          link.style.color   = matches ? 'var(--color-accent-light, #1ecbe1)' : '';
          link.style.fontWeight = matches ? '700' : '';
        });
      }

      window.addEventListener('scroll', update, { passive: true });
      update();
    }


    function skillTagTooltips() {
      const STORIES = {
        'C#'                 : 'Primary language across all 3 roles — APIs, services, background workers',
        'SQL'                : 'T-SQL stored procs, query optimisation, schema migrations across all roles',
        'JavaScript'         : 'Frontend logic at IndiaLends + interactive elements on this portfolio',
        'ASP.NET Core'       : 'Built Minimal APIs, middleware, and custom auth schemes across multiple services',
        '.NET Core'          : 'Target framework for all greenfield services since IndiaLends',
        'Minimal APIs'       : 'Used for dashboard satellite service — lightweight, no controller overhead',
        'REST APIs'          : 'Designed and consumed REST contracts across all three companies',
        'CQRS / MediatR'     : 'Used across most feature work — clean separation of commands and queries via MediatR pipeline',
        'Domain-Driven Design': 'P&S microservice modelled around DDD aggregates — clear boundaries, no anemic domain',
        'Clean Architecture' : 'Applied in dashboard service — strict layer separation: API → UseCases → Domain',
        'Microservices'      : 'Dashboard + planning & scheduling both independently deployable from the monolith',
        'Resiliency Patterns': 'Polly retry + circuit-breaker specifically for database connection handling in shared library',
        'BDD'                : 'SpecFlow / ReqnRoll acceptance tests — .feature files as living regression documentation',
        'Azure Functions'    : 'Timer triggers: nightly scheduled reports + CRM jobs (low-traffic window); Queue triggers: async retry workflows and non-blocking logging; Blob triggers: document processing on upload; HTTP triggers: lightweight API endpoints',
        'Entity Framework 6' : 'EF6 on .NET 4.8 — large multi-tenant enterprise codebase, per-tenant DB architecture',
        'EF Core'            : 'Used in .NET 8/9 services for greenfield data access layers',
        'Dapper'             : 'Replaced EF in dashboard hot paths — raw SQL, significantly faster under load',
        'LINQ'               : 'Everyday — projections, filtering, aggregation across all .NET work',
        'T-SQL'              : 'Stored procs, CTEs, window functions for reporting and bulk operations',
        'SQL Server'         : 'Primary DB at Siemens — large multi-tenant schema across thousands of clients',
        'PostgreSQL'         : 'Used in Java-based and .NET microservices',
        'Redis'              : 'Session store + L1/L2 cache for API response acceleration',
        'Azure App Service'  : 'Ran Azure Functions across multiple trigger types: Timer (reports), Queue (retry/logging), Blob (documents), HTTP (lightweight APIs)',
        'Azure Service Bus'  : 'Loan repayment reminders — Azure Queue has a max TTL of days/weeks, but repayment schedules span years; Service Bus supported scheduling messages years in advance',
        'Azure Blob Storage' : 'Stored loan documents, ID photos, and pre-generated reports ready for analytics teams each morning',
        'AWS Secrets Manager': 'DB credential resolution in a shared .NET library — region-aware, supports rotation without redeployment',
        'Message Queues'     : 'Service-to-service async communication; used Azure Queue with retry-before-poison pattern',
        'Docker'             : 'Used locally to run multiple dependent services together for development — configuration done by the platform team',
        'OIDC / OAuth2'      : 'Worked on projects using OIDC and OAuth2 — integration, flow debugging, and consuming tokens; not protocol implementation',
        'JWT'                : 'Worked with JWT-protected services — token validation, claims extraction; not issuer setup',
        'Auth0'              : 'Worked on projects using Auth0 as the identity provider — integration and configuration side',
        'Cookie Auth Scheme' : 'Built a custom cookie authentication handler for a .NET 8 service — delegating session validation to a central auth service',
        'VAPT Remediation'   : 'Resolved injection, broken auth, and missing header findings from pen-test reports at IndiaLends',
        'Azure DevOps'       : 'CI/CD pipelines, release gates, and board management at IndiaLends',
        'Jenkins'            : 'Build + deploy pipelines for production releases at Siemens',
        'TeamCity'           : 'Build server for .NET solutions and internal NuGet publishing at Siemens',
        'SonarQube'          : 'Static analysis quality gate — issues had to be resolved before PRs could merge',
        'Snyk'               : 'Dependency vulnerability scanning in CI — flagged risky package versions',
        'Grafana'            : 'Production monitoring dashboards for microservices at Siemens',
        'Datadog'            : 'APM traces and log monitoring across services',
        'MyGet (NuGet feed)' : 'Internal NuGet feed — published shared libraries consumed across all .NET repos',
        'NUnit'              : 'Unit + integration test runner across .NET services',
        'SpecFlow'           : 'BDD acceptance tests — Gherkin .feature files with C# step definitions',
        'ReqnRoll'           : 'SpecFlow open-source successor — migrated seamlessly, same Gherkin syntax',
        'Moq'                : 'Mocking framework — repository and service layer mocks in unit tests',
        'Unit Testing'       : 'Wrote tests for business logic, custom auth handlers, query and command handlers',
        'Integration Testing': 'Real-DB integration tests covering repository and service layers end-to-end',
        'Git'                : 'Daily — feature branches, PRs, rebasing across all roles',
        'Azure Repos'        : 'Git hosting at IndiaLends for main projects; also used TFS for a CDN-related project there',
        'Bitbucket'          : 'Code hosting at Siemens — Bitbucket with PR pipelines and branch policies',
        'Swagger / OpenAPI'  : 'Auto-generated API docs on all ASP.NET Core services',
        'Postman'            : 'API testing + environment collections for all services',
        'GitHub Copilot'     : 'Used for boilerplate acceleration — I review every suggestion before accepting',
        'Claude Code'        : 'AI pair programmer for architecture exploration and building this portfolio',
        'Jira'               : 'Sprint planning, bug tracking, and release management across all roles',
        'Scrum'              : '2-week sprints, daily standups, sprint reviews and retrospectives',
        'Kanban'             : 'Maintenance & Reliability initiative ran as a continuous Kanban flow',
      };

      const tip = document.createElement('div');
      tip.id = 'skill-tip';
      tip.style.cssText = `
        position: fixed; max-width: 280px;
        background: rgba(10,14,26,0.97);
        border: 1px solid rgba(43,156,186,0.4);
        border-radius: 10px; padding: 10px 14px;
        font-size: 12px; line-height: 1.6; color: #a8bfcc;
        pointer-events: none; opacity: 0;
        transition: opacity 0.15s ease;
        z-index: 9998;
        box-shadow: 0 8px 32px rgba(0,0,0,0.5);
      `;
      document.body.appendChild(tip);

      function positionTip(e) {
        const pad  = 12;
        const tipW = Math.min(280, window.innerWidth - 16);
        tip.style.maxWidth = tipW + 'px';
        let left = e.clientX + pad;
        let top  = e.clientY + pad;
        if (left + tipW > window.innerWidth  - 8) left = e.clientX - tipW - pad;
        if (left < 8) left = 8;
        if (top  + 80   > window.innerHeight - 8) top  = e.clientY - 80  - pad;
        if (top < 8) top = 8;
        tip.style.left = left + 'px';
        tip.style.top  = top  + 'px';
      }

      document.querySelectorAll('.skill-tags .tag').forEach(tag => {
        const story = STORIES[tag.textContent.trim()];
        if (!story) return;
        tag.style.cursor = 'help';
        tag.addEventListener('mouseenter', e => { tip.textContent = story; tip.style.opacity = '1'; positionTip(e); });
        tag.addEventListener('mousemove',  positionTip);
        tag.addEventListener('mouseleave', () => { tip.style.opacity = '0'; });
      });
    }


    // Timer counts only while this tab is active (Page Visibility API).
    function showDownloadToast() {
      const existing = document.getElementById('download-toast');
      if (existing) existing.remove();

      const toast = document.createElement('div');
      toast.id = 'download-toast';
      toast.innerHTML = `
        <div style="font-weight:700; font-size:15px; color:#fff; margin-bottom:8px;">
          Thanks for taking the time to look.
        </div>
        <div style="font-size:13px; color:#a8bfcc; line-height:1.6;">
          Happy to go deeper on anything that stands out.
          <br><br>
          <a href="mailto:Deepanshu.Kumar@Outlook.in"
             style="color:#1ecbe1; text-decoration:none; font-weight:600;">
            Deepanshu.Kumar@Outlook.in
          </a>
          <br>
          <span style="color:rgba(168,191,204,0.6); font-size:12px;">Open to exciting opportunities. Looking forward to the conversation.</span>
        </div>
      `;
      toast.style.cssText = `
        position: fixed; bottom: 32px; right: 32px;
        background: rgba(10,14,26,0.97);
        border: 1px solid rgba(43,156,186,0.5);
        border-radius: 14px; padding: 20px 24px;
        text-align: center; max-width: 260px;
        box-shadow: 0 16px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(30,203,225,0.1);
        z-index: 99999;
        animation: toastIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards;
      `;
      document.body.appendChild(toast);

      if (!document.getElementById('toast-style')) {
        const s = document.createElement('style');
        s.id = 'toast-style';
        s.textContent = `
          @keyframes toastIn  { from { opacity:0; transform:translateY(20px) scale(0.95); } to { opacity:1; transform:translateY(0) scale(1); } }
          @keyframes toastOut { from { opacity:1; transform:translateY(0) scale(1); } to { opacity:0; transform:translateY(10px) scale(0.95); } }
        `;
        document.head.appendChild(s);
      }

      const TOTAL_MS = 5000;
      let remaining  = TOTAL_MS;
      let lastTick   = Date.now();
      let ticker     = null;

      function dismiss() {
        document.removeEventListener('visibilitychange', onVisibility);
        clearInterval(ticker);
        const t = document.getElementById('download-toast');
        if (!t) return;
        t.style.animation = 'toastOut 0.3s ease forwards';
        setTimeout(() => t.remove(), 320);
      }

      function startTick() {
        lastTick = Date.now();
        ticker   = setInterval(() => {
          remaining -= Date.now() - lastTick;
          lastTick   = Date.now();
          if (remaining <= 0) dismiss();
        }, 200);
      }

      function onVisibility() {
        if (document.hidden) {
          clearInterval(ticker);
        } else {
          lastTick = Date.now();
          startTick();
        }
      }

      document.addEventListener('visibilitychange', onVisibility);
      startTick();
    }


    function navFullNameReveal() {
      const heroName = document.querySelector('.hero-name');
      const navLabel = document.getElementById('nav-fullname');
      if (!heroName || !navLabel) return;

      window.addEventListener('scroll', () => {
        navLabel.classList.toggle('visible', heroName.getBoundingClientRect().bottom < 0);
      }, { passive: true });
    }


    particleSystem();
    typedTitleEffect();
    navBehaviours();
    scrollReveal();
    careerTimer();
    initKnob();
    initSourceTooltip();
    scrollProgressBar();
    cardTilt();
    activeNavHighlight();
    skillTagTooltips();
    navFullNameReveal();

    // Opens PDF in new tab. Shows toast on click + once more when user returns.
    (function() {
      const btns = [
        document.getElementById('resume-dl-btn'),
        document.getElementById('nav-resume-dl-btn'),
      ].filter(Boolean);

      btns.forEach(btn => {
        btn.addEventListener('click', function(e) {
          e.preventDefault();
          window.open(btn.getAttribute('href'), '_blank');
          showDownloadToast();

          function onReturn() {
            if (!document.hidden) {
              document.removeEventListener('visibilitychange', onReturn);
              showDownloadToast();
            }
          }
          document.addEventListener('visibilitychange', onReturn);
        });
      });
    })();
