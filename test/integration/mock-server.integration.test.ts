import { DependencyMonitor, SUCCESS_STATUS_CODE, ERROR_STATUS_CODE } from '../../src';
import { createMockServer } from './mock-server';

/**
 * Basic integration test exercising the mock server with proactive-deps.
 */

describe('DependencyMonitor integration with mock server', () => {
  const mock = createMockServer();
  let port: number;
  const monitor = new DependencyMonitor({
    collectDefaultMetrics: false,
    checkIntervalMs: 200, // fast for test
    cacheDurationMs: 500,
    refreshThresholdMs: 100,
  });

  beforeAll(async () => {
    port = await mock.start();
    monitor.register({
      name: 'mock-api',
      description: 'Local mock dependency',
      impact: 'Feature X degraded',
      checkDetails: {
        type: 'rest',
        url: `http://localhost:${port}/dynamic`,
        method: 'GET',
        expectedStatusCode: 200,
      },
      async check() {
        try {
          const res = await fetch(`http://localhost:${port}/dynamic`);
          if (res.ok) return SUCCESS_STATUS_CODE;
          return { code: ERROR_STATUS_CODE, errorMessage: `status ${res.status}` };
        } catch (error) {
          return { code: ERROR_STATUS_CODE, error: error as Error, errorMessage: 'fetch failed' };
        }
      },
    });
    monitor.startDependencyCheckInterval();
  });

  afterAll(async () => {
    monitor.stopDependencyCheckInterval();
    await mock.stop();
  });

  test('reports OK state initially', async () => {
    // Ensure at least one interval pass
    await new Promise(r => setTimeout(r, 350));
    const status = await monitor.getStatus('mock-api');
    expect(status.healthy).toBe(true);
    expect(status.health.code).toBe(SUCCESS_STATUS_CODE);

  // Metrics should reflect OK (health gauge = 0)
  const metrics = await monitor.getPrometheusMetrics();
  expect(metrics).toMatch(/dependency_latency_ms{dependency="mock-api"} \d+/);
  expect(metrics).toMatch(/dependency_health{dependency="mock-api",impact="Feature X degraded"} 0(\.\d+)?/);
  });

  test('reports CRITICAL when server set to error', async () => {
    mock.setMode('error');
    // wait for interval + cache refresh
    await new Promise(r => setTimeout(r, 400));
    const status = await monitor.getStatus('mock-api');
    expect(status.healthy).toBe(false);
    expect(status.health.code).toBe(ERROR_STATUS_CODE);

  // Metrics should now reflect CRITICAL (health gauge = 2)
  const metrics = await monitor.getPrometheusMetrics();
  expect(metrics).toMatch(/dependency_health{dependency="mock-api",impact="Feature X degraded"} 2(\.\d+)?/);
  });
});
