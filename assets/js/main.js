// Shared site behaviors
(function(){
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
    const header = document.querySelector('.site-header');
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

    const winEl = document.querySelector('main.content, main.report');
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

  function initStyleToggle() {
    let styleBtn = document.getElementById('styleToggle');
    if (!styleBtn) {
      const header = document.querySelector('.site-header');
      if (header) {
        styleBtn = document.createElement('button');
        styleBtn.className = 'style-toggle';
        styleBtn.id = 'styleToggle';
        styleBtn.type = 'button';
        const socials = header.querySelector('.socials');
        if (socials) {
          socials.prepend(styleBtn);
        } else {
          header.appendChild(styleBtn);
        }
      }
    }

    const buttons = [];
    if (styleBtn) buttons.push(styleBtn);
    const footerBtn = document.getElementById('styleToggleFooter');
    if (footerBtn) buttons.push(footerBtn);
    document.querySelectorAll('.style-toggle').forEach(btn => {
      if (!buttons.includes(btn)) buttons.push(btn);
    });

    injectRetroChrome(() => setRetroMode(false, buttons));

    if (buttons.length === 0) return;

    updateStyleButtons(buttons);
    buttons.forEach(btn => {
      if (btn.dataset.styleBound === '1') return;
      btn.dataset.styleBound = '1';
      btn.addEventListener('click', () => {
        const isRetro = !document.documentElement.classList.contains('theme-retro');
        setRetroMode(isRetro, buttons);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStyleToggle);
  } else {
    initStyleToggle();
  }

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

  // Theme toggle (alt paper tone / CRT dark in retro)
  const themeBtn = document.getElementById('themeToggle');
  if (themeBtn) {
    themeBtn.setAttribute('aria-pressed', String(document.documentElement.classList.contains('theme-alt')));
    themeBtn.addEventListener('click', () => {
      const isAlt = document.documentElement.classList.toggle('theme-alt');
      localStorage.setItem('theme', isAlt ? 'alt' : 'default');
      themeBtn.setAttribute('aria-pressed', String(isAlt));
    });
  }

  // Keyboard shortcuts: t top, ? help, c copy email
  const kbd = document.getElementById('kbdHelp');
  document.addEventListener('keydown', (e) => {
    const t = e.target;
    if (t && (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable)) return;
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

  // Interactive SVG Git Graph Trajectory (bottom-to-top, Gitflow lanes left -> right branches)
  function initGitTrajectory() {
    const section = document.getElementById('about-timeline');
    const stage = document.getElementById('gitGraphStage');
    const svg = document.getElementById('gitGraphSvg');
    if (!section || !stage || !svg) return;

    const NS = 'http://www.w3.org/2000/svg';
    const cards = Array.from(stage.querySelectorAll('.git-commit[data-node-id]'));
    const filterButtons = Array.from(section.querySelectorAll('.git-filter-btn[data-branch-filter]'));

    function svgEl(tag, attrs, parent) {
      const el = document.createElementNS(NS, tag);
      for (const [k, v] of Object.entries(attrs)) {
        el.setAttribute(k, String(v));
      }
      if (parent) parent.appendChild(el);
      return el;
    }

    function bezierY(x1, y1, x2, y2) {
      const dy = (y2 - y1) * 0.55;
      return `M ${x1.toFixed(1)} ${y1.toFixed(1)} C ${x1.toFixed(1)} ${(y1 + dy).toFixed(1)}, ${x2.toFixed(1)} ${(y2 - dy).toFixed(1)}, ${x2.toFixed(1)} ${y2.toFixed(1)}`;
    }

    function laneClass(lane) {
      return ['edu', 'work', 'branch', 'quest'][lane] || 'edu';
    }

    function setFilter(branchFilter) {
      section.dataset.activeFilter = branchFilter;
      filterButtons.forEach(btn => {
        const active = btn.dataset.branchFilter === branchFilter;
        btn.classList.toggle('is-active', active);
        btn.setAttribute('aria-pressed', String(active));
      });
      cards.forEach(card => {
        const match = branchFilter === 'all' || card.dataset.group === branchFilter;
        card.classList.toggle('is-dimmed', !match);
        card.classList.toggle('is-highlighted', branchFilter !== 'all' && match);
      });
      svg.querySelectorAll('[data-group]').forEach(el => {
        const match = branchFilter === 'all' || el.getAttribute('data-group') === branchFilter;
        el.classList.toggle('is-dimmed', !match);
      });
    }

    function renderGraph() {
      const svgRect = svg.getBoundingClientRect();
      const width = svg.clientWidth || svgRect.width || 150;
      const height = stage.offsetHeight || svgRect.height || 900;
      if (!width || !height) return;

      svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
      svg.innerHTML = '';

      const laneX = [
        width * 0.16,
        width * 0.39,
        width * 0.62,
        width * 0.85
      ];

      const nodes = {};
      cards.forEach(card => {
        const id = card.dataset.nodeId;
        const lane = Number(card.dataset.lane || 0);
        const r = card.getBoundingClientRect();
        const anchorY = (r.top - svgRect.top) + Math.min(24, r.height * 0.36);
        nodes[id] = {
          id,
          el: card,
          lane,
          group: card.dataset.group || 'education',
          x: laneX[lane],
          y: anchorY
        };
      });

      const n = nodes;
      if (!n.n1 || !n.n13) return;

      const guidesLayer = svgEl('g', { class: 'git-guides-layer' }, svg);
      const connectorsLayer = svgEl('g', { class: 'git-connectors-layer' }, svg);
      const pathsLayer = svgEl('g', { class: 'git-paths-layer' }, svg);
      const dotsLayer = svgEl('g', { class: 'git-dots-layer' }, svg);

      // 0. Background vertical dotted rail guides (Gitflow style)
      laneX.forEach((x) => {
        svgEl('line', {
          x1: x.toFixed(1),
          y1: '4',
          x2: x.toFixed(1),
          y2: (height - 4).toFixed(1),
          class: 'git-lane-guide'
        }, guidesLayer);
      });

      // 1. Subtle horizontal connector lines to cards on the right
      Object.values(n).forEach(node => {
        svgEl('line', {
          x1: node.x.toFixed(1),
          y1: node.y.toFixed(1),
          x2: width.toFixed(1),
          y2: node.y.toFixed(1),
          class: `git-connector git-stroke-${laneClass(node.lane)}`,
          'data-node-id': node.id,
          'data-group': node.group
        }, connectorsLayer);
      });

      // 2. Lane 0: education (Green, leftmost) bottom -> top: n13 -> n12 -> n9 -> n7 -> n1
      const eduTopY = Math.max(16, n.n1.y - 20);
      svgEl('path', {
        d: `M ${n.n13.x.toFixed(1)} ${n.n13.y.toFixed(1)} L ${n.n1.x.toFixed(1)} ${eduTopY.toFixed(1)}`,
        class: 'git-rail git-stroke-edu',
        'data-group': 'education'
      }, pathsLayer);
      svgEl('polygon', {
        points: `${n.n1.x.toFixed(1)},${(eduTopY - 6).toFixed(1)} ${(n.n1.x - 4.5).toFixed(1)},${(eduTopY + 3).toFixed(1)} ${(n.n1.x + 4.5).toFixed(1)},${(eduTopY + 3).toFixed(1)}`,
        class: 'git-fill-edu',
        'data-group': 'education'
      }, pathsLayer);

      // 3. service/military (Amber, Lane 2): forks right from n12 -> n11 -> merges left into Lane 0
      const yMilMerge = n.n11.y - Math.min(28, Math.max(12, (n.n11.y - n.n10.y) * 0.45));
      svgEl('path', {
        d: bezierY(n.n12.x, n.n12.y, n.n11.x, n.n11.y),
        class: 'git-rail git-stroke-branch',
        'data-group': 'branch'
      }, pathsLayer);
      svgEl('path', {
        d: bezierY(n.n11.x, n.n11.y, laneX[0], yMilMerge),
        class: 'git-rail git-stroke-branch',
        'data-group': 'branch'
      }, pathsLayer);

      // 4. exchange/uiuc (Amber, Lane 2): forks right from Lane 0 -> n10 -> merges left into n9
      const yUiucStart = n.n10.y + Math.min(28, Math.max(12, (n.n11.y - n.n10.y) * 0.42));
      svgEl('path', {
        d: bezierY(laneX[0], yUiucStart, n.n10.x, n.n10.y),
        class: 'git-rail git-stroke-branch',
        'data-group': 'branch'
      }, pathsLayer);
      svgEl('path', {
        d: bezierY(n.n10.x, n.n10.y, n.n9.x, n.n9.y),
        class: 'git-rail git-stroke-branch',
        'data-group': 'branch'
      }, pathsLayer);

      // 5. Lane 1: work (Blue, second lane) forks right from n7 -> n6 -> n4 -> n3 -> n2
      const workTopY = Math.max(16, n.n2.y - 20);
      svgEl('path', {
        d: bezierY(n.n7.x, n.n7.y, n.n6.x, n.n6.y),
        class: 'git-rail git-stroke-work',
        'data-group': 'work'
      }, pathsLayer);
      svgEl('path', {
        d: `M ${n.n6.x.toFixed(1)} ${n.n6.y.toFixed(1)} L ${n.n2.x.toFixed(1)} ${workTopY.toFixed(1)}`,
        class: 'git-rail git-stroke-work',
        'data-group': 'work'
      }, pathsLayer);
      svgEl('polygon', {
        points: `${n.n2.x.toFixed(1)},${(workTopY - 6).toFixed(1)} ${(n.n2.x - 4.5).toFixed(1)},${(workTopY + 3).toFixed(1)} ${(n.n2.x + 4.5).toFixed(1)},${(workTopY + 3).toFixed(1)}`,
        class: 'git-fill-work',
        'data-group': 'work'
      }, pathsLayer);

      // 6. Uniforce Consulting (Amber, Lane 2): forks right from n9 -> n8 -> up Lane 2 -> merges left into Lane 1 above n4
      const yUniMerge = n.n4.y - Math.min(24, Math.max(12, (n.n4.y - n.n5.y) * 0.48));
      const yUniCurveStart = n.n4.y;
      svgEl('path', {
        d: bezierY(n.n9.x, n.n9.y, n.n8.x, n.n8.y),
        class: 'git-rail git-stroke-branch',
        'data-group': 'branch'
      }, pathsLayer);
      svgEl('path', {
        d: `M ${n.n8.x.toFixed(1)} ${n.n8.y.toFixed(1)} L ${laneX[2].toFixed(1)} ${yUniCurveStart.toFixed(1)} ${bezierY(laneX[2], yUniCurveStart, laneX[1], yUniMerge).replace(/^M [^ ]+ [^ ]+ /, '')}`,
        class: 'git-rail git-stroke-branch',
        'data-group': 'branch'
      }, pathsLayer);

      // 7. MedUni Vienna Research Internship (Purple, Lane 3): forks right above n6 -> straight up Lane 3 to n5 -> merges left into Lane 1 above n3
      const yMedStart = n.n6.y - Math.min(20, Math.max(10, (n.n6.y - n.n4.y) * 0.35));
      const yMedLand = n.n4.y + Math.min(18, Math.max(8, (n.n6.y - n.n4.y) * 0.28));
      const yMedMerge = n.n3.y - Math.min(24, Math.max(12, (n.n3.y - n.n2.y) * 0.48));
      svgEl('path', {
        d: `${bezierY(laneX[1], yMedStart, laneX[3], yMedLand)} L ${n.n5.x.toFixed(1)} ${n.n5.y.toFixed(1)}`,
        class: 'git-rail git-stroke-quest',
        'data-group': 'quest'
      }, pathsLayer);
      svgEl('path', {
        d: bezierY(n.n5.x, n.n5.y, laneX[1], yMedMerge),
        class: 'git-rail git-stroke-quest',
        'data-group': 'quest'
      }, pathsLayer);

      // 8. Bold dark-outlined commit circles (Gitflow style)
      Object.values(n).forEach(node => {
        svgEl('circle', {
          cx: node.x.toFixed(1),
          cy: node.y.toFixed(1),
          r: 7,
          class: `git-node-dot git-fill-${laneClass(node.lane)}`,
          'data-node-id': node.id,
          'data-group': node.group
        }, dotsLayer);
      });

      const currentFilter = section.dataset.activeFilter || 'all';
      if (currentFilter !== 'all') setFilter(currentFilter);
    }

    let rafId = 0;
    function scheduleRender() {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        renderGraph();
      });
    }

    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => setFilter(btn.dataset.branchFilter || 'all'));
    });

    cards.forEach(card => {
      const id = card.dataset.nodeId;
      card.addEventListener('mouseenter', () => {
        svg.querySelectorAll(`[data-node-id="${id}"]`).forEach(el => el.classList.add('is-hovered'));
      });
      card.addEventListener('mouseleave', () => {
        svg.querySelectorAll(`[data-node-id="${id}"]`).forEach(el => el.classList.remove('is-hovered'));
      });
    });

    scheduleRender();
    setTimeout(scheduleRender, 150);
    window.addEventListener('resize', scheduleRender, { passive: true });
    window.addEventListener('load', scheduleRender);
    section.addEventListener('animationend', scheduleRender);

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(scheduleRender);
    }
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(scheduleRender);
      ro.observe(stage);
    }
    const mo = new MutationObserver(scheduleRender);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGitTrajectory);
  } else {
    initGitTrajectory();
  }
})();
