// Render research grid from manifest
(async function(){
  const grid = document.getElementById('research-grid');
  if (!grid) return;
  try {
    const res = await fetch('/research/manifest.json');
    const items = await res.json();
    grid.innerHTML = items.map(item => {
      const hasValidLink = item.link && item.link !== '#' && item.link.trim() !== '';
      
      return `
        <a class="card reveal" href="${hasValidLink ? item.link : '#'}" ${hasValidLink ? 'target="_blank" rel="noopener"' : 'onclick="event.preventDefault(); return false;"'}>
          <img src="${item.thumbnail || '/assets/images/placeholder.svg'}" alt="${item.title}" loading="lazy" onerror="this.onerror=null;this.src='/assets/images/placeholder.svg'" />
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
