import { DependencyMonitor } from '../src/monitor';
import { SUCCESS_STATUS_CODE, ERROR_STATUS_CODE } from '../src/constants';

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

  it('should get the status of a healthy dependency', async () => {
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

  it('should get the status of an unhealthy dependency', async () => {
    const dependency = {
      name: 'redis',
      description: 'Redis cache',
      impact: 'Responses may be slower due to missing cache.',
      check: async () => ({
        code: ERROR_STATUS_CODE,
        errorMessage: 'Connection failed',
      }),
    };

    monitor.register(dependency);
    const status = await monitor.getStatus('redis');
    expect(status.healthy).toBe(false);
    expect(status.errorMessage).toBe('Connection failed');
  });

  it('should set dependency status if exceptions were encountered executing the check', async () => {
    const dependency = {
      name: 'redis',
      description: 'Redis cache',
      impact: 'Responses may be slower due to missing cache.',
      check: async () => {
        throw new Error('Check Exception');
      },
    };

    monitor.register(dependency);
    const status = await monitor.getStatus('redis');
    expect(status.healthy).toBe(false);
    expect(status.errorMessage).toBe('Error checking dependency redis');
    expect(status.error?.stack).toBeDefined();
    expect(status.error?.name).toBe('Error');
    expect(status.error?.message).toBe('Check Exception');
  });

  it('should get the status of all registered dependencies', async () => {
    const dependency1 = {
      name: 'redis',
      description: 'Redis cache',
      impact: 'Responses may be slower due to missing cache.',
      check: async () => ({ code: SUCCESS_STATUS_CODE }),
    };

    const dependency2 = {
      name: 'db',
      description: 'Database',
      impact: 'Database queries will fail.',
      check: async () => ({
        code: ERROR_STATUS_CODE,
        errorMessage: 'Connection failed',
      }),
    };

    monitor.register(dependency1);
    monitor.register(dependency2);

    const statuses = await monitor.getAllStatuses();
    expect(statuses).toHaveLength(2);
    expect(statuses[0].healthy).toBe(true);
    expect(statuses[1].healthy).toBe(false);
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
    expect(metrics).toContain('dependency_health{dependency="redis"} 0');
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
});
