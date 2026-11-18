// Render research grid from manifest
(async function(){
  const grid = document.getElementById('research-grid');
  if (!grid) return;
  const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  try {
    const res = await fetch('/research/manifest.json?v=20261118b');
    const items = await res.json();
    grid.innerHTML = items.map(item => {
      const hasValidLink = item.link && item.link !== '#' && item.link.trim() !== '';
      const thumbHtml = Array.isArray(item.thumbnails) && item.thumbnails.length > 0
        ? `<div class="card-thumb-grid" aria-label="${item.title}">
            ${item.thumbnails.map(t => {
              const src = (reducedMotion && t.poster) ? t.poster : t.src;
              return `<img src="${src}" alt="${t.alt || item.title}" loading="lazy" decoding="async" />`;
            }).join('')}
          </div>`
        : `<img src="${item.thumbnail || '/assets/images/placeholder.svg'}" alt="${item.title}" loading="lazy" onerror="this.onerror=null;this.src='/assets/images/placeholder.svg'" />`;
      
      return `
        <a class="card reveal" href="${hasValidLink ? item.link : '#'}" ${hasValidLink ? (item.link.startsWith('/') ? '' : 'target="_blank" rel="noopener"') : 'onclick="event.preventDefault(); return false;"'}>
          ${thumbHtml}
          <h3>${item.title}</h3>
          <p>${item.description || ''}</p>
          <div class="meta">${item.date || ''}</div>
        </a>
      `;
    }).join('');
  } catch (e) {
    grid.innerHTML = '<p class="lede">Add entries under /research/items as JSON or markdown and rebuild manifest.</p>';
  }
})();
