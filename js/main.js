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
    documentation: '/docs/'
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
    window.location.href = '/images/danger-zone.html';
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

    function pixelBranchPath(x1, y1, x2, y2, grid) {
      const snap = (v) => Math.round(v / grid) * grid;
      const sx1 = snap(x1);
      const sy1 = snap(y1);
      const sx2 = snap(x2);
      const sy2 = snap(y2);
      const dx = sx2 - sx1;
      const dy = sy2 - sy1;
      if (dx === 0 || dy === 0) {
        return `M ${sx1} ${sy1} L ${sx2} ${sy2}`;
      }
      const dirX = Math.sign(dx);
      const dirY = Math.sign(dy);
      const stepsX = Math.round(Math.abs(dx) / grid);
      const stepsY = Math.round(Math.abs(dy) / grid);
      let cx = sx1;
      let cy = sy1;
      const cmds = [`M ${cx} ${cy}`];

      if (stepsY >= stepsX) {
        const preY = Math.floor((stepsY - stepsX) / 2);
        const postY = stepsY - stepsX - preY;
        if (preY > 0) {
          cy += dirY * preY * grid;
          cmds.push(`L ${cx} ${cy}`);
        }
        for (let i = 0; i < stepsX; i++) {
          cy += dirY * grid;
          cmds.push(`L ${cx} ${cy}`);
          cx += dirX * grid;
          cmds.push(`L ${cx} ${cy}`);
        }
        if (postY > 0) {
          cy += dirY * postY * grid;
          cmds.push(`L ${cx} ${cy}`);
        }
      } else {
        const c1 = Math.floor(stepsY / 2);
        const c2 = stepsY - c1;
        const midX = stepsX - stepsY;
        for (let i = 0; i < c1; i++) {
          cy += dirY * grid;
          cmds.push(`L ${cx} ${cy}`);
          cx += dirX * grid;
          cmds.push(`L ${cx} ${cy}`);
        }
        if (midX > 0) {
          cx += dirX * midX * grid;
          cmds.push(`L ${cx} ${cy}`);
        }
        for (let i = 0; i < c2; i++) {
          cx += dirX * grid;
          cmds.push(`L ${cx} ${cy}`);
          cy += dirY * grid;
          cmds.push(`L ${cx} ${cy}`);
        }
      }
      return cmds.join(' ');
    }

    function laneClass(lane) {
      return ['edu', 'work', 'branch', 'quest', 'quest'][lane] || 'edu';
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
      const width = svg.clientWidth || svgRect.width || 164;
      const height = stage.offsetHeight || svgRect.height || 900;
      if (!width || !height) return;

      const isRetro = document.documentElement.classList.contains('theme-retro');
      const isAlt = document.documentElement.classList.contains('theme-alt');
      const compact = width < 130;
      const G = compact ? 3 : 4;
      const snap = (v) => (isRetro ? Math.round(v / G) * G : v);

      const cs = getComputedStyle(document.documentElement);
      const cssVar = (name, fallback) => cs.getPropertyValue(name).trim() || fallback;
      const palette = {
        edu: {
          base: cssVar('--git-edu', '#16a34a'),
          light: cssVar('--git-edu-light', '#86efac'),
          dark: cssVar('--git-edu-dark', '#14532d')
        },
        work: {
          base: cssVar('--git-work', '#2563eb'),
          light: cssVar('--git-work-light', '#93c5fd'),
          dark: cssVar('--git-work-dark', '#1e3a8a')
        },
        branch: {
          base: cssVar('--git-branch', '#eab308'),
          light: cssVar('--git-branch-light', '#fef08a'),
          dark: cssVar('--git-branch-dark', '#854d0e')
        },
        quest: {
          base: cssVar('--git-quest', '#9333ea'),
          light: cssVar('--git-quest-light', '#d8b4fe'),
          dark: cssVar('--git-quest-dark', '#4c1d95')
        }
      };
      const retroOutline = cssVar('--retro-outline', '#000000');
      const retroShadow = cssVar('--git-pixel-shadow', 'rgba(0,0,0,0.42)');
      const retroHoverFg = cssVar('--retro-hover-fg', '#ff0000');
      const ringColor = cssVar('--git-dot-border', isAlt ? '#0a0a0c' : '#ffffff');

      svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
      if (isRetro) {
        svg.setAttribute('shape-rendering', 'crispEdges');
      } else {
        svg.removeAttribute('shape-rendering');
      }
      svg.innerHTML = '';

      if (!isRetro) {
        const defs = svgEl('defs', {}, svg);
        const blurFilter = svgEl('filter', {
          id: 'git3dBlur',
          x: '-60%',
          y: '-60%',
          width: '220%',
          height: '220%'
        }, defs);
        svgEl('feGaussianBlur', { stdDeviation: '2.4' }, blurFilter);

        Object.entries(palette).forEach(([key, p]) => {
          const grad = svgEl('radialGradient', {
            id: `git3dSphere-${key}`,
            cx: '50%',
            cy: '50%',
            r: '54%',
            fx: '32%',
            fy: '28%'
          }, defs);
          svgEl('stop', { offset: '0%', 'stop-color': p.light }, grad);
          svgEl('stop', { offset: '44%', 'stop-color': p.base }, grad);
          svgEl('stop', { offset: '100%', 'stop-color': p.dark }, grad);
        });
      }

      const laneX = [
        snap(width * 0.12),
        snap(width * 0.29),
        snap(width * 0.46),
        snap(width * 0.64),
        snap(width * 0.81)
      ];

      const nodes = {};
      cards.forEach(card => {
        const id = card.dataset.nodeId;
        const lane = Number(card.dataset.lane || 0);
        const r = card.getBoundingClientRect();
        const anchorY = snap((r.top - svgRect.top) + Math.min(24, r.height * 0.36));
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
      if (!n.n1 || !n.n14) return;

      const guidesLayer = svgEl('g', { class: 'git-guides-layer' }, svg);
      const connectorsLayer = svgEl('g', { class: 'git-connectors-layer' }, svg);
      const pathsLayer = svgEl('g', { class: 'git-paths-layer' }, svg);
      const dotsLayer = svgEl('g', { class: 'git-dots-layer' }, svg);

      function routeBranch(x1, y1, x2, y2) {
        return isRetro ? pixelBranchPath(x1, y1, x2, y2, G) : bezierY(x1, y1, x2, y2);
      }

      function stripMove(d) {
        return d.replace(/^M [^ ]+ [^ ]+ /, '');
      }

      function drawRail(d, laneCls, group) {
        const p = palette[laneCls] || palette.edu;
        const g = svgEl('g', { class: 'git-rail-group', 'data-group': group }, pathsLayer);
        if (isRetro) {
          svgEl('path', {
            d,
            fill: 'none',
            stroke: retroShadow,
            'stroke-width': G,
            'stroke-linecap': 'square',
            'stroke-linejoin': 'miter',
            transform: 'translate(2, 2)'
          }, g);
          svgEl('path', {
            d,
            fill: 'none',
            stroke: retroOutline,
            'stroke-width': G + 2,
            'stroke-linecap': 'square',
            'stroke-linejoin': 'miter'
          }, g);
          svgEl('path', {
            d,
            fill: 'none',
            stroke: p.base,
            'stroke-width': G,
            'stroke-linecap': 'square',
            'stroke-linejoin': 'miter'
          }, g);
        } else {
          svgEl('path', {
            d,
            class: 'git-rail',
            stroke: isAlt ? 'rgba(0, 0, 0, 0.6)' : 'rgba(15, 23, 42, 0.11)',
            'stroke-width': compact ? 2.6 : 3.1,
            transform: 'translate(0, 4.5)',
            filter: 'url(#git3dBlur)'
          }, g);
          svgEl('path', {
            d,
            class: 'git-rail',
            stroke: p.base,
            'stroke-width': compact ? 2.1 : 2.5
          }, g);
          svgEl('path', {
            d,
            class: 'git-rail',
            stroke: '#ffffff',
            opacity: isAlt ? '0.28' : '0.38',
            'stroke-width': '0.65',
            transform: 'translate(-0.35, -0.4)'
          }, g);
        }
      }

      function drawArrow(x, tipY, laneCls, group) {
        const p = palette[laneCls] || palette.edu;
        const g = svgEl('g', { class: 'git-rail-group', 'data-group': group }, pathsLayer);
        if (isRetro) {
          const sx = Math.round(x);
          const sy = Math.round(tipY);
          const rows = [
            { dy: -6, w: 2 },
            { dy: -4, w: 6 },
            { dy: -2, w: 10 },
            { dy: 0, w: 14 }
          ];
          // Shadow
          rows.forEach(row => {
            svgEl('rect', {
              x: sx - row.w / 2 + 2,
              y: sy + row.dy + 2,
              width: row.w,
              height: 2,
              fill: retroShadow
            }, g);
          });
          // Black pixel outline
          svgEl('rect', { x: sx - 2, y: sy - 8, width: 4, height: 2, fill: retroOutline }, g);
          rows.forEach(row => {
            svgEl('rect', {
              x: sx - row.w / 2 - 2,
              y: sy + row.dy,
              width: row.w + 4,
              height: 2,
              fill: retroOutline
            }, g);
          });
          svgEl('rect', { x: sx - 8, y: sy + 2, width: 16, height: 2, fill: retroOutline }, g);
          // Colored pixel fill + left highlight pixel
          rows.forEach(row => {
            svgEl('rect', {
              x: sx - row.w / 2,
              y: sy + row.dy,
              width: row.w,
              height: 2,
              fill: p.base
            }, g);
            if (row.w >= 6) {
              svgEl('rect', {
                x: sx - row.w / 2,
                y: sy + row.dy,
                width: 2,
                height: 2,
                fill: p.light
              }, g);
            }
          });
        } else {
          const hw = compact ? 3.8 : 4.4;
          const top = tipY - 5.2;
          const bot = tipY + 1.8;
          const chev = `M ${(x - hw).toFixed(1)} ${bot.toFixed(1)} L ${x.toFixed(1)} ${top.toFixed(1)} L ${(x + hw).toFixed(1)} ${bot.toFixed(1)}`;
          svgEl('path', {
            d: chev,
            class: 'git-rail',
            stroke: isAlt ? 'rgba(0, 0, 0, 0.6)' : 'rgba(15, 23, 42, 0.14)',
            'stroke-width': compact ? 2.4 : 2.8,
            transform: 'translate(0, 4.4)',
            filter: 'url(#git3dBlur)'
          }, g);
          svgEl('path', {
            d: chev,
            class: 'git-rail',
            stroke: p.base,
            'stroke-width': compact ? 2.0 : 2.35
          }, g);
        }
      }

      function drawMergeDot(x, y, laneCls, group) {
        const p = palette[laneCls] || palette.edu;
        const g = svgEl('g', { 'data-group': group }, dotsLayer);
        if (isRetro) {
          const sx = Math.round(x);
          const sy = Math.round(y);
          svgEl('rect', { x: sx - 2, y: sy - 2, width: 8, height: 8, fill: retroShadow }, g);
          svgEl('rect', { x: sx - 4, y: sy - 4, width: 8, height: 8, fill: retroOutline }, g);
          svgEl('rect', { x: sx - 2, y: sy - 2, width: 4, height: 4, fill: p.base }, g);
          svgEl('rect', { x: sx - 2, y: sy - 2, width: 2, height: 2, fill: p.light }, g);
        } else {
          const r = compact ? 2.7 : 3.2;
          svgEl('ellipse', {
            cx: x.toFixed(1),
            cy: (y + 3.2).toFixed(1),
            rx: (r + 0.4).toFixed(1),
            ry: (r * 0.56).toFixed(1),
            fill: isAlt ? 'rgba(0, 0, 0, 0.58)' : 'rgba(15, 23, 42, 0.13)',
            filter: 'url(#git3dBlur)'
          }, g);
          svgEl('circle', {
            cx: x.toFixed(1),
            cy: y.toFixed(1),
            r: (r + 1.5).toFixed(1),
            fill: ringColor
          }, g);
          svgEl('circle', {
            cx: x.toFixed(1),
            cy: y.toFixed(1),
            r: r.toFixed(1),
            fill: `url(#git3dSphere-${laneCls})`,
            class: 'git-merge-dot'
          }, g);
        }
      }

      function drawCommitNode(node) {
        const laneCls = laneClass(node.lane);
        const p = palette[laneCls] || palette.edu;
        const g = svgEl('g', {
          class: 'git-node-group',
          'data-node-id': node.id,
          'data-group': node.group
        }, dotsLayer);

        if (isRetro) {
          const sx = Math.round(node.x);
          const sy = Math.round(node.y);
          const half = compact ? 6 : 7;
          const inner = compact ? 4 : 5;
          const core = compact ? 2 : 3;

          // Hover targeting frame (hidden unless hovered)
          svgEl('rect', {
            x: sx - half - 3,
            y: sy - half - 3,
            width: (half + 3) * 2,
            height: (half + 3) * 2,
            fill: 'none',
            stroke: retroHoverFg,
            'stroke-width': 2,
            class: 'git-pixel-hover-box'
          }, g);
          // Hard pixel drop shadow
          svgEl('rect', { x: sx - inner + 2, y: sy - half + 2, width: inner * 2, height: half * 2, fill: retroShadow }, g);
          svgEl('rect', { x: sx - half + 2, y: sy - inner + 2, width: half * 2, height: inner * 2, fill: retroShadow }, g);
          // Stepped 8-bit pixel octagon black border
          svgEl('rect', { x: sx - inner, y: sy - half, width: inner * 2, height: half * 2, fill: retroOutline }, g);
          svgEl('rect', { x: sx - half, y: sy - inner, width: half * 2, height: inner * 2, fill: retroOutline }, g);
          // Colored inner pixel octagon
          svgEl('rect', { x: sx - inner, y: sy - core, width: inner * 2, height: core * 2, fill: p.base }, g);
          svgEl('rect', { x: sx - core, y: sy - inner, width: core * 2, height: inner * 2, fill: p.base }, g);
          // Bottom-right pixel shading
          svgEl('rect', { x: sx + core - 2, y: sy + inner - 2, width: 2, height: 2, fill: p.dark }, g);
          svgEl('rect', { x: sx + inner - 2, y: sy + core - 2, width: 2, height: 2, fill: p.dark }, g);
          svgEl('rect', { x: sx + core - 2, y: sy + core - 2, width: 2, height: 2, fill: p.dark }, g);
          // Top-left 16-bit specular pixel highlights
          svgEl('rect', { x: sx - core, y: sy - core, width: 2, height: 2, fill: '#ffffff' }, g);
          svgEl('rect', { x: sx - core + 2, y: sy - inner, width: 2, height: 2, fill: p.light }, g);
          svgEl('rect', { x: sx - inner, y: sy - core + 2, width: 2, height: 2, fill: p.light }, g);
        } else {
          const r = compact ? 4.8 : 5.7;
          // Soft diffused floating shadow (stays grounded while orb lifts)
          svgEl('ellipse', {
            cx: node.x.toFixed(1),
            cy: (node.y + 4.8).toFixed(1),
            rx: (r + 0.5).toFixed(1),
            ry: (r * 0.52).toFixed(1),
            fill: isAlt ? 'rgba(0, 0, 0, 0.65)' : 'rgba(15, 23, 42, 0.15)',
            filter: 'url(#git3dBlur)',
            class: 'git-node-shadow'
          }, g);
          // Concentric spatial hover halo
          svgEl('circle', {
            cx: node.x.toFixed(1),
            cy: node.y.toFixed(1),
            r: (r + 4.8).toFixed(1),
            stroke: p.base,
            class: 'git-node-halo'
          }, g);
          const body = svgEl('g', { class: 'git-node-body' }, g);
          // Crisp negative-space separation ring
          svgEl('circle', {
            cx: node.x.toFixed(1),
            cy: node.y.toFixed(1),
            r: (r + 2.2).toFixed(1),
            fill: ringColor
          }, body);
          // Precision satin 3D orb
          svgEl('circle', {
            cx: node.x.toFixed(1),
            cy: node.y.toFixed(1),
            r: r.toFixed(1),
            fill: `url(#git3dSphere-${laneCls})`,
            class: 'git-node-dot'
          }, body);
          // Subtle top-left specular gleam
          svgEl('circle', {
            cx: (node.x - r * 0.28).toFixed(1),
            cy: (node.y - r * 0.28).toFixed(1),
            r: (r * 0.2).toFixed(1),
            fill: 'rgba(255, 255, 255, 0.5)'
          }, body);
        }
      }

      // 0. Background vertical dotted rail guides
      laneX.forEach((x) => {
        if (isRetro) {
          svgEl('line', {
            x1: Math.round(x),
            y1: 4,
            x2: Math.round(x),
            y2: Math.round(height - 4),
            class: 'git-lane-guide',
            'stroke-width': '2',
            'stroke-dasharray': '2 6'
          }, guidesLayer);
        } else {
          svgEl('line', {
            x1: x.toFixed(1),
            y1: '4',
            x2: x.toFixed(1),
            y2: (height - 4).toFixed(1),
            class: 'git-lane-guide'
          }, guidesLayer);
        }
      });

      // 1. Horizontal connector bridges to cards on the right
      Object.values(n).forEach(node => {
        const laneCls = laneClass(node.lane);
        const p = palette[laneCls] || palette.edu;
        const cg = svgEl('g', {
          class: 'git-connector-group',
          'data-node-id': node.id,
          'data-group': node.group
        }, connectorsLayer);

        if (isRetro) {
          const sx = Math.round(node.x);
          const sy = Math.round(node.y);
          const endX = Math.round(width);
          svgEl('line', {
            x1: sx,
            y1: sy,
            x2: endX,
            y2: sy,
            class: `git-connector git-stroke-${laneCls}`,
            'stroke-width': '2',
            'stroke-dasharray': '4 4'
          }, cg);
          // Crisp pixel plug at card edge
          svgEl('rect', {
            x: endX - 4,
            y: sy - 2,
            width: 4,
            height: 4,
            fill: p.base,
            stroke: retroOutline,
            'stroke-width': 1
          }, cg);
        } else {
          svgEl('line', {
            x1: node.x.toFixed(1),
            y1: node.y.toFixed(1),
            x2: width.toFixed(1),
            y2: node.y.toFixed(1),
            class: `git-connector git-stroke-${laneCls}`
          }, cg);
        }
      });

      // 2. Lane 0: education (Green, leftmost) bottom -> top: n14 -> n13 -> n9 -> n7 -> n1
      const eduTopY = snap(Math.max(16, n.n1.y - 20));
      drawRail(`M ${n.n14.x.toFixed(1)} ${n.n14.y.toFixed(1)} L ${n.n1.x.toFixed(1)} ${eduTopY.toFixed(1)}`, 'edu', 'education');
      drawArrow(n.n1.x, eduTopY, 'edu', 'education');

      // 3. Military Service (Amber, Rail 2): forks right from n13 -> n12 -> merges left into edu above n12
      const yMilMerge = snap(n.n12.y - Math.min(28, Math.max(14, (n.n12.y - n.n11.y) * 0.48)));
      drawRail(routeBranch(n.n13.x, n.n13.y, n.n12.x, n.n12.y), 'branch', 'branch');
      drawRail(routeBranch(n.n12.x, n.n12.y, laneX[0], yMilMerge), 'branch', 'branch');
      drawMergeDot(laneX[0], yMilMerge, 'branch', 'branch');

      // 4. UIUC Exchange Semester (Amber, Rail 2): forks right from edu -> n11 -> merges left into edu before Tutor & B.Sc.
      const yUiucStart = snap(n.n11.y + Math.min(26, Math.max(12, (n.n12.y - n.n11.y) * 0.36)));
      const yUiucMerge = snap(n.n11.y - Math.min(26, Math.max(14, (n.n11.y - n.n10.y) * 0.58)));
      drawRail(routeBranch(laneX[0], yUiucStart, n.n11.x, n.n11.y), 'branch', 'branch');
      drawRail(routeBranch(n.n11.x, n.n11.y, laneX[0], yUiucMerge), 'branch', 'branch');
      drawMergeDot(laneX[0], yUiucMerge, 'branch', 'branch');

      // 5a. AAU Tutor in Econometrics (Blue, Rail 1): forks right from edu -> n10 -> merges left into edu before B.Sc. completion (n9)
      const yTutorStart = snap(n.n10.y + Math.min(18, Math.max(10, (n.n11.y - n.n10.y) * 0.32)));
      const yTutorMerge = snap(n.n10.y - Math.min(26, Math.max(14, (n.n10.y - n.n9.y) * 0.52)));
      drawRail(routeBranch(laneX[0], yTutorStart, n.n10.x, n.n10.y), 'work', 'work');
      drawRail(routeBranch(n.n10.x, n.n10.y, laneX[0], yTutorMerge), 'work', 'work');
      drawMergeDot(laneX[0], yTutorMerge, 'work', 'work');

      // 5b. Continuous BAWAG work trunk (Blue, Rail 1): forks right from edu at n7 -> n6 -> n4 -> n3 -> n2
      const workTopY = snap(Math.max(16, n.n2.y - 20));
      drawRail(routeBranch(n.n7.x, n.n7.y, n.n6.x, n.n6.y), 'work', 'work');
      drawRail(`M ${n.n6.x.toFixed(1)} ${n.n6.y.toFixed(1)} L ${n.n2.x.toFixed(1)} ${workTopY.toFixed(1)}`, 'work', 'work');
      drawArrow(n.n2.x, workTopY, 'work', 'work');

      // 6. Uniforce Consulting (Purple quest, Rail 3): forks right from edu at Aug 2023 (above n9) -> n8 -> straight up Rail 3 -> merges left into edu above n4 (Nov 2024)
      const yUniStart = snap(n.n8.y + Math.min(24, Math.max(12, (n.n9.y - n.n8.y) * 0.42)));
      const yUniMerge = snap(n.n4.y - Math.min(24, Math.max(12, (n.n4.y - n.n5.y) * 0.46)));
      drawRail(routeBranch(laneX[0], yUniStart, n.n8.x, n.n8.y), 'quest', 'quest');
      drawRail(`M ${n.n8.x.toFixed(1)} ${n.n8.y.toFixed(1)} L ${laneX[3].toFixed(1)} ${n.n4.y.toFixed(1)} ${stripMove(routeBranch(laneX[3], n.n4.y, laneX[0], yUniMerge))}`, 'quest', 'quest');
      drawMergeDot(laneX[0], yUniMerge, 'quest', 'quest');

      // 7. MedUni Vienna Research Internship (Purple quest, Rail 4): forks right from edu in Feb 2024 -> up Rail 4 through n5 -> merges left into edu above n3 (Dec 2025)
      const yMedStart = snap(n.n6.y - Math.min(20, Math.max(10, (n.n6.y - n.n4.y) * 0.25)));
      const yMedLand = snap(n.n4.y + Math.min(18, Math.max(10, (n.n6.y - n.n4.y) * 0.22)));
      const yMedMerge = snap(n.n3.y - Math.min(24, Math.max(12, (n.n3.y - n.n2.y) * 0.46)));
      drawRail(`${routeBranch(laneX[0], yMedStart, laneX[4], yMedLand)} L ${n.n5.x.toFixed(1)} ${n.n5.y.toFixed(1)}`, 'quest', 'quest');
      drawRail(`M ${n.n5.x.toFixed(1)} ${n.n5.y.toFixed(1)} L ${laneX[4].toFixed(1)} ${n.n3.y.toFixed(1)} ${stripMove(routeBranch(laneX[4], n.n3.y, laneX[0], yMedMerge))}`, 'quest', 'quest');
      drawMergeDot(laneX[0], yMedMerge, 'quest', 'quest');

      // 8. Commit nodes (3D spheres in modern mode, 16-bit pixel gems in retro mode)
      Object.values(n).forEach(drawCommitNode);

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

    const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    cards.forEach(card => {
      const id = card.dataset.nodeId;
      card.addEventListener('mouseenter', () => {
        svg.querySelectorAll(`[data-node-id="${id}"]`).forEach(el => el.classList.add('is-hovered'));
      });
      card.addEventListener('pointermove', (e) => {
        if (reducedMotion || document.documentElement.classList.contains('theme-retro')) return;
        const rect = card.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;
        const rx = ((0.5 - py) * 2.4).toFixed(2);
        const ry = ((px - 0.5) * 2.6).toFixed(2);
        card.style.setProperty('--rx', `${rx}deg`);
        card.style.setProperty('--ry', `${ry}deg`);
        card.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
        card.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
      });
      card.addEventListener('mouseleave', () => {
        svg.querySelectorAll(`[data-node-id="${id}"]`).forEach(el => el.classList.remove('is-hovered'));
        card.style.removeProperty('--rx');
        card.style.removeProperty('--ry');
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
