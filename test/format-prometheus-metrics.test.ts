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
        latencyMs: 50,
        code: SUCCESS_STATUS_CODE,
        message: SUCCESS_STATUS_MESSAGE,
        status: SUCCESS_STATUS_MESSAGE,
        lastChecked: new Date().toISOString(),
      },
      {
        name: 'db',
        description: 'Database',
        impact: 'Database queries will fail.',
        healthy: false,
        latencyMs: 100,
        code: ERROR_STATUS_CODE,
        message: ERROR_STATUS_MESSAGE,
        status: ERROR_STATUS_MESSAGE,
        lastChecked: new Date().toISOString(),
      },
    ];

    const metrics = formatPrometheusMetrics(dependencies);
    expect(metrics).toContain('dependency_latency_ms{dependency="redis"} 50');
    expect(metrics).toContain('dependency_latency_ms{dependency="db"} 100');
    expect(metrics).toContain('dependency_health{dependency="redis"} 0');
    expect(metrics).toContain('dependency_health{dependency="db"} 1');
  });
});
