(function() {
  'use strict';

  var isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  // Desktop-only timers & intervals tracking
  var desktopTimers = [];
  var desktopIntervals = [];
  var desktopAnimFrames = [];
  var desktopCleanups = [];
  var isDesktopActive = false;

  function safeDesktopTimeout(fn, ms) {
    var id;
    id = setTimeout(function() {
      var idx = desktopTimers.indexOf(id);
      if (idx !== -1) desktopTimers.splice(idx, 1);
      fn();
    }, ms);
    desktopTimers.push(id);
    return id;
  }

  function clearDesktopTimeout(id) {
    var idx = desktopTimers.indexOf(id);
    if (idx !== -1) desktopTimers.splice(idx, 1);
    clearTimeout(id);
  }

  function safeDesktopInterval(fn, ms) {
    var id = setInterval(fn, ms);
    desktopIntervals.push(id);
    return id;
  }

  function clearDesktopInterval(id) {
    var idx = desktopIntervals.indexOf(id);
    if (idx !== -1) desktopIntervals.splice(idx, 1);
    clearInterval(id);
  }

  function safeDesktopRaf(fn) {
    var id;
    id = requestAnimationFrame(function(time) {
      var idx = desktopAnimFrames.indexOf(id);
      if (idx !== -1) desktopAnimFrames.splice(idx, 1);
      fn(time);
    });
    desktopAnimFrames.push(id);
    return id;
  }

  function cancelDesktopRaf(id) {
    var idx = desktopAnimFrames.indexOf(id);
    if (idx !== -1) desktopAnimFrames.splice(idx, 1);
    cancelAnimationFrame(id);
  }

  function getActiveDesktopTimersCount() {
    return desktopTimers.length + desktopIntervals.length + desktopAnimFrames.length;
  }
  window.__ledgio_activeDesktopTimers = getActiveDesktopTimersCount;
  window.__ledgio_desktopTimersCount = getActiveDesktopTimersCount;

  function formatINR(val, prefix) {
    var p = prefix || '';
    var abs = Math.abs(val);
    var formatted = abs.toLocaleString('en-IN');
    if (val < 0 && p.indexOf('−') === -1 && p.indexOf('-') === -1) {
      return '−' + p + formatted;
    }
    return p + formatted;
  }

  function tickNumber(el, start, end, duration, prefix, suffix, decimals) {
    if (!el) return;
    var p = prefix !== undefined ? prefix : '';
    var s = suffix !== undefined ? suffix : '';
    var d = typeof decimals === 'number' ? decimals : 0;

    function formatVal(v) {
      if (d > 0) {
        return p + Number(v).toFixed(d) + s;
      }
      if (s) {
        return p + Math.round(v) + s;
      }
      return formatINR(Math.round(v), p);
    }

    if (isReducedMotion || duration <= 0) {
      el.textContent = formatVal(end);
      return;
    }

    var startTime = null;
    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var elapsed = timestamp - startTime;
      var progress = Math.min(elapsed / duration, 1);
      var easeOut = 1 - Math.pow(1 - progress, 3);
      var current = start + (end - start) * easeOut;
      el.textContent = formatVal(current);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = formatVal(end);
      }
    }
    requestAnimationFrame(step);
  }

  function initHeroSpotlightAndTilt() {
    var hero = document.getElementById('hero');
    var spotlight = document.getElementById('hero-spotlight');
    if (!hero || !spotlight) return;

    if (isReducedMotion || isTouch) return;

    var heroRect = null;
    var rafPending = false;
    var mouseX = 0;
    var mouseY = 0;

    function updateHeroRect() {
      heroRect = hero.getBoundingClientRect();
    }

    updateHeroRect();
    window.addEventListener('scroll', updateHeroRect, { passive: true });
    window.addEventListener('resize', updateHeroRect, { passive: true });

    if (window.ResizeObserver) {
      new ResizeObserver(updateHeroRect).observe(hero);
    }

    hero.addEventListener('pointerenter', function() {
      spotlight.style.opacity = '1';
    });

    hero.addEventListener('pointerleave', function() {
      spotlight.style.opacity = '0';
    });

    hero.addEventListener('pointermove', function(e) {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!rafPending) {
        rafPending = true;
        requestAnimationFrame(function() {
          rafPending = false;
          if (!heroRect) return;

          var relX = mouseX - heroRect.left;
          var relY = mouseY - heroRect.top;

          var pctX = Math.round((relX / heroRect.width) * 100);
          var pctY = Math.round((relY / heroRect.height) * 100);

          spotlight.style.setProperty('--x', pctX + '%');
          spotlight.style.setProperty('--y', pctY + '%');
        });
      }
    });
  }

  // =========================================================================
  // Desktop Hero: Living Ledger Typography ("LEDGIO")
  // =========================================================================
  function initHeroLedgerTitle() {
    var wrap = document.getElementById('hero-ledger-title-wrap');
    var canvas = document.getElementById('hero-ledger-canvas');
    if (!wrap || !canvas) return;

    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var animFrameId = null;
    var startTime = null;
    var isHovered = false;
    var mouseX = -9999;
    var mouseY = -9999;
    var targetMouseX = -9999;
    var targetMouseY = -9999;
    var waves = [];
    var lastCutePingTime = 0;
    var isHeroVisible = true;

    var FINANCIAL_DATA = [
      '+₹45,000', '−₹1,200', '₹36,350', '24.10', 'EMI 7/24', 'SAVINGS',
      '+₹8,000', '₹0 FOREVER', '09:41', 'LOAN: ₹5k', 'KIRANA: ₹640',
      'NET: ₹1.85L', 'LOCAL_FIRST', '0% TELEMETRY', 'CAP: ₹5,000', 'SAFE: ₹36k',
      '+₹14,500', 'AUDIT: PASS', '₹1,299', 'OFFLINE'
    ];

    var dataStreamCells = [];
    var cutePips = [];
    var PIP_SYMBOLS = ['₹', '✦', '+', '★', '₹', '•'];
    var PIP_COLORS = ['#34d399', '#38bdf8', '#fef08a', '#6ee7b7', '#7dd3fc'];

    var width = 940;
    var height = 210;
    var dpr = 1;

    // Reusable offscreen buffers for smooth 60fps rendering without GC thrash
    var maskCanvas = document.createElement('canvas');
    var mCtx = maskCanvas.getContext('2d');
    var contentCanvas = document.createElement('canvas');
    var cCtx = contentCanvas.getContext('2d');

    function initCutePips() {
      cutePips = [];
      var count = 14;
      for (var p = 0; p < count; p++) {
        cutePips.push({
          x: Math.random() * width,
          y: Math.random() * height,
          speed: 0.22 + Math.random() * 0.28,
          swayAmp: 5 + Math.random() * 8,
          swayFreq: 0.0016 + Math.random() * 0.001,
          swayOffset: Math.random() * Math.PI * 2,
          symbol: PIP_SYMBOLS[p % PIP_SYMBOLS.length],
          color: PIP_COLORS[p % PIP_COLORS.length],
          baseAlpha: 0.38 + Math.random() * 0.42,
          size: Math.floor(10 + Math.random() * 4)
        });
      }
    }

    function resize() {
      if (!isDesktopActive) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      var rect = wrap.getBoundingClientRect();
      width = Math.round(rect.width || 940);
      height = Math.round(Math.min(260, Math.max(145, width * 0.24)));
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';

      maskCanvas.width = canvas.width;
      maskCanvas.height = canvas.height;
      contentCanvas.width = canvas.width;
      contentCanvas.height = canvas.height;

      dataStreamCells = [];
      var colWidth = Math.max(52, Math.round(width / 16));
      var rowHeight = 17;
      var cols = Math.ceil(width / colWidth);
      var rows = Math.ceil(height / rowHeight);

      for (var r = 0; r < rows; r++) {
        for (var c = 0; c < cols; c++) {
          dataStreamCells.push({
            x: c * colWidth + colWidth / 2,
            y: r * rowHeight + rowHeight / 2,
            baseText: FINANCIAL_DATA[(r * 5 + c * 3) % FINANCIAL_DATA.length],
            scrambleOffset: (r * 0.05 + c * 0.04) % 1
          });
        }
      }

      initCutePips();
    }

    function drawFrame(now) {
      if (!isDesktopActive) return;
      if (!startTime) startTime = now || performance.now();
      var currentNow = now || performance.now();
      var elapsed = (currentNow - startTime) / 1000;
      var duration = 1.15;
      var progress = Math.min(1, elapsed / duration);
      var ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

      mouseX += (targetMouseX - mouseX) * 0.2;
      mouseY += (targetMouseY - mouseY) * 0.2;

      for (var i = waves.length - 1; i >= 0; i--) {
        var w = waves[i];
        w.r += 14;
        w.life = 1 - (w.r / w.maxR);
        if (w.life <= 0) waves.splice(i, 1);
      }

      // Cute periodic "savings coin drop" ping when idle
      if (currentNow - lastCutePingTime > 3400 && !isHovered && progress >= 1) {
        lastCutePingTime = currentNow;
        var pingLetterIdx = Math.floor(Math.random() * 6);
        var letterX = (width * 0.16) + pingLetterIdx * (width * 0.136);
        var letterY = height * 0.5 + Math.sin(currentNow * 0.001) * 14;
        waves.push({
          x: letterX,
          y: letterY,
          r: 0,
          maxR: Math.min(100, width * 0.13),
          life: 1,
          cute: true
        });
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      var text = 'LEDGIO';
      var fontSize = Math.round(Math.min(185, Math.max(88, width * 0.205)));
      var fontStr = "800 " + fontSize + "px 'Space Grotesk', 'Plus Jakarta Sans', system-ui, sans-serif";
      var centerY = height / 2;
      var textY = centerY + (1 - ease) * 16;

      // 1. Mask Canvas
      mCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      mCtx.clearRect(0, 0, width, height);
      mCtx.font = fontStr;
      mCtx.textAlign = 'center';
      mCtx.textBaseline = 'middle';
      if ('letterSpacing' in mCtx) mCtx.letterSpacing = '0.08em';
      mCtx.fillStyle = '#ffffff';

      mCtx.save();
      mCtx.globalAlpha = Math.min(1, progress * 1.5);
      mCtx.fillText(text, width / 2, textY);
      mCtx.restore();

      // 2. Content Canvas
      cCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cCtx.globalCompositeOperation = 'source-over';
      cCtx.clearRect(0, 0, width, height);

      // Premium Brand Gradient Fill: #10b981 (Emerald) -> #14b8a6 (Teal) -> #0ea5e9 (Cyan)
      var bgGrad = cCtx.createLinearGradient(0, 0, width, 0);
      bgGrad.addColorStop(0, 'rgba(16, 185, 129, 0.24)');
      bgGrad.addColorStop(0.5, 'rgba(20, 184, 166, 0.24)');
      bgGrad.addColorStop(1, 'rgba(14, 165, 233, 0.24)');
      cCtx.fillStyle = bgGrad;
      cCtx.fillRect(0, 0, width, height);

      cCtx.font = "700 11px 'Space Grotesk', 'JetBrains Mono', monospace";
      cCtx.textAlign = 'center';
      cCtx.textBaseline = 'middle';

      for (var j = 0; j < dataStreamCells.length; j++) {
        var cell = dataStreamCells[j];
        if (progress >= 1 && !isReducedMotion) {
          cell.y -= 0.16;
          if (cell.y < 0) cell.y += height;
        }

        var textToShow = cell.baseText;
        if (progress < 1) {
          var scramble = Math.floor((currentNow * 0.03 + cell.scrambleOffset * 100) % FINANCIAL_DATA.length);
          textToShow = FINANCIAL_DATA[scramble];
        }

        var dx = cell.x - mouseX;
        var dy = cell.y - mouseY;
        var dist = Math.hypot(dx, dy);
        var isNearMouse = isHovered && dist < 140;

        var alpha = 0.65;
        var xRatio = Math.max(0, Math.min(1, cell.x / width));
        // Gradient interpolation #34d399 -> #38bdf8
        var cr = Math.round(52 + (56 - 52) * xRatio);
        var cg = Math.round(211 + (189 - 211) * xRatio);
        var cb = Math.round(153 + (248 - 153) * xRatio);
        var color = 'rgb(' + cr + ',' + cg + ',' + cb + ')';

        if (isNearMouse) {
          var k = 1 - (dist / 140);
          alpha = 0.75 + k * 0.25;
          color = '#ffffff';
        }

        for (var wi = 0; wi < waves.length; wi++) {
          var wav = waves[wi];
          var wDist = Math.abs(Math.hypot(cell.x - wav.x, cell.y - wav.y) - wav.r);
          if (wDist < 32) {
            alpha = Math.min(1, alpha + (1 - wDist / 32) * wav.life * 0.7);
            color = wav.cute ? '#fef08a' : '#ffffff';
          }
        }

        cCtx.fillStyle = color;
        cCtx.globalAlpha = alpha;
        cCtx.fillText(textToShow, cell.x, cell.y);
      }

      // Draw cute floating savings micro-particles (₹, ✦, ★, +) inside letters
      if (progress >= 0.5 && !isReducedMotion) {
        for (var pi = 0; pi < cutePips.length; pi++) {
          var pip = cutePips[pi];
          pip.y -= pip.speed;
          if (pip.y < -12) {
            pip.y = height + 10;
            pip.x = Math.random() * width;
          }
          var pipX = pip.x + Math.sin(currentNow * pip.swayFreq + pip.swayOffset) * pip.swayAmp;
          cCtx.font = "800 " + pip.size + "px 'Space Grotesk', system-ui, sans-serif";
          cCtx.fillStyle = pip.color;
          var breatheAlpha = pip.baseAlpha * (0.65 + 0.35 * Math.sin(currentNow * 0.0025 + pip.swayOffset));
          cCtx.globalAlpha = Math.min(1, breatheAlpha * progress);
          cCtx.fillText(pip.symbol, pipX, pip.y);
        }
      }

      var lineSpacing = 5.5;
      var lineCount = Math.floor(height / lineSpacing);

      for (var li = 0; li <= lineCount; li++) {
        var baseY = li * lineSpacing;
        cCtx.beginPath();
        var stepX = 14;
        var first = true;
        for (var lx = 0; lx <= width; lx += stepX) {
          var ldy = 0;

          // Cute continuous gentle ledger wave
          if (!isReducedMotion) {
            ldy += Math.sin(lx * 0.02 + currentNow * 0.0016 + li * 0.35) * 2.2;
          }

          if (isHovered) {
            var mDist = Math.hypot(lx - mouseX, baseY - mouseY);
            if (mDist < 120) {
              var mk = 1 - mDist / 120;
              ldy += -mk * mk * 9;
            }
          }
          for (var wj = 0; wj < waves.length; wj++) {
            var wv = waves[wj];
            var wvDist = Math.abs(Math.hypot(lx - wv.x, baseY - wv.y) - wv.r);
            if (wvDist < 32) {
              var wk = 1 - wvDist / 32;
              ldy += Math.sin(wvDist * 0.25) * wk * (wv.cute ? 7 : 10) * wv.life;
            }
          }

          if (first) {
            cCtx.moveTo(lx, baseY + ldy);
            first = false;
          } else {
            cCtx.lineTo(lx, baseY + ldy);
          }
        }

        var isMajor = (li % 3 === 0);
        cCtx.lineWidth = isMajor ? 2.2 : 1.3;
        var lineAlpha = (isMajor ? 0.95 : 0.8) * Math.min(1, progress * 1.3);
        var lineGrad = cCtx.createLinearGradient(0, 0, width, 0);
        lineGrad.addColorStop(0, isMajor ? 'rgba(110, 231, 183, ' + lineAlpha + ')' : 'rgba(52, 211, 153, ' + lineAlpha + ')');
        lineGrad.addColorStop(0.5, isMajor ? 'rgba(94, 234, 212, ' + lineAlpha + ')' : 'rgba(45, 212, 191, ' + lineAlpha + ')');
        lineGrad.addColorStop(1, isMajor ? 'rgba(125, 211, 252, ' + lineAlpha + ')' : 'rgba(56, 189, 248, ' + lineAlpha + ')');
        cCtx.strokeStyle = lineGrad;
        cCtx.stroke();
      }

      // Mask content into letters
      cCtx.globalCompositeOperation = 'destination-in';
      cCtx.setTransform(1, 0, 0, 1, 0, 0);
      cCtx.drawImage(maskCanvas, 0, 0);
      cCtx.globalCompositeOperation = 'source-over';

      // 3. Render into visible canvas with silky breathing pulse
      var pulse = 0.5 + 0.5 * Math.sin(currentNow * 0.0016);
      ctx.save();
      ctx.shadowColor = 'rgba(16, 185, 129, ' + (0.45 + pulse * 0.16) + ')';
      ctx.shadowBlur = 24 + pulse * 8;
      ctx.drawImage(contentCanvas, 0, 0, width, height);
      ctx.shadowBlur = 0;

      // Stroke outline with emerald -> cyan breathing gradient
      ctx.font = fontStr;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if ('letterSpacing' in ctx) ctx.letterSpacing = '0.08em';

      var strokeGrad = ctx.createLinearGradient(width * (0.08 + pulse * 0.04), 0, width * (0.92 - pulse * 0.04), 0);
      var strokeAlpha = (0.86 + pulse * 0.14) * Math.min(1, progress * 1.5);
      strokeGrad.addColorStop(0, 'rgba(52, 211, 153, ' + strokeAlpha + ')');
      strokeGrad.addColorStop(0.5, 'rgba(45, 212, 191, ' + strokeAlpha + ')');
      strokeGrad.addColorStop(1, 'rgba(56, 189, 248, ' + strokeAlpha + ')');

      ctx.lineWidth = 2.4;
      ctx.strokeStyle = strokeGrad;
      ctx.strokeText(text, width / 2, textY);

      ctx.restore();

      var isStillAnimating = isDesktopActive && !isReducedMotion && isHeroVisible;
      if (isStillAnimating) {
        animFrameId = safeDesktopRaf(drawFrame);
      } else {
        animFrameId = null;
      }
    }

    function wakeAnimation() {
      if (!animFrameId && isDesktopActive) {
        animFrameId = safeDesktopRaf(drawFrame);
      }
    }

    function onPointerEnter(e) {
      isHovered = true;
      var rect = wrap.getBoundingClientRect();
      targetMouseX = e.clientX - rect.left;
      targetMouseY = e.clientY - rect.top;
      wakeAnimation();
    }

    function onPointerMove(e) {
      var rect = wrap.getBoundingClientRect();
      targetMouseX = e.clientX - rect.left;
      targetMouseY = e.clientY - rect.top;
      wakeAnimation();
    }

    function onPointerLeave() {
      isHovered = false;
      targetMouseX = -9999;
      targetMouseY = -9999;
      wakeAnimation();
    }

    var heroEl = document.getElementById('hero');
    function onHeroPointerMove(e) {
      var rect = wrap.getBoundingClientRect();
      var relX = e.clientX - rect.left;
      var relY = e.clientY - rect.top;
      var marginX = 260;
      var marginY = 180;
      var isNear = relX >= -marginX && relX <= rect.width + marginX &&
                  relY >= -marginY && relY <= rect.height + marginY;
      if (isNear) {
        isHovered = true;
        targetMouseX = relX;
        targetMouseY = relY;
        wakeAnimation();
      } else if (isHovered) {
        isHovered = false;
        targetMouseX = -9999;
        targetMouseY = -9999;
        wakeAnimation();
      }
    }

    function onHeroPointerLeave() {
      isHovered = false;
      targetMouseX = -9999;
      targetMouseY = -9999;
      wakeAnimation();
    }

    function onPointerDown(e) {
      var rect = wrap.getBoundingClientRect();
      var clickX = e.clientX - rect.left;
      var clickY = e.clientY - rect.top;
      waves.push({
        x: clickX,
        y: clickY,
        r: 0,
        maxR: rect.width * 0.85,
        life: 1
      });
      wakeAnimation();
    }

    function onResize() {
      resize();
      wakeAnimation();
    }

    wrap.addEventListener('pointerenter', onPointerEnter);
    wrap.addEventListener('pointermove', onPointerMove);
    wrap.addEventListener('pointerleave', onPointerLeave);
    wrap.addEventListener('pointerdown', onPointerDown);
    if (heroEl) {
      heroEl.addEventListener('pointermove', onHeroPointerMove);
      heroEl.addEventListener('pointerleave', onHeroPointerLeave);
    }
    window.addEventListener('resize', onResize);

    desktopCleanups.push(function() {
      if (animFrameId) {
        cancelDesktopRaf(animFrameId);
        animFrameId = null;
      }
      wrap.removeEventListener('pointerenter', onPointerEnter);
      wrap.removeEventListener('pointermove', onPointerMove);
      wrap.removeEventListener('pointerleave', onPointerLeave);
      wrap.removeEventListener('pointerdown', onPointerDown);
      if (heroEl) {
        heroEl.removeEventListener('pointermove', onHeroPointerMove);
        heroEl.removeEventListener('pointerleave', onHeroPointerLeave);
      }
      window.removeEventListener('resize', onResize);
    });

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function() {
        if (!isDesktopActive) return;
        resize();
        wakeAnimation();
      }).catch(function() {});
    }

    if ('IntersectionObserver' in window && heroEl) {
      var heroObs = new IntersectionObserver(function(entries) {
        if (!entries || !entries.length) return;
        isHeroVisible = entries[0].isIntersecting;
        if (isHeroVisible) {
          wakeAnimation();
        }
      }, { threshold: 0.05 });
      heroObs.observe(heroEl);
      desktopCleanups.push(function() {
        heroObs.disconnect();
      });
    }

    resize();
    wakeAnimation();
  }

  function initHeroPreviewSidebar() {
    var frame = document.getElementById('hero-product-frame');
    var navItems = Array.prototype.slice.call(document.querySelectorAll('.replica-sidebar button.replica-nav-item'));
    var views = document.querySelectorAll('.replica-content .replica-view-pane');
    var hudLabel = document.getElementById('hero-hud-label');
    var hudBtn = document.getElementById('hero-hud-toggle');
    var hudIcon = document.getElementById('hero-hud-icon');
    var cursor = document.getElementById('hero-sim-cursor');
    var ripple = document.getElementById('hero-sim-ripple');
    var viewport = frame ? frame.closest('.product-frame-viewport') : null;

    if (!frame || !navItems.length || !views.length) return;

    var isUserInteracting = false;
    var isManualPause = false;
    var currentActIdx = 0;
    var actTimer = null;
    var subTimers = [];
    var isHeroVisible = true;
    var currentTargetEl = null;

    var cameraClasses = [
      'cam-wide',
      'cam-zoom-budgets',
      'cam-zoom-goals',
      'cam-zoom-vault',
      'cam-zoom-dashboard'
    ];

    function clearAllTimers() {
      stopGlide();
      if (actTimer) {
        clearDesktopTimeout(actTimer);
        actTimer = null;
      }
      while (subTimers.length > 0) {
        clearDesktopTimeout(subTimers.pop());
      }
    }

    // Tour pace: 1 = the original scripted timing.
    var TOUR_SLOW = 1;

    function addSubTimer(fn, delay) {
      var t = safeDesktopTimeout(fn, Math.round(delay * TOUR_SLOW));
      subTimers.push(t);
      return t;
    }

    // Centre of an element in the cursor's coordinate space, from layout offsets rather than
    // getBoundingClientRect: offsets ignore the entrance transforms panes and cards play,
    // so the cursor aims at the final position once and never has to re-aim.
    function aimPoint(el) {
      var fr = frame.getBoundingClientRect();
      var vr = viewport.getBoundingClientRect();
      if (frame.offsetWidth && Math.abs(fr.width / frame.offsetWidth - 1) < 0.01 && typeof el.offsetLeft === 'number') {
        var x = 0, y = 0, n = el;
        while (n && n !== viewport && typeof n.offsetLeft === 'number') {
          x += n.offsetLeft; y += n.offsetTop;
          var p = n.offsetParent;
          if (p && p !== viewport) { x += p.clientLeft - p.scrollLeft; y += p.clientTop - p.scrollTop; }
          n = p;
        }
        if (n === viewport) return { x: x + el.offsetWidth / 2, y: y + el.offsetHeight / 2 };
      }
      var r = el.getBoundingClientRect();
      if (!r.width && !r.height) return null;
      return { x: r.left + r.width / 2 - vr.left, y: r.top + r.height / 2 - vr.top };
    }

    // The cursor is driven frame by frame instead of by a CSS transition. Each frame it re-reads
    // where the target is, so it lands exactly on it and never has to re-aim, and nothing in the
    // stylesheet can restart or override its movement.
    var GLIDE_MS = 480, TRACK_MS = 700;
    var glide = null;
    var curX = 0, curY = 0;

    function renderCursor(x, y) {
      curX = x; curY = y;
      cursor.style.translate = x.toFixed(2) + 'px ' + y.toFixed(2) + 'px';
    }

    function stopGlide() {
      if (glide && glide.raf) cancelAnimationFrame(glide.raf);
      glide = null;
    }

    function aimXY(el) {
      var pt = el.getClientRects().length ? aimPoint(el) : null;
      return pt ? { x: pt.x - 5.5, y: pt.y - 3.2, cx: pt.x, cy: pt.y } : null;
    }

    function glideTo(el) {
      if (glide && glide.el === el) return;
      stopGlide();
      var g = glide = { el: el, sx: curX, sy: curY, t0: performance.now(), raf: 0 };
      (function step() {
        if (glide !== g) return;
        var t = performance.now() - g.t0;
        var a = aimXY(el);
        if (a) {
          var p = Math.min(1, t / GLIDE_MS);
          var e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; // ease-in-out cubic
          renderCursor(g.sx + (a.x - g.sx) * e, g.sy + (a.y - g.sy) * e);
        }
        if (t < GLIDE_MS + TRACK_MS) g.raf = requestAnimationFrame(step);
        else glide = null;
      })();
    }

    function pointCursorAt(targetEl, andClick) {
      if (!targetEl || !cursor || !viewport) return;
      currentTargetEl = targetEl;

      // A target inside a hidden pane has no box; moving there would throw the cursor to the corner.
      var a = aimXY(targetEl);
      if (!a) return;

      if (cursor.style.opacity !== '1') {
        // Reappearing after a hide: start at the spot instead of sliding in from the old one.
        stopGlide();
        renderCursor(a.x, a.y);
        void cursor.offsetWidth;
        cursor.style.opacity = '1';
      } else if (!glide || glide.el !== targetEl) {
        if (Math.abs(a.x - curX) > 1.5 || Math.abs(a.y - curY) > 1.5) glideTo(targetEl);
      }

      if (andClick) {
        cursor.classList.add('clicking');
        addSubTimer(function() {
          if (cursor) cursor.classList.remove('clicking');
        }, 110);

        if (ripple) {
          ripple.style.left = Math.round(a.cx) + 'px';
          ripple.style.top = Math.round(a.cy) + 'px';
          ripple.classList.remove('animate');
          void ripple.offsetWidth; // force reflow
          ripple.classList.add('animate');
        }
      }
    }

    function reSyncCursor() {
      if (!glide && currentTargetEl && cursor && cursor.style.opacity === '1') {
        var a = aimXY(currentTargetEl);
        if (a) renderCursor(a.x, a.y);
      }
    }

    // The zoom moves the frame, so the cursor is pinned to its target for the length of the move.
    var stickRaf = 0;
    function stickCursor(ms) {
      cancelAnimationFrame(stickRaf);
      var t0 = performance.now();
      (function step() {
        if (!glide && currentTargetEl && cursor.style.opacity === '1') {
          var a = aimXY(currentTargetEl);
          if (a) renderCursor(a.x, a.y);
        }
        if (performance.now() - t0 < ms) stickRaf = requestAnimationFrame(step);
      })();
    }

    function setCamera(name) {
      var cls = name || 'cam-wide';
      if (frame.classList.contains(cls)) return;
      cameraClasses.forEach(function(c) { frame.classList.remove(c); });
      frame.classList.add(cls);
      stickCursor(900);
    }

    function switchViewPane(viewKey) {
      views.forEach(function(pane) {
        var key = pane.getAttribute('data-view');
        if (key === viewKey) {
          pane.style.display = 'block';
          pane.classList.add('active');
        } else {
          pane.style.display = 'none';
          pane.classList.remove('active');
        }
      });
      navItems.forEach(function(item) {
        var key = item.getAttribute('data-hero-view');
        if (key === viewKey) {
          item.classList.add('active');
          item.setAttribute('aria-selected', 'true');
        } else {
          item.classList.remove('active');
          item.setAttribute('aria-selected', 'false');
        }
      });
    }

    function updateHud(text, isPlaying) {
      if (hudLabel) hudLabel.textContent = text;
      if (hudIcon) {
        hudIcon.className = isPlaying ? 'fas fa-pause' : 'fas fa-play';
      }
    }

    // ---- Scripted demo state ------------------------------------------------------------
    // Every scene performs a real action on the replica: values, bars, rows and states change for
    // real and carry across scenes (the expense added in Budgets lands in the Dashboard totals).
    // Touched nodes are snapshotted once so the whole story rewinds cleanly when the loop restarts.
    var snaps = new Map();
    var inserted = [];
    function $(id) { return document.getElementById(id); }
    function snap(el) {
      if (el && !snaps.has(el)) snaps.set(el, { h: el.innerHTML, c: el.getAttribute('class'), s: el.getAttribute('style') });
      return el;
    }
    function press(el) {
      if (!el) return;
      el.classList.add('is-pressed');
      addSubTimer(function() { el.classList.remove('is-pressed'); }, 170);
    }
    function flash(el) {
      if (!el) return;
      el.classList.remove('row-flash'); void el.offsetWidth; el.classList.add('row-flash');
    }
    function showToast(text) {
      var t = $('hero-toast'), tt = $('hero-toast-text');
      if (!t || !tt) return;
      tt.textContent = text;
      t.classList.add('is-on');
      addSubTimer(function() { t.classList.remove('is-on'); }, 2300);
    }
    function closeSheet() { var sh = $('hero-entry-sheet'); if (sh) sh.classList.remove('is-open'); }
    function resetTransient() {
      closeSheet();
      var t = $('hero-toast'); if (t) t.classList.remove('is-on');
      ['hero-add-btn', 'hero-goal-add', 'hero-entry-save'].forEach(function(id) { var e = $(id); if (e) e.classList.remove('is-pressed'); });
    }
    function resetData() {
      snaps.forEach(function(v, el) {
        // setAttribute, not className: SVG nodes (the goal ring, the balance curve) have a read-only className
        el.innerHTML = v.h;
        if (v.c === null) el.removeAttribute('class'); else el.setAttribute('class', v.c);
        if (v.s === null) el.removeAttribute('style'); else el.setAttribute('style', v.s);
      });
      snaps.clear();
      inserted.forEach(function(n) { if (n.parentNode) n.parentNode.removeChild(n); });
      inserted = [];
      var val = $('hero-entry-val'); if (val) val.textContent = '0';
      var chip = $('hero-entry-chip'); if (chip) chip.classList.remove('is-selected');
      resetTransient();
    }
    function inr(n) { return '₹' + n.toLocaleString('en-IN'); }
    // Counts a text node from a to b using fmt(value); used where the text is more than a bare number.
    function countTo(el, from, to, ms, fmt) {
      snap(el);
      if (isReducedMotion) { el.textContent = fmt(to); return; }
      var t0 = null;
      (function step(ts) {
        if (t0 === null) t0 = ts;
        var p = Math.min(1, (ts - t0) / ms);
        var e = 1 - Math.pow(1 - p, 3);
        el.textContent = fmt(Math.round(from + (to - from) * e));
        if (p < 1) safeDesktopRaf(step);
      })(performance.now());
    }
    function prependRow(list, html, className) {
      snap(list);
      var last = list.lastElementChild;
      if (last) list.removeChild(last);
      var row = document.createElement('div');
      row.className = className;
      row.innerHTML = html;
      list.insertBefore(row, list.firstChild);
      flash(row);
      return row;
    }

    function openSheet() {
      var sh = $('hero-entry-sheet'), v = $('hero-entry-val'), c = $('hero-entry-chip');
      if (v) v.textContent = '0';
      if (c) c.classList.remove('is-selected');
      if (sh) sh.classList.add('is-open');
    }
    function typeAmount(digits) {
      var v = $('hero-entry-val');
      if (!v) return;
      digits.split('').forEach(function(_, i) {
        addSubTimer(function() { v.textContent = digits.slice(0, i + 1); }, i * 170);
      });
    }

    function applyBudgetExpense() {
      var pane = $('hero-view-budgets');
      var food = pane.querySelectorAll('.budget-mini-card')[1];
      var status = food.querySelector('.budget-mini-status');
      var bar = food.querySelector('.motion-bar-fill');
      var cap = food.querySelector('.budget-mini-cap');
      snap(status); snap(bar);
      status.textContent = 'Near the cap   ₹350 left';
      bar.style.width = '93%';
      countTo(cap, 4200, 4650, 700, function(v) { return inr(v) + ' / ₹5,000 cap'; });
      var sub = pane.querySelector('.mini-view-sub');
      countTo(sub, 9750, 10200, 700, function(v) { return 'Real-time headroom limits   ' + inr(v) + ' of ₹11,800 cap used'; });
      var badge = pane.querySelector('.mini-view-header .replica-feed-badge');
      snap(badge); badge.innerHTML = '<i class="fas fa-chart-pie"></i> 86% Spent';
      var row = prependRow(pane.querySelector('.mini-recent-list'), '<span>Lunch thali</span> <span class="tabular-nums">−₹450</span>', 'cat-recent-row');
      inserted.push(row);
      return food;
    }

    function applyDashboardExpense() {
      var exp = $('hero-stat-expenses'), expSub = $('hero-stat-expenses-sub'), safe = $('hero-stat-safe'), sav = $('hero-stat-savings'), badge = $('replica-chart-badge');
      snap(exp); snap(expSub); snap(safe); snap(sav); snap(badge);
      tickNumber(exp, 12450, 12900, 800, '₹');
      tickNumber(safe, 37550, 37100, 800, '₹');
      tickNumber(sav, 75.1, 74.2, 800, '', '%', 1);
      expSub.textContent = '25.8% of income';
      badge.textContent = '+₹37,100';
      var list = $('replica-tx-list');
      var row = prependRow(list, '<div class="replica-tx-left"><span class="replica-cat-badge badge-groceries">Food</span><span>Lunch thali</span></div><span class="replica-tx-amt tx-out">−₹450</span>', 'replica-tx-row tx-row-fresh');
      inserted.push(row);
    }

    // 4 Choreographed Acts. Times are ms from the start of the act; `dur` is the act length.
    var acts = [
      // ACT 1: Budgets. Add an expense and watch the category budget react.
      {
        key: 'budgets',
        tabId: 'hero-tab-budgets',
        dur: 7600,
        run: function() {
          var tab = $('hero-tab-budgets'), addBtn = $('hero-add-btn');
          resetTransient();
          setCamera('cam-wide');
          pointCursorAt(tab, false);

          addSubTimer(function() {
            pointCursorAt(tab, true);
            switchViewPane('budgets');
            updateHud('01 · Add an expense', true);
          }, 500);
          addSubTimer(function() { setCamera('cam-zoom-budgets'); }, 1000);
          addSubTimer(function() { pointCursorAt(addBtn, false); }, 1500);
          addSubTimer(function() {
            pointCursorAt(addBtn, true); press(addBtn); openSheet();
            updateHud('01 · Quick add', true);
          }, 2100);
          addSubTimer(function() { pointCursorAt($('hero-entry-val'), false); }, 2500);
          addSubTimer(function() { typeAmount('450'); }, 3000);
          addSubTimer(function() { pointCursorAt($('hero-entry-chip'), false); }, 3700);
          addSubTimer(function() {
            pointCursorAt($('hero-entry-chip'), true);
            $('hero-entry-chip').classList.add('is-selected');
          }, 4200);
          addSubTimer(function() { pointCursorAt($('hero-entry-save'), false); }, 4600);
          addSubTimer(function() {
            pointCursorAt($('hero-entry-save'), true); press($('hero-entry-save'));
          }, 5200);
          addSubTimer(function() {
            closeSheet();
            showToast('Saved · Food & Groceries −₹450');
            var food = applyBudgetExpense();
            updateHud('01 · Food headroom ₹800 → ₹350', true);
            addSubTimer(function() { pointCursorAt(food, false); }, 500);
          }, 5500);
          addSubTimer(function() {
            setCamera('cam-wide');
            updateHud('01 · Budget updated live', true);
          }, 6800);
        }
      },

      // ACT 2: Goals. Add money to a goal and watch the ring fill.
      {
        key: 'goals',
        tabId: 'hero-tab-goals',
        dur: 5600,
        run: function() {
          var tab = $('hero-tab-goals'), add = $('hero-goal-add');
          resetTransient();
          setCamera('cam-wide');
          pointCursorAt(tab, false);

          addSubTimer(function() {
            pointCursorAt(tab, true);
            switchViewPane('goals');
            updateHud('02 · Goals & Runway', true);
          }, 500);
          addSubTimer(function() { setCamera('cam-zoom-goals'); }, 900);
          addSubTimer(function() { pointCursorAt(add, false); }, 1400);
          addSubTimer(function() {
            pointCursorAt(add, true); press(add);
            var pane = $('hero-view-goals');
            var ring = pane.querySelector('.goal-ring-svg .ring-fill');
            var pct = pane.querySelector('.goal-ring-pct');
            var amts = pane.querySelector('.ring-card .goal-amounts');
            var sub = pane.querySelector('.ring-card .goal-sub');
            snap(ring); snap(sub); snap(pct);
            if (ring) {
              ring.style.transition = 'stroke-dasharray 0.9s cubic-bezier(0.16, 1, 0.3, 1)';
              ring.style.strokeDasharray = '55, 100';
            }
            tickNumber(pct, 50, 55, 850, '', '%', 0);
            countTo(amts, 50000, 55000, 850, function(v) { return '₹' + v.toLocaleString('en-IN') + ' / ₹1,00,000'; });
            sub.textContent = 'Deposit added · 55% funded';
            showToast('+₹5,000 added to Emergency Fund');
            updateHud('02 · Emergency Fund 50% → 55%', true);
          }, 2000);
          addSubTimer(function() {
            setCamera('cam-wide');
            updateHud('02 · Goal progress updated', true);
          }, 4600);
        }
      },

      // ACT 3: Vault. Decrypt an entry on-device.
      {
        key: 'vault',
        tabId: 'hero-tab-vault',
        dur: 5400,
        run: function() {
          var tab = $('hero-tab-vault');
          resetTransient();
          setCamera('cam-wide');
          pointCursorAt(tab, false);

          addSubTimer(function() {
            pointCursorAt(tab, true);
            switchViewPane('vault');
            updateHud('03 · Encrypted Vault', true);
          }, 500);
          addSubTimer(function() { setCamera('cam-zoom-vault'); }, 900);
          var pane = $('hero-view-vault');
          var row = pane ? pane.querySelector('.vault-blur-box') : null;
          var hint = row ? row.querySelector('.vault-hover-hint') : null;
          var icon = row ? row.querySelector('.vault-lock-icon') : null;
          addSubTimer(function() { if (row) pointCursorAt(row, false); }, 1400);
          addSubTimer(function() {
            if (!row) return;
            pointCursorAt(row, true);
            snap(row); snap(hint); snap(icon);
            row.classList.add('is-decrypting');
            hint.textContent = 'Decrypting…';
            updateHud('03 · Decrypting on this device', true);
          }, 2000);
          addSubTimer(function() {
            if (!row) return;
            row.classList.remove('is-decrypting');
            row.classList.add('auto-decrypted');
            hint.textContent = 'Decrypted';
            icon.className = 'fas fa-lock-open vault-lock-icon';
            showToast('AES-GCM · the key never leaves your device');
            updateHud('03 · A/C 4091 revealed, locally', true);
          }, 2600);
          addSubTimer(function() {
            if (!row) return;
            row.classList.remove('auto-decrypted');
            hint.textContent = 'Hover to decrypt';
            icon.className = 'fas fa-lock vault-lock-icon';
            setCamera('cam-wide');
            updateHud('03 · Locked again', true);
          }, 4300);
        }
      },

      // ACT 4: Dashboard. The expense from Budgets has flowed into the totals.
      {
        key: 'dashboard',
        tabId: 'hero-tab-dashboard',
        dur: 6200,
        run: function() {
          var tab = $('hero-tab-dashboard');
          resetTransient();
          setCamera('cam-wide');
          pointCursorAt(tab, false);

          addSubTimer(function() {
            pointCursorAt(tab, true);
            switchViewPane('dashboard');
            updateHud('04 · Net Balance Trend', true);
          }, 500);
          addSubTimer(function() { setCamera('cam-zoom-dashboard'); }, 800);
          addSubTimer(function() { pointCursorAt($('hero-stat-expenses'), false); }, 1500);
          addSubTimer(function() {
            pointCursorAt($('hero-stat-expenses'), true);
            applyDashboardExpense();
            var curve = $('hero-balance-curve');
            if (curve) {
              snap(curve);
              curve.classList.add('curve-glow-streak');
              addSubTimer(function() { curve.classList.remove('curve-glow-streak'); }, 1600);
            }
            updateHud('04 · The ₹450 lunch is in your totals', true);
          }, 2200);
          addSubTimer(function() { pointCursorAt($('hero-stat-safe'), false); }, 3600);
          addSubTimer(function() {
            var safe = $('hero-stat-safe');
            pointCursorAt(safe, true);
            safe.classList.add('stat-glow-pulse');
            addSubTimer(function() { safe.classList.remove('stat-glow-pulse'); }, 1600);
            updateHud('04 · Safe-to-spend ₹37,100', true);
          }, 4200);
          addSubTimer(function() {
            setCamera('cam-wide');
            updateHud('04 · Everything stays on your device', true);
          }, 5400);
        }
      }
    ];

    var ACT_DURATION = 4800;
    var tourComplete = false;

    function stepTour() {
      if (tourComplete || isUserInteracting || isManualPause || !isHeroVisible) return;
      var act = acts[currentActIdx];
      if (currentActIdx === 0) resetData();
      act.run();

      actTimer = safeDesktopTimeout(function() {
        currentActIdx++;
        if (currentActIdx === acts.length) {
          currentActIdx = 0;
          if (cursor) cursor.style.opacity = '0';
          if (!isReducedMotion) {
            // loop like a video: short beat on the finished overview, then restart
            actTimer = safeDesktopTimeout(stepTour, 1600);
            return;
          }
          tourComplete = true;
          isManualPause = true;
          updateHud(hudLabel ? hudLabel.textContent : '', false);
          return;
        }
        stepTour();
      }, Math.round((act.dur || ACT_DURATION) * TOUR_SLOW));
    }

    // Manual user override on click
    navItems.forEach(function(btn) {
      btn.addEventListener('click', function() {
        var key = btn.getAttribute('data-hero-view');
        clearAllTimers();
        resetData();
        isUserInteracting = true;
        currentTargetEl = null;
        frame.classList.add('is-user-interacting');
        setCamera('cam-wide');
        if (cursor) cursor.style.opacity = '0';
        switchViewPane(key);
        updateHud('Manual: ' + key.toUpperCase(), false);

        // Resume auto showcase after 8s of inactivity
        safeDesktopTimeout(function() {
          isUserInteracting = false;
          frame.classList.remove('is-user-interacting');
          for (var i = 0; i < acts.length; i++) {
            if (acts[i].key === key) {
              currentActIdx = (i + 1) % acts.length;
              break;
            }
          }
          stepTour();
        }, 8000);
      });
    });

    // HUD toggle button
    if (hudBtn) {
      hudBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        isManualPause = !isManualPause;
        if (isManualPause) {
          clearAllTimers();
          resetTransient();
          currentTargetEl = null;
          setCamera('cam-wide');
          if (cursor) cursor.style.opacity = '0';
          updateHud('Demo Paused', false);
        } else {
          tourComplete = false;
          isUserInteracting = false;
          frame.classList.remove('is-user-interacting');
          stepTour();
        }
      });
    }

    // Window resize and frame transition listeners to keep cursor position exact
    var onResize = function() { reSyncCursor(); };
    window.addEventListener('resize', onResize);
    var onTransitionEnd = function(e) {
      // transitionend bubbles: only the frame's own transform counts, not every card animating inside it
      if (e.target === frame && e.propertyName === 'transform') {
        reSyncCursor();
      }
    };
    frame.addEventListener('transitionend', onTransitionEnd);

    // Intersection Observer
    var heroEl = document.getElementById('hero');
    if (heroEl && 'IntersectionObserver' in window) {
      var heroObs = new IntersectionObserver(function(entries) {
        if (!entries || !entries.length) return;
        var wasVisible = isHeroVisible;
        isHeroVisible = entries[0].isIntersecting;
        if (isHeroVisible && !wasVisible && !isUserInteracting && !isManualPause) {
          stepTour();
        } else if (!isHeroVisible) {
          clearAllTimers();
        }
      }, { threshold: 0.1 });
      heroObs.observe(heroEl);
      desktopCleanups.push(function() {
        heroObs.disconnect();
      });
    }

    desktopCleanups.push(function() {
      clearAllTimers();
      window.removeEventListener('resize', onResize);
      frame.removeEventListener('transitionend', onTransitionEnd);
      if (frame) {
        frame.classList.remove('is-user-interacting');
        cameraClasses.forEach(function(c) { frame.classList.remove(c); });
      }
    });

    // Kick off Act 1
    window.__heroTourOn = true;
    stepTour();
  }

  function initPaperCardsEmeraldSpotlight() {
    var cards = document.querySelectorAll('.paper-card');
    if (!cards.length) return;

    cards.forEach(function(card) {
      function onCardMove(e) {
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', x + 'px');
        card.style.setProperty('--mouse-y', y + 'px');
      }
      card.addEventListener('pointermove', onCardMove);
      desktopCleanups.push(function() {
        card.removeEventListener('pointermove', onCardMove);
      });
    });
  }

  function initScrollReveal() {
    initAppearObserver();
  }

  function initHeroDashboardLiveFeed() {
    var txList = document.getElementById('replica-tx-list');
    var netBalEl = document.getElementById('hero-net-balance-val');
    var incEl = document.getElementById('hero-stat-income');
    var expEl = document.getElementById('hero-stat-expenses');
    var expSubEl = document.getElementById('hero-stat-expenses-sub');
    var safeEl = document.getElementById('hero-stat-safe');
    var savingsEl = document.getElementById('hero-stat-savings');
    var netBadge = document.getElementById('replica-chart-badge');
    var syncPill = document.querySelector('.hero-preview-stage .replica-sync-pill') || document.querySelector('.replica-sync-pill');
    if (!txList) return;

    var pool = [
      { cat: 'Chai & Snacks', badge: 'badge-dining', desc: 'Chai Tapri', amt: -20, isOut: true },
      { cat: 'UPI Transfer', badge: 'badge-salary', desc: 'UPI from Mom', amt: 500, isOut: false },
      { cat: 'Transit', badge: 'badge-bills', desc: 'Metro Card', amt: -45, isOut: true },
      { cat: 'Dining Out', badge: 'badge-dining', desc: 'Swiggy Dinner', amt: -240, isOut: true },
      { cat: 'Utilities', badge: 'badge-bills', desc: 'Mobile Recharge', amt: -299, isOut: true },
      { cat: 'Freelance', badge: 'badge-salary', desc: 'Freelance Design', amt: 2000, isOut: false },
      { cat: 'Groceries', badge: 'badge-groceries', desc: 'Nature Basket', amt: -650, isOut: true },
      { cat: 'Entertainment', badge: 'badge-dining', desc: 'BookMyShow', amt: -380, isOut: true },
      { cat: 'Repayment', badge: 'badge-salary', desc: 'Repaid by Priya', amt: 1200, isOut: false }
    ];

    var poolIdx = 0;
    var currentIncome = 50000;
    var currentExpenses = 12450;
    var currentSafe = 37550;
    var currentSavings = 75.1;
    var isPaused = false;
    var isVisible = true;

    function getNextDistinctItem() {
      var rows = txList.querySelectorAll('.replica-tx-row');
      var visibleMerchants = [];
      rows.forEach(function(r) {
        var nameEl = r.querySelector('.replica-tx-left span:last-child');
        if (nameEl) visibleMerchants.push(nameEl.textContent.trim().toLowerCase());
      });

      for (var i = 0; i < pool.length; i++) {
        var candidate = pool[(poolIdx + i) % pool.length];
        if (visibleMerchants.indexOf(candidate.desc.toLowerCase()) === -1) {
          poolIdx = (poolIdx + i + 1) % pool.length;
          return candidate;
        }
      }
      var fallback = pool[poolIdx];
      poolIdx = (poolIdx + 1) % pool.length;
      return fallback;
    }

    function addLiveRow() {
      if (window.__heroTourOn || isPaused || !isVisible || isReducedMotion) return;

      var item = getNextDistinctItem();

      var row = document.createElement('div');
      row.className = 'replica-tx-row tx-row-fresh';

      var amtFormatted = item.isOut ? '−₹' + Math.abs(item.amt).toLocaleString('en-IN') : '+₹' + item.amt.toLocaleString('en-IN');
      var amtClass = item.isOut ? 'replica-tx-amt tx-out' : 'replica-tx-amt tx-in';

      row.innerHTML = '<div class="replica-tx-left">' +
        '<span class="replica-cat-badge ' + item.badge + '">' + item.cat + '</span>' +
        '<span>' + item.desc + '</span>' +
        '</div>' +
        '<span class="' + amtClass + '">' + amtFormatted + '</span>';

      txList.insertBefore(row, txList.firstChild);

      var rows = txList.querySelectorAll('.replica-tx-row');
      if (rows.length > 3) {
        txList.removeChild(rows[rows.length - 1]);
      }

      if (item.isOut) {
        var oldExp = currentExpenses;
        currentExpenses += Math.abs(item.amt);
        if (expEl) tickNumber(expEl, oldExp, currentExpenses, 600, '₹');

        var oldSafe = currentSafe;
        currentSafe -= Math.abs(item.amt);
        if (safeEl) tickNumber(safeEl, oldSafe, currentSafe, 600, '₹');
        if (netBalEl) tickNumber(netBalEl, oldSafe, currentSafe, 600, '₹');
      } else {
        var oldInc = currentIncome;
        currentIncome += item.amt;
        if (incEl) tickNumber(incEl, oldInc, currentIncome, 600, '₹');

        var oldSafe2 = currentSafe;
        currentSafe += item.amt;
        if (safeEl) tickNumber(safeEl, oldSafe2, currentSafe, 600, '₹');
        if (netBalEl) tickNumber(netBalEl, oldSafe2, currentSafe, 600, '₹');
      }

      if (expSubEl && currentIncome > 0) {
        var expPct = ((currentExpenses / currentIncome) * 100).toFixed(1);
        expSubEl.textContent = expPct + '% of income';
      }

      if (savingsEl && currentIncome > 0) {
        var oldSav = currentSavings;
        currentSavings = parseFloat((((currentIncome - currentExpenses) / currentIncome) * 100).toFixed(1));
        tickNumber(savingsEl, oldSav, currentSavings, 600, '', '%', 1);
      }

      if (netBadge) {
        netBadge.textContent = '+₹' + currentSafe.toLocaleString('en-IN');
      }

      if (syncPill) {
        var icon = syncPill.querySelector('i');
        var text = syncPill.querySelector('span') || syncPill;
        if (icon) icon.className = 'fas fa-rotate fa-spin text-emerald';
        if (text) text.textContent = 'Syncing...';

        safeDesktopTimeout(function() {
          if (icon) icon.className = 'fas fa-circle-check text-emerald';
          if (text) text.textContent = 'Cloud Synced';
        }, 900);
      }
    }

    var feedInterval = null;
    desktopCleanups.push(function() {
      clearDesktopInterval(feedInterval);
    });

    var statCards = document.querySelectorAll('.replica-stat-card');
    statCards.forEach(function(card) {
      card.addEventListener('mouseenter', function() {
        var valEl = card.querySelector('.replica-stat-value');
        if (valEl) {
          if (valEl.id === 'hero-stat-savings') {
            var raw = currentSavings || 75.1;
            tickNumber(valEl, Math.max(0, raw - 5), raw, 500, '', '%', 1);
            return;
          }
          var raw = parseInt(valEl.textContent.replace(/[^0-9]/g, ''), 10) || 0;
          if (raw > 0) {
            var prefix = valEl.textContent.indexOf('%') !== -1 ? '' : '₹';
            var suffix = valEl.textContent.indexOf('%') !== -1 ? '%' : '';
            tickNumber(valEl, Math.round(raw * 0.9), raw, 500, prefix, suffix, 0);
          }
        }
      });
    });

    document.addEventListener('visibilitychange', function() {
      isPaused = document.hidden;
    });

    var heroSec = document.getElementById('hero');
    if (heroSec && window.IntersectionObserver) {
      var obs = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          isVisible = entry.isIntersecting;
        });
      }, { threshold: 0.1 });
      obs.observe(heroSec);
      desktopCleanups.push(function() { obs.disconnect(); });
    }
  }

  function initChartScrubbing() {
    var wrap = document.getElementById('replica-chart-wrap');
    var svg = document.getElementById('replica-chart-svg');
    var curve = document.getElementById('hero-balance-curve');
    var crosshair = document.getElementById('chart-scrub-line');
    var dot = document.getElementById('chart-scrub-dot');
    var tooltip = document.getElementById('chart-scrub-tooltip');
    if (!wrap || !curve || !crosshair || !dot || !tooltip) return;

    var curveLength = 0;
    try {
      curveLength = curve.getTotalLength();
    } catch(err) {
      curveLength = 550;
    }

    function handleScrub(clientX) {
      var rect = wrap.getBoundingClientRect();
      var relX = clientX - rect.left;
      var t = Math.max(0, Math.min(1, relX / rect.width));

      var pt = { x: t * 500, y: 115 - t * 85 };
      if (curve.getPointAtLength && curveLength > 0) {
        try {
          pt = curve.getPointAtLength(t * curveLength);
        } catch(e) {}
      }

      crosshair.setAttribute('x1', pt.x);
      crosshair.setAttribute('x2', pt.x);
      crosshair.setAttribute('y1', 0);
      crosshair.setAttribute('y2', 140);
      crosshair.style.opacity = '1';

      dot.setAttribute('cx', pt.x);
      dot.setAttribute('cy', pt.y);
      dot.style.opacity = '1';

      var day = Math.min(24, Math.max(1, Math.round(1 + t * 23)));
      var amt = Math.round(32500 + t * 15750);
      var dayStr = (day < 10 ? '0' + day : '' + day) + ' Oct';
      tooltip.textContent = dayStr + ' • ' + formatINR(amt, '₹');

      var leftPct = (pt.x / 500) * 100;
      var topPct = (pt.y / 140) * 100;
      tooltip.style.left = leftPct.toFixed(1) + '%';
      tooltip.style.top = topPct.toFixed(1) + '%';
      tooltip.style.opacity = '1';
    }

    function hideScrub() {
      crosshair.style.opacity = '0';
      dot.style.opacity = '0';
      tooltip.style.opacity = '0';
    }

    wrap.addEventListener('pointerenter', function(e) {
      handleScrub(e.clientX);
    });

    wrap.addEventListener('pointermove', function(e) {
      handleScrub(e.clientX);
    });

    wrap.addEventListener('pointerleave', hideScrub);

    wrap.addEventListener('touchstart', function(e) {
      if (e.touches && e.touches[0]) {
        handleScrub(e.touches[0].clientX);
      }
    }, { passive: true });

    wrap.addEventListener('touchmove', function(e) {
      if (e.touches && e.touches[0]) {
        handleScrub(e.touches[0].clientX);
      }
    }, { passive: true });

    wrap.addEventListener('touchend', hideScrub);
    wrap.addEventListener('touchcancel', hideScrub);
  }

  function initMotionTour() {
    ['scene1-budget-bar','scene2-bar','scene3-goal-fill','scene4-loan-bar'].forEach(function(id) {
      var bar = document.getElementById(id);
      if (bar) { var percent = parseFloat(bar.style.width) || 0; bar.style.width = '100%'; bar.style.transformOrigin = 'left'; bar.style.transform = 'scaleX(' + percent / 100 + ')'; }
    });
        // Numbered Feature Demo Scenes (Sections 01, 02, 03)
    // Runs self-contained looping timelines when each section is visible (>=40%), paused off-screen.

    var sec1 = document.getElementById('feature-01');
    var sec2 = document.getElementById('feature-02');
    var sec3 = document.getElementById('feature-03');

    // Section 1: Quick Entry Drawer
    var s1Timer = null;
    var s1Timeouts = [];
    function clearS1() {
            if (s1Timer) { clearDesktopTimeout(s1Timer); s1Timer = null; }
      while (s1Timeouts.length > 0) clearDesktopTimeout(s1Timeouts.pop());
    }
    function resetS1() {
      var s1Amt = document.getElementById('scene1-amt-text');
      var s1Tag = document.getElementById('scene1-cat-tag');
      var s1Safe = document.getElementById('scene1-safe-val');
      var s1BudText = document.getElementById('scene1-budget-text');
      var s1BudBar = document.getElementById('scene1-budget-bar');
      var s1Toast = document.getElementById('scene1-toast');
      var s1List = document.getElementById('scene1-today-list');

      if (s1Amt) s1Amt.textContent = '0';
      if (s1Tag) s1Tag.innerHTML = '<i class="fas fa-tag"></i> Category';
      if (s1Safe) s1Safe.textContent = '₹37,550';
      if (s1BudText) s1BudText.textContent = '₹0 / ₹5,000 (0%)';
      if (s1BudBar) s1BudBar.style.transform = 'scaleX(0.0)';
      if (s1Toast) s1Toast.style.display = 'none';
      if (s1List) {
        var added = s1List.querySelector('.tx-added-row');
        if (added) s1List.removeChild(added);
      }
    }
    function runS1Timeline() {
      resetS1();
      var submitBtn = document.getElementById('scene1-submit-btn');

      // 400ms: type amount
      var t1 = safeDesktopTimeout(function() {
                var s1Amt = document.getElementById('scene1-amt-text');
        if (s1Amt) {
                    s1Amt.textContent = '1';
          setTimeout(function() { s1Amt.textContent = '12'; }, 80);
          setTimeout(function() { s1Amt.textContent = '120'; }, 160);
          setTimeout(function() { s1Amt.textContent = '1,200'; }, 240);
        }
      }, 400);
      s1Timeouts.push(t1);

      // 800ms: pick category
      var t2 = safeDesktopTimeout(function() {
        var s1Tag = document.getElementById('scene1-cat-tag');
        if (s1Tag) s1Tag.innerHTML = '<i class="fas fa-tag"></i> Groceries';
      }, 800);
      s1Timeouts.push(t2);

      // 1400ms: press submit
      var t3 = safeDesktopTimeout(function() {
        if (submitBtn) submitBtn.classList.add('sim-pressed');
        var t3b = safeDesktopTimeout(function() {
          if (submitBtn) submitBtn.classList.remove('sim-pressed');
          var s1Safe = document.getElementById('scene1-safe-val');
          var s1BudText = document.getElementById('scene1-budget-text');
          var s1BudBar = document.getElementById('scene1-budget-bar');
          var s1Toast = document.getElementById('scene1-toast');
          var s1List = document.getElementById('scene1-today-list');

          if (s1Safe) tickNumber(s1Safe, 37550, 36350, 700, '₹');
          if (s1BudBar) s1BudBar.style.transform = 'scaleX(0.24)';
          if (s1BudText) s1BudText.textContent = '₹1,200 / ₹5,000 (24%)';
          if (s1Toast) s1Toast.style.display = 'inline-flex';

          if (s1List && !s1List.querySelector('.tx-added-row')) {
            var newRow = document.createElement('div');
            newRow.className = 'motion-today-row expense-item tx-added-row';
            newRow.innerHTML = '<span>Kirana store &bull; Groceries</span><span class="tx-out tabular-nums">−₹1,200</span>';
            s1List.insertBefore(newRow, s1List.firstChild);
          }
        }, 180);
        s1Timeouts.push(t3b);
      }, 1400);
      s1Timeouts.push(t3);

      // Repeat loop every 4800ms
    }

    // Section 2: Category Headroom Engine
    var s2Timer = null;
    var s2Timeouts = [];
    function clearS2() {
      if (s2Timer) { clearDesktopTimeout(s2Timer); s2Timer = null; }
      while (s2Timeouts.length > 0) clearDesktopTimeout(s2Timeouts.pop());
    }
    function resetS2() {
      var s2Sub = document.getElementById('scene2-sub-label');
      var s2Badge = document.getElementById('scene2-badge');
      var s2Bar = document.getElementById('scene2-bar');
      var s2Over = document.getElementById('scene2-overflow');
      var s2Warn = document.getElementById('scene2-warning');
      var s2Head = document.getElementById('scene2-headroom-val');
      var s2Dining = document.getElementById('scene2-dining-list');

      if (s2Sub) s2Sub.textContent = '₹4,600 / ₹5,000 (92%)';
      if (s2Badge) {
        s2Badge.className = 'motion-badge-amber';
        s2Badge.textContent = '₹400 left';
      }
      if (s2Bar) {
        s2Bar.className = 'motion-bar-fill bar-amber';
        s2Bar.style.transform = 'scaleX(0.92)';
      }
      if (s2Over) { s2Over.style.left = '95%'; s2Over.style.width = '0%'; }
      if (s2Warn) s2Warn.style.display = 'none';
      if (s2Head) {
        s2Head.textContent = '₹400 Left (8%)';
        s2Head.className = 'motion-stat-val text-amber tabular-nums';
      }
      if (s2Dining) {
        var dAdded = s2Dining.querySelector('.tx-dining-added');
        if (dAdded) s2Dining.removeChild(dAdded);
      }
    }
    function runS2Timeline() {
      resetS2();
      var actionBtn2 = document.getElementById('scene2-action-btn');

      var t1 = safeDesktopTimeout(function() {
        if (actionBtn2) actionBtn2.classList.add('sim-pressed');

        var t2 = safeDesktopTimeout(function() {
          if (actionBtn2) actionBtn2.classList.remove('sim-pressed');

          var s2Card = document.getElementById('scene2-card');
          var s2Sub = document.getElementById('scene2-sub-label');
          var s2Badge = document.getElementById('scene2-badge');
          var s2Bar = document.getElementById('scene2-bar');
          var s2Over = document.getElementById('scene2-overflow');
          var s2Warn = document.getElementById('scene2-warning');
          var s2Head = document.getElementById('scene2-headroom-val');
          var s2Dining = document.getElementById('scene2-dining-list');

          if (s2Card) {
            s2Card.classList.remove('sim-shake');
            void s2Card.offsetWidth;
            s2Card.classList.add('sim-shake');
          }

          if (s2Bar) {
            s2Bar.className = 'motion-bar-fill bar-coral';
            s2Bar.style.transform = 'scaleX(1.0)';
          }
          if (s2Over) { s2Over.style.left = '95%'; s2Over.style.width = '5%'; }
          if (s2Sub) s2Sub.textContent = '₹5,250 / ₹5,000 (105%)';
          if (s2Badge) {
            s2Badge.className = 'motion-badge-coral';
            s2Badge.textContent = 'Over by ₹250';
          }
          if (s2Warn) s2Warn.style.display = 'inline-flex';
          if (s2Head) {
            s2Head.textContent = 'Over by ₹250 (105%)';
            s2Head.className = 'motion-stat-val text-coral tabular-nums';
          }
          if (s2Dining && !s2Dining.querySelector('.tx-dining-added')) {
            var dRow = document.createElement('div');
            dRow.className = 'motion-today-row tx-dining-added';
            dRow.innerHTML = '<span>Dinner &bull; Dining Out</span><span class="tx-out tabular-nums">−₹650</span>';
            s2Dining.insertBefore(dRow, s2Dining.firstChild);
          }
        }, 180);
        s2Timeouts.push(t2);
      }, 900);
      s2Timeouts.push(t1);
    }

    // Section 3: Goals & Peer Loans (Scene 3 & Scene 4)
    var s3Timer = null;
    var s3Timeouts = [];
    function clearS3() {
      if (s3Timer) { clearDesktopTimeout(s3Timer); s3Timer = null; }
      while (s3Timeouts.length > 0) clearDesktopTimeout(s3Timeouts.pop());
    }
    function resetS3() {
      // Reset Scene 3
      var s3Cur = document.getElementById('scene3-current-val');
      var s3Bar = document.getElementById('scene3-goal-fill');
      var s3Mile = document.getElementById('scene3-milestone');
      var s3Hist = document.getElementById('scene3-history');
      var s3Chip = document.getElementById('scene3-flying-chip');
      var s3Cushion = document.getElementById('scene3-months-cushion');

      if (s3Cur) s3Cur.textContent = '₹45,000';
      if (s3Bar) s3Bar.style.transform = 'scaleX(0.45)';
      if (s3Mile) s3Mile.style.display = 'none';
      if (s3Cushion) s3Cushion.textContent = '3.6 Months Buffer';
      if (s3Chip) { s3Chip.classList.remove('fly'); s3Chip.style.opacity = '0'; }
      if (s3Hist) {
        var added3 = s3Hist.querySelector('.tx-history-added');
        if (added3) s3Hist.removeChild(added3);
      }

      // Reset Scene 4
      var s4Val = document.getElementById('scene4-loan-val');
      var s4RepLabel = document.getElementById('scene4-repaid-label');
      var s4Bar = document.getElementById('scene4-loan-bar');
      var s4Pill = document.getElementById('scene4-repay-pill');
      var s4Settle = document.getElementById('scene4-settle-list');
      var s4Inc = document.getElementById('scene4-income-list');

      if (s4Val) s4Val.textContent = '₹12,500';
      if (s4RepLabel) s4RepLabel.textContent = 'Repaid ₹0 / ₹12,500 (0%)';
      if (s4Bar) s4Bar.style.transform = 'scaleX(0.0)';
      if (s4Pill) s4Pill.style.display = 'none';
      if (s4Settle) s4Settle.innerHTML = '<div class="motion-feed-empty text-zinc">No repayments yet</div>';
      if (s4Inc) s4Inc.innerHTML = '<div class="motion-feed-empty text-zinc">Awaiting settlement</div>';
    }
    function runS3Timeline() {
      resetS3();

      var addBtn3 = document.getElementById('scene3-add-btn');
      var repayBtn4 = document.getElementById('scene4-repay-btn');

      // 800ms: Fund goal
      var t1 = safeDesktopTimeout(function() {
        if (addBtn3) addBtn3.classList.add('sim-pressed');
        var t1b = safeDesktopTimeout(function() {
          if (addBtn3) addBtn3.classList.remove('sim-pressed');
          var s3Cur = document.getElementById('scene3-current-val');
          var s3Bar = document.getElementById('scene3-goal-fill');
          var s3Mile = document.getElementById('scene3-milestone');
          var s3Hist = document.getElementById('scene3-history');
          var s3Chip = document.getElementById('scene3-flying-chip');
          var s3Cushion = document.getElementById('scene3-months-cushion');

          if (s3Chip) s3Chip.classList.add('fly');
          if (s3Bar) s3Bar.style.transform = 'scaleX(0.5)';
          if (s3Cur) tickNumber(s3Cur, 45000, 50000, 700, '₹');
          if (s3Mile) s3Mile.style.display = 'inline-flex';
          if (s3Cushion) s3Cushion.textContent = '4.0 Months Buffer';

          if (s3Hist && !s3Hist.querySelector('.tx-history-added')) {
            var hRow = document.createElement('div');
            hRow.className = 'motion-history-row tx-history-added';
            hRow.innerHTML = '<span>Today &bull; Manual Deposit</span><span class="text-emerald tabular-nums">+₹5,000</span>';
            s3Hist.insertBefore(hRow, s3Hist.firstChild);
          }
        }, 180);
        s3Timeouts.push(t1b);
      }, 800);
      s3Timeouts.push(t1);

      // 1800ms: Repay loan
      var t2 = safeDesktopTimeout(function() {
        if (repayBtn4) repayBtn4.classList.add('sim-pressed');
        var t2b = safeDesktopTimeout(function() {
          if (repayBtn4) repayBtn4.classList.remove('sim-pressed');
          var s4Val = document.getElementById('scene4-loan-val');
          var s4RepLabel = document.getElementById('scene4-repaid-label');
          var s4Bar = document.getElementById('scene4-loan-bar');
          var s4Pill = document.getElementById('scene4-repay-pill');
          var s4Settle = document.getElementById('scene4-settle-list');
          var s4Inc = document.getElementById('scene4-income-list');

          if (s4Pill) s4Pill.style.display = 'inline-flex';
          if (s4Val) tickNumber(s4Val, 12500, 10000, 700, '₹');
          if (s4Bar) s4Bar.style.transform = 'scaleX(0.2)';
          if (s4RepLabel) s4RepLabel.textContent = 'Repaid ₹2,500 / ₹12,500 (20%)';

          if (s4Settle) {
            s4Settle.innerHTML = '<div class="motion-today-row"><span>Today &bull; UPI</span><span class="text-emerald tabular-nums">+₹2,500</span></div>';
          }
          if (s4Inc) {
            s4Inc.innerHTML = '<div class="motion-today-row"><span>Repaid by Rahul</span><span class="text-emerald tabular-nums">+₹2,500</span></div>';
          }
        }, 180);
        s3Timeouts.push(t2b);
      }, 1800);
      s3Timeouts.push(t2);
    }

    // Direct click listeners on buttons for immediate interactivity
    var submit1 = document.getElementById('scene1-submit-btn');
    if (submit1) {
            submit1.addEventListener('click', function(e) {
                e.preventDefault();
        clearS1();
        runS1Timeline();
      });
    }
    var action2 = document.getElementById('scene2-action-btn');
    if (action2) {
      action2.addEventListener('click', function(e) {
        e.preventDefault();
        clearS2();
        runS2Timeline();
      });
    }
    var add3 = document.getElementById('scene3-add-btn');
    if (add3) {
      add3.addEventListener('click', function(e) {
        e.preventDefault();
        clearS3();
        runS3Timeline();
      });
    }
    var repay4 = document.getElementById('scene4-repay-btn');
    if (repay4) {
      repay4.addEventListener('click', function(e) {
        e.preventDefault();
        clearS3();
        runS3Timeline();
      });
    }

    // Intersection Observers with threshold 0.4 (loops while >= 40% visible, pauses offscreen)
    if ('IntersectionObserver' in window && !isReducedMotion) {
      var createObserver = function(secEl, startFn, stopFn) {
        if (!secEl) return;
        var obs = new IntersectionObserver(function(entries) {
          if (!entries || !entries.length) return;
          if (entries[0].isIntersecting) {
            obs.unobserve(secEl);
            startFn();
          }
        }, { threshold: 0.4 });
        obs.observe(secEl);
        desktopCleanups.push(function() {
          obs.disconnect();
          stopFn();
        });
      };

      createObserver(sec1, runS1Timeline, clearS1);
      createObserver(sec2, runS2Timeline, clearS2);
      createObserver(sec3, runS3Timeline, clearS3);
    } else {
      // Reduced motion or fallback: ensure initial states are rendered cleanly
      resetS1();
      resetS2();
      resetS3();
      if (isReducedMotion) {
        var values = {'scene1-amt-text':'1,200','scene1-safe-val':'₹36,350','scene1-budget-text':'₹1,200 / ₹5,000 (24%)','scene2-sub-label':'₹5,250 / ₹5,000 (105%)','scene2-badge':'Over by ₹250','scene2-headroom-val':'Over by ₹250 (105%)','scene3-current-val':'₹50,000','scene3-months-cushion':'4.0 Months Buffer','scene4-repaid-label':'Repaid ₹2,500 / ₹12,500 (20%)'};
        Object.keys(values).forEach(function(id) { var el = document.getElementById(id); if (el) el.textContent = values[id]; });
        ['scene1-budget-bar','scene2-bar','scene3-goal-fill','scene4-loan-bar'].forEach(function(id, i) { var el = document.getElementById(id); if (el) el.style.transform = 'scaleX(' + [0.24,1,0.5,0.2][i] + ')'; });
      }
    }
  }

  function initCategoryInspector() {
    var chips = document.querySelectorAll('.paper-cat-chip');
    var catName = document.getElementById('cat-inspector-name');
    var catStatus = document.getElementById('cat-inspector-status');
    var catBar = document.getElementById('cat-inspector-bar');
    var catCap = document.getElementById('cat-inspector-cap');
    var recentList = document.getElementById('cat-recent-list');
    var overBar = document.getElementById('cat-inspector-overflow');
    if (!chips.length || !catName || !catBar) return;

    var catData = {
      food: {
        name: 'Food & Dining',
        status: '₹800 left',
        statusColor: '#d97706',
        pct: 84,
        hasOverflow: false,
        barClass: 'motion-bar-fill bar-amber',
        capText: '₹4,200 / ₹5,000 cap',
        rows: [
          { note: 'Weekly Groceries', amt: '−₹2,100' },
          { note: 'Dinner with team', amt: '−₹1,450' },
          { note: 'Coffee & Bakery', amt: '−₹650' }
        ]
      },
      bills: {
        name: 'Bills & Utilities',
        status: 'On track',
        statusColor: '#059669',
        pct: 61.25,
        hasOverflow: false,
        barClass: 'motion-bar-fill',
        capText: '₹2,450 / ₹4,000 cap',
        rows: [
          { note: 'Fiber Broadband', amt: '−₹999' },
          { note: 'Electricity Utility', amt: '−₹1,150' },
          { note: 'Mobile Prepaid', amt: '−₹301' }
        ]
      },
      transit: {
        name: 'Transit & Fuel',
        status: 'Over by ₹50',
        statusColor: '#f43f5e',
        pct: 100,
        hasOverflow: true,
        overflowWidth: '6.25%',
        barClass: 'motion-bar-fill bar-coral',
        capText: '₹850 / ₹800 cap',
        rows: [
          { note: 'Monthly Metro Pass', amt: '−₹450' },
          { note: 'Auto Rickshaw Fares', amt: '−₹220' },
          { note: 'Petrol Pump', amt: '−₹180' }
        ]
      }
    };

    function selectCat(key) {
      var data = catData[key];
      if (!data) return;

      chips.forEach(function(c) {
        if (c.getAttribute('data-cat') === key) {
          c.classList.add('active');
        } else {
          c.classList.remove('active');
        }
      });

      catName.textContent = data.name;
      catStatus.textContent = data.status;
      catStatus.style.color = data.statusColor;
      catCap.textContent = data.capText;

      catBar.className = data.barClass;
      catBar.style.width = '0%';
      void catBar.offsetWidth;
      catBar.style.width = data.pct + '%';

      if (overBar) {
        if (data.hasOverflow) {
          overBar.style.display = 'block';
          overBar.style.width = data.overflowWidth || '6%';
        } else {
          overBar.style.display = 'none';
          overBar.style.width = '0%';
        }
      }

      if (recentList) {
        recentList.innerHTML = '';
        data.rows.forEach(function(r) {
          var row = document.createElement('div');
          row.className = 'cat-recent-row';
          row.innerHTML = '<span>' + r.note + '</span> <span class="tabular-nums">' + r.amt + '</span>';
          recentList.appendChild(row);
        });
      }
    }

    chips.forEach(function(chip) {
      chip.addEventListener('click', function() {
        var key = chip.getAttribute('data-cat');
        selectCat(key);
      });
    });
  }

  function initInteractiveDonut() {
    var card = document.getElementById('paper-card-reports');
    var svg = document.getElementById('reports-donut-svg');
    var btnThis = document.getElementById('btn-month-this');
    var btnLast = document.getElementById('btn-month-last');
    var centerAmt = document.getElementById('donut-center-amt');
    var centerLbl = document.getElementById('donut-center-lbl');
    var insightText = document.getElementById('donut-insight-text');
    var insightLine = document.getElementById('donut-insight-line');
    var slices = document.querySelectorAll('.mini-donut-slice');
    var legendRows = document.querySelectorAll('.mini-donut-legend-row');

    if (!card || !svg) return;

    var monthData = {
      this: {
        total: 9350,
        slices: {
          Food: { pct: 45, dash: '45 55', offset: 25, amt: '₹4,208' },
          Bills: { pct: 26, dash: '26 74', offset: 80, amt: '₹2,431' },
          Transit: { pct: 9, dash: '9 91', offset: 54, amt: '₹841' },
          Shopping: { pct: 20, dash: '20 80', offset: 45, amt: '₹1,870' }
        },
        insightText: 'Food down 12% vs last month',
        insightIcon: 'fas fa-arrow-trend-down text-emerald'
      },
      last: {
        total: 11200,
        slices: {
          Food: { pct: 52, dash: '52 48', offset: 25, amt: '₹5,824' },
          Bills: { pct: 22, dash: '22 78', offset: 73, amt: '₹2,464' },
          Transit: { pct: 11, dash: '11 89', offset: 51, amt: '₹1,232' },
          Shopping: { pct: 15, dash: '15 85', offset: 40, amt: '₹1,680' }
        },
        insightText: 'Shopping was 15% higher',
        insightIcon: 'fas fa-arrow-trend-up text-amber'
      }
    };

    var activeMonth = 'this';

    function setMonth(monthKey) {
      activeMonth = monthKey;
      var data = monthData[monthKey];
      if (!data) return;

      if (btnThis && btnLast) {
        if (monthKey === 'this') {
          btnThis.classList.add('active');
          btnLast.classList.remove('active');
        } else {
          btnLast.classList.add('active');
          btnThis.classList.remove('active');
        }
      }

      if (centerAmt) {
        var startAmt = monthKey === 'this' ? 11200 : 9350;
        tickNumber(centerAmt, startAmt, data.total, 500, '₹');
      }
      if (centerLbl) centerLbl.textContent = 'Total spent';

      slices.forEach(function(s) {
        var cat = s.getAttribute('data-cat');
        var sData = data.slices[cat];
        if (sData) {
          s.setAttribute('stroke-dasharray', sData.dash);
          s.setAttribute('stroke-dashoffset', sData.offset);
        }
      });

      legendRows.forEach(function(row) {
        var cat = row.getAttribute('data-cat');
        var sData = data.slices[cat];
        if (sData) {
          var dot = row.querySelector('.legend-dot');
          var dotHtml = dot ? dot.outerHTML : '';
          row.innerHTML = dotHtml + ' ' + cat + ' (' + sData.pct + '%)';
        }
      });

      if (insightLine && insightText) {
        var icon = insightLine.querySelector('i');
        if (icon) icon.className = data.insightIcon;
        insightText.textContent = data.insightText;
      }
    }

    if (btnThis) {
      btnThis.addEventListener('click', function() { setMonth('this'); });
    }
    if (btnLast) {
      btnLast.addEventListener('click', function() { setMonth('last'); });
    }

    function highlightCategory(cat) {
      var data = monthData[activeMonth];
      if (!data) return;
      var sData = data.slices[cat];
      if (!sData) return;

      slices.forEach(function(s) {
        if (s.getAttribute('data-cat') === cat) {
          s.classList.add('highlight');
          s.classList.remove('dimmed');
        } else {
          s.classList.remove('highlight');
          s.classList.add('dimmed');
        }
      });

      legendRows.forEach(function(lr) {
        if (lr.getAttribute('data-cat') === cat) {
          lr.classList.add('active');
        } else {
          lr.classList.remove('active');
        }
      });

      if (centerAmt) centerAmt.textContent = sData.amt;
      if (centerLbl) centerLbl.textContent = cat + ' (' + sData.pct + '%)';
    }

    function clearHighlight() {
      var data = monthData[activeMonth];
      slices.forEach(function(s) {
        s.classList.remove('highlight');
        s.classList.remove('dimmed');
      });
      legendRows.forEach(function(lr) {
        lr.classList.remove('active');
      });
      if (centerAmt && data) centerAmt.textContent = formatINR(data.total, '₹');
      if (centerLbl) centerLbl.textContent = 'Total spent';
    }

    slices.forEach(function(s) {
      s.addEventListener('mouseenter', function() {
        var cat = s.getAttribute('data-cat');
        highlightCategory(cat);
      });
      s.addEventListener('mouseleave', clearHighlight);
    });

    legendRows.forEach(function(lr) {
      lr.addEventListener('mouseenter', function() {
        var cat = lr.getAttribute('data-cat');
        highlightCategory(cat);
      });
      lr.addEventListener('mouseleave', clearHighlight);
    });

    if (window.IntersectionObserver) {
      var obs = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            slices.forEach(function(s) {
              s.style.transition = 'stroke-dasharray 1.2s cubic-bezier(0.16, 1, 0.3, 1), stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)';
            });
            obs.disconnect();
          }
        });
      }, { threshold: 0.3 });
      obs.observe(card);
    }
  }

  function initPwaCard() {
    var card = document.getElementById('paper-card-pwa');
    var installBtn = document.getElementById('pwa-card-install-btn');
    var installedPill = document.getElementById('pwa-installed-pill');
    var hintEl = document.getElementById('pwa-platform-hint');
    if (!card) return;

    var ua = navigator.userAgent || '';
    var isIos = /iphone|ipad|ipod/i.test(ua);
    var isAndroid = /android/i.test(ua);
    var isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

    if (isStandalone) {
      if (installBtn) installBtn.style.display = 'none';
      if (installedPill) installedPill.style.display = 'inline-flex';
      if (hintEl) hintEl.textContent = 'Running in standalone native window.';
      return;
    }

    if (hintEl) {
      if (isIos) {
        hintEl.innerHTML = '<i class="fas fa-arrow-up-from-bracket text-emerald"></i> Tap Share in Safari, then select <strong>Add to Home Screen</strong>.';
      } else if (isAndroid) {
        hintEl.innerHTML = '<i class="fas fa-ellipsis-vertical text-emerald"></i> Tap browser menu or the button above to install directly.';
      } else {
        hintEl.innerHTML = '<i class="fas fa-desktop text-emerald"></i> Click the install icon in the address bar or the button above.';
      }
    }

    if (installBtn) {
      installBtn.addEventListener('click', function() {
        if (window.deferredPWAInstallPrompt) {
          window.deferredPWAInstallPrompt.prompt();
          window.deferredPWAInstallPrompt.userChoice.then(function(choice) {
            if (choice.outcome === 'accepted') {
              installBtn.style.display = 'none';
              if (installedPill) installedPill.style.display = 'inline-flex';
            }
          });
        } else {
          installBtn.style.display = 'none';
          if (installedPill) installedPill.style.display = 'inline-flex';
        }
      });
    }
  }

  function initPaperInteractions() {
    var currPill = document.getElementById('paper-currency-pill');
    var currAmt = document.getElementById('paper-currency-amt');
    var currCode = document.getElementById('paper-currency-code');
    if (currPill && currAmt && currCode) {
      var currencies = [
        { code: 'INR', amt: '\u20B983,000' },
        { code: 'USD', amt: '$1,000' },
        { code: 'EUR', amt: '\u20AC920' },
        { code: 'GBP', amt: '\u00A3785' }
      ];
      var curIdx = 0;
      currPill.addEventListener('click', function() {
        curIdx = (curIdx + 1) % currencies.length;
        currAmt.textContent = currencies[curIdx].amt;
        currCode.textContent = currencies[curIdx].code;
      });
    }
  }

  function initPullThePlugDemo() {
    var syncBtn = document.getElementById('plug-sync-toggle-btn');
    var syncText = document.getElementById('plug-sync-text');
    var syncIcon = document.getElementById('plug-sync-icon');
    var waitingChip = document.getElementById('plug-waiting-chip');
    var waitingCount = document.getElementById('plug-waiting-count');
    var form = document.getElementById('plug-tx-form');
    var txList = document.getElementById('plug-tx-list');
    var balanceEl = document.getElementById('plug-balance-val');

    if (!syncBtn || !form || !txList) return;

    var isOnline = true;
    var pendingItems = [];
    var currentBalance = 48250;

    syncBtn.addEventListener('click', function() {
      isOnline = !isOnline;
      if (isOnline) {
        syncBtn.className = 'replica-sync-pill plug-status-pill';
        syncText.textContent = 'Cloud Synced';
        syncIcon.className = 'fas fa-circle-check';

        if (pendingItems.length > 0) {
          syncPendingItems();
        } else {
          if (waitingChip) waitingChip.style.display = 'none';
        }
      } else {
        syncBtn.className = 'replica-sync-pill offline plug-status-pill';
        syncText.textContent = 'Offline Mode';
        syncIcon.className = 'fas fa-wifi-slash';
      }
    });

    function syncPendingItems() {
      if (pendingItems.length === 0) return;
      var item = pendingItems.shift();
      if (item && item.iconEl) {
        item.iconEl.className = 'fas fa-check sync-tick-icon';
        item.iconEl.title = 'Synced';
      }
      if (waitingCount) waitingCount.textContent = pendingItems.length;
      if (pendingItems.length === 0) {
        if (waitingChip) waitingChip.style.display = 'none';
      } else {
        setTimeout(syncPendingItems, 350);
      }
    }

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      var amtInput = document.getElementById('plug-input-amt');
      var catInput = document.getElementById('plug-input-cat');
      var noteInput = document.getElementById('plug-input-note');

      var amt = parseFloat(amtInput.value) || 0;
      var cat = catInput.value || 'General';
      var note = noteInput.value.trim() || 'Kirana store';

      if (amt <= 0) return;

      currentBalance -= amt;
      if (balanceEl) {
        balanceEl.textContent = '\u20B9' + currentBalance.toLocaleString('en-IN');
      }

      var row = document.createElement('div');
      row.className = 'plug-tx-item';

      var dateStr = 'Just now';
      var iconClass = isOnline ? 'fas fa-check sync-tick-icon' : 'fas fa-clock sync-pending-icon';
      var iconTitle = isOnline ? 'Synced' : 'Waiting for sync';

      row.innerHTML = '<span class="plug-tx-date">' + dateStr + '</span>' +
        '<div class="plug-tx-desc-col">' +
          '<div class="plug-tx-note">' + note + '</div>' +
          '<div class="plug-tx-cat">' + cat + '</div>' +
        '</div>' +
        '<div class="plug-tx-amt tx-out tabular-nums">\u2212\u20B9' + amt.toLocaleString('en-IN') + '</div>' +
        '<i class="' + iconClass + '" title="' + iconTitle + '"></i>';

      txList.insertBefore(row, txList.firstChild);

      var iconEl = row.querySelector('i');
      if (!isOnline) {
        pendingItems.push({ el: row, iconEl: iconEl });
        if (waitingChip) waitingChip.style.display = 'inline-flex';
        if (waitingCount) waitingCount.textContent = pendingItems.length;
      }

      amtInput.value = '';
      noteInput.value = '';
    });
  }

  function initManifestoScrollIllumination() {
    var manifesto = document.getElementById('manifesto');
    if (!manifesto) return;
    var words = manifesto.querySelectorAll('.manifesto-word');
    if (!words.length) return;

    if (window.IntersectionObserver) {
      var thresholds = [];
      for (var i = 0; i <= 20; i++) {
        thresholds.push(i / 20);
      }
      var obs = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          var ratio = entry.intersectionRatio;
          var litCount = Math.floor(ratio * words.length);
          words.forEach(function(word, idx) {
            if (idx <= litCount) {
              word.classList.add('lit');
            } else {
              word.classList.remove('lit');
            }
          });
        });
      }, { threshold: thresholds });
      obs.observe(manifesto);
      desktopCleanups.push(function() { obs.disconnect(); });
    }
  }

  function initSimulatorSliders() {
    var incomeSlider = document.getElementById('sim-income');
    var expensesSlider = document.getElementById('sim-expenses');
    function updateFill(slider) {
      if (!slider) return;
      var min = parseFloat(slider.min) || 0;
      var max = parseFloat(slider.max) || 100;
      var val = parseFloat(slider.value) || 0;
      var pct = ((val - min) / (max - min)) * 100;
      slider.style.setProperty('--fill', pct.toFixed(1) + '%');
      slider.style.background = 'linear-gradient(to right, #10b981 ' + pct.toFixed(1) + '%, rgba(255, 255, 255, 0.12) ' + pct.toFixed(1) + '%)';
    }
    if (incomeSlider) {
      updateFill(incomeSlider);
      incomeSlider.addEventListener('input', function() { updateFill(incomeSlider); });
    }
    if (expensesSlider) {
      updateFill(expensesSlider);
      expensesSlider.addEventListener('input', function() { updateFill(expensesSlider); });
    }
  }

  function initDesktopExperience() {
        if (isDesktopActive) return;
    isDesktopActive = true;

    initHeroLedgerTitle();
    initHeroPreviewSidebar();

    initHeroDashboardLiveFeed();
    initChartScrubbing();
    initMotionTour();
    initCategoryInspector();
    initInteractiveDonut();
    initPwaCard();
    initPaperInteractions();
    initPullThePlugDemo();
    initManifestoScrollIllumination();
  }

  function teardownDesktopExperience() {
    if (!isDesktopActive) return;
    isDesktopActive = false;

    // Clear all desktop timers, intervals, and animation frames
    while (desktopTimers.length > 0) clearTimeout(desktopTimers.pop());
    while (desktopIntervals.length > 0) clearInterval(desktopIntervals.pop());
    while (desktopAnimFrames.length > 0) cancelAnimationFrame(desktopAnimFrames.pop());

    // Run cleanups (observers, listeners)
    while (desktopCleanups.length > 0) {
      try {
        var cleanup = desktopCleanups.pop();
        if (typeof cleanup === 'function') cleanup();
      } catch (e) {}
    }
  }

