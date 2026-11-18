// Starts the playground (php -S + router.php) on a free port for a test file.
// Notes are stored in a temporary folder, so tests never touch playground/.data.
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

const freePort = () => new Promise((resolve, reject) => {
  const server = createServer();
  server.unref();
  server.on('error', reject);
  server.listen(0, '127.0.0.1', () => {
    const { port } = server.address();
    server.close(() => resolve(port));
  });
});

export async function startServer() {
  const port = await freePort();
  const data = mkdtempSync(join(tmpdir(), 'exura-dev-'));
  const php = spawn('php', ['-S', `127.0.0.1:${port}`, join(ROOT, 'playground', 'router.php')], {
    cwd: join(ROOT, 'playground'),
    env: { ...process.env, EXURA_DEV_DATA: data },
    stdio: ['ignore', 'ignore', 'pipe'],
  });

  let log = '';
  php.stderr.on('data', chunk => { log += chunk; });

  const url = `http://127.0.0.1:${port}`;
  for (let i = 0; i < 50; i++) {
    try {
      await fetch(url + '/');
      return {
        url,
        log: () => log,
        stop: () => {
          php.kill();
          rmSync(data, { recursive: true, force: true });
        },
      };
    } catch {
      await new Promise(r => setTimeout(r, 100));
    }
  }
  php.kill();
  throw new Error(`php -S did not start on ${port}\n${log}`);
}

// JSON request against the exuraphp playground
export async function api(base, method, route, body) {
  const response = await fetch(base + route, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: response.status, json: await response.json() };
}
