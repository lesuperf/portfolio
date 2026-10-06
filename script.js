const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let paused = reducedMotion.matches;
const motionButton = document.querySelector('.motion-toggle');
function setMotionState() {
  document.documentElement.classList.toggle('motion-paused', paused);
  document.documentElement.classList.toggle('js-motion', !paused);
  motionButton.setAttribute('aria-pressed', String(paused));
  motionButton.setAttribute('aria-label', paused ? 'Activer les animations' : 'Mettre les animations en pause');
  motionButton.firstElementChild.textContent = paused ? '▷' : 'Ⅱ';
}
setMotionState();
motionButton.addEventListener('click', () => { paused = !paused; setMotionState(); });
reducedMotion.addEventListener('change', event => { paused = event.matches; setMotionState(); });
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } });
}, { threshold: .12 });
document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
const progress = document.querySelector('.scroll-progress');
function updateProgress() {
  const distance = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = `${distance > 0 ? window.scrollY / distance * 100 : 0}%`;
}
window.addEventListener('scroll', updateProgress, { passive: true });
window.addEventListener('resize', updateProgress);
updateProgress();
document.querySelector('#year').textContent = new Date().getFullYear();
document.querySelectorAll('.expertise-card').forEach(card => {
  card.addEventListener('pointermove', event => {
    if (paused || event.pointerType === 'touch') return;
    const bounds = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${event.clientX - bounds.left}px`);
    card.style.setProperty('--my', `${event.clientY - bounds.top}px`);
  });
});
const canvas = document.querySelector('#network');
const context = canvas.getContext('2d');
const hero = document.querySelector('.hero');
let width = 0, height = 0, particles = [], lastFrame = 0;
let pointer = { x: -1000, y: -1000 };
function resizeNetwork() {
  width = hero.clientWidth; height = hero.clientHeight;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = width * ratio; canvas.height = height * ratio;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  particles = Array.from({ length: width < 700 ? 30 : 65 }, () => ({ x: Math.random() * width, y: Math.random() * height, vx: (Math.random() - .5) * .3, vy: (Math.random() - .5) * .3 }));
  drawNetwork(0);
}
hero.addEventListener('pointermove', event => { const rect = hero.getBoundingClientRect(); pointer = { x: event.clientX - rect.left, y: event.clientY - rect.top }; }, { passive: true });
hero.addEventListener('pointerleave', () => { pointer = { x: -1000, y: -1000 }; });
function drawNetwork(step) {
  context.clearRect(0, 0, width, height);
  particles.forEach((point, index) => {
    point.x = (point.x + point.vx * step + width) % width;
    point.y = (point.y + point.vy * step + height) % height;
    context.fillStyle = '#c1f76b55'; context.beginPath(); context.arc(point.x, point.y, 1.2, 0, Math.PI * 2); context.fill();
    for (let next = index + 1; next < particles.length; next++) {
      const other = particles[next]; const distance = Math.hypot(point.x - other.x, point.y - other.y);
      if (distance < 135) { context.strokeStyle = `rgba(175,221,122,${(1 - distance / 135) * .12})`; context.beginPath(); context.moveTo(point.x, point.y); context.lineTo(other.x, other.y); context.stroke(); }
    }
    const proximity = Math.hypot(point.x - pointer.x, point.y - pointer.y);
    if (proximity < 190) { context.strokeStyle = `rgba(193,247,107,${(1 - proximity / 190) * .4})`; context.beginPath(); context.moveTo(point.x, point.y); context.lineTo(pointer.x, pointer.y); context.stroke(); }
  });
}
function animate(time) {
  const step = Math.min((time - lastFrame) / 16.67, 2); lastFrame = time;
  if (!paused && !document.hidden && hero.getBoundingClientRect().bottom > 0) drawNetwork(step);
  requestAnimationFrame(animate);
}
if (context) { resizeNetwork(); window.addEventListener('resize', resizeNetwork); requestAnimationFrame(animate); }
