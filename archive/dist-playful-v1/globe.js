import { spherePoints, project } from './globe-math.mjs';

const stage = document.querySelector('.globe-stage');
const tileLayer = document.querySelector('.globe-tiles');
const pauseButton = document.querySelector('[data-globe="pause"]');
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
const brands = [
  ['spotify', '#1ed760', 'dark'], ['netflix', '#e50914', 'dark'],
  ['notion', '#191919', ''], ['youtube', '#ff0033', ''],
  ['applemusic', '#fa243c', ''], ['figma', '#ffffff', 'violet'],
  ['dropbox', '#0061ff', ''], ['twitch', '#9146ff', ''],
  ['github', '#ffffff', 'dark'], ['duolingo', '#58cc02', ''],
  ['appletv', '#191919', ''], ['discord', '#5865f2', ''],
  ['tidal', '#191919', 'lime'], ['icloud', '#3693f3', ''],
  ['crunchyroll', '#f47521', ''], ['zoom', '#0b5cff', ''],
];

const points = spherePoints(brands.length);
const tiles = brands.map(([slug, color, surface]) => {
  const tile = document.createElement('span');
  tile.className = `globe-tile${surface ? ` is-${surface}` : ''}`;
  const icon = document.createElement('span');
  icon.className = 'globe-logo';
  icon.style.color = color;
  icon.style.setProperty('--brand-icon', `url("assets/brands/${slug}.svg")`);
  tile.append(icon);
  tileLayer.append(tile);
  return tile;
});

// Slow exhibition motion is deliberately separate from fast UI transitions.
const globeMotion = { radiansPerSecond: 0.13, pixelsPerRadian: 190, initialYaw: 0.45, initialPitch: -0.13 };
let yaw = globeMotion.initialYaw;
let pitch = globeMotion.initialPitch;
let radius = 140;
let paused = motionPreference.matches;
let hovering = false;
let visible = false;
let frame = 0;
let previousTime = 0;
let pointer = null;

function render() {
  points.forEach((point, index) => {
    const p = project(point, yaw, pitch, radius);
    const tile = tiles[index];
    tile.style.transform = `translate3d(${p.x.toFixed(2)}px,${p.y.toFixed(2)}px,0) scale(${p.scale.toFixed(3)})`;
    tile.style.opacity = p.opacity.toFixed(3);
    tile.style.zIndex = String(Math.round((p.z + 1) * 50));
  });
}
function shouldMove() {
  return visible && !document.hidden && !paused && !hovering && !pointer && !motionPreference.matches;
}
function tick(time) {
  frame = 0;
  if (!shouldMove()) { previousTime = 0; return; }
  if (previousTime) yaw += Math.min((time - previousTime) / 1000, 0.05) * globeMotion.radiansPerSecond;
  previousTime = time;
  render();
  frame = requestAnimationFrame(tick);
}
function syncMotion() {
  if (frame) cancelAnimationFrame(frame);
  frame = 0;
  previousTime = 0;
  if (shouldMove()) frame = requestAnimationFrame(tick);
}
function updatePause() {
  const still = paused || motionPreference.matches;
  pauseButton.setAttribute('aria-pressed', String(still));
  const label = motionPreference.matches ? 'Reduced motion enabled' : still ? 'Play globe rotation' : 'Pause globe rotation';
  pauseButton.setAttribute('aria-label', label);
  pauseButton.title = label;
  pauseButton.querySelector('span').textContent = still ? '▶' : 'Ⅱ';
  pauseButton.disabled = motionPreference.matches;
  syncMotion();
}
pauseButton.addEventListener('click', () => { paused = !paused; updatePause(); });
document.querySelectorAll('[data-globe="left"], [data-globe="right"]').forEach(button => {
  button.addEventListener('click', () => {
    // Keyboard and button actions update immediately; no forced animation.
    yaw += button.dataset.globe === 'left' ? -Math.PI / 6 : Math.PI / 6;
    paused = true;
    render();
    updatePause();
  });
});

stage.addEventListener('pointerenter', event => {
  if (finePointer.matches && event.pointerType !== 'touch') { hovering = true; syncMotion(); }
});
stage.addEventListener('pointerleave', () => { hovering = false; syncMotion(); });
stage.addEventListener('pointerdown', event => {
  if (pointer || event.button !== 0) return;
  pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, yaw, pitch };
  stage.setPointerCapture(event.pointerId);
  stage.classList.add('is-dragging');
  syncMotion();
});
stage.addEventListener('pointermove', event => {
  if (!pointer || event.pointerId !== pointer.id) return;
  yaw = pointer.yaw + (event.clientX - pointer.x) / globeMotion.pixelsPerRadian;
  // Vertical touch gestures belong to page scrolling.
  if (event.pointerType !== 'touch') pitch = Math.max(-0.7, Math.min(0.7, pointer.pitch - (event.clientY - pointer.y) / globeMotion.pixelsPerRadian));
  if (!motionPreference.matches) render();
});
function endDrag(event) {
  if (!pointer || event.pointerId !== pointer.id) return;
  pointer = null;
  stage.classList.remove('is-dragging');
  if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
  render();
  syncMotion();
}
stage.addEventListener('pointerup', endDrag);
stage.addEventListener('pointercancel', endDrag);
stage.addEventListener('lostpointercapture', endDrag);
document.addEventListener('visibilitychange', syncMotion);
motionPreference.addEventListener('change', () => { paused = motionPreference.matches; updatePause(); render(); });
new ResizeObserver(([entry]) => {
  radius = Math.max(40, Math.min(entry.contentRect.width * 0.37, entry.contentRect.height * 0.41));
  render();
}).observe(stage);
new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; syncMotion(); }).observe(stage);
updatePause();
render();