/* =========================================================================
     Screen.Movie Motion System: Appear Observer, Scroll Lift & Demos
     ========================================================================= */
  function initAppearObserver() {
    if (window.__ledgio_appearObsInit) return;
    window.__ledgio_appearObsInit = true;

    // Auto-tag key headings if not tagged
    document.querySelectorAll('.section-head-center').forEach(function(head) {
      if (!head.classList.contains('lp-reveal') && !head.hasAttribute('data-appear')) {
        head.classList.add('lp-reveal');
      }
    });

    var appearEls = document.querySelectorAll('[data-appear], .lp-appear, .lp-reveal');
    if (!appearEls.length) return;

    var motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    var reduced = isReducedMotion || (motionQuery && motionQuery.matches);

    var revealAll = function() {
      appearEls.forEach(function(el) {
        el.classList.add('is-appeared', 'is-revealed');
      });
    };

    if (reduced || !('IntersectionObserver' in window)) {
      revealAll();
      return;
    }

    var appearObserver = new IntersectionObserver(function(entries, observer) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-appeared', 'is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.04,
      rootMargin: '0px 0px 80px 0px'
    });

    appearEls.forEach(function(el) {
      appearObserver.observe(el);
    });

    if (typeof desktopCleanups !== 'undefined' && Array.isArray(desktopCleanups)) {
      desktopCleanups.push(function() {
        appearObserver.disconnect();
      });
    }

    // Reveal hero initial elements immediately on load without flicker
    var initialHeroEls = document.querySelectorAll('#hero [data-appear], #hero .lp-appear, #hero .lp-reveal');
    initialHeroEls.forEach(function(el) {
      el.classList.add('is-appeared', 'is-revealed');
    });

    // 2.5s failsafe timeout that reveals all elements unconditionally
    setTimeout(revealAll, 2500);
  }

  function initMobileMenu() {
    var openBtn = document.getElementById('mobile-menu-open-btn');
    var closeBtn = document.getElementById('mobile-menu-close-btn');
    var overlay = document.getElementById('mobile-nav-overlay');
    if (!overlay) return;

    var sheet = overlay.querySelector('.mobile-nav-sheet');
    var mainContent = document.getElementById('main-content');
    var navPill = document.getElementById('landing-nav-pill');
    var footer = document.querySelector('footer');
    var willChangeTimeout = null;

    function applyWillChange() {
      if (sheet) sheet.style.willChange = 'transform, opacity';
      if (willChangeTimeout) clearTimeout(willChangeTimeout);
      willChangeTimeout = setTimeout(function() {
        if (sheet) sheet.style.willChange = '';
      }, 350);
    }

    function openMenu() {
      applyWillChange();
      overlay.classList.add('active');
      overlay.setAttribute('aria-hidden', 'false');
      overlay.removeAttribute('inert');
      try { overlay.inert = false; } catch (e) {}

      if (mainContent) {
        mainContent.setAttribute('inert', '');
        try { mainContent.inert = true; } catch (e) {}
      }
      if (navPill) {
        navPill.setAttribute('inert', '');
        try { navPill.inert = true; } catch (e) {}
      }
      if (footer) {
        footer.setAttribute('inert', '');
        try { footer.inert = true; } catch (e) {}
      }

      // Lock body scroll without layout shift
      var scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = scrollbarWidth + 'px';
      }

      // Move focus to close button
      if (closeBtn) {
        closeBtn.focus();
        if (typeof requestAnimationFrame === 'function') {
          requestAnimationFrame(function() { closeBtn.focus(); });
        }
        setTimeout(function() {
          closeBtn.focus();
        }, 50);
      }
    }

    function closeMenu() {
      applyWillChange();
      overlay.classList.remove('active');
      overlay.setAttribute('aria-hidden', 'true');
      overlay.setAttribute('inert', '');
      try { overlay.inert = true; } catch (e) {}

      if (mainContent) {
        mainContent.removeAttribute('inert');
        try { mainContent.inert = false; } catch (e) {}
      }
      if (navPill) {
        navPill.removeAttribute('inert');
        try { navPill.inert = false; } catch (e) {}
      }
      if (footer) {
        footer.removeAttribute('inert');
        try { footer.inert = false; } catch (e) {}
      }

      // Restore body scroll
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';

      // Return focus to opener
      if (openBtn) {
        openBtn.focus();
      }
    }

    if (openBtn) openBtn.addEventListener('click', openMenu);
    if (closeBtn) closeBtn.addEventListener('click', closeMenu);

    var mobLinks = overlay.querySelectorAll('.mob-link, .mobile-nav-cta a');
    mobLinks.forEach(function(link) {
      link.addEventListener('click', function(e) {
        var href = link.getAttribute('href');
        closeMenu();
        if (href && href.startsWith('#')) {
          var target = document.querySelector(href);
          if (target) {
            e.preventDefault();
            setTimeout(function() {
              target.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }
        }
      });
    });

    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) closeMenu();
    });

    document.addEventListener('keydown', function(e) {
      if (!overlay.classList.contains('active')) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        closeMenu();
        return;
      }

      if (e.key === 'Tab') {
        var focusables = overlay.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusables.length === 0) return;
        var first = focusables[0];
        var last = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    });
  }

  function initNavScrollPill() {
    var nav = document.getElementById('landing-nav-pill');
    if (!nav) return;
    var marker = document.createElement('span');
    marker.setAttribute('aria-hidden', 'true');
    marker.style.cssText = 'position:absolute;top:30px;left:0;width:1px;height:1px;pointer-events:none';
    document.body.appendChild(marker);
    // Observer geometry avoids forcing layout from a scroll handler.
    var wasScrolled;
    new IntersectionObserver(function(entries) {
      var scrolled = entries[0].boundingClientRect.top < 0;
      if (scrolled === wasScrolled) return;
      wasScrolled = scrolled;
      nav.classList.toggle('is-scrolled', scrolled);
    }).observe(marker);
  }

  function initReleaseVersionPill() {
    var pillText = document.getElementById('hero-release-text');
    var ver = window.LEDGIO_VERSION || '1.9.0';
    if (pillText) {
      pillText.innerHTML = 'Free forever &bull; Open source &bull; v' + ver;
    }
  }

  function initFaqAccordion() {
    var faqItems = document.querySelectorAll('.faq-accordion-item');
    if (!faqItems.length) return;

    faqItems.forEach(function(item) {
      var trigger = item.querySelector('.faq-accordion-trigger');
      var panel = item.querySelector('.faq-accordion-panel');
      if (!trigger || !panel) return;

      trigger.addEventListener('click', function() {
        var isCurrentlyOpen = item.classList.contains('is-open');

        // Close all items (only one row open at a time)
        faqItems.forEach(function(otherItem) {
          var otherTrigger = otherItem.querySelector('.faq-accordion-trigger');
          var otherPanel = otherItem.querySelector('.faq-accordion-panel');
          otherItem.classList.remove('is-open');
          if (otherTrigger) otherTrigger.setAttribute('aria-expanded', 'false');
          if (otherPanel) otherPanel.setAttribute('hidden', '');
        });

        // Toggle clicked item
        if (!isCurrentlyOpen) {
          item.classList.add('is-open');
          trigger.setAttribute('aria-expanded', 'true');
          panel.removeAttribute('hidden');
        }
      });
    });
  }

  function initDemoVisibilityObservers() {
    if (!('IntersectionObserver' in window)) return;

    var demoSections = document.querySelectorAll('.feature-section, #offline-demo, #simulator');
    var demoObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        var isVis = entry.isIntersecting;
        entry.target.setAttribute('data-demo-active', isVis ? 'true' : 'false');
      });
    }, { threshold: 0.40 });

    demoSections.forEach(function(sec) {
      demoObserver.observe(sec);
    });
  }

      // =========================================================================
  // Stream Subtitle Word-by-Word Reveal (Halftone Ledger Signature Motif)
  // =========================================================================
  function initHeroStreamText() {
    var subEl = document.getElementById('hero-stream-subline');
    if (!subEl) return;
    if (subEl.querySelector('.stream-word')) return;
    var isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReduced) return;

    var text = subEl.textContent.trim();
    if (!text) return;
    var words = text.split(/\s+/);
    subEl.textContent = '';

    for (var i = 0; i < words.length; i++) {
      var span = document.createElement('span');
      span.className = 'stream-word';
      span.style.setProperty('--stagger', (i * 15) + 'ms');
      span.textContent = words[i];
      subEl.appendChild(span);
      if (i < words.length - 1) {
        subEl.appendChild(document.createTextNode(' '));
      }
    }

    var caret = document.createElement('span');
    caret.className = 'stream-caret';
    caret.setAttribute('aria-hidden', 'true');
    subEl.appendChild(caret);
  }

  // =========================================================================
  // Halftone Ledger V2 Ambient Background & Visibility Lifecycle
  // =========================================================================
  function initAmbientBackground() {
    var bgEl = document.getElementById('lp-ambient-bg');
    var heroEl = document.getElementById('hero');
    if (!bgEl && !heroEl) return;

    var isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReduced) return;

    // 1. Tab visibility pausing (visibilitychange)
    document.addEventListener('visibilitychange', function() {
      if (document.hidden) {
        document.body.classList.add('lp-anim-paused');
      } else {
        document.body.classList.remove('lp-anim-paused');
      }
    });

    // 2. Hero IntersectionObserver: pause hero ambient glows when off-screen
    if (heroEl && 'IntersectionObserver' in window) {
      var heroObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            heroEl.classList.remove('hero-anim-paused');
          } else {
            heroEl.classList.add('hero-anim-paused');
          }
        });
      }, { threshold: 0.05 });
      heroObserver.observe(heroEl);
    }
  }


