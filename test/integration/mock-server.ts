/**
 * Simple HTTP mock server used in integration tests.
 * Exposes endpoints that simulate healthy, warning, and error states.
 *
 * Routes:
 *   GET /health/ok        -> 200 { status: 'ok' }
 *   GET /health/slow      -> 200 after a short delay (simulate latency)
 *   GET /health/error     -> 500 { status: 'error' }
 *   GET /data/:id         -> 200 { id, value }
 *   GET /toggle/:mode     -> switch internal mode (ok|error|flaky)
 *   GET /dynamic          -> responds based on current mode
 *
 * The exported createMockServer() helper returns start()/stop() controls
 * so tests can own server lifecycle without relying on global state.
 */
import http, { IncomingMessage, ServerResponse } from 'http';
import { URL } from 'url';

export interface MockServerHandle {
  port: number;
  start(): Promise<number>;
  stop(): Promise<void>;
  getMode(): string;
  setMode(mode: string): void;
}

export function createMockServer(requestedPort: number = 0): MockServerHandle {
  let server: http.Server | null = null;
  let mode: 'ok' | 'error' | 'flaky' = 'ok';
  let currentPort = requestedPort;

  const respondJSON = (res: ServerResponse, code: number, body: any) => {
    const json = JSON.stringify(body);
    res.writeHead(code, {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(json),
    });
    res.end(json);
  };

  const handler = async (req: IncomingMessage, res: ServerResponse) => {
    const method = req.method || 'GET';
    const url = new URL(req.url || '/', `http://${req.headers.host}`);
    const path = url.pathname;

    if (method === 'GET' && path === '/health/ok') {
      return respondJSON(res, 200, { status: 'ok' });
    }
    if (method === 'GET' && path === '/health/error') {
      return respondJSON(res, 500, { status: 'error' });
    }
    if (method === 'GET' && path === '/health/slow') {
      await new Promise((r) => setTimeout(r, 150));
      return respondJSON(res, 200, { status: 'ok', delayed: true });
    }
    if (method === 'GET' && path.startsWith('/data/')) {
      const id = path.split('/')[2];
      return respondJSON(res, 200, { id, value: `value-${id}` });
    }
    if (method === 'GET' && path.startsWith('/toggle/')) {
      const newMode = path.split('/')[2];
      if (newMode === 'ok' || newMode === 'error' || newMode === 'flaky') {
        mode = newMode;
        return respondJSON(res, 200, { mode });
      }
      return respondJSON(res, 400, { error: 'invalid mode' });
    }
    if (method === 'GET' && path === '/dynamic') {
      if (mode === 'ok') return respondJSON(res, 200, { status: 'ok' });
      if (mode === 'error') return respondJSON(res, 500, { status: 'error' });
      // flaky mode — alternate
      const now = Date.now();
      if (now % 2 === 0)
        return respondJSON(res, 200, { status: 'ok', flaky: true });
      return respondJSON(res, 500, { status: 'error', flaky: true });
    }

    respondJSON(res, 404, { error: 'not found' });
  };

  return {
    port: currentPort,
    getMode: () => mode,
    setMode: (m: string) => {
      if (m === 'ok' || m === 'error' || m === 'flaky') mode = m;
    },
    async start() {
      if (server) return currentPort;
      server = http.createServer(handler);
      await new Promise<void>((resolve) => {
        server!.listen(currentPort, () => {
          // if ephemeral port (0), capture the assigned port
          const address = server!.address();
          if (typeof address === 'object' && address && 'port' in address) {
            currentPort = address.port;
          }
          resolve();
        });
      });
      return currentPort;
    },
    async stop() {
      if (!server) return;
      await new Promise<void>((resolve, reject) => {
        server!.close((err) => (err ? reject(err) : resolve()));
      });
      server = null;
    },
  };
}

// When run directly (manual local debugging):
if (require.main === module) {
  (async () => {
    const srv = createMockServer(3001);
    const p = await srv.start();
    // eslint-disable-next-line no-console
    console.log(`Mock server listening on http://localhost:${p}`);
  })();
}
