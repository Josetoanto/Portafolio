// ── Scarcity engine (auto-update por mes, sin recargar) ──
(function() {
  const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                 'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

  function getMonthlySlots(date) {
    const mes = date.getMonth();
    const year = date.getFullYear();
    const dia = date.getDate();
    const diasDelMes = new Date(year, mes + 1, 0).getDate();
    const diasRestantes = diasDelMes - dia;

    // Si quedan menos de 10 dias para terminar el mes, forzar 1 slot.
    if (diasRestantes < 10) {
      return 1;
    }

    // Determinista por mes y año: solo puede devolver 1 o 2.
    const seed = (year * 12) + mes + 17;
    return (seed % 2 === 0) ? 1 : 2;
  }

  function buildScarcityMap(date) {
    const mes = date.getMonth();
    const year = date.getFullYear();
    const slots = getMonthlySlots(date);
    const ocupados = 4 - slots;

    const mesActual = MESES[mes];
    const mesSiguiente = MESES[(mes + 1) % 12];
    const yearSig = (mes === 11) ? year + 1 : year;

    return {
      'hero':            `Solo ${slots} espacios disponibles — ${mesActual} ${year}`,
      'slots':           String(slots),
      'next':            `"${mesSiguiente} ${yearSig}"`,
      'contact-badge':   `${ocupados} de 4 espacios ocupados — <strong>quedan ${slots} para ${mesActual}</strong>`,
      'contact-urgency': `Si no reservas ahora, el siguiente espacio abre en <strong>${mesSiguiente} ${yearSig}</strong>.`
    };
  }

  function renderScarcity() {
    const map = buildScarcityMap(new Date());

    document.querySelectorAll('[data-scarcity]').forEach(el => {
      const key = el.dataset.scarcity;
      if (map[key]) el.innerHTML = map[key];
    });
  }

  function msUntilNextMonth() {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 5);
    return Math.max(nextMonth.getTime() - now.getTime(), 1000);
  }

  function scheduleMonthlyRefresh() {
    setTimeout(() => {
      renderScarcity();
      scheduleMonthlyRefresh();
    }, msUntilNextMonth());
  }

  renderScarcity();

  // Refresco de respaldo por si la pestaña queda abierta mucho tiempo.
  setInterval(renderScarcity, 60 * 60 * 1000);
  scheduleMonthlyRefresh();
})();

// Reveal on scroll
const obs = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) setTimeout(() => e.target.classList.add('on'), i * 80);
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

// Active nav link on scroll
const secs  = document.querySelectorAll('section[id]');
const links = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
  let cur = '';
  secs.forEach(s => { if (window.scrollY >= s.offsetTop - 80) cur = s.id; });
  links.forEach(a => { a.classList.toggle('active', a.getAttribute('href') === '#' + cur); });
}, { passive: true });
