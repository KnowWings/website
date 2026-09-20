(() => {
  const region = document.querySelector('.editorial-window');
  if (!region) return;
  const section = region.closest('.editorial-studies');
  const track = region.querySelector('.editorial-track');
  const cards = [...track.children];
  const counter = section.querySelector('#study-position');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const requestedCase = Number(new URLSearchParams(location.search).get('case'));
  let index = [1, 2, 3].includes(requestedCase) ? requestedCase + 2 : 3, busy = false, start = null, dragged = false, timer;
  function paint(animate = true) {
    track.classList.toggle('is-resetting', !animate);
    const width = parseFloat(getComputedStyle(cards[0]).width);
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    track.style.transform = `translateX(${region.clientWidth / 2 - width / 2 - index * (width + gap)}px)`;
    cards.forEach((card, i) => {
      const active = i === index, adjacent = Math.abs(i - index) === 1;
      const link = card.querySelector('a');
      const title = card.querySelector('h3').textContent;
      card.classList.toggle('is-active', active);
      card.classList.toggle('is-adjacent', adjacent);
      card.setAttribute('aria-hidden', String(!active && !adjacent));
      link.tabIndex = active || adjacent ? 0 : -1;
      link.setAttribute('aria-label', active ? `View case study: ${title}` : `Select case study: ${title}`);
      if (active) link.removeAttribute('role');
      else link.setAttribute('role', 'button');
    });
    counter.textContent = `0${index % 3 + 1} / 03`;
    // Commit the invisible loop reset before allowing the next transition.
    if (!animate) { void track.offsetWidth; track.classList.remove('is-resetting'); }
  }
  function finish() {
    const focused = cards.findIndex(card => card.contains(document.activeElement));
    const oldIndex = index;
    if (index < 3) index += 3;
    if (index > 5) index -= 3;
    if (index !== oldIndex) {
      paint(false);
      if (focused >= 0) cards[focused + index - oldIndex]?.querySelector('a').focus({preventScroll: true});
    }
    busy = false;
  }
  function move(step) {
    if (busy || !step) return;
    busy = true;
    index += Math.sign(step);
    paint();
    clearTimeout(timer);
    timer = setTimeout(finish, reduced.matches ? 190 : 650);
  }
  section.querySelectorAll('[data-step]').forEach(button => {
    button.addEventListener('click', () => move(Number(button.dataset.step)));
  });
  section.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      move(event.key === 'ArrowRight' ? 1 : -1);
    } else if (event.key === ' ' && event.target.matches('.editorial-card a[role="button"]')) {
      event.preventDefault();
      event.target.click();
    }
  });
  region.addEventListener('click', event => {
    const card = event.target.closest('.editorial-card');
    if (!card) return;
    if (dragged || busy) { event.preventDefault(); dragged = false; return; }
    const selected = cards.indexOf(card);
    if (selected !== index) {
      event.preventDefault();
      move(selected - index);
    }
  });
  region.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    start = {x: event.clientX, y: event.clientY};
    dragged = false;
  });
  region.addEventListener('pointermove', event => {
    if (start && Math.abs(event.clientX - start.x) > 10) dragged = true;
  });
  window.addEventListener('pointerup', event => {
    if (!start) return;
    const dx = event.clientX - start.x, dy = event.clientY - start.y;
    start = null;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) {
      dragged = true;
      move(dx < 0 ? 1 : -1);
    }
  });
  region.addEventListener('pointercancel', () => { start = null; dragged = false; });
  region.addEventListener('dragstart', event => event.preventDefault());
  new ResizeObserver(() => { clearTimeout(timer); finish(); paint(false); }).observe(region);
  reduced.addEventListener('change', () => { clearTimeout(timer); finish(); paint(false); });
  paint(false);
})();
