/*
 Simple HTTP server example using proactive-deps to monitor the PokeAPI.

 Endpoints:
   GET /pokemon/:name    -> Fetches live data from https://pokeapi.co/api/v2/pokemon/:name
   GET /dependencies     -> Returns the current dependency check statuses (from proactive-deps cache)
   GET /metrics          -> Prometheus metrics for the dependency monitor (latency & health)
   GET /                 -> Basic help text

 Usage:
   1. Build the library first so the root package exports are available (dist/):
        npm install
        npm run build
   2. Start the example server:
        node example/server.js
   3. Try it:
        curl http://localhost:3000/pokemon/ditto
        curl http://localhost:3000/dependencies
        curl http://localhost:3000/metrics

 Notes:
   - This example uses only Node built‑ins (no Express) to keep dependencies minimal.
   - If you want live reloading or TS in the example, you can adapt it to use ts-node / nodemon.
*/

const http = require('http');
const { URL } = require('url');
let proactive;
try {
  // Prefer built version (dist) when available
  proactive = require('..');
} catch (e) {
  // Fallback to source for local dev prior to build
  proactive = require('../src');
}

const {
  DependencyMonitor,
  SUCCESS_STATUS_CODE,
  ERROR_STATUS_CODE,
} = proactive;

const monitor = new DependencyMonitor({
  // Collect default metrics (optional)
  collectDefaultMetrics: true,
  // Faster interval for demo purposes
  checkIntervalMs: 10000,
  cacheDurationMs: 30000,
  refreshThresholdMs: 5000,
});

// Register a dependency check for the public PokeAPI
monitor.register({
  name: 'PokeAPI',
  description: 'Public Pokémon REST API',
  impact: 'Pokémon data cannot be fetched for users',
  checkDetails: {
    type: 'rest',
    url: 'https://pokeapi.co/api/v2/pokemon/pikachu',
    method: 'GET',
    expectedStatusCode: 200,
  },
  async check() {
    try {
      const res = await fetch('https://pokeapi.co/api/v2/pokemon/pikachu');
      if (res.ok) {
        return SUCCESS_STATUS_CODE;
      }
      return {
        code: ERROR_STATUS_CODE,
        errorMessage: `Unexpected status code ${res.status}`,
      };
    } catch (error) {
      return {
        code: ERROR_STATUS_CODE,
        error,
        errorMessage: 'Error calling PokeAPI',
      };
    }
  },
});

monitor.startDependencyCheckInterval();

function sendJson(res, statusCode, body) {
  const json = JSON.stringify(body, null, 2);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(json),
  });
  res.end(json);
}

async function handlePokemonRequest(res, name) {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(name)}`);
    if (!response.ok) {
      sendJson(res, response.status, { error: `PokeAPI returned status ${response.status}` });
      return;
    }
    const data = await response.json();
    // Return a trimmed subset of data for brevity
    const subset = {
      name: data.name,
      id: data.id,
      height: data.height,
      weight: data.weight,
      base_experience: data.base_experience,
      types: data.types.map(t => t.type.name),
      abilities: data.abilities.map(a => a.ability.name),
    };
    sendJson(res, 200, subset);
  } catch (error) {
    sendJson(res, 502, { error: 'Failed to fetch from PokeAPI', details: error.message });
  }
}

const server = http.createServer(async (req, res) => {
  const method = req.method || 'GET';
  const urlObj = new URL(req.url, `http://${req.headers.host}`);
  const path = urlObj.pathname || '/';

  // Simple routing
  if (method === 'GET' && path === '/') {
    sendJson(res, 200, {
      message: 'Proactive Deps Example Server',
      routes: ['/pokemon/:name', '/dependencies', '/metrics'],
    });
    return;
  }

  if (method === 'GET' && path.startsWith('/pokemon/')) {
    const name = path.split('/')[2];
    if (!name) {
      sendJson(res, 400, { error: 'Missing Pokémon name' });
      return;
    }
    await handlePokemonRequest(res, name);
    return;
  }

  if (method === 'GET' && path === '/dependencies') {
    try {
      const statuses = await monitor.getAllStatuses();
      sendJson(res, 200, statuses);
    } catch (error) {
      sendJson(res, 500, { error: 'Unable to fetch dependency statuses', details: error.message });
    }
    return;
  }

  if (method === 'GET' && path === '/metrics') {
    try {
      const metrics = await monitor.getPrometheusMetrics();
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end(metrics);
    } catch (error) {
      sendJson(res, 500, { error: 'Unable to render Prometheus metrics', details: error.message });
    }
    return;
  }

  sendJson(res, 404, { error: 'Not found' });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Example server listening on http://localhost:${PORT}`);
});
