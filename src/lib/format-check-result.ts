import {
  SUCCESS_STATUS_CODE,
  ERROR_STATUS_CODE,
  WARNING_STATUS_CODE,
  SUCCESS_STATUS_MESSAGE,
  ERROR_STATUS_MESSAGE,
  WARNING_STATUS_MESSAGE,
} from '../constants';
import { DependencyCheckResult, DependencyStatus } from '../types';

export default function formatCheckResult(
  dependencyName: string,
  result: DependencyCheckResult,
  latencyMs: number = 0,
): DependencyStatus {
  const status: DependencyStatus & { error?: Error; errorMessage?: string } = {
    name: dependencyName,
    healthy: false,
    code: ERROR_STATUS_CODE,
    message: ERROR_STATUS_MESSAGE,
    latencyMs: latencyMs,
  };

  if (result.code === SUCCESS_STATUS_CODE) {
    status.healthy = true;
    status.code = SUCCESS_STATUS_CODE;
    status.message = SUCCESS_STATUS_MESSAGE;
  } else if (result.code === WARNING_STATUS_CODE) {
    status.healthy = true;
    status.code = WARNING_STATUS_CODE;
    status.message = WARNING_STATUS_MESSAGE;
  }

  if (result.error) {
    status.error = result.error;
  }

  if (result.errorMessage) {
    status.errorMessage = result.errorMessage;
  }

  return status as DependencyStatus;
}
