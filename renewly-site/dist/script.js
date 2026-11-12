// Where every "Explore Renewly" button goes. Set this to the App Store, Play Store or waitlist
// link when it exists; until then the buttons scroll to the features section.
const APP_URL = '';
if (APP_URL) {
  document.querySelectorAll('[data-cta]').forEach(link => {
    link.href = APP_URL;
    if (/^https?:/.test(APP_URL)) link.rel = 'noopener';
  });
}

// Load each photo shortly before it scrolls into view.
const lazyBackgrounds = document.querySelectorAll('.lazy-bg');
if ('IntersectionObserver' in window) {
  const bgObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('bg-in');
      bgObserver.unobserve(entry.target);
    });
  }, { rootMargin: '600px 0px' });
  lazyBackgrounds.forEach(el => bgObserver.observe(el));
} else {
  lazyBackgrounds.forEach(el => el.classList.add('bg-in'));
}

const nav = document.querySelector('.nav');
const menuButton = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('.mobile-nav');

function setMenu(open) {
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  mobileNav.hidden = !open;
}
menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !mobileNav.hidden) { setMenu(false); menuButton.focus(); }
});

const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 8);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

// Count a figure up from zero the first time its tile appears.
function countUp(el) {
  const target = Number(el.dataset.count);
  const format = n => '₦' + Math.round(n).toLocaleString('en-US');
  if (reducedMotion.matches) { el.textContent = format(target); return; }
  const start = performance.now() + 250;
  const duration = 1100;
  el.textContent = format(0);
  const step = now => {
    const t = Math.min(Math.max((now - start) / duration, 0), 1);
    el.textContent = format(target * (1 - Math.pow(1 - t, 3)));
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

const revealItems = document.querySelectorAll('.reveal');
const reveal = item => {
  item.classList.add('is-in');
  item.querySelectorAll('[data-count]').forEach(countUp);
};
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      reveal(entry.target);
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  revealItems.forEach(item => observer.observe(item));
} else {
  revealItems.forEach(reveal);
}

// Hero headline: the logo chip and the renewal chip roll to the next subscription together.
const rolls = [...document.querySelectorAll('[data-roll]')];
if (rolls.length && !reducedMotion.matches) {
  const faces = rolls[0].children.length; // the last face repeats the first, for a seamless loop
  let index = 0;
  const show = (i, animate = true) => rolls.forEach(roll => {
    roll.style.transition = animate ? '' : 'none';
    roll.style.transform = `translateY(${-i * 100}%)`;
  });
  setInterval(() => {
    if (document.hidden) return;
    index += 1;
    show(index);
    if (index === faces - 1) {
      setTimeout(() => {
        index = 0;
        show(0, false);
        rolls.forEach(roll => roll.offsetHeight);
        rolls.forEach(roll => { roll.style.transition = ''; });
      }, 900);
    }
  }, 2800);
}

// Hero flow: two tracks sweep from the screen edges into the phone; logo tiles travel along them.
const flow = document.querySelector('.flow');
if (flow && CSS.supports('offset-path', 'path("M0 0L1 1")')) {
  const hero = document.querySelector('.hero');
  const title = document.getElementById('hero-title');
  const phone = document.querySelector('.hero-stage .phone');
  const svg = flow.querySelector('.flow-lines');
  const paths = { l: flow.querySelector('.flow-path[data-side="l"]'), r: flow.querySelector('.flow-path[data-side="r"]') };
  const tiles = [...flow.querySelectorAll('.flow-tile')];
  const f = n => n.toFixed(1);

  const layout = () => {
    const H = hero.getBoundingClientRect();
    const T = title.getBoundingClientRect();
    // The phone may still be mid-entrance, so measure its resting box (no transform).
    const stage = phone.parentElement.getBoundingClientRect();
    const pl = stage.left + (stage.width - phone.offsetWidth) / 2 - H.left;
    const pr = pl + phone.offsetWidth;
    const pt = stage.top - H.top + parseFloat(getComputedStyle(phone.parentElement).paddingTop);
    const W = H.width;
    const narrow = W < 800;

    // Start points: beside the headline on wide screens, just above the phone on narrow ones.
    const ly0 = narrow ? pt - 10 : T.top - H.top + T.height * 0.3;
    const ry0 = narrow ? pt - 50 : T.bottom - H.top - 20;
    const ly1 = pt + (narrow ? 130 : 150);
    const ry1 = pt + (narrow ? 100 : 120);
    const lx1 = pl + 26, rx1 = pr - 26;
    const d = {
      l: `M ${f(-70)} ${f(ly0)} C ${f(pl * 0.45)} ${f(ly0 + 10)} ${f(pl - 60)} ${f(ly1 - 170)} ${f(lx1)} ${f(ly1)}`,
      r: `M ${f(W + 70)} ${f(ry0)} C ${f(W - (W - pr) * 0.4)} ${f(ry0 + 10)} ${f(pr + 70)} ${f(ry1 - 150)} ${f(rx1)} ${f(ry1)}`,
    };
    svg.setAttribute('width', W);
    svg.setAttribute('height', H.height);
    svg.setAttribute('viewBox', `0 0 ${f(W)} ${f(H.height)}`);
    paths.l.setAttribute('d', d.l);
    paths.r.setAttribute('d', d.r);
    tiles.forEach(t => { t.style.offsetPath = `path("${d[t.dataset.side]}")`; });
    flow.classList.add('is-ready');
  };

  // Four tiles per side are on screen; each takes the next brand every time it starts the track again.
  const brands = {
    l: [['netflix', '#e50914'], ['youtube', '#ff0000'], ['applemusic', '#fa243c'], ['figma', '#f24e1e'], ['duolingo', '#58cc02'], ['twitch', '#9146ff'], ['zoom', '#0b5cff'], ['tidal', '#000000']],
    r: [['spotify', '#1db954'], ['icloud', '#3693f3'], ['notion', '#000000'], ['dropbox', '#0061ff'], ['github', '#181717'], ['appletv', '#000000'], ['crunchyroll', '#f47521'], ['discord', '#5865f2']],
  };
  tiles.forEach(t => {
    let next = Number(t.style.getPropertyValue('--k'));
    t.addEventListener('animationiteration', () => {
      const pool = brands[t.dataset.side];
      next = (next + 4) % pool.length;
      const [slug, color] = pool[next];
      t.style.setProperty('--icon', `url(assets/brands/${slug}.svg)`);
      t.style.setProperty('--c', color);
    });
  });

  let queued = false;
  const relayout = () => { if (queued) return; queued = true; requestAnimationFrame(() => { queued = false; layout(); }); };
  layout();
  window.addEventListener('resize', relayout);
  if (document.fonts) document.fonts.ready.then(relayout);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => flow.classList.toggle('is-paused', !entry.isIntersecting)).observe(hero);
  }
}

