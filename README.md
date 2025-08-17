# proactive-deps

Lightweight, cached, proactive dependency health checks for Node.js services.

Define async checks (DBs, REST APIs, queues, etc.), get structured status + latency, and expose Prometheus metrics (via `prom-client`) out-of-the-box.

## Features

- Simple registration of dependency checks
- Per‑dependency TTL + refresh threshold (cache-manager under the hood)
- Latency + health gauges for Prometheus
- Optional collection of Node default metrics
- Skippable checks (e.g. for local dev / disabled services)
- TypeScript first (ships types)

## Install

```bash
npm install proactive-deps
```

## Quick Start

```js
import {
  DependencyMonitor,
  SUCCESS_STATUS_CODE,
  ERROR_STATUS_CODE,
} from 'proactive-deps';

const monitor = new DependencyMonitor({
  // Optional: turn on prom-client default metrics & tweak intervals
  collectDefaultMetrics: true,
  checkIntervalMs: 15000,
  cacheDurationMs: 60000,
  refreshThresholdMs: 5000,
});

monitor.register({
  name: 'redis',
  description: 'Redis cache',
  impact: 'Responses may be slower (cache miss path).',
  check: async () => {
    try {
      // Simulate a health check (e.g., ping Redis)
      await redis.ping();
      return SUCCESS_STATUS_CODE; // Healthy status
    } catch (error) {
      return {
        code: ERROR_STATUS_CODE,
        error,
        errorMessage: 'Redis connection failed',
      }; // Unhealthy status with error details
    }
  },
  cacheDurationMs: 10000, // (optional) override default cache TTL
  refreshThresholdMs: 5000, // (optional) pre-emptive refresh window
  checkDetails: {
    type: 'database',
    server: 'localhost',
    database: 'cache',
    dbType: 'redis',
  }, // Optional details about the dependency
});

monitor.startDependencyCheckInterval();
```

### Skipping a Dependency

```js
monitor.register({
  name: 'external-service',
  description: 'An external service that is temporarily disabled',
  impact: 'No impact since this service is currently unused.',
  check: async () => {
    // This check will not run because the dependency is skipped
    return { code: SUCCESS_STATUS_CODE };
  },
  skip: true, // Mark this dependency as skipped
});
```

### REST API Example

```js
monitor.register({
  name: 'user-service',
  description: 'User management REST API',
  impact: 'User-related operations may fail.',
  check: async () => {
    try {
      const response = await fetch('https://api.example.com/users/health');
      if (response.ok) {
        return SUCCESS_STATUS_CODE;
      } else {
        return {
          code: ERROR_STATUS_CODE,
          errorMessage: `Unexpected status: ${response.status}`,
        };
      }
    } catch (error) {
      return {
        code: ERROR_STATUS_CODE,
        error,
        errorMessage: 'Failed to reach user-service API',
      };
    }
  },
  checkDetails: {
    type: 'rest',
    url: 'https://api.example.com/users/health',
    method: 'GET',
  }, // Optional details about the dependency
});
```

### Return Shape

Checker returns either:

- `SUCCESS_STATUS_CODE` (number) or
- `{ code, error?, errorMessage? }`

`skip: true` short‑circuits to an OK result with `latency: 0` and `skipped: true`.

### Fetch All Statuses

```js
const statuses = await monitor.getAllStatuses();
console.log(statuses);
// Example output:
// [
//   {
//     name: 'redis',
//     description: 'Redis cache layer',
//     impact: 'Responses may be slower due to missing cache.',
//     healthy: true,
//     health: {
//       state: 'OK',
//       code: 0,
//       latency: 5,
//       skipped: false,
//     },
//     lastChecked: '2025-04-13T12:00:00Z',
//   },
// ];
```

### Single Dependency

```js
const status = await monitor.getStatus('redis');
console.log(status);
// Example output:
// {
//   name: 'redis',
//   description: 'Redis cache layer',
//   impact: 'Responses may be slower due to missing cache.',
//   healthy: true,
//   health: {
//     state: 'OK',
//     code: 0,
//     latency: 5,
//     skipped: false,
//   },
//   lastChecked: '2025-04-13T12:00:00Z',
// }
```

## Prometheus Metrics

The monitor lazily initializes `prom-client` gauges (or uses the provided registry):

- `dependency_latency_ms{dependency}` – last check latency (ms)
- `dependency_health{dependency,impact}` – health state (0 OK, 1 WARNING, 2 CRITICAL)

Enable default Node metrics by passing `collectDefaultMetrics: true` to the constructor.

```js
const metrics = await monitor.getPrometheusMetrics();
console.log(metrics);
/*
# HELP dependency_latency_ms Last dependency check latency in milliseconds
# TYPE dependency_latency_ms gauge
dependency_latency_ms{dependency="redis"} 5

# HELP dependency_health Dependency health status (0=OK,1=WARNING,2=CRITICAL)
# TYPE dependency_health gauge
dependency_health{dependency="redis",impact="Responses may be slower (cache miss path)."} 0
*/
```

### Example Server (PokeAPI Demo)

See `example/server.js` for a pure Node HTTP server exposing:

- `/pokemon/:name` – live pass‑through to PokeAPI
- `/dependencies` – JSON array of current statuses
- `/metrics` – Prometheus text output

Run it locally:

```bash
npm run build
node example/server.js
```

## API Docs

For detailed API documentation, refer to the [docs](https://dantheuber.github.io/proactive-deps).

## Roadmap (abridged)

- Built-in helper for common /metrics endpoint
- Optional retry / backoff helpers
- Alert hooks (Slack, email)
- Pluggable cache stores

## License

MIT © 2025 Daniel Essig
