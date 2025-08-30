// Render blog grid from generated manifest and handle reading single posts
(async function(){
  const grid = document.getElementById('blog-grid');
  const params = new URLSearchParams(location.search);
  const slug = params.get('p');

  if (slug) {
    // Show a single post HTML if present
    const res = await fetch(`/blog/${slug}.html`).catch(()=>null);
    if (res && res.ok) {
      const html = await res.text();
      document.body.innerHTML = html; // replaces body with prerendered
      return;
    }
  }

  if (!grid) return;
    try {
      const res = await fetch('/blog/manifest.json');
      const items = await res.json();
      grid.innerHTML = items.map(item => {
        const href = item.link ? item.link : `/blog/${encodeURIComponent(item.slug)}.html`;
        const external = item.link ? ' target="_blank" rel="noopener"' : '';
        return `
        <a class="card reveal" href="${href}" aria-label="Open ${item.title}"${external}>
          <img src="${item.thumbnail || '/images/placeholder.svg'}" alt="${item.title}" loading="lazy" onerror="this.onerror=null;this.src='/images/placeholder.svg'" />
          <h3>${item.title}</h3>
          <p>${item.description || ''}</p>
          <div class="meta">${item.date || ''}</div>
        </a>`;
      }).join('');
  } catch (e) {
    grid.innerHTML = '<p class="lede">No posts yet. Add markdown files under /blog/posts</p>';
  }
})();
