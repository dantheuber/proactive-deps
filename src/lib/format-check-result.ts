import {
  SUCCESS_STATUS_CODE,
  ERROR_STATUS_CODE,
  WARNING_STATUS_CODE,
  SUCCESS_STATUS_MESSAGE,
  ERROR_STATUS_MESSAGE,
  WARNING_STATUS_MESSAGE,
} from '../constants';
import {
  DependencyCheckOptions,
  DependencyCheckResult,
  DependencyStatus,
} from '../types';

type ErrorObject = {
  name: string;
  message: string;
  stack?: string;
};
const objectifyError = (error: Error | undefined): ErrorObject | undefined =>
  error
    ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      }
    : undefined;

export default function formatCheckResult(
  dependency: DependencyCheckOptions,
  result: DependencyCheckResult,
  latencyMs: number = 0,
): DependencyStatus {
  const resultCode = typeof result === 'number' ? result : result.code;
  const resultError = typeof result === 'number' ? undefined : result.error;
  const resultErrorMessage =
    typeof result === 'number' ? undefined : result.errorMessage;
  const status: DependencyStatus & { error?: Error; errorMessage?: string } = {
    name: dependency.name,
    lastChecked: new Date().toISOString(),
    description: dependency.description,
    impact: dependency.impact,
    healthy: false,
    code: ERROR_STATUS_CODE,
    status: ERROR_STATUS_MESSAGE,
    latencyMs: latencyMs,
  };

  switch (resultCode) {
    case SUCCESS_STATUS_CODE:
      status.healthy = true;
      status.code = SUCCESS_STATUS_CODE;
      status.status = SUCCESS_STATUS_MESSAGE;
      break;
    case WARNING_STATUS_CODE:
      status.healthy = true;
      status.code = WARNING_STATUS_CODE;
      status.status = WARNING_STATUS_MESSAGE;
      break;
    case ERROR_STATUS_CODE:
      status.error = objectifyError(resultError);
      status.errorMessage = resultErrorMessage;
    default:
      break;
  }

  return status as DependencyStatus;
}
