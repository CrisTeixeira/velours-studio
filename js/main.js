/* ==========================================================================
   MAIN — arranque do site
   1. Preenche todo o conteúdo a partir de js/data.js
   2. Inicia os módulos (ui, horário, marcações)
   3. Navegação, progresso de scroll, animações GSAP / fallback
   4. Preloader
   ========================================================================== */

(function (Velours) {
  'use strict';

  const data = window.STUDIO_DATA;
  if (!data) {
    console.error('[Velours] js/data.js não foi carregado.');
    return;
  }
  const utils = Velours.utils;
  const { $, $$, esc, icon, get } = utils;
  const ui = Velours.ui;

  /* ======================================================================
     1. CONTEÚDO
     ====================================================================== */

  /** [data-bind="caminho"] → texto; [data-img] → imagem com fallback */
  function bindContent() {
    $$('[data-bind]').forEach((el) => {
      const value = get(data, el.dataset.bind);
      if (value != null) el.textContent = value;
    });
    $$('[data-img]').forEach((el) => {
      el.dataset.src = get(data, el.dataset.img) || '';
      el.dataset.alt = get(data, el.dataset.alt) || '';
    });
  }

  /** Atalho: preenche todos os [data-render="nome"] com o HTML devolvido */
  function render(name, html) {
    $$(`[data-render="${name}"]`).forEach((el) => { el.innerHTML = html; });
  }

  /** HTML de uma imagem com fallback (ver utils.hydrateImages) */
  const imageFrame = (src, alt, extraClass = '', label = '') =>
    `<div class="img-frame ${extraClass}" data-src="${esc(src)}" data-alt="${esc(alt)}" data-label="${esc(label || alt)}"></div>`;

  const initials = (name) => name.replace(/[[\]]/g, '').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');

  function renderPillars() {
    render('pillars', data.sections.pillars.map((p, i) => `
      <li class="pillar">
        <span class="pillar__bar" aria-hidden="true"></span>
        <span class="pillar__num">0${i + 1}</span>
        <span class="pillar__word">${esc(p.word)}</span>
        <span class="pillar__text">${esc(p.text)}</span>
      </li>`).join(''));
  }

  function renderManifesto() {
    const el = $('[data-render="manifesto-text"]');
    if (el) utils.splitWords(el, data.sections.manifesto.text);
    render('gallery', data.sections.manifesto.gallery.map((g, i) =>
      `<figure class="gallery__item" data-reveal="clip" data-speed="${[0.08, -0.06, 0.12][i % 3]}">${imageFrame(g.src, g.alt, '', '[Foto do estúdio]')}</figure>`
    ).join(''));
  }

  function renderCoaches() {
    render('coaches', data.coaches.map((c, i) => `
      <article class="coach-card" data-reveal data-speed="${i % 2 ? 0.08 : 0}">
        <div class="coach-card__inner">
          <div class="coach-card__face coach-card__front">
            ${imageFrame(c.image, c.imageAlt, '', `[Foto de ${c.name}]`)}
            <div class="coach-card__meta">
              <div>
                <h3 class="coach-card__name">${esc(c.name)}</h3>
                <p class="coach-card__role">${esc(c.role)}</p>
              </div>
              <button class="coach-card__hint" type="button" data-flip="open" aria-expanded="false" aria-label="Ver perfil de ${esc(c.name)}">
                Ver perfil ${icon('arrow-up-right', 14, '')}
              </button>
            </div>
          </div>
          <div class="coach-card__face coach-card__back">
            <h3>${esc(c.name)}</h3>
            <p>${esc(c.bio)}</p>
            <div>
              <h4>Especialidades</h4>
              <div class="tags">${c.specialties.map((s) => `<span class="tag">${esc(s)}</span>`).join('')}</div>
            </div>
            <div>
              <h4>Certificações</h4>
              <ul class="coach-card__list">${c.certifications.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
            </div>
            <button class="btn btn--ghost btn--sm" type="button" data-flip="close" aria-label="Voltar à foto de ${esc(c.name)}">Voltar</button>
          </div>
        </div>
      </article>`).join(''));
  }

  const intensityBar = (level, large = false) =>
    `<span class="intensity${large ? ' intensity--lg' : ''}" aria-label="Intensidade ${level} de 5" role="img">${
      [1, 2, 3, 4, 5].map((n) => `<span class="${n <= level ? 'is-on' : ''}"></span>`).join('')
    }</span>`;

  function renderClasses() {
    render('classes', data.classes.map((c, i) => `
      <button class="class-card" type="button" data-class-id="${esc(c.id)}" data-reveal aria-haspopup="dialog" data-cursor>
        <span class="class-card__num" aria-hidden="true">0${i + 1}</span>
        <span class="class-card__icon">${icon(c.icon, 28, '')}</span>
        <span class="class-card__title">${esc(c.name)}</span>
        <span class="class-card__text">${esc(c.short)}</span>
        <span class="class-card__foot">
          ${intensityBar(c.intensity)}
          <span class="class-card__more">Ver detalhes ${icon('arrow-right', 16, '')}</span>
        </span>
      </button>`).join(''));

    $$('[data-class-id]').forEach((card) => card.addEventListener('click', () => openClass(card.dataset.classId)));
  }

  /** Modal com os detalhes de uma modalidade */
  function openClass(id) {
    const c = Velours.schedule.classById(id);
    if (!c) return;
    const days = data.days;
    const next = c.appointment ? [] : Velours.schedule.nextSessions(c.id, 3);
    const nextHtml = c.appointment
      ? '<p>Por marcação, em horário a combinar com o teu coach.</p>'
      : next.length
        ? `<ul class="coach-card__list">${next.map((s) =>
            `<li>${s.offset === 0 ? 'Hoje' : s.offset === 1 ? 'Amanhã' : days[s.dayIndex].long} · ${esc(s.time)} · ${esc(s.coach)}</li>`).join('')}</ul>`
        : '<p>Sem aulas agendadas nos próximos dias.</p>';

    $('#classModalBody').innerHTML = `
      <div class="class-detail">
        <div class="class-detail__head">
          <span class="class-card__icon">${icon(c.icon, 28, '')}</span>
          <h2 class="modal__title" id="classModalTitle">${esc(c.name)}</h2>
        </div>
        <p>${esc(c.description)}</p>
        <div class="class-detail__facts">
          <div class="fact"><span class="fact__label">Duração</span><span class="fact__value">${c.duration} min</span></div>
          <div class="fact"><span class="fact__label">Nível</span><span class="fact__value">${esc(c.level)}</span></div>
        </div>
        <div class="class-detail__intensity">
          <div class="class-detail__intensity-head"><span>Intensidade</span><strong>${c.intensity}/5</strong></div>
          ${intensityBar(c.intensity, true)}
        </div>
        <div class="class-detail__next"><h4>Próximas aulas</h4>${nextHtml}</div>
        <button class="btn btn--primary btn--block btn--lg" type="button" id="classModalBook">
          Marcar ${esc(c.name)} ${icon('arrow-right', 20)}
        </button>
      </div>`;

    // Barras de intensidade animam em sequência
    $$('#classModalBody .intensity--lg span').forEach((s, i) => { s.style.animationDelay = `${0.15 + i * 0.08}s`; });
    $('#classModalBook').addEventListener('click', () => Velours.booking.open({ classId: c.id }));
    ui.modal.open('classModal');
  }

  function renderStats() {
    render('stats', data.stats.map((s) => {
      const value = s.value === 'auto' ? Velours.schedule.countWeekly() : Number(s.value) || 0;
      return `
        <div class="stat" data-reveal>
          <p class="stat__value">${esc(s.prefix)}<span data-count-to="${value}">0</span>${esc(s.suffix)}</p>
          <p class="stat__label">${esc(s.label)}</p>
        </div>`;
    }).join(''));
  }

  function renderCompare() {
    const t = data.transformation;
    render('compare-before', `<span class="compare__tag">${esc(t.before.label)}</span>${imageFrame(t.before.src, t.before.alt, '', t.before.alt)}`);
    render('compare-after', `<span class="compare__tag">${esc(t.after.label)}</span>${imageFrame(t.after.src, t.after.alt, '', t.after.alt)}`);
  }

  function renderPlans() {
    render('plans', data.plans.map((p) => {
      const hasPrice = typeof p.monthly === 'number';
      return `
        <article class="plan glass${p.featured ? ' plan--featured' : ''}" data-reveal>
          ${p.featured ? `<span class="plan__badge">${esc(p.badge || 'Mais popular')}</span>` : ''}
          <h3 class="plan__name">${esc(p.name)}</h3>
          <p class="plan__desc">${esc(p.description)}</p>
          <div class="price" data-monthly="${p.monthly}" data-yearly="${p.yearly}" aria-live="polite">
            <span class="price__amount${hasPrice ? '' : ' is-placeholder'}">${hasPrice ? `${p.monthly}€` : '[Preço]'}</span>
            <span class="price__period">/mês</span>
          </div>
          <button class="btn ${p.featured ? 'btn--light' : 'btn--glass'} btn--block magnetic" type="button" data-open-booking data-plan="${esc(p.name)}">${esc(p.cta)}</button>
          <ul class="plan__features">
            ${p.features.map((f) => `<li>${icon('check', 18, '')}<span>${esc(f)}</span></li>`).join('')}
          </ul>
        </article>`;
    }).join(''));
  }

  function renderTestimonials() {
    const stars = icon('star', 16, '').repeat(5);
    render('testimonials', data.testimonials.map((t, i) => `
      <figure class="testimonial glass" aria-roledescription="slide" aria-label="${i + 1} de ${data.testimonials.length}">
        ${t.example ? '<span class="example-badge">Exemplo</span>' : ''}
        <img src="assets/icons/quote.svg" alt="" class="testimonial__quote" width="38" height="38">
        <div class="testimonial__stars" role="img" aria-label="5 estrelas">${stars}</div>
        <blockquote class="testimonial__text">“${esc(t.text)}”</blockquote>
        <figcaption class="testimonial__person">
          <span class="testimonial__avatar" aria-hidden="true">${esc(initials(t.name))}</span>
          <span><span class="testimonial__name">${esc(t.name)}</span><br><span class="testimonial__detail">${esc(t.detail)}</span></span>
        </figcaption>
      </figure>`).join(''));
  }

  function renderFaq() {
    render('faq', data.faq.map((f, i) => `
      <div class="acc-item" data-reveal>
        <h3>
          <button class="acc-item__btn" type="button" aria-expanded="false" aria-controls="faq-${i}" id="faq-btn-${i}">
            <span>${esc(f.q)}</span>
            <span class="acc-item__icon">${icon('plus', 16, '')}</span>
          </button>
        </h3>
        <div class="acc-item__panel" id="faq-${i}" role="region" aria-labelledby="faq-btn-${i}">
          <div><p>${esc(f.a)}</p></div>
        </div>
      </div>`).join(''));
  }

  function mapLink() {
    const s = data.studio;
    return s.mapLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${s.address} ${s.postalCode}`)}`;
  }

  function renderContact() {
    const s = data.studio;
    const phoneDigits = s.phone.replace(/[^\d+]/g, '');
    const phoneHtml = phoneDigits.length >= 9 ? `<a href="tel:${esc(phoneDigits)}">${esc(s.phone)}</a>` : esc(s.phone);
    const emailHtml = s.email.includes('@') ? `<a href="mailto:${esc(s.email)}">${esc(s.email)}</a>` : esc(s.email);
    const waUrl = utils.whatsappUrl(data.booking.floatingMessage);

    render('contact-info', `
      <div class="contact-item">
        <span class="contact-item__icon">${icon('map-pin', 20, '')}</span>
        <div><h3>Morada</h3><p>${esc(s.address)}<br>${esc(s.postalCode)}</p></div>
      </div>
      <div class="contact-item">
        <span class="contact-item__icon">${icon('clock', 20, '')}</span>
        <div>
          <h3>Horário de funcionamento</h3>
          <ul class="hours">${s.openingHours.map((h) => `<li><span>${esc(h.days)}</span><span>${esc(h.hours)}</span></li>`).join('')}</ul>
        </div>
      </div>
      <div class="contact-item">
        <span class="contact-item__icon">${icon('phone', 20, '')}</span>
        <div><h3>Telefone</h3><p>${phoneHtml}</p></div>
      </div>
      <div class="contact-item">
        <span class="contact-item__icon">${icon('mail', 20, '')}</span>
        <div><h3>Email</h3><p>${emailHtml}</p></div>
      </div>
      <div class="contact__buttons">
        <a class="btn btn--primary magnetic" href="${esc(waUrl)}" target="_blank" rel="noopener">${icon('whatsapp', 20)} WhatsApp</a>
        <a class="btn btn--glass magnetic" href="${esc(data.social.instagram)}" target="_blank" rel="noopener">${icon('instagram', 20)} Instagram</a>
      </div>`);

    const mapEl = $('[data-render="map"]');
    if (s.mapEmbedUrl) {
      mapEl.innerHTML = `<iframe src="${esc(s.mapEmbedUrl)}" title="Mapa com a localização do ${esc(s.name)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>`;
    } else {
      mapEl.classList.add('map--placeholder');
      mapEl.innerHTML = `
        <div class="map__pin">
          <span class="map__marker">${icon('map-pin', 26, '')}</span>
          <p class="map__address">${esc(s.address)}</p>
          <a class="btn btn--glass btn--sm" href="${esc(mapLink())}" target="_blank" rel="noopener">Abrir no mapa ${icon('arrow-up-right', 16)}</a>
        </div>`;
    }
  }

  function renderSocial() {
    const waUrl = utils.whatsappUrl(data.booking.floatingMessage);
    render('social-links', `
      <a class="social-link" href="${esc(data.social.instagram)}" target="_blank" rel="noopener" aria-label="Instagram ${esc(data.social.instagramHandle)}">${icon('instagram', 20, '')}</a>
      <a class="social-link" href="${esc(waUrl)}" target="_blank" rel="noopener" aria-label="WhatsApp">${icon('whatsapp', 20, '')}</a>`);
    $('#waFloat').href = waUrl;
    $('#year').textContent = new Date().getFullYear();
  }

  /* ======================================================================
     2. NAVEGAÇÃO E SCROLL
     ====================================================================== */
  function initNav() {
    const nav = $('#nav');
    const progress = $('#scrollProgress');
    const wa = $('#waFloat');
    let ticking = false;

    const onScroll = () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - innerHeight;
      nav.classList.toggle('is-scrolled', y > 30);
      progress.style.setProperty('--progress', max > 0 ? (y / max).toFixed(4) : 0);
      wa.classList.toggle('is-visible', y > innerHeight * 0.6);
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
    }, { passive: true });
    onScroll();

    // Link ativo conforme a secção visível
    const links = $$('.nav__links a');
    const sections = links.map((a) => $(a.getAttribute('href'))).filter(Boolean);
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          links.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === `#${entry.target.id}`));
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      sections.forEach((s) => io.observe(s));
    }
  }

  function initMenu() {
    const burger = $('#burger');
    const overlay = $('#menuOverlay');
    const setOpen = (open, viaKeyboard = false) => {
      if (open === overlay.classList.contains('is-open')) return;
      overlay.classList.toggle('is-open', open);
      overlay.setAttribute('aria-hidden', String(!open));
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
      utils.lockScroll(open);
      // Só move o foco para o 1.º link quando o menu é aberto pelo teclado
      if (open && viaKeyboard) setTimeout(() => $('a', overlay).focus({ preventScroll: true }), 300);
    };
    burger.addEventListener('click', (e) => setOpen(!overlay.classList.contains('is-open'), e.detail === 0));
    overlay.addEventListener('click', (e) => { if (e.target.closest('a, button')) setOpen(false); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('is-open')) { setOpen(false); burger.focus(); }
    });
    window.addEventListener('resize', () => { if (innerWidth >= 900) setOpen(false); });
  }

  /* ======================================================================
     3. ANIMAÇÕES DE SCROLL (GSAP + ScrollTrigger, com fallback)
     ====================================================================== */
  function revealFallback() {
    const els = $$('[data-reveal]');
    utils.onVisible(els, (el) => el.classList.add('is-visible'), { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    $$('.manifesto__text .word').forEach((w) => w.classList.add('is-lit'));
  }

  function initScrollAnimations() {
    const reduced = utils.reducedMotion();
    if (reduced) {
      $$('[data-reveal]').forEach((el) => el.classList.add('is-visible'));
      document.documentElement.classList.add('no-motion');
      return;
    }
    if (!utils.hasGsap()) {
      document.documentElement.classList.add('no-gsap');
      revealFallback();
      return;
    }

    const { gsap, ScrollTrigger } = window;
    gsap.registerPlugin(ScrollTrigger);

    // Revelações em grupo (com pequeno atraso entre elementos)
    ScrollTrigger.batch('[data-reveal]', {
      start: 'top 88%',
      once: true,
      onEnter: (batch) => batch.forEach((el, i) => {
        el.style.setProperty('--delay', `${i * 0.1}s`);
        el.classList.add('is-visible');
      })
    });

    // Parallax: [data-speed] (positivo = mais lento, negativo = mais rápido)
    $$('[data-speed]').forEach((el) => {
      const speed = Number(el.dataset.speed);
      if (!speed) return;
      const inHero = el.closest('.hero');
      gsap.fromTo(el,
        { y: inHero ? 0 : speed * 120 },
        {
          y: inHero ? speed * 400 : speed * -120,
          ease: 'none',
          scrollTrigger: {
            trigger: inHero || el,
            start: inHero ? 'top top' : 'top bottom',
            end: 'bottom top',
            scrub: true
          }
        });
    });

    // Conteúdo do hero desvanece ao sair
    gsap.to('.hero__content', {
      opacity: 0, y: -60, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'center center', end: 'bottom top', scrub: true }
    });

    // Manifesto: palavras acendem com o scroll (fixado no desktop)
    const words = $$('.manifesto__text .word');
    const mm = gsap.matchMedia();
    const lightWords = (trigger, opts) => {
      ScrollTrigger.create({
        trigger,
        scrub: true,
        ...opts,
        onUpdate: (self) => {
          const lit = Math.round(self.progress * words.length);
          words.forEach((w, i) => w.classList.toggle('is-lit', i < lit));
        }
      });
    };
    mm.add('(min-width: 900px)', () => {
      lightWords('.manifesto__inner', { start: 'center center', end: '+=90%', pin: true });
    });
    mm.add('(max-width: 899px)', () => {
      lightWords('.manifesto__inner', { start: 'top 80%', end: 'bottom 35%' });
    });

    // Títulos de secção entram com leve deslizamento lateral
    $$('.section-title').forEach((title) => {
      gsap.from(title, {
        xPercent: -6, ease: 'none',
        scrollTrigger: { trigger: title, start: 'top bottom', end: 'top 40%', scrub: true }
      });
    });

    // Recalcula posições depois de as imagens carregarem
    window.addEventListener('load', () => ScrollTrigger.refresh());

    // Se o URL trouxer #secção, volta a posicionar (o pin altera a altura da página)
    if (location.hash && $(location.hash)) {
      ScrollTrigger.refresh();
      $(location.hash).scrollIntoView({ behavior: 'auto' });
    }
  }

  /* ======================================================================
     4. PRELOADER
     ====================================================================== */
  function initPreloader(onDone) {
    const pre = $('#preloader');
    const minTime = utils.reducedMotion() ? 0 : 1700;
    const started = performance.now();
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      const wait = Math.max(0, minTime - (performance.now() - started));
      setTimeout(() => {
        pre.classList.add('is-done');
        document.body.classList.add('is-ready');
        onDone();
      }, wait);
    };
    if (document.readyState === 'complete') finish();
    else window.addEventListener('load', finish, { once: true });
    setTimeout(finish, 3200);          // nunca bloquear mais de ~3s em redes lentas
  }

  /* ======================================================================
     ARRANQUE
     ====================================================================== */
  function start() {
    // Conteúdo
    bindContent();
    renderPillars();
    renderManifesto();
    renderCoaches();
    renderClasses();
    renderStats();
    renderCompare();
    renderPlans();
    renderTestimonials();
    renderFaq();
    renderContact();
    renderSocial();
    utils.hydrateImages();
    $$('.split-letters').forEach(utils.splitLetters);

    // Módulos
    ui.modal.init();
    Velours.schedule.init();
    Velours.booking.init();
    ui.initFlipCards();
    ui.initAccordion($('.accordion'));
    ui.initPillars();
    ui.initCarousel();
    ui.initCompare();
    ui.initPricingToggle();
    ui.initCounters();
    ui.initTilt('.class-card');
    ui.initMagnetic();
    ui.initCursor();
    ui.initHeroMouse();

    // Navegação
    initNav();
    initMenu();

    // Animações arrancam quando o preloader sai
    initPreloader(initScrollAnimations);
  }

  start();
})(window.Velours);
