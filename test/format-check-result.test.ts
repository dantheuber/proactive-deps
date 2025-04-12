import formatCheckResult from '../src/lib/format-check-result';
import {
  SUCCESS_STATUS_CODE,
  ERROR_STATUS_CODE,
  WARNING_STATUS_CODE,
} from '../src/constants';

describe('formatCheckResult', () => {
  it('should return a healthy status for SUCCESS_STATUS_CODE', () => {
    const result = formatCheckResult(
      'redis',
      { code: SUCCESS_STATUS_CODE },
      50,
    );
    expect(result).toEqual({
      name: 'redis',
      healthy: true,
      code: SUCCESS_STATUS_CODE,
      message: 'OK',
      latencyMs: 50,
    });
  });

  it('should return a warning status for WARNING_STATUS_CODE', () => {
    const result = formatCheckResult(
      'redis',
      { code: WARNING_STATUS_CODE },
      100,
    );
    expect(result).toEqual({
      name: 'redis',
      healthy: true,
      code: WARNING_STATUS_CODE,
      message: 'WARNING',
      latencyMs: 100,
    });
  });

  it('should return an unhealthy status for ERROR_STATUS_CODE', () => {
    const result = formatCheckResult(
      'redis',
      { code: ERROR_STATUS_CODE, errorMessage: 'Connection failed' },
      200,
    );
    expect(result).toEqual({
      name: 'redis',
      healthy: false,
      code: ERROR_STATUS_CODE,
      message: 'CRITICAL',
      latencyMs: 200,
      errorMessage: 'Connection failed',
    });
  });

  it('should handle missing errorMessage in error status', () => {
    const result = formatCheckResult('redis', { code: ERROR_STATUS_CODE }, 200);
    expect(result).toEqual({
      name: 'redis',
      healthy: false,
      code: ERROR_STATUS_CODE,
      message: 'CRITICAL',
      latencyMs: 200,
    });
  });
});
