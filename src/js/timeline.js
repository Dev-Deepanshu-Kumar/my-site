// ── Timeline bar — proportional widths from real dates ──────────────
//
// To add a new org: add an entry to TIMELINE_PERIODS, add a
// .timeline-segment--<key> CSS rule for the colour, and add a
// <div class="timeline-segment timeline-segment--<key>" data-key="<key>">
// in the HTML. Widths, legend, year markers update automatically.
//
const TIMELINE_PERIODS = [
  { key: 'telebu',     start: new Date(2019, 11, 1), end: new Date(2020, 11, 31), label: 'Telebu',       color: '#a78bfa' },
  { key: 'gap',        start: new Date(2021,  0, 1), end: new Date(2022,  2, 31), label: 'Career break', color: null },
  { key: 'indialends', start: new Date(2022,  3, 1), end: new Date(2023, 11, 31), label: 'IndiaLends',   color: 'var(--color-gold)' },
  { key: 'siemens',    start: new Date(2024,  0, 1), end: null,                   label: 'Siemens',      color: 'var(--color-accent)' },
];

function _fmtDate(d) {
  if (!d) return 'Present';
  return d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
}

function initTimeline() {
  const bar    = document.getElementById('timeline-bar');
  const gapZzz = document.getElementById('gap-zzz');
  if (!bar) return;

  const now   = new Date();
  const total = TIMELINE_PERIODS.reduce((sum, p) => {
    return sum + ((p.end || now) - p.start);
  }, 0);

  let gapOffsetPct = 0, gapWidthPct = 0, accumulated = 0;

  TIMELINE_PERIODS.forEach(p => {
    const seg = bar.querySelector(`[data-key="${p.key}"]`);
    if (!seg) return;
    const end      = p.end || now;
    const duration = end - p.start;
    const pct      = (duration / total) * 100;
    seg.style.flex = `0 0 ${pct.toFixed(3)}%`;

    const months = Math.round(duration / (1000 * 60 * 60 * 24 * 30.44));
    const label  = p.end
      ? `${p.label} · ${_fmtDate(p.start)} – ${_fmtDate(p.end)} · ${months}mo`
      : `${p.label} · ${_fmtDate(p.start)} – Present · ${months}mo`;

    if (p.key === 'gap') {
      gapOffsetPct = (accumulated / total) * 100;
      gapWidthPct  = pct;
      seg.setAttribute('data-tooltip', `Career break · ${_fmtDate(p.start)} – ${_fmtDate(p.end)} — recalibrating`);
      if (gapZzz) {
        const tooltip = gapZzz.querySelector('.gap-tooltip');
        if (tooltip) tooltip.textContent = `Career break · ${_fmtDate(p.start)} – ${_fmtDate(p.end)} — recalibrating`;
      }
    } else {
      seg.setAttribute('title', label);
    }
    accumulated += duration;
  });

  if (gapZzz) {
    gapZzz.style.left  = `${gapOffsetPct.toFixed(3)}%`;
    gapZzz.style.width = `${gapWidthPct.toFixed(3)}%`;
  }

  // Year markers
  const yearsEl = document.getElementById('timeline-years');
  if (yearsEl) {
    const startYear = TIMELINE_PERIODS[0].start.getFullYear();
    const endDate   = now;
    const totalSpan = endDate - TIMELINE_PERIODS[0].start;
    const endYear   = endDate.getFullYear();
    let html = '';
    for (let yr = startYear; yr <= endYear; yr++) {
      const d   = new Date(yr, 0, 1);
      const pct = ((d - TIMELINE_PERIODS[0].start) / totalSpan) * 100;
      if (pct < 0 || pct > 100) continue;
      const isNow  = yr === endYear;
      const left   = isNow ? '100%' : `${pct.toFixed(2)}%`;
      const anchor = isNow ? 'translateX(-100%)' : 'translateX(-50%)';
      html += `<span class="timeline-year${isNow ? ' timeline-year--now' : ''}"
                     style="left:${left};transform:${anchor}">${isNow ? 'now' : yr}</span>`;
    }
    yearsEl.innerHTML = html;
  }

  // Legend
  const legend = document.getElementById('timeline-legend');
  if (legend) {
    legend.innerHTML = [...TIMELINE_PERIODS]
      .filter(p => p.color)
      .map(p => {
        const suffix = !p.end ? ' (current)' : '';
        return `<div class="timeline-legend-item">
          <span class="timeline-legend-dot" style="background:${p.color}"></span>
          ${p.label}${suffix}
        </div>`;
      }).join('');
  }
}

initTimeline();

// Gap tooltip — tap on mobile, hover handled by CSS
(function() {
  const gapSegment = document.querySelector('.timeline-segment--gap');
  const gapZzz     = document.querySelector('.gap-zzz');
  if (gapSegment && gapZzz) {
    gapSegment.addEventListener('click', function(e) {
      e.stopPropagation();
      gapZzz.classList.toggle('tooltip-visible');
    });
    document.addEventListener('click', function() {
      gapZzz.classList.remove('tooltip-visible');
    });
  }
})();

// ── Mobile tab bar ───────────────────────────────────────────────────
//
// To add a new endpoint tab: add one entry here. method: null = icon.
// Label kept short (~5 chars) — truncated by CSS on small screens.
// Keep in sync with CMD_ITEMS in interactions.js and sections in index.html.
//
const MOBILE_TABS = [
  { section: 'overview',        method: null,   icon: '&#x25C9;', label: 'Overview' },
  { section: 'experience',      method: 'get',  icon: null,       label: 'Exp'      },
  { section: 'skills',          method: 'get',  icon: null,       label: 'Skills'   },
  { section: 'validator',       method: 'post', icon: null,       label: 'Demo'     },
  { section: 'recommendations', method: 'get',  icon: null,       label: 'Recs'     },
  { section: 'education',       method: 'get',  icon: null,       label: 'Edu'      },
];

// Rendered in a standalone IIFE below for fault isolation —
// if any earlier module throws, the nav still appears.
function _buildMobileTabs() {
  var nav = document.getElementById('mobile-tabs');
  if (!nav) return;
  nav.innerHTML = MOBILE_TABS.map(function(t, i) {
    var icon = t.method
      ? '<span class="mobile-tab-icon method-badge method-' + t.method + '" style="padding:1px 4px;font-size:8px;">' + t.method.toUpperCase() + '</span>'
      : '<span class="mobile-tab-icon">' + t.icon + '</span>';
    return '<a href="#' + t.section + '" class="mobile-tab' + (i === 0 ? ' active' : '') + '" data-section="' + t.section + '">'
      + icon + '<span class="mobile-tab-label">' + t.label + '</span></a>';
  }).join('');
}
_buildMobileTabs();
