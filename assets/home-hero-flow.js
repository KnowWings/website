(() => {
  const figure = document.querySelector('.intel-figure');
  if (!figure || !window.ResizeObserver) return;

  const cards = [...figure.querySelectorAll('.intel-card')];
  const nodes = [...figure.querySelectorAll('.intel-node')];
  const sources = figure.querySelector('.intel-sources');
  const outcome = figure.querySelector('.intel-outcome');
  const stacked = matchMedia('(max-width: 800px)');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  if (cards.length !== 6 || nodes.length !== 3 || !sources || !outcome) return;

  const ns = 'http://www.w3.org/2000/svg';
  function makeSvg(name, attributes, parent) {
    const element = document.createElementNS(ns, name);
    for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, value);
    parent?.append(element);
    return element;
  }

  const svg = makeSvg('svg', { class: 'intel-flow-overlay', 'aria-hidden': 'true', focusable: 'false' }, figure);
  const defs = makeSvg('defs', {}, svg);
  const arrowhead = makeSvg('marker', {
    id: 'intel-flow-arrowhead', viewBox: '0 0 7 8', markerWidth: 7, markerHeight: 8,
    refX: 6, refY: 4, orient: 'auto', markerUnits: 'userSpaceOnUse'
  }, defs);
  makeSvg('path', { d: 'M1 1 L6 4 L1 7', class: 'intel-flow-chevron' }, arrowhead);

  const streams = cards.map((_, index) => {
    const id = 'intel-evidence-stream-' + (index + 1);
    const path = makeSvg('path', { id }, defs);
    makeSvg('use', { href: '#' + id, class: 'intel-flow-stream' }, svg);
    const dash = makeSvg('use', { href: '#' + id, class: 'intel-flow-dash' }, svg);
    dash.style.animationDelay = (-index * .24) + 's';
    return path;
  });
  const trunk = makeSvg('path', { class: 'intel-flow-stream intel-flow-trunk' }, svg);

  const connections = nodes.map((_, index) => {
    const id = 'intel-process-connector-' + (index + 1);
    const path = makeSvg('path', {
      id, class: 'intel-flow-connection', 'marker-end': 'url(#intel-flow-arrowhead)'
    }, svg);
    const dot = makeSvg('circle', { class: 'intel-flow-signal', r: 2.6 }, svg);
    const timing = { begin: (-index * .19) + 's', repeatCount: 'indefinite' };
    const motion = makeSvg('animateMotion', { ...timing, calcMode: 'paced' }, dot);
    makeSvg('mpath', { href: '#' + id }, motion);
    const fade = makeSvg('animate', {
      ...timing, attributeName: 'opacity', values: '0;1;1;0', keyTimes: '0;.10;.90;1'
    }, dot);
    return { path, motion, fade };
  });

  function draw() {
    const origin = svg.getBoundingClientRect();
    if (!origin.width || !origin.height) return;

    function box(element) {
      const rect = element.getBoundingClientRect();
      const left = rect.left - origin.left;
      const top = rect.top - origin.top;
      return {
        left, top, right: left + rect.width, bottom: top + rect.height,
        x: left + rect.width / 2, y: top + rect.height / 2
      };
    }

    const stages = nodes.map(box);
    const first = stages[0];
    const panel = box(outcome);
    const cardBoxes = cards.map(box);

    if (stacked.matches) {
      // Keep each incoming stream in its own lane until it joins the shared line.
      const gutter = (cardBoxes[0].right + cardBoxes[1].left) / 2;
      const mergeY = box(sources).bottom + 6;
      for (const [index, card] of cardBoxes.entries()) {
        const fromLeft = index % 2 === 0;
        const edge = fromLeft ? card.right : card.left;
        const lane = gutter + (fromLeft ? -1 : 1) * (2 + Math.floor(index / 2) * 1.8);
        const turn = card.y + 9;
        streams[index].setAttribute('d', `M ${edge} ${card.y} Q ${lane} ${card.y} ${lane} ${turn} V ${mergeY - 5} Q ${lane} ${mergeY} ${gutter} ${mergeY}`);
      }
      trunk.setAttribute('d', `M ${gutter} ${mergeY} H ${first.x + 7} Q ${first.x} ${mergeY} ${first.x} ${mergeY + 7} V ${first.top}`);
    } else {
      const edge = cardBoxes[0].right;
      const mergeX = first.left - 10;
      const bend = edge + (mergeX - edge) * .55;
      for (const [index, card] of cardBoxes.entries()) {
        streams[index].setAttribute('d', `M ${edge} ${card.y} C ${bend} ${card.y} ${bend} ${first.y} ${mergeX} ${first.y}`);
      }
      trunk.setAttribute('d', `M ${mergeX} ${first.y} H ${first.left}`);
    }

    const last = stages[2];
    // The last mobile connector follows the panel's outer gutter, clear of the labels.
    const rail = origin.width - 7;
    const entry = panel.right - 22;
    const finalPath = stacked.matches
      ? `M ${last.right + 4} ${last.y} H ${rail - 7} Q ${rail} ${last.y} ${rail} ${last.y + 7} V ${panel.top - 17} Q ${rail} ${panel.top - 10} ${rail - 7} ${panel.top - 10} H ${entry + 6} Q ${entry} ${panel.top - 10} ${entry} ${panel.top - 4}`
      : `M ${last.right + 4} ${last.y} H ${panel.left - 5}`;

    connections.forEach(({ path, motion, fade }, index) => {
      const from = stages[index];
      const to = stages[index + 1];
      const geometry = to ? `M ${from.right + 4} ${from.y} H ${to.left - 4}` : finalPath;
      path.setAttribute('d', geometry);
      const duration = (path.getTotalLength() / 42) + 's';
      motion.setAttribute('dur', duration);
      fade.setAttribute('dur', duration);
    });

    figure.classList.add('is-flow-ready');
  }

  function syncMotionPreference() {
    if (reducedMotion.matches) svg.pauseAnimations();
    else svg.unpauseAnimations();
  }

  reducedMotion.addEventListener('change', syncMotionPreference);
  syncMotionPreference();

  let frame;
  const observer = new ResizeObserver(() => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(draw);
  });
  [figure, sources, outcome, ...nodes].forEach(element => observer.observe(element));
  draw();
})();
