/* ==========================================================================
   UI — utilitários partilhados e componentes interativos
   (modal, carrossel, acordeão, contadores, cursor, botões magnéticos,
    tilt 3D, cartões flip, comparador antes/depois, preços, parallax do rato)

   Expõe: window.TheOne.utils e window.TheOne.ui
   ========================================================================== */

// Indica ao CSS que o JS está ativo (permite esconder elementos para animar)
document.documentElement.classList.add('js');

window.TheOne = window.TheOne || {};

(function (TheOne) {
  'use strict';

  /* ======================================================================
     UTILITÁRIOS
     ====================================================================== */
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointerQuery = window.matchMedia('(hover: hover) and (pointer: fine)');

  const utils = {
    $: (sel, root = document) => root.querySelector(sel),
    $$: (sel, root = document) => Array.from(root.querySelectorAll(sel)),

    /** Lê um valor do objeto de dados por caminho, ex.: get(data, 'studio.name') */
    get(obj, path) {
      return path.split('.').reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
    },

    /** Escapa texto para inserir em HTML com segurança */
    esc(value) {
      return String(value == null ? '' : value)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    },

    /** <img> de um ícone em assets/icons (decorativo por defeito) */
    icon(name, size = 20, cls = 'icon') {
      return `<img src="assets/icons/${name}.svg" alt="" class="${cls}" width="${size}" height="${size}">`;
    },

    reducedMotion: () => reducedMotionQuery.matches,
    finePointer: () => finePointerQuery.matches,
    hasGsap: () => Boolean(window.gsap && window.ScrollTrigger),

    /** "07:30" → 450 */
    toMinutes(hhmm) {
      const [h, m] = hhmm.split(':').map(Number);
      return h * 60 + m;
    },
    /** 450 → "07:30" */
    toTime(minutes) {
      const h = Math.floor(minutes / 60) % 24;
      const m = minutes % 60;
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    },

    /** Índice do dia na semana começando à segunda (0 = Seg … 6 = Dom) */
    weekdayIndex(date = new Date()) {
      return (date.getDay() + 6) % 7;
    },

    formatNumber: (n) => new Intl.NumberFormat('pt-PT').format(n),

    /** Link wa.me. Se o número ainda for um marcador, abre o WhatsApp sem destinatário. */
    whatsappUrl(text) {
      const raw = String(utils.get(window.STUDIO_DATA, 'studio.whatsapp') || '');
      const digits = raw.includes('[') ? '' : raw.replace(/\D/g, '');
      if (!digits && !utils._warnedWa) {
        utils._warnedWa = true;
        console.warn('[The One] Número de WhatsApp por definir em js/data.js (studio.whatsapp).');
      }
      return `https://wa.me/${digits}?text=${encodeURIComponent(text || '')}`;
    },

    /** Bloqueio de scroll com contador (menu + modal podem coexistir) */
    _locks: 0,
    lockScroll(lock) {
      utils._locks = Math.max(0, utils._locks + (lock ? 1 : -1));
      document.documentElement.classList.toggle('is-locked', utils._locks > 0);
    },

    /**
     * Carrega imagens dentro de elementos .img-frame[data-src].
     * Se o ficheiro não existir, mostra um gradiente da marca com legenda.
     */
    hydrateImages(root = document) {
      utils.$$('.img-frame[data-src]', root).forEach((frame) => {
        if (frame.dataset.hydrated) return;
        frame.dataset.hydrated = '1';
        const src = frame.dataset.src;
        const showFallback = () => {
          frame.classList.add('is-missing');
          frame.classList.remove('is-loaded');
          frame.innerHTML = `<span class="img-frame__label">${utils.esc(frame.dataset.label || frame.dataset.alt || 'Imagem em breve')}</span>`;
          frame.setAttribute('role', 'img');
          frame.setAttribute('aria-label', frame.dataset.alt || 'Imagem em breve');
        };
        if (!src) return showFallback();

        const img = new Image();
        img.alt = frame.dataset.alt || '';
        img.decoding = 'async';
        if ('eager' in frame.dataset) {
          img.loading = 'eager';
          img.fetchPriority = 'high';
        } else {
          img.loading = 'lazy';
        }
        img.addEventListener('load', () => frame.classList.add('is-loaded'), { once: true });
        img.addEventListener('error', showFallback, { once: true });
        img.src = src;               // listeners ligados antes do src → erro nunca se perde
        frame.appendChild(img);
        if (img.complete && img.naturalWidth) frame.classList.add('is-loaded');
      });
    },

    /** Divide o texto de um elemento em letras animáveis (<span class="char">) */
    splitLetters(el) {
      const text = el.textContent;
      el.textContent = '';
      [...text].forEach((ch, i) => {
        const span = document.createElement('span');
        span.className = 'char';
        span.textContent = ch === ' ' ? ' ' : ch;
        span.style.setProperty('--i', i);
        el.appendChild(span);
      });
    },

    /** Divide em palavras; a última frase fica destacada (.is-accent) */
    splitWords(el, text) {
      const sentences = text.trim().split(/(?<=[.!?])\s+/);
      const lastIndex = sentences.length - 1;
      el.textContent = '';
      sentences.forEach((sentence, si) => {
        sentence.split(/\s+/).forEach((word) => {
          const span = document.createElement('span');
          span.className = 'word' + (si === lastIndex && sentences.length > 1 ? ' is-accent' : '');
          span.textContent = word;
          el.appendChild(span);
          el.appendChild(document.createTextNode(' '));
        });
      });
    },

    /** Anima um número de `from` até `to` (easeOutExpo) */
    tweenNumber(from, to, duration, onUpdate) {
      if (utils.reducedMotion() || duration <= 0) return onUpdate(to);
      const start = performance.now();
      const step = (now) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
        onUpdate(Math.round(from + (to - from) * eased));
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    },

    /** Observa elementos e chama `callback` uma vez quando ficam visíveis */
    onVisible(elements, callback, options = { threshold: 0.35 }) {
      if (!('IntersectionObserver' in window)) return elements.forEach(callback);
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            callback(entry.target);
            io.unobserve(entry.target);
          }
        });
      }, options);
      elements.forEach((el) => io.observe(el));
    }
  };

  const { $, $$ } = utils;

  /* ======================================================================
     MODAL (acessível: foco preso, Esc fecha, devolve o foco, swipe para fechar)
     ====================================================================== */
  const modal = {
    current: null,
    lastFocus: null,

    open(id, { focus } = {}) {
      const el = document.getElementById(id);
      if (!el) return;
      if (modal.current && modal.current !== el) modal.close({ restoreFocus: false });

      modal.lastFocus = modal.lastFocus || document.activeElement;
      modal.current = el;
      el.hidden = false;
      void el.offsetWidth;                // força reflow para a transição arrancar
      el.classList.add('is-open');
      utils.lockScroll(true);

      const dialog = $('.modal__dialog', el);
      dialog.scrollTop = 0;
      const target = (focus && $(focus, el)) || $('.modal__close', el);
      setTimeout(() => target && target.focus({ preventScroll: true }), 60);
    },

    close({ restoreFocus = true } = {}) {
      const el = modal.current;
      if (!el) return;
      el.classList.remove('is-open');
      modal.current = null;
      utils.lockScroll(false);
      const dialog = $('.modal__dialog', el);
      setTimeout(() => {
        if (!el.classList.contains('is-open')) {
          el.hidden = true;
          dialog.style.removeProperty('transform');
          el.dispatchEvent(new CustomEvent('modal:closed'));
        }
      }, 450);
      if (restoreFocus && modal.lastFocus && modal.lastFocus.focus) {
        modal.lastFocus.focus({ preventScroll: true });
      }
      if (restoreFocus) modal.lastFocus = null;
    },

    init() {
      // Fechar ao clicar no fundo ou em [data-close-modal]
      document.addEventListener('click', (e) => {
        if (e.target.closest('[data-close-modal]') && modal.current) modal.close();
      });

      // Esc + foco preso dentro do modal
      document.addEventListener('keydown', (e) => {
        if (!modal.current) return;
        if (e.key === 'Escape') { e.preventDefault(); modal.close(); return; }
        if (e.key !== 'Tab') return;
        const focusables = $$('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])', modal.current)
          .filter((n) => n.offsetParent !== null && !n.closest('[hidden]'));
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      });

      // Telemóvel: arrastar o painel para baixo para fechar (sensação de app)
      $$('.modal__dialog').forEach((dialog) => {
        let startY = null;
        let delta = 0;
        dialog.addEventListener('touchstart', (e) => {
          if (window.innerWidth >= 640 || dialog.scrollTop > 0) return;
          startY = e.touches[0].clientY;
          delta = 0;
        }, { passive: true });
        dialog.addEventListener('touchmove', (e) => {
          if (startY === null) return;
          delta = Math.max(0, e.touches[0].clientY - startY);
          if (delta > 0) {
            dialog.style.transition = 'none';
            dialog.style.transform = `translateY(${delta}px)`;
          }
        }, { passive: true });
        dialog.addEventListener('touchend', () => {
          if (startY === null) return;
          dialog.style.removeProperty('transition');
          if (delta > 110) modal.close();
          else dialog.style.removeProperty('transform');
          startY = null;
        });
      });
    }
  };

  /* ======================================================================
     CARROSSEL (scroll-snap nativo = swipe suave; autoplay + pontos)
     ====================================================================== */
  function initCarousel() {
    const track = $('#carouselTrack');
    const dotsWrap = $('#carouselDots');
    if (!track || !dotsWrap) return;
    const slides = $$('.testimonial', track);
    let pages = [];
    let current = 0;
    let timer = null;
    let paused = false;
    let inView = false;

    // Posições de scroll alcançáveis (no desktop há várias visíveis de cada vez)
    function computePages() {
      const max = track.scrollWidth - track.clientWidth;
      const pad = parseFloat(getComputedStyle(track).paddingLeft) || 0;
      const positions = slides.map((s) => Math.min(Math.max(0, s.offsetLeft - pad), max));
      pages = positions.filter((p, i) => i === 0 || Math.abs(p - positions[i - 1]) > 4);
      dotsWrap.innerHTML = pages.map((_, i) =>
        `<button class="carousel__dot" type="button" role="tab" aria-label="Ir para o testemunho ${i + 1}" aria-selected="false"></button>`
      ).join('');
      $$('.carousel__dot', dotsWrap).forEach((dot, i) => dot.addEventListener('click', () => { goTo(i); restart(); }));
      updateActive();
    }

    function goTo(i) {
      current = (i + pages.length) % pages.length;
      track.scrollTo({ left: pages[current], behavior: utils.reducedMotion() ? 'auto' : 'smooth' });
    }

    function updateActive() {
      const x = track.scrollLeft;
      let best = 0;
      pages.forEach((p, i) => { if (Math.abs(p - x) < Math.abs(pages[best] - x)) best = i; });
      current = best;
      $$('.carousel__dot', dotsWrap).forEach((d, i) => d.setAttribute('aria-selected', String(i === best)));
    }

    function tick() { if (!paused && inView && !document.hidden) goTo(current + 1); }
    function restart() {
      clearInterval(timer);
      if (!utils.reducedMotion()) timer = setInterval(tick, 5500);
    }

    let scrollRaf;
    track.addEventListener('scroll', () => {
      cancelAnimationFrame(scrollRaf);
      scrollRaf = requestAnimationFrame(updateActive);
    }, { passive: true });

    $('#carouselPrev').addEventListener('click', () => { goTo(current - 1); restart(); });
    $('#carouselNext').addEventListener('click', () => { goTo(current + 1); restart(); });
    track.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(current + 1); restart(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(current - 1); restart(); }
    });

    // Pausa enquanto o utilizador interage
    const carousel = $('#carousel');
    carousel.addEventListener('mouseenter', () => { paused = true; });
    carousel.addEventListener('mouseleave', () => { paused = false; });
    carousel.addEventListener('focusin', () => { paused = true; });
    carousel.addEventListener('focusout', () => { paused = false; });
    track.addEventListener('touchstart', () => { paused = true; }, { passive: true });
    track.addEventListener('touchend', () => { setTimeout(() => { paused = false; }, 4000); });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; }, { threshold: 0.4 }).observe(carousel);
    } else {
      inView = true;
    }

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(computePages, 200);
    });
    computePages();
    restart();
  }

  /* ======================================================================
     BARRA DE VALORES — destaca um valor de cada vez (pausa com o rato)
     ====================================================================== */
  function initPillars() {
    const root = $('.pillars');
    const items = $$('.pillar', root || document);
    if (!root || !items.length || utils.reducedMotion()) return;
    root.classList.add('is-cycling');
    let index = 0;
    let timer = null;
    let inView = false;

    const activate = (i) => {
      index = (i + items.length) % items.length;
      items.forEach((item, n) => {
        item.classList.remove('is-active');
        if (n === index) {
          void item.offsetWidth;          // reinicia a animação da linha
          item.classList.add('is-active');
        }
      });
    };
    const play = () => {
      clearInterval(timer);
      timer = setInterval(() => { if (inView && !document.hidden) activate(index + 1); }, 3200);
    };

    items.forEach((item, i) => {
      item.addEventListener('mouseenter', () => { clearInterval(timer); activate(i); root.classList.add('is-paused'); });
      item.addEventListener('mouseleave', () => { root.classList.remove('is-paused'); play(); });
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; }, { threshold: 0.5 }).observe(root);
    } else {
      inView = true;
    }
    activate(0);
    play();
  }

  /* ======================================================================
     ACORDEÃO (só um aberto de cada vez)
     ====================================================================== */
  function initAccordion(root) {
    if (!root) return;
    const items = $$('.acc-item', root);
    items.forEach((item) => {
      const btn = $('.acc-item__btn', item);
      btn.addEventListener('click', () => {
        const willOpen = !item.classList.contains('is-open');
        items.forEach((other) => {
          other.classList.remove('is-open');
          $('.acc-item__btn', other).setAttribute('aria-expanded', 'false');
        });
        if (willOpen) {
          item.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  /* ======================================================================
     CONTADORES (animam quando ficam visíveis)
     ====================================================================== */
  function initCounters() {
    const counters = $$('[data-count-to]');
    utils.onVisible(counters, (el) => {
      const target = Number(el.dataset.countTo) || 0;
      utils.tweenNumber(0, target, 2200, (v) => { el.textContent = utils.formatNumber(v); });
    }, { threshold: 0.6 });
  }

  /* ======================================================================
     CURSOR PERSONALIZADO (só rato; desativado em ecrãs táteis)
     ====================================================================== */
  function initCursor() {
    const cursor = $('#cursor');
    if (!cursor || !utils.finePointer() || utils.reducedMotion()) return;
    document.documentElement.classList.add('has-cursor');
    const dot = $('.cursor__dot', cursor);
    const ring = $('.cursor__ring', cursor);
    let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y;

    window.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      x = e.clientX; y = e.clientY;
      dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      cursor.classList.remove('is-hidden');
    }, { passive: true });

    (function loop() {
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      requestAnimationFrame(loop);
    })();

    const interactive = 'a, button, select, input, label, [data-cursor], .coach-card, .compare';
    document.addEventListener('mouseover', (e) => cursor.classList.toggle('is-hover', Boolean(e.target.closest(interactive))));
    document.addEventListener('mousedown', () => cursor.classList.add('is-down'));
    document.addEventListener('mouseup', () => cursor.classList.remove('is-down'));
    document.documentElement.addEventListener('mouseleave', () => cursor.classList.add('is-hidden'));
  }

  /* ======================================================================
     BOTÕES MAGNÉTICOS
     ====================================================================== */
  function initMagnetic() {
    if (!utils.finePointer() || utils.reducedMotion()) return;
    $$('.magnetic').forEach((btn) => {
      btn.addEventListener('pointermove', (e) => {
        const r = btn.getBoundingClientRect();
        btn.style.setProperty('--mx', `${(e.clientX - (r.left + r.width / 2)) * 0.28}px`);
        btn.style.setProperty('--my', `${(e.clientY - (r.top + r.height / 2)) * 0.38}px`);
      });
      btn.addEventListener('pointerleave', () => {
        btn.style.setProperty('--mx', '0px');
        btn.style.setProperty('--my', '0px');
      });
    });
  }

  /* ======================================================================
     TILT 3D NOS CARTÕES DE MODALIDADE
     ====================================================================== */
  function initTilt(selector) {
    if (!utils.finePointer() || utils.reducedMotion()) return;
    $$(selector).forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        card.classList.add('is-tilting');
        card.style.setProperty('--ry', `${(px - 0.5) * 14}deg`);
        card.style.setProperty('--rx', `${(0.5 - py) * 14}deg`);
        card.style.setProperty('--gx', `${px * 100}%`);
        card.style.setProperty('--gy', `${py * 100}%`);
      });
      card.addEventListener('pointerleave', () => {
        card.classList.remove('is-tilting');
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      });
    });
  }

  /* ======================================================================
     CARTÕES FLIP DOS COACHES
     Desktop: vira com hover (CSS). Toque/teclado: botões e toque no cartão.
     ====================================================================== */
  function initFlipCards() {
    const touchLike = window.matchMedia('(hover: none)');
    $$('.coach-card').forEach((card) => {
      const front = $('[data-flip="open"]', card);
      const back = $('[data-flip="close"]', card);
      const setFlipped = (flipped, moveFocus) => {
        card.classList.toggle('is-flipped', flipped);
        front.setAttribute('aria-expanded', String(flipped));
        back.tabIndex = flipped ? 0 : -1;
        front.tabIndex = flipped ? -1 : 0;
        if (moveFocus) (flipped ? back : front).focus({ preventScroll: true });
      };
      front.addEventListener('click', (e) => { e.stopPropagation(); setFlipped(true, e.detail === 0); });
      back.addEventListener('click', (e) => { e.stopPropagation(); setFlipped(false, e.detail === 0); });
      card.addEventListener('click', () => {
        if (touchLike.matches) setFlipped(!card.classList.contains('is-flipped'), false);
      });
      setFlipped(false, false);
    });
  }

  /* ======================================================================
     COMPARADOR ANTES / DEPOIS
     Arrasto com rato/dedo no contentor + input range para teclado.
     ====================================================================== */
  function initCompare() {
    const box = $('#compare');
    const range = $('#compareRange');
    if (!box || !range) return;
    const set = (pct) => {
      const v = Math.max(0, Math.min(100, pct));
      box.style.setProperty('--pos', `${v}%`);
      range.value = v;
    };
    const fromEvent = (e) => {
      const r = box.getBoundingClientRect();
      set(((e.clientX - r.left) / r.width) * 100);
    };

    range.addEventListener('input', () => set(Number(range.value)));
    range.addEventListener('focus', () => box.classList.toggle('is-focused', range.matches(':focus-visible')));
    range.addEventListener('blur', () => box.classList.remove('is-focused'));

    let dragging = false;
    box.addEventListener('pointerdown', (e) => {
      dragging = true;
      box.classList.add('is-dragging');
      box.setPointerCapture(e.pointerId);
      fromEvent(e);
    });
    box.addEventListener('pointermove', (e) => { if (dragging) fromEvent(e); });
    const stop = () => { dragging = false; box.classList.remove('is-dragging'); };
    box.addEventListener('pointerup', stop);
    box.addEventListener('pointercancel', stop);

    // Pequena demonstração quando aparece no ecrã (mostra que é arrastável)
    if (!utils.reducedMotion()) {
      utils.onVisible([box], () => {
        const keys = [50, 72, 30, 50];
        let i = 0;
        const next = () => {
          if (dragging || i >= keys.length - 1) return;
          const from = keys[i], to = keys[++i];
          const start = performance.now();
          const step = (now) => {
            if (dragging) return;
            const t = Math.min(1, (now - start) / 700);
            const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
            set(from + (to - from) * e);
            if (t < 1) requestAnimationFrame(step); else setTimeout(next, 120);
          };
          requestAnimationFrame(step);
        };
        setTimeout(next, 400);
      }, { threshold: 0.6 });
    }
    set(50);
  }

  /* ======================================================================
     PREÇOS — alternar Mensal / Anual com animação
     ====================================================================== */
  function initPricingToggle() {
    const toggle = $('#billingToggle');
    if (!toggle) return;
    const buttons = $$('[data-billing]', toggle);

    function apply(mode, animate) {
      toggle.classList.toggle('is-yearly', mode === 'yearly');
      buttons.forEach((b) => b.setAttribute('aria-checked', String(b.dataset.billing === mode)));
      $$('.price').forEach((price) => {
        const amount = $('.price__amount', price);
        const period = $('.price__period', price);
        const from = Number(price.dataset[mode === 'yearly' ? 'monthly' : 'yearly']);
        const to = price.dataset[mode];
        period.textContent = mode === 'yearly' ? '/mês · pago anualmente' : '/mês';
        if (!to || to === 'null') return;           // preço ainda por definir: mantém "[Preço]"
        if (animate) {
          price.classList.remove('is-changing');
          void price.offsetWidth;
          price.classList.add('is-changing');
          utils.tweenNumber(from || 0, Number(to), 700, (v) => { amount.textContent = `${v}€`; });
        } else {
          amount.textContent = `${to}€`;
        }
      });
    }

    buttons.forEach((b) => b.addEventListener('click', () => apply(b.dataset.billing, true)));
    // Setas do teclado no grupo de rádio
    toggle.addEventListener('keydown', (e) => {
      if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
      const next = toggle.classList.contains('is-yearly') ? 'monthly' : 'yearly';
      apply(next, true);
      $(`[data-billing="${next}"]`, toggle).focus();
    });
    apply('monthly', false);
  }

  /* ======================================================================
     PARALLAX DAS FORMAS DO HERO COM O RATO
     ====================================================================== */
  function initHeroMouse() {
    const hero = $('.hero');
    if (!hero || !utils.finePointer() || utils.reducedMotion()) return;
    const shapes = $$('[data-mouse]', hero);
    hero.addEventListener('pointermove', (e) => {
      const nx = e.clientX / innerWidth - 0.5;
      const ny = e.clientY / innerHeight - 0.5;
      shapes.forEach((s) => {
        const f = Number(s.dataset.mouse);
        s.style.setProperty('--tx', `${nx * f * 2}px`);
        s.style.setProperty('--ty', `${ny * f * 2}px`);
      });
    });
  }

  TheOne.utils = utils;
  TheOne.ui = {
    modal,
    initPillars,
    initCarousel,
    initAccordion,
    initCounters,
    initCursor,
    initMagnetic,
    initTilt,
    initFlipCards,
    initCompare,
    initPricingToggle,
    initHeroMouse
  };
})(window.TheOne);
