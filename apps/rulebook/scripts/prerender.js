// Writes one static HTML file per page into dist/, using the server build in dist-ssr/.
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';

const dist = 'dist';
const ssrEntry = pathToFileURL(join('dist-ssr', 'entry-server.js')).href;
const { paths, render } = await import(ssrEntry);
const template = readFileSync(join(dist, 'index.html'), 'utf8');

const escapeHtml = (text) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Pages that don't exist at build time (e.g. uploaded rules) load the client app from 404.html.
writeFileSync(join(dist, '404.html'), template);

// The list builder renders in the browser only (its armies live there); its address loads the app shell.
mkdirSync(join(dist, 'builder'), { recursive: true });
writeFileSync(join(dist, 'builder', 'index.html'), template);

for (const path of paths) {
  const { html, title } = render(path);

  const page = template
    .replace(/<title>.*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
    .replace('<div id="root"></div>', `<div id="root" data-path="${escapeHtml(path)}">${html}</div>`);

  const file = join(dist, path, 'index.html');

  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, page);
}

rmSync('dist-ssr', { recursive: true, force: true });
console.log(`prerendered ${paths.length} pages`);
