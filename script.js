/* ═══════════════════════════════════════════════════════════
   TUDO MAIS DOCE — script.js v3
   Zero dependências externas. ~180 linhas.
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── Preloader ──────────────────────────────────────────── */
  const pre = document.getElementById('preloader');
  if (pre) {
    // CSS animation handles the visual; JS fires the callback
    pre.addEventListener('animationend', () => {
      pre.style.display = 'none';
      document.body.classList.add('loaded');
    }, { once: true });
  } else {
    document.body.classList.add('loaded');
  }

  /* ── Custom Cursor ──────────────────────────────────────── */
  const dot  = document.getElementById('curDot');
  const ring = document.getElementById('curRing');
  const isTouchDevice = window.matchMedia('(hover: none)').matches;

  if (dot && ring && !isTouchDevice) {
    let mx = -100, my = -100;   // start off-screen
    let rx = -100, ry = -100;

    window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
    document.addEventListener('mouseleave', () => { dot.style.opacity = ring.style.opacity = '0'; });
    document.addEventListener('mouseenter', () => { dot.style.opacity = ring.style.opacity = '1'; });

    (function cursorLoop() {
      // dot: snap
      dot.style.transform  = `translate(calc(${mx}px - 50%), calc(${my}px - 50%))`;
      // ring: lag
      rx += (mx - rx) * .14;
      ry += (my - ry) * .14;
      ring.style.transform = `translate(calc(${rx}px - 50%), calc(${ry}px - 50%))`;
      requestAnimationFrame(cursorLoop);
    })();

    // Hover state
    document.querySelectorAll('a, button, [data-hover]').forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('hover'));
      el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
    });
  }

  /* ── Navbar scroll ──────────────────────────────────────── */
  const nav = document.getElementById('nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 64);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── Mobile menu ────────────────────────────────────────── */
  const hamburger = document.getElementById('hamburger');
  const navMenu   = document.getElementById('navMenu');
  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      const open = hamburger.classList.toggle('open');
      navMenu.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    navMenu.querySelectorAll('.nav-link').forEach(a => {
      a.addEventListener('click', () => {
        hamburger.classList.remove('open');
        navMenu.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  /* ── Scroll Progress (JS fallback for older browsers) ───── */
  const progressBar = document.querySelector('.scroll-progress');
  if (progressBar && !CSS.supports('animation-timeline', 'scroll()')) {
    window.addEventListener('scroll', () => {
      const h = document.documentElement;
      const pct = h.scrollTop / (h.scrollHeight - h.clientHeight);
      progressBar.style.width = (pct * 100) + '%';
    }, { passive: true });
  }

  /* ── Intersection Observer — Scroll Reveals ─────────────── */
  const STAGGER = 80; // ms between staggered siblings

  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el    = entry.target;
      const delay = parseFloat(el.dataset.delay || 0) * 1000;
      setTimeout(() => el.classList.add('in'), delay);
      revealObs.unobserve(el);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('[data-reveal]').forEach(el => revealObs.observe(el));

  /* ── Animated Counters ──────────────────────────────────── */
  const counterObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const target = parseInt(el.dataset.count, 10);
      const suffix = el.dataset.suffix || '';
      const dur    = 2000;
      const start  = performance.now();

      function tick(now) {
        const t   = Math.min((now - start) / dur, 1);
        const val = Math.round(easeOut(t) * target);
        el.textContent = val + suffix;
        if (t < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      counterObs.unobserve(el);
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.n-val').forEach(el => counterObs.observe(el));

  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  /* ── Magnetic Buttons ───────────────────────────────────── */
  if (!isTouchDevice) {
    document.querySelectorAll('.btn-solid, .btn-linha, .btn-produto, .btn-enviar, .btn-wpp, .nav-cta').forEach(btn => {
      const STRENGTH = 0.28;
      btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width  / 2) * STRENGTH;
        const y = (e.clientY - r.top  - r.height / 2) * STRENGTH;
        btn.style.setProperty('--mx', x + 'px');
        btn.style.setProperty('--my', y + 'px');
        btn.style.transform = `translate(var(--mx), var(--my))`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0,0)';
        btn.style.transition = 'transform .6s cubic-bezier(.34,1.56,.64,1)';
        setTimeout(() => btn.style.transition = '', 600);
      });
    });
  }

  /* ── Card hover: subtle scale on produto-copy text ──────── */
  document.querySelectorAll('.produto').forEach(p => {
    const copy = p.querySelector('.produto-copy');
    if (!copy) return;
    p.addEventListener('mouseenter', () => {
      copy.style.transition = 'background .4s';
    });
  });

  /* ── Smooth active nav link ─────────────────────────────── */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const activeObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(a => a.removeAttribute('data-active'));
      const match = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
      if (match) match.setAttribute('data-active', '');
    });
  }, { threshold: 0.45 });

  sections.forEach(s => activeObs.observe(s));

  /* Active nav style */
  document.head.insertAdjacentHTML('beforeend', `
    <style>
      .nav-link[data-active] { color: var(--gold2) !important; }
      .nav-link[data-active]::after { width: 100% !important; }
    </style>
  `);

  /* ── Cortina — abre ao entrar na viewport ───────────────── */
  (function () {
    const wrap = document.getElementById('curtainWrap');
    if (!wrap) return;
    let fired = false;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting || fired) return;
        fired = true;
        setTimeout(() => wrap.classList.add('open'), 300);
        obs.unobserve(wrap);
      });
    }, { threshold: 0.2 });
    obs.observe(wrap);
  })();

  /* ── Video autoplay fallback (mobile precisa de interação) ── */
  (function () {
    const vid = document.querySelector('.vid-bg-loop');
    if (!vid) return;
    // Garante autoplay mesmo após interação do usuário em mobile
    document.addEventListener('touchstart', () => {
      if (vid.paused) vid.play();
    }, { once: true });
  })();

  /* ── Form submit ────────────────────────────────────────── */
  window.submitForm = function (e) {
    e.preventDefault();
    const ok = document.getElementById('formOk');
    if (ok) ok.classList.add('show');
  };

  /* ── Touch: show scroll hint animation on vozes ─────────── */
  const hint = document.querySelector('.vozes-hint');
  if (hint && isTouchDevice) {
    hint.style.display = 'block';
    setTimeout(() => { hint.style.opacity = '0'; hint.style.transition = 'opacity 1s'; }, 3000);
  } else if (hint) {
    hint.style.display = 'none';
  }

})();
