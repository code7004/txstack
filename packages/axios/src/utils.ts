import type { AxiosError } from "axios";
import type { ApiError } from "./types";

/** axios 에러 / 일반 Error / 그 외를 `ApiError` 한 형태로 정규화한다. */
export function parseApiError(err: unknown): ApiError {
  const defaultError: ApiError = {
    statusCode: 500,
    message: "Unknown error"
  };

  if (!err) return defaultError;

  if ((err as AxiosError).isAxiosError) {
    const axiosErr = err as AxiosError<ApiError>;
    const data = axiosErr.response?.data;

    if (data) {
      return {
        statusCode: data.statusCode ?? axiosErr.response?.status ?? 500,
        message: data.message ?? "Request failed",
        error: data.error,
        path: data.path,
        timestamp: data.timestamp
      };
    }

    return {
      statusCode: axiosErr.response?.status ?? 500,
      message: axiosErr.message
    };
  }

  if (err instanceof Error) {
    return {
      statusCode: 500,
      message: err.message
    };
  }

  return defaultError;
}
