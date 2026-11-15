import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';

const directory = path.dirname(fileURLToPath(import.meta.url));
const pages = [
  { source: 'home.md', output: 'index.html', title: 'Markus Köfler — Machine Learning Research', description: 'Research on discovering shared factors across environments and learning with consistently organized task representations.', prefix: '' },
  { source: 'research/report.md', output: 'research/index.html', title: 'Discovering Shared Factors for Compositional Reinforcement Learning — Markus Köfler', description: 'A thesis research report on SSR discovery, semantic decoding, and compositional control with supplied task codes.', prefix: '../' },
];

for (const page of pages) {
  const content = marked.parse(fs.readFileSync(path.join(directory, page.source), 'utf8'), { mangle: false, headerIds: false });
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title>${page.title}</title>
  <meta name="description" content="${page.description}">
  <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="${page.prefix}draft.css">
  <script defer src="${page.prefix}alignment.js"></script>
</head>
<body>
  <a class="skip" href="#main">Skip to content</a>
  <div class="draft-note">DESIGN &amp; CONTENT DRAFT · 29 OCTOBER 2026</div>
  <header class="site-head">
    <a class="name" href="${page.prefix || './'}">Markus Köfler</a>
    <nav aria-label="Main navigation">
      <a href="${page.prefix || './'}"${page.prefix ? '' : ' aria-current="page"'}>About</a>
      <a href="${page.prefix}research/"${page.prefix ? ' aria-current="page"' : ''}>Research</a>
      <a href="/projects/">Projects</a><a href="/blog/">Writing</a><a href="/cv/">CV</a>
      <button class="style-toggle" id="styleToggle" type="button" aria-pressed="false" title="Switch to nostalgic old-school HTML style">retro</button>
    </nav>
  </header>
  <main id="main">${content}</main>
  <footer><span>Markus Köfler · <a href="mailto:markus.koefler11@gmail.com">Contact</a></span><span><button class="btn" id="themeToggle" type="button" aria-label="Toggle theme">theme</button> <a href="/">Current website</a></span></footer>
</body>
</html>
`;
  fs.writeFileSync(path.join(directory, page.output), html);
  console.log(`Built drafts/${page.output}`);
}
