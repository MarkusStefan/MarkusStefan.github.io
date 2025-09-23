// fetch recent Medium posts and merge into blog/manifest.json
// run in CI on a schedule; no secrets needed for public RSS

import fs from 'fs';
import path from 'path';

const MEDIUM_USERNAME = 'markus.koefler11';
const RSS_URL = `https://medium.com/feed/@${MEDIUM_USERNAME}`;
const BLOG_DIR = path.join(process.cwd(), 'blog');
const MANIFEST = path.join(BLOG_DIR, 'manifest.json');
const IMG_DIR = path.join(process.cwd(), 'images', 'blog');

async function fetchRss(url) {
  const res = await fetch(url, {
    redirect: 'follow',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
      'Accept': 'application/rss+xml, application/xml;q=0.9, text/xml;q=0.8, */*;q=0.5'
    }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  return await res.text();
}

function stripHtml(html) {
  return (html || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

function parseRssItems(xml) {
  // naive XML parsing for Medium RSS items
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let m;
  while ((m = itemRegex.exec(xml)) !== null) {
    const block = m[1];
    const get = (tag) => (block.match(new RegExp(`<${tag}>([\s\S]*?)<\/${tag}>`)) || [,''])[1];
    const title = stripHtml(get('title'));
    const link = stripHtml(get('link'));
  const pubDate = stripHtml(get('pubDate'));
    const content = get('content:encoded') || get('description');
    const description = stripHtml(content).slice(0, 220);
    // basic date normalize with fallback
    let date = '';
    try {
      const d = new Date(pubDate);
      if (!isNaN(d.getTime())) date = d.toISOString().slice(0,10);
    } catch {}
    // thumbnail: Medium returns img in content; try to extract first
    const imgMatch = (content || '').match(/<img[^>]+src=["']([^"']+)["']/i);
    const thumbnail = imgMatch ? imgMatch[1] : '/assets/images/placeholder.svg';
    if (title && link) items.push({ title, link, date, description, thumbnail, slug: encodeURIComponent(title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')) });
  }
  return items;
}

async function main() {
  try {
    const xml = await fetchRss(RSS_URL);
    const mediumItems = parseRssItems(xml).slice(0, 12); // cap
    let itemsToUse = mediumItems;
    if (mediumItems.length === 0) {
      console.warn('No Medium items parsed from RSS. Trying rss2json fallback...');
      try {
        const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(RSS_URL)}`;
        const res = await fetch(apiUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        if (res.ok) {
          const data = await res.json();
          const mapped = Array.isArray(data.items) ? data.items.map(it => {
            const clean = (s) => (s||'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
            const contentHtml = it.content || it.description || '';
            const imgMatch = contentHtml.match(/<img[^>]+src=["']([^"']+)["']/i);
            const thumb = it.thumbnail || (it.enclosure && it.enclosure.link) || (imgMatch ? imgMatch[1] : '/assets/images/placeholder.svg');
            return {
              title: it.title,
              link: it.link,
              date: it.pubDate ? new Date(it.pubDate).toISOString().slice(0,10) : '',
              description: clean(it.description || it.content || '').slice(0,220),
              thumbnail: thumb,
              slug: encodeURIComponent((it.title||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''))
            };
          }) : [];
          itemsToUse = mapped.slice(0, 12);
        } else {
          console.warn('rss2json fallback failed:', res.status, res.statusText);
        }
      } catch (e) {
        console.warn('rss2json fallback error:', e.message);
      }
    }
  let local = [];
    if (fs.existsSync(MANIFEST)) {
      try { local = JSON.parse(fs.readFileSync(MANIFEST, 'utf8')); } catch {}
    }
    // merge: prefer local entries when slugs collide; keep external posts by link
    const byKey = new Map();
    for (const item of local) {
      const key = item.link || `/blog/${item.slug}.html`;
      byKey.set(key, item);
    }
    for (const m of itemsToUse) {
      byKey.set(m.link, { ...m });
    }
    let merged = Array.from(byKey.values()).sort((a,b)=>{
      const da = Date.parse(a?.date||'')||0; const db = Date.parse(b?.date||'')||0; return db-da;
    });
    // try to localize thumbnails to avoid hotlinking
    merged = await localizeThumbnails(merged);
    fs.writeFileSync(MANIFEST, JSON.stringify(merged, null, 2), 'utf8');
    console.log(`updated blog/manifest.json with ${merged.length} items (including Medium)`);
  } catch (err) {
    console.error('Medium fetch failed:', err.message);
    process.exitCode = 0; // don’t fail pipeline on a fetch issue
  }
}

if (import.meta.url === `file://${process.argv[1]}`) main();

async function localizeThumbnails(items) {
  try { fs.mkdirSync(IMG_DIR, { recursive: true }); } catch {}
  const out = [];
  for (const item of items) {
    let thumb = item.thumbnail;
    const u = (thumb || '').toString();
    if (/^https?:\/\//i.test(u)) {
      try {
        const local = await cacheImage(u, item.slug || encodeURIComponent(item.title?.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')) || 'medium');
        if (local) thumb = local;
      } catch {}
    }
    out.push({ ...item, thumbnail: thumb });
  }
  return out;
}

async function cacheImage(url, baseName) {
  try {
    const res = await fetch(url, { redirect: 'follow' });
    if (!res.ok) return '';
    const ct = res.headers.get('content-type') || '';
    let ext = extFromUrl(url) || extFromContentType(ct) || '.jpg';
    // sanitize basename
    const safe = (baseName || 'img').toLowerCase().replace(/[^a-z0-9\-]+/g,'-').replace(/(^-|-$)/g,'');
    const file = path.join(IMG_DIR, `${safe}${ext}`);
    if (!fs.existsSync(file)) {
      const buf = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(file, buf);
    }
    return `/assets/images/blog/${safe}${ext}`;
  } catch {
    return '';
  }
}

function extFromUrl(u) {
  try {
    const p = new URL(u).pathname;
    const m = p.match(/\.(jpg|jpeg|png|webp|gif)(?:$|[?#])/i);
    return m ? `.${m[1].toLowerCase()}` : '';
  } catch { return ''; }
}

function extFromContentType(ct) {
  if (/jpeg/.test(ct)) return '.jpg';
  if (/png/.test(ct)) return '.png';
  if (/webp/.test(ct)) return '.webp';
  if (/gif/.test(ct)) return '.gif';
  return '';
}
