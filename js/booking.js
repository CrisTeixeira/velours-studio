/* ==========================================================================
   MARCAÇÕES
   Modal com formulário (nome, telefone, modalidade, dia, horário),
   validação e animação de sucesso. Sem servidor: ao enviar, abre o
   WhatsApp com a mensagem já preenchida para o número em data.js.

   Expõe: window.Velours.booking
   ========================================================================== */

(function (Velours) {
  'use strict';

  const { $, $$, esc, weekdayIndex } = Velours.utils;
  const data = window.STUDIO_DATA;
  const MODAL_ID = 'bookingModal';
  const DAYS_AHEAD = 14;      // quantos dias aparecem na lista "Dia"

  let form, fields, extraNote, successBox, waLink;
  let extraInfo = '';         // ex.: plano escolhido na secção de preços
  let submitted = false;      // após a 1.ª tentativa, valida enquanto se escreve

  const dateFmt = new Intl.DateTimeFormat('pt-PT', { weekday: 'short', day: 'numeric', month: 'short' });

  /* ---------- Opções dos selects ---------- */
  function fillClasses() {
    fields.cls.innerHTML = '<option value="">Escolhe a modalidade</option>' +
      data.classes.map((c) => `<option value="${esc(c.id)}">${esc(c.name)}</option>`).join('');
  }

  /** Próximas datas em que a modalidade escolhida tem aulas */
  function availableDates(classId) {
    const cls = Velours.schedule.classById(classId);
    const out = [];
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    for (let i = 0; i < DAYS_AHEAD; i++) {
      const date = new Date(now);
      date.setDate(now.getDate() + i);
      const idx = weekdayIndex(date);
      const daySessions = Velours.schedule.sessionsOn(idx);
      if (!daySessions.length) continue;                         // estúdio fechado
      if (!cls.appointment) {
        const times = Velours.schedule.sessionsOn(idx, classId).filter((s) => i > 0 || s.start > nowMin + 30);
        if (!times.length) continue;
      }
      out.push({ date, idx, offset: i });
    }
    return out;
  }

  function fillDays(preferredIndex) {
    const classId = fields.cls.value;
    if (!classId) {
      fields.day.innerHTML = '<option value="">Escolhe primeiro a modalidade</option>';
      fields.day.disabled = true;
      fillTimes();
      return;
    }
    const dates = availableDates(classId);
    fields.day.disabled = false;
    fields.day.innerHTML = '<option value="">Escolhe o dia</option>' + dates.map((d) => {
      const label = d.offset === 0 ? `Hoje · ${dateFmt.format(d.date)}` : d.offset === 1 ? `Amanhã · ${dateFmt.format(d.date)}` : dateFmt.format(d.date);
      return `<option value="${d.date.toISOString().slice(0, 10)}" data-idx="${d.idx}" data-offset="${d.offset}">${esc(label)}</option>`;
    }).join('');
    if (preferredIndex != null) {
      const match = $$('option', fields.day).find((o) => o.dataset.idx === String(preferredIndex));
      if (match) fields.day.value = match.value;
    }
    fillTimes();
  }

  function fillTimes(preferredTime) {
    const opt = fields.day.selectedOptions[0];
    const cls = Velours.schedule.classById(fields.cls.value);
    if (!cls || !opt || !opt.value) {
      fields.time.innerHTML = '<option value="">—</option>';
      fields.time.disabled = true;
      return;
    }
    fields.time.disabled = false;
    let options;
    if (cls.appointment) {
      options = data.booking.appointmentSlots.map((t) => ({ value: t, label: t }));
    } else {
      const nowMin = new Date().getHours() * 60 + new Date().getMinutes();
      options = Velours.schedule.sessionsOn(Number(opt.dataset.idx), cls.id)
        .filter((s) => opt.dataset.offset !== '0' || s.start > nowMin + 30)
        .map((s) => ({ value: s.time, label: `${s.time} · ${s.coach}` }));
    }
    fields.time.innerHTML = '<option value="">Hora</option>' +
      options.map((o) => `<option value="${esc(o.value)}">${esc(o.label)}</option>`).join('');
    if (preferredTime && options.some((o) => o.value === preferredTime)) fields.time.value = preferredTime;
    else if (options.length === 1) fields.time.value = options[0].value;
  }

  /* ---------- Validação ---------- */
  const rules = {
    name: (v) => (v.trim().length < 2 ? 'Indica o teu nome.' : ''),
    phone: (v) => {
      const clean = v.replace(/[\s().-]/g, '');
      if (!clean) return 'Indica o teu número de telefone.';
      const pt = /^(\+?351)?[29]\d{8}$/;          // números portugueses
      const intl = /^\+\d{8,15}$/;                  // outros países
      return pt.test(clean) || intl.test(clean) ? '' : 'Número inválido. Ex.: 912 345 678';
    },
    cls: (v) => (v ? '' : 'Escolhe uma modalidade.'),
    day: (v) => (v ? '' : 'Escolhe o dia.'),
    time: (v) => (v ? '' : 'Escolhe a hora.')
  };

  function validateField(key) {
    const input = fields[key];
    const msg = rules[key](input.value);
    const wrap = input.closest('.field');
    const err = document.getElementById(input.getAttribute('aria-describedby'));
    wrap.classList.toggle('has-error', Boolean(msg));
    input.setAttribute('aria-invalid', String(Boolean(msg)));
    err.textContent = msg;
    return !msg;
  }

  function validateAll() {
    const results = Object.keys(rules).map(validateField);
    const firstInvalid = Object.keys(rules).find((k) => fields[k].getAttribute('aria-invalid') === 'true');
    if (firstInvalid) fields[firstInvalid].focus();
    return results.every(Boolean);
  }

  /* ---------- Envio ---------- */
  function buildMessage() {
    const cls = Velours.schedule.classById(fields.cls.value);
    const dayLabel = fields.day.selectedOptions[0].textContent.replace(/^(Hoje|Amanhã) · /, '');
    const replacements = {
      nome: fields.name.value.trim(),
      modalidade: cls ? cls.name : '',
      dia: dayLabel,
      hora: fields.time.selectedOptions[0].textContent,
      extra: (extraInfo ? `\n${extraInfo}` : '') + `\nTelefone: ${fields.phone.value.trim()}`
    };
    return data.booking.message.replace(/\{(\w+)\}/g, (_, k) => replacements[k] ?? '');
  }

  function onSubmit(e) {
    e.preventDefault();
    submitted = true;
    if (!validateAll()) return;

    const url = Velours.utils.whatsappUrl(buildMessage());
    // Abrir de imediato (dentro do clique) evita o bloqueio de pop-ups
    window.open(url, '_blank', 'noopener');

    waLink.href = url;
    form.hidden = true;
    successBox.hidden = false;
    successBox.classList.remove('is-animating');
    void successBox.offsetWidth;
    successBox.classList.add('is-animating');
    $('.btn', successBox).focus({ preventScroll: true });
  }

  function reset() {
    form.reset();
    submitted = false;
    extraInfo = '';
    extraNote.hidden = true;
    form.hidden = false;
    successBox.hidden = true;
    successBox.classList.remove('is-animating');
    $$('.field', form).forEach((f) => f.classList.remove('has-error'));
    $$('[aria-invalid]', form).forEach((f) => f.removeAttribute('aria-invalid'));
    $$('.field__error', form).forEach((f) => { f.textContent = ''; });
    fillDays();
  }

  /**
   * Abre o modal, opcionalmente com dados pré-preenchidos.
   * @param {{classId?: string, dayIndex?: number, time?: string, extra?: string}} opts
   */
  function open(opts = {}) {
    reset();
    if (opts.classId) fields.cls.value = opts.classId;
    if (opts.extra) {
      extraInfo = opts.extra;
      extraNote.textContent = opts.extra;
      extraNote.hidden = false;
    }
    fillDays(opts.dayIndex);
    if (opts.time) fillTimes(opts.time);

    // Foca o primeiro campo por preencher
    const focus = !fields.name.value ? '#bfName' : '#bfPhone';
    Velours.ui.modal.open(MODAL_ID, { focus });
  }

  function init() {
    form = $('#bookingForm');
    if (!form) return;
    fields = {
      name: $('#bfName'),
      phone: $('#bfPhone'),
      cls: $('#bfClass'),
      day: $('#bfDay'),
      time: $('#bfTime')
    };
    extraNote = $('#bookingExtra');
    successBox = $('#bookingSuccess');
    waLink = $('#bookingWaLink');

    fillClasses();
    fillDays();

    fields.cls.addEventListener('change', () => { fillDays(); if (submitted) validateField('cls'); });
    fields.day.addEventListener('change', () => { fillTimes(); if (submitted) validateField('day'); });
    Object.keys(rules).forEach((key) => {
      fields[key].addEventListener('input', () => { if (submitted) validateField(key); });
      fields[key].addEventListener('blur', () => { if (submitted) validateField(key); });
    });
    form.addEventListener('submit', onSubmit);

    // Qualquer botão com [data-open-booking] abre o modal
    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('[data-open-booking]');
      if (!trigger) return;
      e.preventDefault();
      open({
        classId: trigger.dataset.class || '',
        extra: trigger.dataset.plan ? `Plano de interesse: ${trigger.dataset.plan}` : ''
      });
    });

    document.getElementById(MODAL_ID).addEventListener('modal:closed', reset);
  }

  Velours.booking = { init, open };
})(window.Velours);
