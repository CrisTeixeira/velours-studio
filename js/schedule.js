/* ==========================================================================
   HORÁRIO INTERATIVO
   • Separadores por dia (com destaque de "Hoje")
   • Filtro por modalidade
   • Indicador "A decorrer" com barra de progresso e "A seguir"
   • Funções auxiliares usadas noutros módulos (próximas aulas, total semanal)

   Expõe: window.Velours.schedule
   ========================================================================== */

(function (Velours) {
  'use strict';

  const { $, $$, esc, icon, toMinutes, toTime, weekdayIndex } = Velours.utils;
  const data = window.STUDIO_DATA;

  const state = {
    day: weekdayIndex(),   // 0 = Segunda
    filter: 'all'
  };
  let refreshTimer = null;

  /* ---------- Ajudantes de dados ---------- */
  const classById = (id) => data.classes.find((c) => c.id === id);
  const dayKey = (index) => data.days[index].key;

  /** Aulas de um dia, ordenadas, com hora de fim calculada */
  function sessionsFor(index) {
    return (data.schedule[dayKey(index)] || [])
      .map((s) => {
        const cls = classById(s.classId);
        if (!cls) {
          console.warn(`[Velours] Modalidade "${s.classId}" no horário não existe em classes.`);
          return null;
        }
        const start = toMinutes(s.time);
        const end = start + (cls.duration || 50);
        return { ...s, cls, start, end, endTime: toTime(end) };
      })
      .filter(Boolean)
      .sort((a, b) => a.start - b.start);
  }

  const nowMinutes = () => {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  };

  /** Data (dia do mês) de cada separador da semana atual */
  function weekDates() {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - weekdayIndex(today));
    return data.days.map((_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  }

  /* ---------- Renderização ---------- */
  function renderTabs() {
    const tabs = $('#dayTabs');
    const dates = weekDates();
    const todayIdx = weekdayIndex();
    tabs.innerHTML = data.days.map((d, i) => {
      const empty = !sessionsFor(i).length;
      return `
        <button class="day-tab${i === todayIdx ? ' is-today' : ''}${empty ? ' is-empty' : ''}" type="button" role="tab"
          id="tab-${d.key}" aria-controls="sessionList" aria-selected="${i === state.day}" tabindex="${i === state.day ? 0 : -1}"
          data-day="${i}" aria-label="${esc(d.long)}${i === todayIdx ? ' (hoje)' : ''}">
          <span class="day-tab__short">${esc(d.short)}</span>
          <span class="day-tab__date">${dates[i].getDate()}</span>
        </button>`;
    }).join('');
  }

  function renderFilters() {
    const wrap = $('#classFilter');
    const groupClasses = data.classes.filter((c) => !c.appointment);
    wrap.innerHTML = [{ id: 'all', name: 'Todas' }, ...groupClasses].map((c) =>
      `<button class="chip" type="button" data-filter="${esc(c.id)}" aria-pressed="${state.filter === c.id}">${esc(c.name)}</button>`
    ).join('');
  }

  function renderSessions() {
    const list = $('#sessionList');
    const isToday = state.day === weekdayIndex();
    const now = nowMinutes();
    const all = sessionsFor(state.day);
    const sessions = all.filter((s) => state.filter === 'all' || s.classId === state.filter);
    list.setAttribute('aria-labelledby', `tab-${dayKey(state.day)}`);

    if (!sessions.length) {
      const closed = !all.length;
      list.innerHTML = `
        <div class="session-empty">
          <strong>${closed ? 'Dia de descanso' : 'Sem aulas desta modalidade'}</strong>
          ${closed ? 'O estúdio está encerrado neste dia.' : 'Experimenta outro dia ou outra modalidade.'}
        </div>`;
      return;
    }

    const nextIdx = isToday ? sessions.findIndex((s) => s.start > now) : -1;

    // Se as aulas de hoje já terminaram, sugere o próximo dia com aulas
    let hint = '';
    if (isToday && sessions.every((s) => now >= s.end)) {
      const nextDay = [1, 2, 3, 4, 5, 6].map((o) => (state.day + o) % 7).find((i) => sessionsFor(i).length);
      if (nextDay != null) {
        hint = `<div class="session-hint"><span>As aulas de hoje já terminaram.</span>
          <button class="btn btn--primary" type="button" data-goto-day="${nextDay}">Ver ${esc(data.days[nextDay].long)}</button></div>`;
      }
    }

    list.innerHTML = hint + sessions.map((s, i) => {
      const live = isToday && now >= s.start && now < s.end;
      const past = isToday && now >= s.end;
      const next = !live && i === nextIdx && !sessions.some((x) => now >= x.start && now < x.end);
      const cls = ['session', live && 'session--live', past && 'session--past', next && 'session--next'].filter(Boolean).join(' ');
      return `
        <article class="${cls}" ${live ? `data-progress="${(now - s.start) / (s.end - s.start)}"` : ''}>
          <div class="session__time"><strong>${esc(s.time)}</strong><span>até ${esc(s.endTime)}</span></div>
          <div>
            <h3 class="session__name">${esc(s.cls.name)}</h3>
            <div class="session__meta">
              ${live ? '<span class="badge badge--live">A decorrer</span>' : ''}
              ${next ? '<span class="badge badge--next">A seguir</span>' : ''}
              <span>${icon('user', 14, '')}${esc(s.coach)}</span>
              <span>${icon('clock', 14, '')}${s.cls.duration} min</span>
            </div>
          </div>
          ${past ? '' : `<button class="btn btn--glass" type="button" data-book-session data-class="${esc(s.classId)}" data-day="${state.day}" data-time="${esc(s.time)}" aria-label="Marcar ${esc(s.cls.name)} às ${esc(s.time)}">Marcar</button>`}
          ${live ? '<span class="session__progress" aria-hidden="true"></span>' : ''}
        </article>`;
    }).join('');

    // Barra de progresso da aula a decorrer
    $$('.session--live', list).forEach((el) => {
      $('.session__progress', el).style.setProperty('--p', el.dataset.progress);
    });
  }

  function selectDay(index, focus) {
    state.day = (index + 7) % 7;
    $$('.day-tab').forEach((t, i) => {
      t.setAttribute('aria-selected', String(i === state.day));
      t.tabIndex = i === state.day ? 0 : -1;
    });
    if (focus) $$('.day-tab')[state.day].focus();
    renderSessions();
  }

  /* ---------- API pública ---------- */

  /** Próximas `limit` aulas de uma modalidade a partir de agora (para o modal) */
  function nextSessions(classId, limit = 3) {
    const result = [];
    const today = weekdayIndex();
    const now = nowMinutes();
    for (let offset = 0; offset < 7 && result.length < limit; offset++) {
      const idx = (today + offset) % 7;
      sessionsFor(idx)
        .filter((s) => s.classId === classId && (offset > 0 || s.start > now))
        .forEach((s) => result.length < limit && result.push({ ...s, dayIndex: idx, offset }));
    }
    return result;
  }

  /** Aulas de uma modalidade num dia (para o formulário de marcação) */
  function sessionsOn(index, classId) {
    return sessionsFor(index).filter((s) => !classId || s.classId === classId);
  }

  /** Total de aulas de grupo por semana (estatística automática) */
  function countWeekly() {
    return data.days.reduce((sum, _, i) => sum + sessionsFor(i).length, 0);
  }

  function init() {
    if (!$('#dayTabs')) return;
    renderTabs();
    renderFilters();
    renderSessions();

    $('#dayTabs').addEventListener('click', (e) => {
      const tab = e.target.closest('[data-day]');
      if (tab) selectDay(Number(tab.dataset.day));
    });
    // Navegação por setas entre separadores (padrão ARIA tabs)
    $('#dayTabs').addEventListener('keydown', (e) => {
      const map = { ArrowRight: 1, ArrowLeft: -1, Home: -state.day, End: 6 - state.day };
      if (!(e.key in map)) return;
      e.preventDefault();
      selectDay(state.day + map[e.key], true);
    });

    $('#classFilter').addEventListener('click', (e) => {
      const chip = e.target.closest('[data-filter]');
      if (!chip) return;
      state.filter = chip.dataset.filter;
      $$('.chip').forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
      renderSessions();
    });

    $('#sessionList').addEventListener('click', (e) => {
      const goto = e.target.closest('[data-goto-day]');
      if (goto) return selectDay(Number(goto.dataset.gotoDay), true);
      const btn = e.target.closest('[data-book-session]');
      if (!btn) return;
      Velours.booking.open({
        classId: btn.dataset.class,
        dayIndex: Number(btn.dataset.day),
        time: btn.dataset.time
      });
    });

    // Atualiza o indicador "A decorrer" a cada minuto
    clearInterval(refreshTimer);
    refreshTimer = setInterval(() => {
      if (state.day === weekdayIndex()) renderSessions();
    }, 60000);
  }

  Velours.schedule = { init, nextSessions, sessionsOn, countWeekly, classById };
})(window.Velours);
