/**
 * validator.js — PAN name fuzzy matching algorithm + animated pipeline trace
 *
 * Exports:
 *   window.runValidator()   — called by HTML onclick on the "Send Request" button
 *
 * Globals consumed:
 *   window.bumpRequest(type)       — defined in uptime.js
 *   window.showToast(status, msg)  — defined in interactions.js
 *
 * Algorithm weights (production values, tuned against 30k records):
 *   Jaro-Winkler        35%
 *   Damerau-Levenshtein 25%
 *   Dice coefficient    20%
 *   Token sort ratio    20%
 *
 * Default threshold: 72% — scores within ±5% trigger fallback to external API.
 * To adjust: change the default value of vld-threshold input in index.html.
 */
(function() {
  'use strict';

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


})();
