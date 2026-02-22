import { marked } from 'marked';
import { readFileSync, writeFileSync } from 'fs';
import { join, basename } from 'path';
import { readdirSync } from 'fs';

const STYLES = `
  * { box-sizing: border-box; }
  :root {
    --bg: #0f0f12;
    --surface: #18181d;
    --text: #e4e4e7;
    --muted: #a1a1aa;
    --accent: #a78bfa;
    --accent-dim: #7c3aed;
    --border: #27272a;
    --link: #a78bfa;
    --link-hover: #c4b5fd;
  }
  html { font-size: 18px; scroll-behavior: smooth; }
  body {
    font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.65;
    color: var(--text);
    background: var(--bg);
    margin: 0;
    padding: 2rem 1rem 4rem;
    max-width: 720px;
    margin-left: auto;
    margin-right: auto;
  }
  h1 {
    font-size: 1.85rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    margin: 0 0 0.5rem;
    color: var(--text);
  }
  h2 {
    font-size: 1.35rem;
    font-weight: 600;
    margin: 2.25rem 0 0.75rem;
    padding-bottom: 0.35rem;
    border-bottom: 1px solid var(--border);
    color: var(--text);
  }
  h3 { font-size: 1.15rem; font-weight: 600; margin: 1.5rem 0 0.5rem; color: var(--text); }
  p { margin: 0 0 1rem; color: var(--muted); }
  strong { color: var(--text); font-weight: 600; }
  a { color: var(--link); text-decoration: none; }
  a:hover { color: var(--link-hover); text-decoration: underline; }
  ul, ol { margin: 0 0 1rem; padding-left: 1.5rem; color: var(--muted); }
  li { margin: 0.25rem 0; }
  li ul, li ol { margin: 0.25rem 0; }
  hr { border: none; height: 1px; background: var(--border); margin: 2rem 0; }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 1rem 0;
    font-size: 0.95rem;
  }
  th, td {
    padding: 0.6rem 0.75rem;
    text-align: left;
    border: 1px solid var(--border);
  }
  th {
    background: var(--surface);
    color: var(--text);
    font-weight: 600;
  }
  td { color: var(--muted); }
  tr:nth-child(even) td { background: rgba(255,255,255,0.02); }
  .meta { font-size: 0.9rem; color: var(--muted); margin-bottom: 1.5rem; }
  .back { display: inline-block; margin-bottom: 1.5rem; color: var(--accent); font-size: 0.9rem; }
  .back:hover { color: var(--link-hover); }
`;

function getTitle(html, filename) {
  const match = html.match(/<h1[^>]*>([^<]+)<\/h1>/);
  return match ? match[1].trim() : basename(filename, '.md');
}

function wrap(body, title, filename) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,600;0,9..40,700;1,9..40,400&display=swap" rel="stylesheet">
  <style>${STYLES}</style>
</head>
<body>
  <a class="back" href="index.html">← All policies</a>
  <div class="content">
${body}
  </div>
</body>
</html>`;
}

function wrapIndex(entries) {
  const list = entries
    .map(({ name, title }) => `<li><a href="${name}">${escapeHtml(title)}</a></li>`)
    .join('\n    ');
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Privacy policies</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&display=swap" rel="stylesheet">
  <style>${STYLES}</style>
</head>
<body>
  <h1>Privacy policies</h1>
  <p class="meta">Select a document below.</p>
  <ul>
    ${list}
  </ul>
</body>
</html>`;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const dir = join(process.cwd());
const mdFiles = readdirSync(dir).filter((f) => f.endsWith('.md'));

marked.setOptions({ gfm: true });

const indexEntries = [];

for (const file of mdFiles) {
  const name = file.replace(/\.md$/i, '.html');
  const path = join(dir, file);
  const md = readFileSync(path, 'utf8');
  const rawHtml = marked.parse(md);
  const title = getTitle(rawHtml, file);
  const html = wrap(rawHtml, title, file);
  writeFileSync(join(dir, name), html, 'utf8');
  indexEntries.push({ name, title });
  console.log('Wrote', name);
}

writeFileSync(join(dir, 'index.html'), wrapIndex(indexEntries), 'utf8');
console.log('Wrote index.html');
