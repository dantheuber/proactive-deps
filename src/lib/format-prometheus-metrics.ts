import { DependencyStatus } from '../types';

export default function formatPrometheusMetrics(
  dependencies: DependencyStatus[],
): string {
  const latencyMetrics = dependencies.map(
    (dep) => `dependency_latency_ms{dependency="${dep.name}"} ${dep.latencyMs}`,
  );
  const healthMetrics = dependencies.map(
    (dep) =>
      `dependency_health{dependency="${dep.name}"} ${dep.healthy ? 1 : 0}`,
  );
  const metrics = [
    '# HELP dependency_health Dependency status (1: healthy, 0: unhealthy)',
    '# TYPE dependency_health gauge',
    ...healthMetrics,
    '# HELP dependency_latency_ms Dependency latency in milliseconds',
    '# TYPE dependency_latency_ms gauge',
    ...latencyMetrics,
  ];

  return metrics.join('\n');
}