// How it works: steps drive the phone. Plays on its own while in view until someone picks a step.
const how = document.querySelector('.how');
if (how) {
  const steps = [...how.querySelectorAll('.how-step')];
  const screens = [...how.querySelectorAll('.screen')];
  const panel = document.getElementById('how-panel');
  const caption = document.getElementById('how-caption');
  const captions = [
    'The new subscription form, filled in for Netflix at ₦4,800 a month.',
    'The reminder screen, set to one day before the 13 November billing date.',
    'The home screen, showing ₦18,450 spent this month and Netflix renewing tomorrow.',
  ];
  let current = 0;
  let manual = false;

  const select = (i, focus = false) => {
    current = i;
    steps.forEach((step, n) => {
      step.setAttribute('aria-selected', String(n === i));
      step.tabIndex = n === i ? 0 : -1;
    });
    screens.forEach((screen, n) => screen.classList.toggle('is-active', n === i));
    panel.setAttribute('aria-labelledby', steps[i].id);
    caption.textContent = captions[i];
    if (focus) steps[i].focus();
  };
  const takeOver = () => { manual = true; how.classList.remove('is-playing'); };

  steps.forEach((step, n) => {
    step.addEventListener('click', () => { takeOver(); select(n); });
    step.addEventListener('keydown', event => {
      const keys = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
      let next;
      if (event.key in keys) next = (n + keys[event.key] + steps.length) % steps.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = steps.length - 1;
      if (next === undefined) return;
      event.preventDefault();
      takeOver();
      select(next, true);
    });
  });

  how.addEventListener('animationend', event => {
    if (event.animationName === 'how-fill') select((current + 1) % steps.length);
  });
  how.addEventListener('pointerenter', () => how.classList.add('is-held'));
  how.addEventListener('pointerleave', () => how.classList.remove('is-held'));

  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    new IntersectionObserver(([entry]) => {
      how.classList.toggle('is-playing', entry.isIntersecting && !manual);
    }, { threshold: 0.45 }).observe(how);
  }
}

document.getElementById('year').textContent = new Date().getFullYear();
