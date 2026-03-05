#!/usr/bin/env node
/**
 * Standalone server for the Inventory Intelligence prototype.
 * Zero dependencies — uses Node.js built-in modules only.
 * Serves the pre-built dist/ folder on http://localhost:4000
 *
 * To build a binary:
 *   npm run build
 *   npx pkg serve.js --targets node18-macos-arm64,node18-macos-x64,node18-win-x64 --out-path ./bin
 *
 * The binary embeds the dist/ folder and runs a local web server.
 * Recipients just double-click (or run ./inventory-intelligence) — no Node, no npm needed.
 */
const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT = 4000;
const DIST = path.join(__dirname, 'dist');

const MIME = {
  '.html': 'text/html',
  '.js':   'application/javascript',
  '.css':  'text/css',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.ico':  'image/x-icon',
  '.json': 'application/json',
};

const server = http.createServer((req, res) => {
  // Strip query strings
  let urlPath = req.url.split('?')[0];
  // SPA fallback — all routes serve index.html
  let filePath = path.join(DIST, urlPath === '/' ? 'index.html' : urlPath);

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(DIST, 'index.html');
  }

  const ext  = path.extname(filePath);
  const mime = MIME[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  });
});

server.listen(PORT, '127.0.0.1', () => {
  const url = `http://localhost:${PORT}`;
  console.log(`\nInventory Intelligence prototype running at ${url}\n`);

  // Auto-open browser (best-effort, different commands per OS)
  const open = process.platform === 'darwin' ? 'open'
             : process.platform === 'win32'  ? 'start'
             : 'xdg-open';
  require('child_process').exec(`${open} ${url}`);
});
