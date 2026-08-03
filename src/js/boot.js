(function() {
  'use strict';

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

})();
