document.addEventListener('DOMContentLoaded', () => {
  // Disable all links for screenshot mode
  document.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', (e) => e.preventDefault());
  });

  // Offline image fallbacks
  (function ensureImages() {
    const fallback = 'assets/images/banner.svg';
    // <img> tags
    document.querySelectorAll('img').forEach(img => {
      img.addEventListener('error', () => {
        if (img.src.endsWith(fallback)) return;
        img.removeAttribute('srcset');
        img.src = fallback;
      }, { once: true });
    });
    // Background images in inline styles (e.g., .card-img)
    const bgEls = Array.from(document.querySelectorAll('[style*="background-image"]'));
    bgEls.forEach(el => {
      const bg = getComputedStyle(el).backgroundImage;
      const m = bg && bg.match(/url\\(["']?(.*?)["']?\\)/);
      const url = m && m[1];
      if (!url || !/^https?:/i.test(url)) return;
      const test = new Image();
      test.onload = () => {};
      test.onerror = () => { el.style.backgroundImage = `url('${fallback}')`; };
      test.src = url;
    });
  })();

  // Year
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // Menu filter
  const buttons = Array.from(document.querySelectorAll('.chip'));
  const cards = Array.from(document.querySelectorAll('#menuGrid .card'));
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');
      cards.forEach(c => {
        const cat = c.getAttribute('data-category');
        const show = filter === 'all' || filter === cat;
        c.style.display = show ? '' : 'none';
      });
    });
  });

  // Lightbox
  if (window.GLightbox) {
    GLightbox({ selector: '.glightbox', touchNavigation: true, loop: true });
  }

  // CountUp on view
  const stats = document.querySelectorAll('.stat[data-count]');
  const started = new WeakSet();
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !started.has(entry.target)) {
        const end = Number(entry.target.getAttribute('data-count') || '0');
        if (window.countUp) {
          const c = new window.countUp.CountUp(entry.target, end, { duration: 2, separator: ' ' });
          c.start();
        } else {
          entry.target.textContent = end.toLocaleString('ru-RU');
        }
        started.add(entry.target);
      }
    });
  }, { threshold: .4 });
  stats.forEach(s => io.observe(s));
});

