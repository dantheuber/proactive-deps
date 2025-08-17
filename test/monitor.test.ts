import promClient from 'prom-client';
import { DependencyMonitor } from '../src/monitor';
import { SUCCESS_STATUS_CODE, ERROR_STATUS_CODE, WARNING_STATUS_CODE } from '../src/constants';
import { DatabaseCheckDetails } from '../src/types';

describe('DependencyMonitor', () => {
  let monitor: DependencyMonitor;

  beforeEach(() => {
    monitor = new DependencyMonitor();
    jest.useFakeTimers(); // Enable Jest's fake timers
  });

  afterEach(() => {
    jest.clearAllTimers(); // Clear all timers after each test
    jest.useRealTimers(); // Restore real timers
  });

  it('should allow starting and stopping of monitor interval', () => {
    expect((monitor as any)._dependencyCheckInterval).toBe(null);
    monitor.startDependencyCheckInterval();
    expect((monitor as any)._dependencyCheckInterval).not.toBe(null);
    monitor.startDependencyCheckInterval(); // branch for re-starting already running interval
    expect((monitor as any)._dependencyCheckInterval).not.toBe(null);
    monitor.stopDependencyCheckInterval();
    expect((monitor as any)._dependencyCheckInterval).toBe(null);
  });

  it('should register a dependency', () => {
    const dependency = {
      name: 'redis',
      description: 'Redis cache',
      impact: 'Responses may be slower due to missing cache.',
      check: async () => ({ code: SUCCESS_STATUS_CODE }),
      cacheDurationMs: 10000,
    };

    monitor.register(dependency);
    expect((monitor as any)._dependencies).toContain(dependency);
  });

  it('should register a dependency with optional override properties', () => {
    const dependency = {
      name: 'redis',
      description: 'Redis cache',
      impact: 'Responses may be slower due to missing cache.',
      check: async () => ({ code: SUCCESS_STATUS_CODE }),
      cacheDurationMs: 10000,
      refreshDurationMs: 5000,
    };

    monitor.register(dependency);
    expect((monitor as any)._dependencies).toContain(dependency);
  });

  it('status should provide the check details provided when registering the dependency', async () => {
    const checkDetails: DatabaseCheckDetails = {
      type: 'database',
      server: 'localhost',
      database: 'mydb',
      dbType: 'mysql',
    };

    const dependency = {
      name: 'redis',
      description: 'Redis cache',
      impact: 'Responses may be slower due to missing cache.',
      check: async () => ({ code: SUCCESS_STATUS_CODE }),
      checkDetails,
    };

    monitor.register(dependency);
    const status = await monitor.getStatus('redis');
    expect(status.checkDetails).toEqual(checkDetails);
  });

  it('should get the status of a healthy dependency', async () => {
    const dependency = {
      name: 'redis',
      description: 'Redis cache',
      impact: 'Responses may be slower due to missing cache.',
      check: async () => ({ code: SUCCESS_STATUS_CODE }),
      cacheDurationMs: 10000,
    };

    monitor.register(dependency);
    const status = await monitor.getStatus('redis');
    expect(status).toEqual({
      name: 'redis',
      description: 'Redis cache',
      impact: 'Responses may be slower due to missing cache.',
      healthy: true,
      health: {
        state: 'OK',
        code: SUCCESS_STATUS_CODE,
        latency: expect.any(Number),
        skipped: false,
      },
      lastChecked: expect.any(String),
    });
  });

  it('should get the status of an unhealthy dependency', async () => {
    const dependency = {
      name: 'redis',
      description: 'Redis cache',
      impact: 'Responses may be slower due to missing cache.',
      check: async () => ({
        code: ERROR_STATUS_CODE,
        errorMessage: 'Connection failed',
      }),
      cacheDurationMs: 10000,
    };

    monitor.register(dependency);
    const status = await monitor.getStatus('redis');
    expect(status).toEqual({
      name: 'redis',
      description: 'Redis cache',
      impact: 'Responses may be slower due to missing cache.',
      healthy: false,
      health: {
        state: 'CRITICAL',
        code: ERROR_STATUS_CODE,
        latency: expect.any(Number),
        skipped: false,
      },
      errorMessage: 'Connection failed',
      lastChecked: expect.any(String),
    });
  });

  it('should set dependency status if exceptions were encountered executing the check', async () => {
    const dependency = {
      name: 'redis',
      description: 'Redis cache',
      impact: 'Responses may be slower due to missing cache.',
      check: async () => {
        throw new Error('Check Exception');
      },
      cacheDurationMs: 10000,
    };

    monitor.register(dependency);
    const status = await monitor.getStatus('redis');
    expect(status).toEqual({
      name: 'redis',
      description: 'Redis cache',
      impact: 'Responses may be slower due to missing cache.',
      healthy: false,
      health: {
        state: 'CRITICAL',
        code: ERROR_STATUS_CODE,
        latency: expect.any(Number),
        skipped: false,
      },
      error: {
        name: 'Error',
        message: 'Check Exception',
        stack: expect.any(String),
      },
      errorMessage: 'Error checking dependency redis',
      lastChecked: expect.any(String),
    });
  });

  it('should get the status of all registered dependencies', async () => {
    const dependency1 = {
      name: 'redis',
      description: 'Redis cache',
      impact: 'Responses may be slower due to missing cache.',
      check: async () => ({ code: SUCCESS_STATUS_CODE }),
      cacheDurationMs: 10000,
    };

    const dependency2 = {
      name: 'db',
      description: 'Database',
      impact: 'Database queries will fail.',
      check: async () => ({
        code: ERROR_STATUS_CODE,
        errorMessage: 'Connection failed',
      }),
      cacheDurationMs: 10000,
    };

    monitor.register(dependency1);
    monitor.register(dependency2);

    const statuses = await monitor.getAllStatuses();
    expect(statuses).toHaveLength(2);
    expect(statuses[0]).toMatchObject({
      name: 'redis',
      healthy: true,
    });
    expect(statuses[1]).toMatchObject({
      name: 'db',
      healthy: false,
    });
  });

  it('should generate Prometheus metrics for all dependencies', async () => {
    const dependency = {
      name: 'redis',
      description: 'Redis cache',
      impact: 'Responses may be slower due to missing cache.',
      check: async () => ({ code: SUCCESS_STATUS_CODE }),
    };

    monitor.register(dependency);

    const metrics = await monitor.getPrometheusMetrics();
    expect(metrics).toContain('dependency_latency_ms{dependency="redis"}');
    expect(metrics).toContain(
      'dependency_health{dependency="redis",impact="Responses may be slower due to missing cache."} 0',
    );
  });

  it('should handle cache miss and fetch dependency status', async () => {
    const dependency = {
      name: 'redis',
      description: 'Redis cache',
      impact: 'Responses may be slower due to missing cache.',
      check: async () => ({ code: SUCCESS_STATUS_CODE }),
    };

    monitor.register(dependency);

    const status = await monitor.getStatus('redis');
    expect(status.healthy).toBe(true);
  });

  it('should throw an error if the dependency is not found', async () => {
    await expect(monitor.getStatus('nonexistent')).rejects.toThrow(
      'Dependency nonexistent not found',
    );
  });

  it('should only run the dependency check after the cache duration has expired', async () => {
    const checkMock = jest.fn(async () => ({ code: SUCCESS_STATUS_CODE }));
    const dependency = {
      name: 'redis',
      description: 'Redis cache',
      impact: 'Responses may be slower due to missing cache.',
      check: checkMock,
      cacheDurationMs: 10000, // 10 seconds
    };

    monitor.register(dependency);

    // First call should trigger the check
    await monitor.getStatus('redis');
    expect(checkMock).toHaveBeenCalledTimes(1);

    // Call again before cache expires
    await monitor.getStatus('redis');
    expect(checkMock).toHaveBeenCalledTimes(1); // Should still be 1

    // Advance time to after the cache duration
    jest.advanceTimersByTime(10001);

    // Call again after cache expires
    await monitor.getStatus('redis');
    expect(checkMock).toHaveBeenCalledTimes(2); // Should now be 2
  });

  it('should return a skipped status for a dependency set to skip', async () => {
    const dependency = {
      name: 'redis',
      description: 'Redis cache',
      impact: 'Responses may be slower due to missing cache.',
      check: async () => ({ code: SUCCESS_STATUS_CODE }),
      cacheDurationMs: 10000,
      skip: true, // Mark the dependency as skipped
    };

    monitor.register(dependency);

    const status = await monitor.getStatus('redis');
    expect(status).toEqual({
      name: 'redis',
      description: 'Redis cache',
      impact: 'Responses may be slower due to missing cache.',
      healthy: true, // Skipped dependencies are considered healthy
      health: {
        state: 'OK', // Use the success state for skipped dependencies
        code: SUCCESS_STATUS_CODE, // Use the success code for skipped dependencies
        latency: 0, // No latency since the check is skipped
        skipped: true, // Indicate that the check was skipped
      },
      lastChecked: expect.any(String),
    });
  });
  it('registers and updates gauges using injected registry', async () => {
      const registry = new promClient.Registry();
      const monitor = new DependencyMonitor({ promClient, registry });
  
      monitor.register({
        name: 'redis',
        description: 'Redis cache',
        impact: 'Cache latency may increase',
        check: async () => ({ code: SUCCESS_STATUS_CODE }),
      });
      monitor.register({
        name: 'api',
        description: 'External API',
        impact: 'Some features degraded',
        check: async () => ({ code: WARNING_STATUS_CODE }),
      });
      monitor.register({
        name: 'skipped',
        description: 'Skipped dep',
        impact: 'None',
        skip: true,
        check: async () => ({ code: SUCCESS_STATUS_CODE }),
      });
  
      await monitor.getAllStatuses(); // trigger checks & metrics
      const metrics = await monitor.getPrometheusMetrics();
  
      expect(metrics).toContain('dependency_latency_ms{dependency="redis"}');
      expect(metrics).toContain('dependency_latency_ms{dependency="api"}');
      // skipped dependency does not execute check so latency metric not emitted
      expect(metrics).toMatch(/dependency_health\{dependency="redis",impact="Cache latency may increase"} 0/);
      expect(metrics).toMatch(/dependency_health\{dependency="api",impact="Some features degraded"} 1/);
    });
    describe('prom-client integration', () => {
      it('handles repeated metrics calls (init short-circuit)', async () => {
        const registry = new promClient.Registry();
        const monitor = new DependencyMonitor({
          promClient,
          registry,
        });
        monitor.register({
          name: 'svc',
          description: 'Service',
          impact: 'Degraded responses',
          check: async () => ({ code: SUCCESS_STATUS_CODE }),
        });
        const first = await monitor.getPrometheusMetrics();
        const second = await monitor.getPrometheusMetrics(); // triggers early return branch
        expect(first).toContain('dependency_latency_ms{dependency="svc"}');
        expect(second).toContain('dependency_health{dependency="svc",impact="Degraded responses"} 0');
      });
    });
  it('getPrometheusRegistry() returns registry', async () => {
    const registry = new promClient.Registry();
    const monitor = new DependencyMonitor({ promClient, registry });
    monitor.register({
      name: 'redis',
      description: 'Redis cache',
      impact: 'Cache latency may increase',
      check: async () => ({ code: SUCCESS_STATUS_CODE }),
    });
    expect(monitor.getPrometheusRegistry()).toBe(registry);
  });
  it('collectDefaultMetrics option enables default metrics', async () => {
    const monitor = new DependencyMonitor({ promClient, collectDefaultMetrics: true });
    monitor.register({
      name: 'redis',
      description: 'Redis cache',
      impact: 'Cache latency may increase',
      check: async () => ({ code: SUCCESS_STATUS_CODE }),
    });
    const metrics = await monitor.getPrometheusMetrics();
    expect(metrics).toContain('# HELP process_cpu_seconds_total'); // default metric
  });
  it('emits metrics with blank impact when impact not provided', async () => {
    const monitor = new DependencyMonitor({ promClient });
    monitor.register({
      name: 'noimpact',
      description: 'No impact dep',
      check: async () => ({ code: SUCCESS_STATUS_CODE }),
    } as any);
    const metrics = await monitor.getPrometheusMetrics();
    expect(metrics).toMatch(/dependency_health\{dependency="noimpact",impact=""} 0/);
  });
});
