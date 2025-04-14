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
  checkDetails: {
    type: 'database',
    server: 'localhost',
    database: 'cache',
    dbType: 'redis',
  }, // Optional details about the dependency
});

monitor.startDependencyCheckInterval();
```

### Using the `skip` Boolean

The `skip` boolean allows you to mark a dependency as skipped, meaning its health check will not be executed. Skipped dependencies are considered healthy by default, with a latency of `0` and the `skipped` flag set to `true`.

#### Why Would You Want to Skip a Dependency?

There are several scenarios where skipping a dependency might be useful:

- **Temporarily Disabled Services**: If a service is temporarily offline or not in use, you can skip its health check to avoid unnecessary errors or alerts.
- **Development or Testing**: During development or testing, you might want to skip certain dependencies that are not yet implemented or are mocked.

#### Example with a Skipped Dependency

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

When a dependency is skipped, its status will look like this:

```js
{
  name: 'external-service',
  description: 'An external service that is temporarily disabled',
  impact: 'No impact since this service is currently unused.',
  healthy: true,
  health: {
    state: 'OK',
    code: 0,
    latency: 0,
    skipped: true,
  },
  lastChecked: '2025-04-13T12:00:00Z',
}
```

### Why Use `checkDetails`?

The `checkDetails` property allows you to provide additional metadata about the dependency being monitored. This can be useful for:

- **Debugging**: Including details like the server, database name, or API endpoint can help quickly identify the source of an issue.
- **Monitoring Dashboards**: Exposing `checkDetails` in status summaries or metrics can provide more context for operations teams.
- **Custom Alerts**: Use `checkDetails` to include specific information in alerts, such as the type of dependency or its criticality.

#### Example with REST API Dependency

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
//   health: {
//     state: 'OK',
//     code: 0,
//     latency: 5,
//     skipped: false,
//   },
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
dependency_health{dependency="redis", impact="Responses may be slower due to missing cache."} 0
*/
```

## 📖 API Documentation

For detailed API documentation, refer to the [docs](https://dantheuber.github.io/proactive-deps).

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
