// simple static generator: read markdown and write pages/index fragments
// minimal and sync for simplicity
// comments are brief per your style

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import chokidar from 'chokidar';

const ROOT = process.cwd();
const PROJECTS_MD = path.join(ROOT, 'content', 'projects');
const BLOGS_MD = path.join(ROOT, 'blogs');
const RESEARCH_MD = path.join(ROOT, 'research');

const TEMPLATES_DIR = path.join(ROOT, 'scripts', 'templates');
const PROJECTS_HTML = path.join(ROOT, 'projects.html');

function slugify(name) {
	return name.toLowerCase()
		.replace(/^\d+-/, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)/g, '');
}

function loadTemplate(name) {
	const p = path.join(TEMPLATES_DIR, name);
	return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '';
}

function projectArticleFromMD(data, contentHtml) {
	const title = data.title || data.name || 'untitled';
	const date = data.date || '';
	const image = data.image ? data.image : '';
	const repo = data.repo ? data.repo : '';
	const link = data.link ? data.link : '';
	return `\n<article>\n  <header>\n    ${date ? `<span class="date">${date}</span>` : ''}\n    <h2>${link ? `<a href="${link}" target="_blank" rel="noopener noreferrer">${title}</a>` : title}</h2>\n  </header>\n  ${image ? `<a href="${link || '#'}" class="image fit"><img src="${image}" alt="${title}" /></a>` : ''}\n  <p>${contentHtml}</p>\n  <ul class="actions special">\n    ${repo ? `<li><a href="${repo}" target="_blank" rel="noopener noreferrer" class="button">Repository</a></li>` : ''}\n    ${link && !repo ? `<li><a href="${link}" target="_blank" rel="noopener noreferrer" class="button">Link</a></li>` : ''}\n  </ul>\n</article>\n`;
}

function generateProjects() {
	if (!fs.existsSync(PROJECTS_MD)) return '';
	const files = fs.readdirSync(PROJECTS_MD).filter(f => f.endsWith('.md'));
	const articles = files.map(f => {
		const fp = path.join(PROJECTS_MD, f);
		const raw = fs.readFileSync(fp, 'utf8');
		const parsed = matter(raw);
		const html = marked.parse(parsed.content);
		return { order: parsed.data.order || 0, html: projectArticleFromMD(parsed.data, html) };
	})
	.sort((a,b)=>a.order - b.order)
	.map(x=>x.html).join('\n');

	if (fs.existsSync(PROJECTS_HTML)) {
		let projectsHtml = fs.readFileSync(PROJECTS_HTML, 'utf8');
		const start = '<!-- MODULAR_PROJECTS_MARKER_START -->';
		const end = '<!-- MODULAR_PROJECTS_MARKER_END -->';
		const startIdx = projectsHtml.indexOf(start);
		const endIdx = projectsHtml.indexOf(end);
		if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
			const before = projectsHtml.slice(0, startIdx + start.length);
			const after = projectsHtml.slice(endIdx);
			const injected = `\n${articles}\n`;
			projectsHtml = before + injected + after;
			fs.writeFileSync(PROJECTS_HTML, projectsHtml, 'utf8');
			console.log('wrote projects.html with', files.length, 'projects');
		} else {
			console.warn('could not find markers in projects.html, skipping injection');
		}
	}
	return articles;
}

