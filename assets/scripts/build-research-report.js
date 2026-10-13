import fs from 'fs';
import path from 'path';
import { marked } from 'marked';
import katex from 'katex';

function renderMath(match, display, inline) {
  const html = katex.renderToString((display ?? inline).trim(), {
    displayMode: display !== undefined,
    output: 'mathml',
    throwOnError: true,
    strict: 'error',
  });
  return display === undefined ? html : `<div class="math-display">${html}</div>`;
}

export function buildResearchReport() {
  const directory = path.join(process.cwd(), 'research', 'aligned-causal-representations');
  const source = path.join(directory, 'report.md');
  if (!fs.existsSync(source)) return;

  const expressions = [];
  const markdown = fs.readFileSync(source, 'utf8').replace(
    /\$\$([\s\S]*?)\$\$|\$([^$\n]+)\$/g,
    (match, display, inline) => {
      expressions.push(renderMath(match, display, inline));
      return `CRLMATHPLACEHOLDER${expressions.length - 1}END`;
    },
  );
  let html = marked.parse(markdown, { mangle: false, headerIds: false });
  html = html.replace(/<p>(CRLMATHPLACEHOLDER\d+END)<\/p>/g, '$1');
  html = html.replace(/CRLMATHPLACEHOLDER(\d+)END/g, (_, index) => expressions[index]);

  const output = path.join(directory, 'index.html');
  const page = fs.readFileSync(output, 'utf8');
  const start = '<!-- RESEARCH_REPORT_START -->';
  const end = '<!-- RESEARCH_REPORT_END -->';
  const before = page.indexOf(start);
  const after = page.indexOf(end);
  if (before < 0 || after < before) throw new Error('Research report markers are missing');
  fs.writeFileSync(output, page.slice(0, before + start.length) + '\n' + html + page.slice(after));
}
