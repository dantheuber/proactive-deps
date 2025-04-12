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
### Registering a Dependency

```js
import { DependencyMonitor } from 'proactive-deps';

const monitor = new DependencyMonitor();

monitor.register({
  name: 'redis',
  description: 'Redis cache layer',
  check: async () => {
    // Your health check logic here
    await redis.ping();
  },
  cacheDurationMs: 10000 // 10 seconds between checks
});
```

### Getting Current Status
```js
const status = await monitor.getStatus();
console.log(status);
// {
//   redis: { healthy: true, lastChecked: '...', latencyMs: 5 }
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

# HELP dependency_healthy Whether the dependency is currently healthy (1 = healthy, 0 = unhealthy)
# TYPE dependency_healthy gauge
dependency_healthy{dependency="redis"} 1
*/
```

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