# 🛠️ proactive-deps

Proactive Dependency Checks for Node.js Projects

`proactive-deps` is a lightweight Node.js library that makes it easy to monitor the health of your app’s runtime dependencies. It lets you define custom async checks for critical external services—like databases, APIs, queues, etc.—and provides real-time status tracking, latency metrics, and Prometheus-style exports.

## 🔍 Why Use This?

Long-running services often depend on external systems, and when those go down, it can cause confusing or delayed failures. proactive-deps helps you proactively detect issues before they become full outages—without adding brittle health check logic to your app’s core business logic.

## 🚀 Features

- ✅ Custom async health checks per dependency
- 🧠 Smart result caching (set TTL per dependency)
- 📈 Built-in latency tracking
- 📊 Prometheus-style metrics export
- 🧪 Live status summaries for dashboards or alerts

## 📦 Installation

```bash
npm install proactive-deps
```

## ⚙️ Usage

#### Starting and Stopping the Dependency Check Interval

Once you have registered your dependencies, you must call `monitor.startDependencyCheckInterval()` to start the automated interval that periodically checks the status of all registered dependencies. This ensures that the health of your dependencies is monitored continuously at the configured interval.

If you need to stop the automated checks (e.g., during application shutdown or maintenance), you can call `monitor.stopDependencyCheckInterval()` to stop the interval.

### Registering a Dependency

```js
import {
  DependencyMonitor,
  SUCCESS_STATUS_CODE,
  ERROR_STATUS_CODE,
} from 'proactive-deps';

const monitor = new DependencyMonitor();

monitor.register({
  name: 'redis',
  description: 'Redis cache layer',
  impact: 'Responses may be slower due to missing cache.',
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
  cacheDurationMs: 10000, // Cache results for 10 seconds
  refreshThresholdMs: 5000, // Refresh results if older than 5 seconds
});

monitor.startDependencyCheckInterval();
```

### What Should a Dependency Check Return?

A registered dependency check can return either a status code or an object with additional details.

#### When Healthy:

You can return just the status code:

```js
SUCCESS_STATUS_CODE;
```

Or an object with the status code:

```js
{
  code: SUCCESS_STATUS_CODE,
}
```

- `code`: A status code indicating success (e.g., `SUCCESS_STATUS_CODE`).
- `error`: Should be `undefined` when the dependency is healthy.
- `errorMessage`: Should be `undefined` when the dependency is healthy.

#### When Errors Are Encountered:

You can return an object with the status code and optional error details:

```js
{
  code: ERROR_STATUS_CODE,
  error: new Error('Connection failed'),
  errorMessage: 'Redis connection failed',
}
```

- `code`: A status code indicating an error (e.g., `ERROR_STATUS_CODE`).
- `error`: An `Error` object describing the issue.
- `errorMessage`: A string describing the error in detail.

This flexibility allows you to return a simple status code for healthy dependencies or provide detailed error information when issues are encountered. The structure ensures consistency across all dependency checks and allows the monitor to handle and report errors effectively.

### Getting Current Status

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
//     code: 0,
//     status: 'OK',
//     latencyMs: 5,
//     lastChecked: '2025-04-13T12:00:00Z',
//   },
// ];
```

### Getting the Status of a Specific Dependency

```js
const status = await monitor.getStatus('redis');
console.log(status);
// Example output:
// {
//   name: 'redis',
//   description: 'Redis cache layer',
//   impact: 'Responses may be slower due to missing cache.',
//   healthy: true,
//   code: 0,
//   status: 'OK',
//   latencyMs: 5,
//   lastChecked: '2025-04-13T12:00:00Z',
// }
```

### Prometheus Metrics Output

```js
const metrics = await monitor.getPrometheusMetrics();
console.log(metrics);
/*
# HELP dependency_latency_ms Latency of dependency checks in milliseconds
# TYPE dependency_latency_ms gauge
dependency_latency_ms{dependency="redis"} 5

# HELP dependency_health Whether the dependency is currently healthy (0 = healthy, 1 = unhealthy)
# TYPE dependency_health gauge
dependency_health{dependency="redis"} 0
*/
```

## 📖 API Documentation

For detailed API documentation, refer to the [API.md](./API.md) file.

The `API.md` file contains comprehensive information about all exported classes, methods, and types in the library, generated using JSDoc.

## 🧠 Philosophy

Other tools might let you know that a dependency was broken when you find out the hard way. `proactive-deps` helps you know in advance, by making it dead simple to wrap, register, and expose active health checks for the services your app relies on.

## 🧪 Ideal Use Cases

- Embedding in HTTP services to power `/health` or `/metrics` endpoints
- Scheduled checks that alert on failure via cron or background workers
- Internal monitoring dashboards for systems that depend on flaky external services

## 🛣️ Future Plans

- [ ] Built-in Prometheus metrics endpoint handler
- [ ] Retry logic with exponential backoff
- [ ] Custom alert hooks (email, Slack, etc.)
- [ ] Custom cache stores.

## 📄 License

MIT © 2025 Daniel Essig
