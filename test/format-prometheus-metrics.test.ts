import {
  ERROR_STATUS_CODE,
  ERROR_STATUS_MESSAGE,
  SUCCESS_STATUS_CODE,
  SUCCESS_STATUS_MESSAGE,
} from '../src/constants';
import formatPrometheusMetrics from '../src/lib/format-prometheus-metrics';

describe('formatPrometheusMetrics', () => {
  it('should generate Prometheus metrics for dependencies', () => {
    const dependencies = [
      {
        name: 'redis',
        description: 'Redis cache layer',
        impact: 'Responses may be slower due to missing cache.',
        healthy: true,
        health: {
          state: SUCCESS_STATUS_MESSAGE,
          code: SUCCESS_STATUS_CODE,
          latency: 50,
          skipped: false,
        },
        lastChecked: new Date().toISOString(),
      },
      {
        name: 'db',
        description: 'Database',
        impact: 'Database queries will fail.',
        healthy: false,
        health: {
          state: ERROR_STATUS_MESSAGE,
          code: ERROR_STATUS_CODE,
          latency: 100,
          skipped: false,
        },
        lastChecked: new Date().toISOString(),
        errorMessage: 'Connection failed',
        error: {
          name: 'ConnectionError',
          message: 'Failed to connect to the database',
          stack: 'Error stack trace here',
        },
      },
    ];

    const metrics = formatPrometheusMetrics(dependencies);
    expect(metrics).toContain('dependency_latency_ms{dependency="redis"} 50');
    expect(metrics).toContain('dependency_latency_ms{dependency="db"} 100');
    expect(metrics).toContain('dependency_health{dependency="redis", impact="Responses may be slower due to missing cache."} 0');
    expect(metrics).toContain('dependency_health{dependency="db", impact="Database queries will fail."} 1');
  });
});
