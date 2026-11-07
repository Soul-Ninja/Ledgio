/**
 * Ledgio v2 — Alive Layer v7 (Phase B7)
 * Scroll progress, vertical live rail with traveling packet, section motif lighting,
 * synchronized nav links, cursor card spotlight, and interactive vault reveal.
 */
(function () {
  'use strict';

  var root = document.documentElement;
  var isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Vault blur-reveal interaction (available even with reduced motion)
  function initVaultInteraction() {
    var vaultBox = document.querySelector('#paper-card-vault .vault-blur-box');
    if (!vaultBox) return;

    var reblurTimer = null;
    function revealVault() {
      vaultBox.classList.add('is-revealed');
      vaultBox.setAttribute('aria-pressed', 'true');
      var icon = vaultBox.querySelector('.vault-lock-icon');
      if (icon) {
        icon.classList.remove('fa-lock');
        icon.classList.add('fa-lock-open');
      }
    }

    function concealVault() {
      vaultBox.classList.remove('is-revealed');
      vaultBox.setAttribute('aria-pressed', 'false');
      var icon = vaultBox.querySelector('.vault-lock-icon');
      if (icon) {
        icon.classList.remove('fa-lock-open');
        icon.classList.add('fa-lock');
      }
      if (reblurTimer) {
        clearTimeout(reblurTimer);
        reblurTimer = null;
      }
    }

    vaultBox.addEventListener('click', function (e) {
      e.stopPropagation();
      if (vaultBox.classList.contains('is-revealed')) {
        concealVault();
      } else {
        revealVault();
        if (reblurTimer) clearTimeout(reblurTimer);
        reblurTimer = setTimeout(concealVault, 4000);
      }
    });

    vaultBox.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (vaultBox.classList.contains('is-revealed')) {
          concealVault();
        } else {
          revealVault();
        }
      }
    });

    document.addEventListener('click', function (e) {
      if (!vaultBox.contains(e.target) && vaultBox.classList.contains('is-revealed')) {
        concealVault();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVaultInteraction);
  } else {
    initVaultInteraction();
  }

  if (isReduced) return;

  root.classList.add('alive-ready');

  // Top progress bar
  var bar = document.createElement('div');
  bar.className = 'alive-progress';
  bar.setAttribute('aria-hidden', 'true');

  // Subtle ambient glow
  var glow = document.createElement('div');
  glow.className = 'alive-glow';
  glow.setAttribute('aria-hidden', 'true');
  document.body.insertBefore(glow, document.body.firstChild);
  document.body.appendChild(bar);

  // Vertical live rail
  var railContainer = document.createElement('div');
  railContainer.className = 'live-rail-container';
  railContainer.setAttribute('aria-hidden', 'true');
  railContainer.innerHTML = '<div class="live-rail-track"></div><div class="live-rail-fill"></div><div class="live-rail-packet"></div>';
  document.body.appendChild(railContainer);

  var railFill = railContainer.querySelector('.live-rail-fill');
  var railPacket = railContainer.querySelector('.live-rail-packet');

  // Precompute section geometry to avoid layout reads in scroll loop
  var sectionMarkers = [];
  var navLinks = [];
  var totalScrollable = 0;
  var railTrackHeight = 0;

  function cacheGeometry() {
    var max = root.scrollHeight - window.innerHeight;
    totalScrollable = max > 0 ? max : 1;
    var railTrack = railContainer.querySelector('.live-rail-track');
    railTrackHeight = railTrack ? railTrack.offsetHeight : 0;

    sectionMarkers = [];
    var sections = document.querySelectorAll('#problem, #steps, #features, #faq, #closing-cta, .feature-section');
    sections.forEach(function (sec) {
      var rect = sec.getBoundingClientRect();
      var top = rect.top + window.scrollY;
      var motif = sec.querySelector('.section-motif-bar');
      sectionMarkers.push({
        id: sec.id,
        el: sec,
        top: top,
        height: rect.height,
        motif: motif
      });
    });

    navLinks = Array.from(document.querySelectorAll('.landing-header .nav-item'));
  }

  var queued = false;
  function updateScrollDynamics() {
    queued = false;
    var scrollY = window.scrollY;
    var p = Math.min(1, Math.max(0, scrollY / totalScrollable));

    // Update top bar & glow
    bar.style.transform = 'scaleX(' + p.toFixed(4) + ')';
    glow.style.transform = 'translate3d(' + ((p - 0.5) * 30).toFixed(2) + 'vw,' + (p * 60 - 10).toFixed(2) + 'vh,0)';

    // Update vertical rail fill & packet
    if (railFill && railPacket && railTrackHeight > 0) {
      var fillH = Math.round(p * railTrackHeight);
      railFill.style.height = fillH + 'px';
      railPacket.style.transform = 'translateY(' + fillH + 'px)';
    }

    // Active section & motif lighting
    var viewportCenter = scrollY + window.innerHeight * 0.45;
    var activeId = '';
    for (var i = 0; i < sectionMarkers.length; i++) {
      var sm = sectionMarkers[i];
      var isInside = (viewportCenter >= sm.top && viewportCenter <= sm.top + sm.height);
      if (sm.motif) {
        if (isInside) {
          sm.motif.classList.add('is-active');
        } else {
          sm.motif.classList.remove('is-active');
        }
      }
      if (isInside && sm.id) {
        activeId = sm.id;
      }
    }

    // Top nav link synchronization
    if (activeId && navLinks.length > 0) {
      var targetHref = '#' + (activeId.startsWith('feature') ? 'features' : activeId);
      navLinks.forEach(function (link) {
        if (link.getAttribute('href') === targetHref) {
          link.classList.add('active');
        } else if (link.getAttribute('href') && link.getAttribute('href').startsWith('#')) {
          link.classList.remove('active');
        }
      });
    }
  }

  window.addEventListener('scroll', function () {
    if (!queued) {
      queued = true;
      requestAnimationFrame(updateScrollDynamics);
    }
  }, { passive: true });

  window.addEventListener('resize', function () {
    cacheGeometry();
    updateScrollDynamics();
  }, { passive: true });

  // IntersectionObserver for elements entering view
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in-view');
        }
      });
    }, { threshold: 0.15 });

    document.querySelectorAll('.section-problem,.section-steps,.section-faq,.section-closing,.feature-section,.feature-demo-frame,.half-frame')
      .forEach(function (n) { io.observe(n); });
  }

  // Pointer card lighting
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.addEventListener('pointermove', function (ev) {
      var t = ev.target;
      var card = t && t.closest ? t.closest('.feature-demo-frame,.half-frame,.why-card,.step-card') : null;
      if (!card) return;
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (ev.clientX - r.left) + 'px');
      card.style.setProperty('--my', (ev.clientY - r.top) + 'px');
    }, { passive: true });
  }

  // Initial calculation after load
  if (document.readyState === 'complete') {
    cacheGeometry();
    updateScrollDynamics();
  } else {
    window.addEventListener('load', function () {
      cacheGeometry();
      updateScrollDynamics();
    });
  }
})();
