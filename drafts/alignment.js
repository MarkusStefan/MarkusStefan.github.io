(() => {
  const STYLE_KEY = 'site-style';
  const THEME_KEY = 'theme';
  const ROUTE_ALIASES = {
    about: '/',
    home: '/',
    index: '/',
    '~mkoefler': '/',
    writing: '/blog/',
    blog: '/blog/',
    posts: '/blog/',
    research: '/research/',
    papers: '/research/',
    aligned: '/research/aligned-causal-representations/',
    causal: '/research/aligned-causal-representations/',
    report: '/research/aligned-causal-representations/',
    'aligned-causal-representations': '/research/aligned-causal-representations/',
    projects: '/projects/',
    code: '/projects/',
    cv: '/cv/',
    vitae: '/cv/',
    resume: '/cv/',
    docs: '/docs/',
    documentation: '/docs/',
    drafts: '/drafts/',
    draft: '/drafts/',
    'drafts/research': '/drafts/research/',
    'draft research': '/drafts/research/'
  };

  if (localStorage.getItem(STYLE_KEY) === 'retro') {
    document.documentElement.classList.add('theme-retro');
  }
  if (localStorage.getItem(THEME_KEY) === 'alt') {
    document.documentElement.classList.add('theme-alt');
  }

  function resolveLocationTarget(rawInput) {
    const raw = (rawInput || '').trim();
    if (!raw) return null;
    if (/^(https?:|mailto:)/i.test(raw)) return raw;
    const key = raw.toLowerCase().replace(/^\/+|\/+$/g, '');
    if (ROUTE_ALIASES[key]) return ROUTE_ALIASES[key];
    if (raw.startsWith('/')) return raw;
    if (/^[^\s]+\.[a-z]{2,}(\/|$)/i.test(raw)) return 'https://' + raw;
    let path = '/' + raw.replace(/^\/+/, '');
    if (!path.endsWith('/') && !/[.?#]/.test(path)) path += '/';
    return path;
  }

  function updateStyleButtons(buttons) {
    const isRetro = document.documentElement.classList.contains('theme-retro');
    buttons.forEach(btn => {
      btn.textContent = isRetro ? 'modern' : 'retro';
      btn.setAttribute('aria-pressed', String(isRetro));
      btn.title = isRetro ? 'Switch to modern design' : 'Switch to nostalgic old-school HTML style';
    });
  }

  function setRetroMode(isRetro, buttons) {
    document.documentElement.classList.toggle('theme-retro', isRetro);
    localStorage.setItem(STYLE_KEY, isRetro ? 'retro' : 'modern');
    if (!isRetro) {
      document.querySelectorAll('.retro-minimized, .retro-maximized').forEach(el => {
        el.classList.remove('retro-minimized', 'retro-maximized');
      });
      document.querySelectorAll('.retro-win-min, .retro-win-max').forEach(btn => {
        btn.setAttribute('aria-pressed', 'false');
      });
    }
    updateStyleButtons(buttons);
  }

  function injectRetroChrome(onCloseRetro) {
    const header = document.querySelector('.site-head');
    if (header && !document.querySelector('.retro-address-bar')) {
      const bar = document.createElement('div');
      bar.className = 'retro-only retro-address-bar';
      bar.innerHTML = `
        <div class="retro-nav-buttons">
          <button type="button" class="retro-nav-btn" data-nav="back" title="Back">&#9664; Back</button>
          <button type="button" class="retro-nav-btn" data-nav="forward" title="Forward">Forward &#9654;</button>
          <button type="button" class="retro-nav-btn" data-nav="reload" title="Reload">Reload</button>
        </div>
        <form class="retro-location-form" autocomplete="off">
          <label class="retro-loc-label" for="retroLocationInput">Location:</label>
          <input id="retroLocationInput" class="retro-url-box" type="text" list="retroSiteRoutes" spellcheck="false" aria-label="Navigate to URL or site section" />
          <datalist id="retroSiteRoutes">
            <option value="/">About</option>
            <option value="/blog/">Writing</option>
            <option value="/research/">Research</option>
            <option value="/research/aligned-causal-representations/">Aligned Causal Representations</option>
            <option value="/projects/">Projects</option>
            <option value="/cv/">CV</option>
            <option value="/docs/">Docs</option>
            <option value="/drafts/">Drafts</option>
            <option value="/drafts/research/">Drafts Research</option>
          </datalist>
          <button type="submit" class="retro-nav-btn retro-go-btn">Go</button>
        </form>
      `;
      header.insertAdjacentElement('afterend', bar);

      const input = bar.querySelector('#retroLocationInput');
      input.value = window.location.href;
      input.addEventListener('focus', () => input.select());

      bar.querySelector('[data-nav="back"]').addEventListener('click', () => window.history.back());
      bar.querySelector('[data-nav="forward"]').addEventListener('click', () => window.history.forward());
      bar.querySelector('[data-nav="reload"]').addEventListener('click', () => window.location.reload());

      bar.querySelector('.retro-location-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const target = resolveLocationTarget(input.value);
        if (!target) {
          input.value = window.location.href;
          return;
        }
        window.location.assign(target);
      });
    }

    const winEl = document.querySelector('main#main');
    if (winEl && !winEl.querySelector('.retro-window-titlebar')) {
      const titleBar = document.createElement('div');
      titleBar.className = 'retro-only retro-window-titlebar';

      const titleSpan = document.createElement('span');
      titleSpan.className = 'retro-win-title';
      titleSpan.textContent = `Netscape - [${document.title || 'Markus Koefler'}]`;

      const controls = document.createElement('div');
      controls.className = 'retro-win-controls';
      controls.innerHTML = `
        <button type="button" class="retro-win-btn retro-win-min" aria-label="Minimize window" aria-pressed="false" title="Minimize window">_</button>
        <button type="button" class="retro-win-btn retro-win-max" aria-label="Maximize window" aria-pressed="false" title="Maximize window">&#9633;</button>
        <button type="button" class="retro-win-btn retro-win-close" aria-label="Close retro window and switch to modern" title="Close (switch to modern)">X</button>
      `;

      titleBar.append(titleSpan, controls);
      winEl.prepend(titleBar);

      const minBtn = controls.querySelector('.retro-win-min');
      const maxBtn = controls.querySelector('.retro-win-max');
      const closeBtn = controls.querySelector('.retro-win-close');

      minBtn.addEventListener('click', () => {
        const isMin = winEl.classList.toggle('retro-minimized');
        minBtn.setAttribute('aria-pressed', String(isMin));
        minBtn.title = isMin ? 'Restore window' : 'Minimize window';
      });

      maxBtn.addEventListener('click', () => {
        winEl.classList.remove('retro-minimized');
        minBtn.setAttribute('aria-pressed', 'false');
        minBtn.title = 'Minimize window';
        const isMax = winEl.classList.toggle('retro-maximized');
        maxBtn.setAttribute('aria-pressed', String(isMax));
        maxBtn.title = isMax ? 'Restore window size' : 'Maximize window';
      });

      closeBtn.addEventListener('click', () => {
        onCloseRetro();
      });
    }
  }

  function initDraftRetro() {
    const styleButtons = document.querySelectorAll('.style-toggle');
    injectRetroChrome(() => setRetroMode(false, styleButtons));

    if (styleButtons.length > 0) {
      updateStyleButtons(styleButtons);
      styleButtons.forEach(btn => {
        if (btn.dataset.styleBound === '1') return;
        btn.dataset.styleBound = '1';
        btn.addEventListener('click', () => {
          const isRetro = !document.documentElement.classList.contains('theme-retro');
          setRetroMode(isRetro, styleButtons);
        });
      });
    }

    const themeBtn = document.getElementById('themeToggle');
    if (themeBtn && themeBtn.dataset.themeBound !== '1') {
      themeBtn.dataset.themeBound = '1';
      themeBtn.setAttribute('aria-pressed', String(document.documentElement.classList.contains('theme-alt')));
      themeBtn.addEventListener('click', () => {
        const isAlt = document.documentElement.classList.toggle('theme-alt');
        localStorage.setItem(THEME_KEY, isAlt ? 'alt' : 'default');
        themeBtn.setAttribute('aria-pressed', String(isAlt));
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDraftRetro);
  } else {
    initDraftRetro();
  }
})();

const demo = document.querySelector('[data-alignment-demo]');
if (demo) {
  const buttons = demo.querySelectorAll('[data-mode]');
  const output = demo.querySelector('[role="status"]');
  buttons.forEach(button => button.addEventListener('click', () => {
    const local = button.dataset.mode === 'local';
    buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    demo.querySelectorAll('[data-task]').forEach(task => {
      const mass = Number(task.dataset.mass);
      const friction = Number(task.dataset.friction);
      const label = local && mass === 2 ? 3 - friction : friction;
      task.dataset.label = String(label);
      task.querySelector('.code').textContent = `Code: (${mass}, ${label})`;
    });
    output.textContent = local
      ? 'Branch-local labels: the second label 1 means low friction for the light body and high friction for the heavy body. All four complete codes still identify different tasks.'
      : 'Global labels: the second label 1 means low friction for both bodies, and label 2 means high friction. All four complete codes identify different tasks.';
  }));
}
