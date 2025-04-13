import formatCheckResult from '../src/lib/format-check-result';
import {
  SUCCESS_STATUS_CODE,
  ERROR_STATUS_CODE,
  WARNING_STATUS_CODE,
  SUCCESS_STATUS_MESSAGE,
  ERROR_STATUS_MESSAGE,
  WARNING_STATUS_MESSAGE,
} from '../src/constants';

describe('formatCheckResult', () => {
  const dependency = {
    name: 'redis',
    description: 'Redis cache layer',
    impact: 'Responses may be slower due to missing cache.',
    check: async () => ({ code: SUCCESS_STATUS_CODE }), // Mock check function
  };

  it('should return a healthy status for SUCCESS_STATUS_CODE', () => {
    const result = formatCheckResult(
      dependency,
      { code: SUCCESS_STATUS_CODE },
      50,
    );
    expect(result).toEqual({
      name: 'redis',
      description: 'Redis cache layer',
      impact: 'Responses may be slower due to missing cache.',
      healthy: true,
      code: SUCCESS_STATUS_CODE,
      status: SUCCESS_STATUS_MESSAGE,
      latencyMs: 50,
      lastChecked: expect.any(String),
    });
  });
  it('should return a healthy status for when returning only SUCCESS_STATUS_CODE', () => {
    const result = formatCheckResult(
      dependency,
      SUCCESS_STATUS_CODE,
      50,
    );
    expect(result).toEqual({
      name: 'redis',
      description: 'Redis cache layer',
      impact: 'Responses may be slower due to missing cache.',
      healthy: true,
      code: SUCCESS_STATUS_CODE,
      status: SUCCESS_STATUS_MESSAGE,
      latencyMs: 50,
      lastChecked: expect.any(String),
    });
  });

  it('should return a warning status for WARNING_STATUS_CODE', () => {
    const result = formatCheckResult(
      dependency,
      { code: WARNING_STATUS_CODE },
      100,
    );
    expect(result).toEqual({
      name: 'redis',
      description: 'Redis cache layer',
      impact: 'Responses may be slower due to missing cache.',
      healthy: true,
      code: WARNING_STATUS_CODE,
      status: WARNING_STATUS_MESSAGE,
      latencyMs: 100,
      lastChecked: expect.any(String),
    });
  });

  it('should return an unhealthy status for ERROR_STATUS_CODE', () => {
    const result = formatCheckResult(
      dependency,
      { code: ERROR_STATUS_CODE, errorMessage: 'Connection failed' },
      200,
    );
    expect(result).toEqual({
      name: 'redis',
      description: 'Redis cache layer',
      impact: 'Responses may be slower due to missing cache.',
      healthy: false,
      code: ERROR_STATUS_CODE,
      status: ERROR_STATUS_MESSAGE,
      latencyMs: 200,
      errorMessage: 'Connection failed',
      lastChecked: expect.any(String),
    });
  });

  it('should handle missing errorMessage in error status', () => {
    const result = formatCheckResult(dependency, { code: ERROR_STATUS_CODE }, 200);
    expect(result).toEqual({
      name: 'redis',
      description: 'Redis cache layer',
      impact: 'Responses may be slower due to missing cache.',
      healthy: false,
      code: ERROR_STATUS_CODE,
      status: ERROR_STATUS_MESSAGE,
      latencyMs: 200,
      lastChecked: expect.any(String),
    });
  });

  it('should handle an error object in the result', () => {
    const error = new Error('Connection failed');
    const result = formatCheckResult(
      dependency,
      { code: ERROR_STATUS_CODE, error },
      300,
    );
    expect(result).toEqual({
      name: 'redis',
      description: 'Redis cache layer',
      impact: 'Responses may be slower due to missing cache.',
      healthy: false,
      code: ERROR_STATUS_CODE,
      status: ERROR_STATUS_MESSAGE,
      latencyMs: 300,
      error: {
        name: 'Error',
        message: 'Connection failed',
        stack: expect.any(String),
      },
      lastChecked: expect.any(String),
    });
  });
});
