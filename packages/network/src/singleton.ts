import type { AxiosInstance, AxiosRequestConfig } from "axios";
import { createHttpClient } from "./client";
import type { HttpClient, HttpClientOptions } from "./types";

/**
 * 앱 전역 기본 클라이언트.
 *
 * 권장 방식은 `createHttpClient` 로 인스턴스를 직접 들고 다니는 것이다.
 * 이 싱글턴은 기존 코드(`initAxios`/`getAxios` 패턴)를 옮겨오기 위한 호환 계층이며,
 * 테스트 격리가 어렵고 클라이언트를 둘 이상 둘 수 없으므로 신규 코드에서는 쓰지 않는다.
 */
let defaultClient: HttpClient | null = null;

/** 전역 기본 클라이언트를 만들거나, 이미 있으면 설정만 갱신한다. */
export function initHttpClient(options: HttpClientOptions): HttpClient {
  if (defaultClient) {
    defaultClient.setBaseURL(options.baseURL);
    return defaultClient;
  }

  defaultClient = createHttpClient(options);
  return defaultClient;
}

/** 전역 기본 클라이언트를 반환한다. `initHttpClient` 전에 호출하면 던진다. */
export function getHttpClient(): HttpClient {
  if (!defaultClient) throw new Error("[@txstack/network] HttpClient is not initialized. Call initHttpClient() first.");
  return defaultClient;
}

/** 전역 기본 클라이언트를 비운다. 테스트에서 상태를 격리할 때 쓴다. */
export function resetHttpClient(): void {
  defaultClient = null;
}

/** 전역 클라이언트의 원본 axios 인스턴스. */
export function getAxios(): AxiosInstance {
  return getHttpClient().instance;
}

/** 전역 클라이언트의 axios defaults 를 덮어쓴다. */
export function changeAxiosConfig(config: Partial<AxiosRequestConfig>): void {
  getHttpClient().setConfig(config);
}

/** 전역 클라이언트의 baseURL 을 바꾼다. */
export function changeAxiosBaseUrl(baseURL: string): void {
  getHttpClient().setBaseURL(baseURL);
}
