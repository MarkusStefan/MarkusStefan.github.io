// Render research grid from manifest
(async function(){
  const grid = document.getElementById('research-grid');
  if (!grid) return;
  try {
    const res = await fetch('/research/manifest.json');
    const items = await res.json();
    grid.innerHTML = items.map(item => `
      <a class="card reveal" href="${item.link || '#'}" target="_blank" rel="noopener">
        <img src="${item.thumbnail || '/images/placeholder.svg'}" alt="${item.title}" loading="lazy" onerror="this.onerror=null;this.src='/images/placeholder.svg'" />
        <h3>${item.title}</h3>
        <p>${item.description || ''}</p>
        <div class="meta">${item.date || ''}</div>
      </a>
    `).join('');
  } catch (e) {
    grid.innerHTML = '<p class="lede">Add entries under /research/items as JSON or markdown and rebuild manifest.</p>';
  }
})();