/* =========================================================================
     Phase B: Word-by-word Heading Streaming (desktop >= 1024px)
     ========================================================================= */
  function initHeadingStreaming() {
    if (window.innerWidth < 1024 || isReducedMotion) return;
    var headings = document.querySelectorAll('h2.problem-title, h2.steps-title, h2.feature-title, h2.faq-title, h2.closing-title');
    headings.forEach(function(h2) {
      if (h2.dataset.streamInit) return;
      h2.dataset.streamInit = 'true';

      var childNodes = Array.from(h2.childNodes);
      var wordIndex = 0;
      h2.innerHTML = '';

      childNodes.forEach(function(node) {
        if (node.nodeType === Node.TEXT_NODE) {
          var parts = node.textContent.split(/(\s+)/);
          parts.forEach(function(part) {
            if (!part) return;
            if (/^\s+$/.test(part)) {
              h2.appendChild(document.createTextNode(' '));
            } else {
              var span = document.createElement('span');
              span.className = 'heading-stream-word';
              span.style.setProperty('--w-i', Math.min(23, wordIndex++));
              span.textContent = part;
              h2.appendChild(span);
            }
          });
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          var span = document.createElement('span');
          span.className = 'heading-stream-word ' + (node.className || '');
          span.style.setProperty('--w-i', Math.min(23, wordIndex++));
          span.innerHTML = node.innerHTML;
          h2.appendChild(span);
        }
      });
    });
  }

