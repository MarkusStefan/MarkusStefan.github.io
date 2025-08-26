// Shared site behaviors
(function(){
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // live clock (hh:mm, 24h)
  const clk = document.getElementById('clock');
  function tick(){
    if (!clk) return;
    const d = new Date();
    const hh = String(d.getHours()).padStart(2,'0');
    const mm = String(d.getMinutes()).padStart(2,'0');
    clk.textContent = `${hh}:${mm}`;
  }
  tick();
  setInterval(tick, 30_000);

  // copy to clipboard for contact
  document.querySelectorAll('button.copy').forEach(btn => {
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(btn.getAttribute('data-copy') || '');
        btn.setAttribute('data-state', 'copied');
        setTimeout(()=>{ btn.removeAttribute('data-state'); }, 1000);
      } catch {}
    });
  });

  // Theme toggle (alt paper tone)
  const themeBtn = document.getElementById('themeToggle');
  if (themeBtn) {
    const current = localStorage.getItem('theme') || 'default';
    if (current === 'alt') document.documentElement.classList.add('theme-alt');
    themeBtn.addEventListener('click', () => {
      document.documentElement.classList.toggle('theme-alt');
      const isAlt = document.documentElement.classList.contains('theme-alt');
      localStorage.setItem('theme', isAlt ? 'alt' : 'default');
    });
  }

  // Keyboard shortcuts: t top, ? help, c copy email
  const kbd = document.getElementById('kbdHelp');
  document.addEventListener('keydown', (e) => {
    if (e.key === 't') { location.hash = '#top'; }
    if (e.key === '?') {
      if (kbd) { kbd.classList.toggle('show'); }
    }
    if (e.key === 'c') {
      const emailBtn = document.querySelector('button.copy[data-copy]');
      if (emailBtn) emailBtn.click();
    }
  });

  // Reading progress (posts)
  const progress = document.getElementById('progress');
  if (progress) {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.body.scrollHeight - window.innerHeight;
      const p = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0;
      progress.style.width = p + '%';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
})();
