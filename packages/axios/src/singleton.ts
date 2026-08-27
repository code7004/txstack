/**
 * `@txstack/axios/singleton` — 앱 전역 기본 클라이언트.
 *
 * **권장 방식이 아니다. 루트 배럴에서 일부러 뺐다.**
 *
 * 권장은 `createHttpClient` 로 만든 인스턴스를 모듈에서 export 하는 것이다 —
 * ESM 모듈 자체가 싱글턴이라 같은 일을 전역 상태 없이 할 수 있다.
 *
 * ```ts
 * // src/lib/api.ts  ← 이것으로 충분하다
 * export const api = createHttpClient({ baseURL: "/api" });
 * ```
 *
 * 이 서브패스는 기존 `initAxios`/`getAxios` 패턴을 쓰던 코드를 **옮겨오는 동안**의 호환
 * 계층이다. 전역 상태라 테스트 격리가 어렵고 클라이언트를 둘 이상 둘 수 없다.
 */
import { createHttpClient } from "./client";
import type { HttpClient, HttpClientOptions } from "./types";

let defaultClient: HttpClient | null = null;

/**
 * 전역 기본 클라이언트를 만든다.
 *
 * **이미 있어도 새로 만들어 교체한다 — 마지막 호출이 이긴다.** 원본은 baseURL 만 갱신하고
 * 나머지 옵션을 조용히 버렸는데, 그러면 `onUnauthorized` 를 바꿔 넣어도 반영되지 않아
 * 원인을 찾기 어렵다.
 */
export function initHttpClient(options: HttpClientOptions): HttpClient {
  defaultClient = createHttpClient(options);
  return defaultClient;
}

/** 전역 기본 클라이언트를 반환한다. `initHttpClient` 전에 호출하면 던진다. */
export function getHttpClient(): HttpClient {
  if (!defaultClient) throw new Error("[@txstack/axios] HttpClient is not initialized. Call initHttpClient() first.");
  return defaultClient;
}

/** 전역 기본 클라이언트를 비운다. 테스트에서 상태를 격리할 때 쓴다. */
export function resetHttpClient(): void {
  defaultClient = null;
}
