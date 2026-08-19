import type { AxiosError } from "axios";
import type { IApiError } from "./types";

/**
 * 값이 `undefined` 이거나 공백 문자열인 키를 제거한다.
 * query string 을 만들 때 빈 파라미터가 붙는 것을 막는다.
 */
export function removeUndefined<T extends object>(params?: T): Partial<T> {
  if (!params) return {};

  const result: Partial<T> = {};

  Object.keys(params).forEach((key) => {
    const value = params[key as keyof T];

    if (value !== undefined && String(value).trim() !== "") {
      result[key as keyof T] = value;
    }
  });

  return result;
}

/** 만료 시각(ms epoch)이 지났는지. `expiresAt` 이 없으면 만료로 본다. */
export function isTokenExpired(expiresAt: number | undefined): boolean {
  if (!expiresAt) return true;
  return Date.now() > expiresAt;
}

/** axios 에러 / 일반 Error / 그 외를 `IApiError` 한 형태로 정규화한다. */
export function parseApiError(err: unknown): IApiError {
  const defaultError: IApiError = {
    statusCode: 500,
    message: "Unknown error"
  };

  if (!err) return defaultError;

  if ((err as AxiosError).isAxiosError) {
    const axiosErr = err as AxiosError<IApiError>;
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
