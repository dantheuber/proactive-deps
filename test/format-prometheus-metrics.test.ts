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
        healthy: true,
        latencyMs: 50,
        code: SUCCESS_STATUS_CODE,
        message: SUCCESS_STATUS_MESSAGE,
      },
      {
        name: 'db',
        healthy: false,
        latencyMs: 100,
        code: ERROR_STATUS_CODE,
        message: ERROR_STATUS_MESSAGE,
      },
    ];

    const metrics = formatPrometheusMetrics(dependencies);
    expect(metrics).toContain('dependency_latency_ms{dependency="redis"} 50');
    expect(metrics).toContain('dependency_latency_ms{dependency="db"} 100');
    expect(metrics).toContain('dependency_health{dependency="redis"} 1');
    expect(metrics).toContain('dependency_health{dependency="db"} 0');
  });
});
