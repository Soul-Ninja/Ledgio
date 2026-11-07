/* Landing demos, phase B8: scroll-scrubbed reports walkthrough + hero tour chapters. */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function fmt(n) { return '₹' + n.toLocaleString('en-IN'); }

  /* ---------- Reports walkthrough: scroll position is the playhead ---------- */
  var CATS = [
    { n: 'Food & Dining', v: 3650 },
    { n: 'Bills & Utilities', v: 2490 },
    { n: 'Business & Tech', v: 1600 },
    { n: 'Transportation', v: 1160 }
  ];
  var MONTHS = [['Jun', 5200], ['Jul', 6100], ['Aug', 5800], ['Sep', 7400], ['Oct', 6900], ['Nov', 8900]];
  var CHAPTERS = [['Category split', 0, 0.3], ['Inspect a slice', 0.3, 0.6], ['Six-month trend', 0.6, 1]];
  var CX = 100, CY = 100, R = 84, RING_R = R / 2, RING_C = 2 * Math.PI * RING_R;

  function initReports() {
    var root = document.getElementById('rep-demo');
    if (!root) return;
    var total = CATS.reduce(function (a, c) { return a + c.v; }, 0);

    var a0 = -Math.PI / 2, slices = '', legend = '', mids = [];
    CATS.forEach(function (c, i) {
      var a1 = a0 + (c.v / total) * Math.PI * 2;
      var large = a1 - a0 > Math.PI ? 1 : 0;
      var x0 = CX + R * Math.cos(a0), y0 = CY + R * Math.sin(a0);
      var x1 = CX + R * Math.cos(a1), y1 = CY + R * Math.sin(a1);
      slices += '<path class="rep-slice rep-c' + (i + 1) + '" d="M' + CX + ' ' + CY + ' L' + x0.toFixed(2) + ' ' + y0.toFixed(2) +
        ' A' + R + ' ' + R + ' 0 ' + large + ' 1 ' + x1.toFixed(2) + ' ' + y1.toFixed(2) + ' Z"/>';
      mids.push({ a: (a0 + a1) / 2, start: (a0 + Math.PI / 2) / (Math.PI * 2), pct: Math.round(c.v / total * 100) });
      legend += '<li class="rep-leg"><span class="rep-sw rep-c' + (i + 1) + '" aria-hidden="true"></span><span class="rep-leg-n">' + c.n.replace('&', '&amp;') + '</span><span class="rep-leg-v">' + fmt(c.v) + '</span></li>';
      a0 = a1;
    });

    var grid = '', ticks = [0, 2000, 4000, 6000, 8000, 10000], bars = '', X0 = 46, X1 = 292, Y0 = 134, Y1 = 14, bw = 24;
    ticks.forEach(function (t) {
      var y = Y0 - (t / 10000) * (Y0 - Y1);
      grid += '<line class="rep-grid" x1="' + X0 + '" x2="' + X1 + '" y1="' + y + '" y2="' + y + '"/><text class="rep-tick" x="' + (X0 - 6) + '" y="' + (y + 3) + '" text-anchor="end">' + (t ? '₹' + t / 1000 + 'k' : '₹0') + '</text>';
    });
    var step = (X1 - X0) / MONTHS.length;
    MONTHS.forEach(function (m, j) {
      var h = (m[1] / 10000) * (Y0 - Y1), x = X0 + step * j + (step - bw) / 2;
      bars += '<rect class="rep-bar' + (j === MONTHS.length - 1 ? ' rep-bar-now' : '') + '" x="' + x + '" y="' + (Y0 - h) + '" width="' + bw + '" height="' + h + '" rx="3"/>' +
        '<text class="rep-bval" x="' + (x + bw / 2) + '" y="' + (Y0 - h - 5) + '" text-anchor="middle">' + fmt(m[1]) + '</text>' +
        '<text class="rep-tick" x="' + (x + bw / 2) + '" y="' + (Y0 + 14) + '" text-anchor="middle">' + m[0] + '</text>';
    });

    var chapters = CHAPTERS.map(function (c) {
      return '<button type="button" class="rep-ch" data-end="' + c[2] + '"><span class="rep-ch-fill" aria-hidden="true"></span><span class="rep-ch-name">' + c[0] + '</span></button>';
    }).join('');

    root.innerHTML =
      '<div class="rep-cards">' +
        '<section class="rep-card" aria-label="Spending by category">' +
          '<header class="rep-head"><h3 class="rep-title">Spending by Category</h3><span class="rep-chip">November 2026</span></header>' +
          '<div class="rep-pie-row">' +
            '<svg class="rep-pie" viewBox="0 0 200 200" role="img" aria-label="Pie chart of November spending by category">' +
              '<defs><mask id="rep-sweep" style="mask-type:alpha"><circle class="rep-sweep-ring" cx="' + CX + '" cy="' + CY + '" r="' + RING_R + '" transform="rotate(-90 ' + CX + ' ' + CY + ')"/></mask></defs>' +
              '<g mask="url(#rep-sweep)">' + slices + '</g></svg>' +
            '<ul class="rep-legend">' + legend + '</ul>' +
          '</div>' +
        '</section>' +
        '<section class="rep-card" aria-label="Monthly trend">' +
          '<header class="rep-head"><h3 class="rep-title">Monthly Trend (Last 6 Months)</h3></header>' +
          '<svg class="rep-trend" viewBox="0 0 300 156" role="img" aria-label="Bar chart of monthly spending, June to November">' + grid + bars + '</svg>' +
        '</section>' +
      '</div>' +
      '<p class="rep-readout" id="rep-readout"></p>' +
      '<div class="rep-timeline" role="group" aria-label="Walkthrough chapters">' + chapters + '</div>' +
      '<p class="rep-hint">Scroll to play. Sample data.</p>';

    var fig = root.parentNode.querySelector('.feature-product-figure');
    if (fig) fig.parentNode.removeChild(fig);
    root.classList.add('is-live');

    var ring = root.querySelector('.rep-sweep-ring');
    var sliceEls = [].slice.call(root.querySelectorAll('.rep-slice'));
    var legEls = [].slice.call(root.querySelectorAll('.rep-leg'));
    var barEls = [].slice.call(root.querySelectorAll('.rep-bar'));
    var valEls = [].slice.call(root.querySelectorAll('.rep-bval'));
    var chEls = [].slice.call(root.querySelectorAll('.rep-ch'));
    var readout = root.querySelector('#rep-readout');
    ring.setAttribute('stroke-width', R);
    var lastText = '';

    function render(p) {
      var s = clamp(p / 0.28, 0, 1);
      ring.setAttribute('stroke-dasharray', (RING_C * s).toFixed(2) + ' ' + RING_C.toFixed(2));

      var hi = -1, e = 0;
      if (p >= 0.3 && p < 0.6) {
        var q = (p - 0.3) / 0.3 * CATS.length;
        hi = Math.min(CATS.length - 1, Math.floor(q));
        var t = q - hi;
        e = Math.min(1, t * 6, (1 - t) * 6);
      }
      sliceEls.forEach(function (el, i) {
        var on = i === hi ? e : 0;
        el.style.transform = 'translate(' + (Math.cos(mids[i].a) * 9 * on).toFixed(2) + 'px,' + (Math.sin(mids[i].a) * 9 * on).toFixed(2) + 'px)';
        el.style.opacity = (1 - 0.55 * (hi >= 0 && i !== hi ? e : 0)).toFixed(2);
      });
      legEls.forEach(function (el, i) {
        el.style.opacity = clamp((s - mids[i].start) * 6 + 0.05, 0, 1).toFixed(2);
        el.classList.toggle('is-on', i === hi && e > 0.5);
      });

      barEls.forEach(function (el, j) {
        var b = clamp((p - 0.58 - j * 0.06) / 0.12, 0, 1);
        el.style.transform = 'scaleY(' + easeOut(b).toFixed(3) + ')';
        valEls[j].style.opacity = b.toFixed(2);
      });

      chEls.forEach(function (el, k) {
        var c = CHAPTERS[k];
        var f = clamp((p - c[1]) / (c[2] - c[1]), 0, 1);
        el.firstChild.style.transform = 'scaleX(' + f.toFixed(3) + ')';
        el.classList.toggle('is-active', p >= c[1] && p < c[2] + 0.0001 && p < 1 || (k === CHAPTERS.length - 1 && p >= 1));
      });

      var text;
      if (p < 0.3) text = fmt(total) + ' spent in November';
      else if (p < 0.6) text = CATS[hi].n + ': ' + fmt(CATS[hi].v) + ', ' + mids[hi].pct + '% of the month';
      else if (p < 0.95) text = 'Month by month, June to November';
      else text = 'November is the highest of the six months';
      if (text !== lastText) { readout.textContent = text; lastText = text; }
    }

    if (reduced) {
      render(1);
      root.classList.add('is-static');
      return;
    }

    var ticking = false, last = -1;
    function update() {
      ticking = false;
      var vh = window.innerHeight || 800;
      var top = root.getBoundingClientRect().top;
      var p = clamp((vh * 0.85 - top) / (vh * 0.7), 0, 1);
      if (Math.abs(p - last) < 0.002) return;
      last = p;
      render(p);
    }
    function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }

    render(0);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        var on = en[0].isIntersecting;
        window[on ? 'addEventListener' : 'removeEventListener']('scroll', onScroll, { passive: true });
        if (on) onScroll();
      }, { rootMargin: '150% 0px' }).observe(root);
    } else {
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    chEls.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var vh = window.innerHeight || 800;
        var target = root.getBoundingClientRect().top + window.pageYOffset - vh * 0.85 + parseFloat(btn.getAttribute('data-end')) * vh * 0.7;
        window.scrollTo({ top: target, behavior: 'smooth' });
      });
    });
  }

  /* ---------- Hero tour chapters: a timeline over the existing auto tour ---------- */
  function initChapters() {
    var wrap = document.getElementById('hero-chapters');
    var content = document.querySelector('.replica-content');
    if (!wrap || !content) return;
    var btns = [].slice.call(wrap.querySelectorAll('.hero-chapter'));
    var order = btns.map(function (b) { return b.getAttribute('data-chapter'); });
    var icon = document.getElementById('hero-hud-icon');
    var cur = -2;

    function sync() {
      var pane = content.querySelector('.replica-view-pane.active');
      var i = order.indexOf(pane ? pane.getAttribute('data-view') : '');
      if (i === cur) return;
      var first = cur === -2;
      cur = i;
      btns.forEach(function (b, j) {
        b.classList.toggle('is-active', j === i);
        b.classList.toggle('is-done', i >= 0 && j < i);
        b.classList.remove('is-playing');
        if (j === i && !first && !reduced) {
          requestAnimationFrame(function () { requestAnimationFrame(function () { b.classList.add('is-playing'); }); });
        }
      });
    }
    function syncPause() { wrap.classList.toggle('is-paused', !!icon && icon.classList.contains('fa-play')); }

    new MutationObserver(sync).observe(content, { subtree: true, attributes: true, attributeFilter: ['class'] });
    if (icon) new MutationObserver(syncPause).observe(icon, { attributes: true, attributeFilter: ['class'] });
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        var tab = document.getElementById('hero-tab-' + b.getAttribute('data-chapter'));
        if (tab) tab.click();
      });
    });
    sync();
    syncPause();
  }

  function boot() { initReports(); initChapters(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
