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

  // Interactive Placeholder Functionality
  function createInteractivePlaceholder() {
    // Find all placeholder images and replace them with interactive versions
    document.querySelectorAll('img[src*="placeholder.svg"], img[src*="placeholder.png"]').forEach(img => {
      // Skip if already processed
      if (img.parentElement.classList.contains('interactive-placeholder-wrapper')) return;
      
      // Create the interactive placeholder
      const interactivePlaceholder = document.createElement('div');
      interactivePlaceholder.className = 'interactive-placeholder';
      interactivePlaceholder.innerHTML = `
        <div class="placeholder-content">
          <div class="placeholder-title">UNDER CONSTRUCTION</div>
          <div class="placeholder-subtitle">Coming Soon</div>
          <div class="button-container">
            <button class="danger-btn" data-action="danger-click">
              <span class="btn-text">DANGER</span>
              <div class="tooltip">do not click!</div>
            </button>
          </div>
        </div>
      `;
      
      // Replace the image with our interactive placeholder
      img.parentNode.replaceChild(interactivePlaceholder, img);
      
      // Add event listener to the button with proper event handling
      const dangerBtn = interactivePlaceholder.querySelector('.danger-btn');
      dangerBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        handleDangerClick();
      });
      
      // Prevent the card link from being triggered when clicking on the placeholder
      interactivePlaceholder.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
      });
    });
  }

  // Initialize interactive placeholders when DOM is ready and after dynamic content loads
  function initPlaceholders() {
    createInteractivePlaceholder();
    // Re-run after a short delay to catch dynamically loaded content
    setTimeout(createInteractivePlaceholder, 500);
    setTimeout(createInteractivePlaceholder, 1000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPlaceholders);
  } else {
    initPlaceholders();
  }

  // Global function for danger button click
  window.handleDangerClick = function() {
    console.log('Danger button clicked! Redirecting to danger zone...');
    // Store the current page URL for return navigation
    sessionStorage.setItem('returnUrl', window.location.href);
    // Navigate to danger zone
    window.location.href = '/assets/images/danger-zone.html';
  };
})();
