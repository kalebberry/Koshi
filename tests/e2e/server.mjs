import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
};

export function createTestServer(port = 4173) {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url || '/', `http://127.0.0.1:${port}`);
    const pathname = decodeURIComponent(url.pathname);
    let filePath;

    if (pathname === '/' || pathname === '/harness.html') {
      filePath = path.join(__dirname, 'fixtures', 'harness.html');
    } else if (pathname.startsWith('/fixtures/')) {
      filePath = path.join(__dirname, 'fixtures', pathname.slice('/fixtures/'.length));
    } else {
      filePath = path.join(rootDir, pathname);
    }

    const resolved = path.resolve(filePath);
    if (!resolved.startsWith(rootDir)) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('403 Forbidden');
      return;
    }

    fs.readFile(resolved, (err, content) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end(`404 Not Found: ${pathname}`);
        return;
      }
      const ext = path.extname(resolved).toLowerCase();
      res.writeHead(200, {
        'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      });
      res.end(content);
    });
  });

  return {
    server,
    start: () =>
      new Promise((resolve) => {
        server.listen(port, '127.0.0.1', () => {
          resolve(server);
        });
      }),
    close: () =>
      new Promise((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      }),
  };
}

// When executed directly (e.g. by Playwright webServer or CLI)
const isDirectExecution =
  process.argv[1] && path.resolve(process.argv[1]) === __filename;

if (isDirectExecution) {
  const port = Number(process.env.PORT) || 4173;
  const { start } = createTestServer(port);
  start().then(() => {
    console.log(`Kōshi test server running at http://127.0.0.1:${port}/harness.html`);
  });
}
