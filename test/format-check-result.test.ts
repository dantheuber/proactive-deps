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
      health: {
        state: SUCCESS_STATUS_MESSAGE,
        code: SUCCESS_STATUS_CODE,
        latency: 50,
        skipped: false,
      },
      lastChecked: expect.any(String),
    });
  });

  it('should return a healthy status when returning only SUCCESS_STATUS_CODE', () => {
    const result = formatCheckResult(dependency, SUCCESS_STATUS_CODE, 50);
    expect(result).toEqual({
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
      health: {
        state: WARNING_STATUS_MESSAGE,
        code: WARNING_STATUS_CODE,
        latency: 100,
        skipped: false,
      },
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
      health: {
        state: ERROR_STATUS_MESSAGE,
        code: ERROR_STATUS_CODE,
        latency: 200,
        skipped: false,
      },
      errorMessage: 'Connection failed',
      lastChecked: expect.any(String),
    });
  });

  it('should handle missing errorMessage in error status', () => {
    const result = formatCheckResult(
      dependency,
      { code: ERROR_STATUS_CODE },
      200,
    );
    expect(result).toEqual({
      name: 'redis',
      description: 'Redis cache layer',
      impact: 'Responses may be slower due to missing cache.',
      healthy: false,
      health: {
        state: ERROR_STATUS_MESSAGE,
        code: ERROR_STATUS_CODE,
        latency: 200,
        skipped: false,
      },
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
      health: {
        state: ERROR_STATUS_MESSAGE,
        code: ERROR_STATUS_CODE,
        latency: 300,
        skipped: false,
      },
      error: {
        name: 'Error',
        message: 'Connection failed',
        stack: expect.any(String),
      },
      lastChecked: expect.any(String),
    });
  });

  it('should return a skipped status when dependency skip is true', () => {
    const result = formatCheckResult(
      { ...dependency, skip: true }, // Add the skip property to the dependency
      { code: SUCCESS_STATUS_CODE },
      0, // Latency is 0 since the check is skipped
      true, // Indicate that the check was skipped
    );
    expect(result).toEqual({
      name: 'redis',
      description: 'Redis cache layer',
      impact: 'Responses may be slower due to missing cache.',
      healthy: true, // Skipped dependencies are considered healthy
      health: {
        state: SUCCESS_STATUS_MESSAGE, // Use the success state for skipped dependencies
        code: SUCCESS_STATUS_CODE, // Use the success code for skipped dependencies
        latency: 0, // No latency since the check is skipped
        skipped: true, // Indicate that the check was skipped
      },
      lastChecked: expect.any(String),
    });
  });
});
