// Render projects grid from manifest
(async function(){
  const grid = document.getElementById('projects-grid');
  if (!grid) return;
  try {
    const res = await fetch('/projects/manifest.json');
    const items = await res.json();
    grid.innerHTML = items.map(item => `
      <a class="card reveal" href="${item.github}" target="_blank" rel="noopener" aria-label="${item.title} on GitHub">
        <img src="${item.thumbnail || '/assets/images/placeholder.svg'}" alt="${item.title}" loading="lazy" onerror="this.onerror=null;this.src='/assets/images/placeholder.svg'" />
        <h3>${item.title}</h3>
        <p>${item.description || ''}</p>
        <div class="meta">${item.stack || ''}</div>
      </a>
    `).join('');
  } catch (e) {
    grid.innerHTML = '<p class="lede">Add entries under /projects/items as JSON and rebuild manifest.</p>';
  }
})();
