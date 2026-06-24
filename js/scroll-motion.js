import { animate, inView, stagger } from 'https://cdn.jsdelivr.net/npm/motion@12.23.12/+esm';

const EASE = [0.22, 1, 0.36, 1];
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function revealHeader(el) {
  animate(el, { opacity: [0, 1], y: [32, 0] }, { duration: 0.7, ease: EASE });
}

function revealGroupHead(el) {
  animate(el, { opacity: [0, 1], y: [28, 0] }, { duration: 0.65, ease: EASE });
}

function revealGrid(grid) {
  const items = grid.querySelectorAll('.vid-item');
  if (!items.length) return;
  animate(items, { opacity: [0, 1], y: [24, 0] }, {
    delay: stagger(0.07, { ease: 'easeOut' }),
    duration: 0.5,
    ease: EASE,
  });
}

function revealNav(el) {
  animate(el, { opacity: [0, 1], y: [16, 0] }, { duration: 0.55, ease: EASE, delay: 0.1 });
}

export function initScrollMotion() {
  if (reduced) return;

  document.querySelectorAll('[data-motion="header"]').forEach(revealHeader);
  document.querySelectorAll('[data-motion="nav"]').forEach(revealNav);

  inView('.vid-group-head', revealGroupHead, { margin: '0px 0px -50px 0px' });
  inView('.vid-grid', revealGrid, { margin: '0px 0px -40px 0px' });
}

initScrollMotion();