function generatePagesFromDir(dir, outDir, baseUrl, templateName) {
	if (!fs.existsSync(dir)) return [];
	const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
	const template = loadTemplate(templateName);
	const list = [];

	files.forEach(f => {
		const fp = path.join(dir, f);
		const raw = fs.readFileSync(fp, 'utf8');
		const parsed = matter(raw);
		const htmlBody = marked.parse(parsed.content);
		const title = parsed.data.title || parsed.data.name || f.replace('.md', '');
		const date = parsed.data.date || '';
		const slug = parsed.data.slug || slugify(f.replace('.md', ''));
		const outPath = path.join(outDir, `${slug}.html`);
		const pageHtml = template
			.replace(/%title%/g, title)
			.replace(/%date%/g, date)
			.replace(/%content%/g, htmlBody)
			.replace(/%baseurl%/g, baseUrl);

		fs.writeFileSync(outPath, pageHtml, 'utf8');
		const mdRel = `${baseUrl}/${f}`;
		const htmlRel = `${baseUrl}/${slug}.html`;
		list.push({ title, date, slug, md: mdRel, html: htmlRel });
		console.log('wrote', outPath);
	});

	const itemTemplate = loadTemplate('list_item_template.html') || `<li><a href="%href%">%title%</a> <span class="date">%date%</span></li>`;
	const listHtml = '<ul class="posts-list">\n' + list.map(item =>
		itemTemplate.replace(/%href%/g, `./${item.slug}.html`).replace(/%title%/g, item.title).replace(/%date%/g, item.date)
	).join('\n') + '\n</ul>';

    // don't overwrite themed index pages; only write if missing
    const indexPath = path.join(outDir, 'index.html');
    if (!fs.existsSync(indexPath)) {
        const indexHtml = `<!doctype html>
<html>
<head>
	<meta charset="utf-8"/>
	<title>index</title>
	<link rel="stylesheet" href="/assets/css/main.css"/>
</head>
<body>
	<div id="wrapper">
		<header id="header"><a href="/index.html" class="logo">home</a></header>
		<nav id="nav"></nav>
		<div id="main">
			<section class="post">
				<header class="major"><h1>index</h1></header>
				${listHtml}
			</section>
		</div>
		<footer id="footer"></footer>
	</div>
</body>
</html>`;
        fs.writeFileSync(indexPath, indexHtml, 'utf8');
        console.log('wrote index for', outDir);
    } else {
        console.log('skipped writing themed index for', outDir);
    }
	try {
		const sorted = list.slice().sort((a,b)=>{
			const da = Date.parse(a.date||'')||0; const db = Date.parse(b.date||'')||0; return db-da;
		});
		fs.writeFileSync(path.join(outDir, 'index.json'), JSON.stringify(sorted, null, 2), 'utf8');
		console.log('wrote index.json for', outDir);
	} catch (err) {
		console.warn('could not write index.json', err.message);
	}
	return list;
}

function generateSite() {
	generateProjects();
	if (!fs.existsSync(BLOGS_MD)) fs.mkdirSync(BLOGS_MD, { recursive: true });
	generatePagesFromDir(BLOGS_MD, BLOGS_MD, '/blogs', 'post_template.html');
	if (!fs.existsSync(RESEARCH_MD)) fs.mkdirSync(RESEARCH_MD, { recursive: true });
	generatePagesFromDir(RESEARCH_MD, RESEARCH_MD, '/research', 'post_template.html');

	// build research manifest from items/*.json if present
	try {
		const itemsDir = path.join(RESEARCH_MD, 'items');
		if (fs.existsSync(itemsDir)) {
			const files = fs.readdirSync(itemsDir).filter(f => f.endsWith('.json'));
			const items = [];
			for (const f of files) {
				try {
					const raw = fs.readFileSync(path.join(itemsDir, f), 'utf8');
					const data = JSON.parse(raw);
					// minimal schema: title required; keep only known keys to avoid bloat
					if (data && data.title) {
						const { title, date, thumbnail, description, link } = data;
						items.push({ title, date, thumbnail, description, link });
					}
				} catch { /* skip bad item */ }
			}
			// sort by date desc if available
			items.sort((a,b)=>{
				const da = Date.parse(a?.date||'')||0; const db = Date.parse(b?.date||'')||0; return db - da;
			});
			fs.writeFileSync(path.join(RESEARCH_MD, 'manifest.json'), JSON.stringify(items, null, 2), 'utf8');
			console.log('wrote research/manifest.json with', items.length, 'items');
		}
	} catch (err) {
		console.warn('could not build research manifest:', err.message);
	}
	console.log('site generation complete');
}

function watchAndGenerate() {
	const watchPaths = [PROJECTS_MD, BLOGS_MD, RESEARCH_MD].map(p=>path.resolve(p));
	const watcher = chokidar.watch(watchPaths, { ignoreInitial: false, persistent: true });
	watcher.on('all', () => {
		try { generateSite(); } catch (err) { console.error(err); }
	});
	console.log('watching for changes in', watchPaths.join(', '));
}

if (process.argv[1] && process.argv[1].endsWith('build-content.js')) {
	const args = process.argv.slice(2);
	if (args.includes('--watch')) watchAndGenerate(); else generateSite();
}

export { generateSite, slugify };