/* =========================================================================
     Phase B: Demo Number Counting (Count-up once on enter)
     ========================================================================= */
  function initCountUpDemos() {
    if (!('IntersectionObserver' in window)) return;

    var numTargets = document.querySelectorAll(
      '#scene1-budget-text, #scene2-sub-label, #scene2-badge, #cat-inspector-status, .lp-amount.paper-currency-amount'
    );
    if (!numTargets.length) return;

    var countObserver = new IntersectionObserver(function(entries, obs) {
      entries.forEach(function(entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        obs.unobserve(el);

        var originalText = el.textContent.trim();
        var match = originalText.match(/([₹$€]?\s*)([0-9,]+)(\s*(?:\/|\w|%|left|spent|safe|momentum|overflow|track|changes|waiting|\b)*.*)/i);
        if (!match) return;

        var prefix = match[1] || '';
        var rawNumStr = match[2].replace(/,/g, '');
        var suffix = match[3] || '';
        var targetNum = parseInt(rawNumStr, 10);
        if (isNaN(targetNum) || targetNum <= 0) return;

        if (isReducedMotion) {
          el.textContent = originalText;
          return;
        }

        var start = 0;
        var duration = 650;
        var startTime = null;

        function step(timestamp) {
          if (document.hidden) {
            el.textContent = originalText;
            return;
          }
          if (!startTime) startTime = timestamp;
          var elapsed = timestamp - startTime;
          var progress = Math.min(elapsed / duration, 1);
          var ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
          var current = Math.round(start + (targetNum - start) * ease);
          el.textContent = prefix + current.toLocaleString('en-IN') + suffix;

          if (progress < 1) {
            requestAnimationFrame(step);
          } else {
            el.textContent = originalText;
          }
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.15 });

    numTargets.forEach(function(target) {
      countObserver.observe(target);
    });
  }

  function initAll() {
    var desktopMql = window.matchMedia('(min-width: 768px)');

    function handleDesktopBreakpoint(e) {
      if (e.matches) {
        initDesktopExperience();
      } else {
        teardownDesktopExperience();
      }
    }

    if (desktopMql.addEventListener) {
      desktopMql.addEventListener('change', handleDesktopBreakpoint);
    } else if (desktopMql.addListener) {
      desktopMql.addListener(handleDesktopBreakpoint);
    }

    if (desktopMql.matches) {
      initDesktopExperience();
    }

    // Shared features across all viewports
    initSimulatorSliders();
    initScrollReveal();
    initAppearObserver();
    initNavScrollPill();
    initMobileMenu();
    // Keep the product at its settled scale; scroll-driven zoom forced repeated layout.
    initDemoVisibilityObservers();
    initReleaseVersionPill();
    initFaqAccordion();
    initAmbientBackground();
    initHeroStreamText();
    initHeadingStreaming();
    initCountUpDemos();
    window.__ledgio_landingReady = true;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }


})();
