import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios";
import { attachInterceptors } from "./interceptors";
import type { DeleteOptions, HttpClient, HttpClientOptions } from "./types";

/** 브라우저 XHR 어댑터만 `responseType: "blob"` 을 이해한다. Node 어댑터는 arraybuffer 로 받는다. */
const supportsBlobResponse = typeof window !== "undefined" && typeof window.XMLHttpRequest !== "undefined";

/**
 * HTTP 클라이언트를 만든다.
 *
 * **모듈 하나에서 만들어 export 하면 그것이 곧 앱의 단일 클라이언트다** — ESM 모듈 자체가
 * 싱글턴이라 패키지가 전역 상태를 들 필요가 없다.
 *
 * ```ts
 * // src/lib/api.ts
 * export const api = createHttpClient({ baseURL: "/api" });
 * ```
 *
 * baseURL 이 부팅 후에 정해진다면 먼저 만들어두고 `api.setBaseURL(ip)` 를 부른다.
 *
 * - `get/post/put/patch/delete` : `unwrap` 을 거친 응답 본문을 반환한다.
 * - `getBlob/getText`           : 봉투가 없는 원본 응답(파일 다운로드 등)을 그대로 반환한다.
 *
 * @example
 * const api = createHttpClient({
 *   baseURL: "/api",
 *   getToken: () => sessionStorage.getItem("token"),
 *   onUnauthorized: () => store.dispatch(logout()),
 *   unwrap: (data) => (data as { body: unknown }).body
 * });
 */
export function createHttpClient(options: HttpClientOptions): HttpClient {
  if (!options.baseURL) throw new Error("[@txstack/axios] baseURL is required");

  const instance = axios.create({
    baseURL: options.baseURL,
    withCredentials: options.withCredentials ?? false,
    timeout: options.timeout,
    // Content-Type 을 기본값으로 넣지 않는다. axios 가 본문 종류를 보고 정한다 —
    // 객체면 application/json, FormData 면 boundary 가 붙은 multipart/form-data.
    headers: options.headers
  });

  attachInterceptors(instance, options);

  const unwrap = options.unwrap;
  const take = <T>(res: AxiosResponse<unknown>): T => (unwrap ? (unwrap(res.data) as T) : (res.data as T));

  return {
    instance,

    async get<T>(url: string, params?: unknown, config?: AxiosRequestConfig): Promise<T> {
      return take<T>(await instance.get(url, { params, ...config }));
    },

    async post<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
      return take<T>(await instance.post(url, body, config));
    },

    async put<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
      return take<T>(await instance.put(url, body, config));
    },

    async patch<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
      return take<T>(await instance.patch(url, body, config));
    },

    async delete<T>(url: string, deleteOptions?: DeleteOptions, config?: AxiosRequestConfig): Promise<T> {
      return take<T>(
        await instance.delete(url, {
          params: deleteOptions?.params,
          data: deleteOptions?.body,
          ...config
        })
      );
    },

    async getBlob(url: string, config?: AxiosRequestConfig): Promise<Blob> {
      if (supportsBlobResponse) {
        const res = await instance.get<Blob>(url, { ...config, responseType: "blob" });
        return res.data;
      }

      // Node 어댑터는 blob 을 모른다. arraybuffer 로 받아 감싸 준다 (Node 18+ 전역 Blob).
      const res = await instance.get<ArrayBuffer>(url, { ...config, responseType: "arraybuffer" });
      return new Blob([res.data]);
    },

    async getText(url: string, config?: AxiosRequestConfig): Promise<string> {
      const res = await instance.get<string>(url, { ...config, responseType: "text" });
      return res.data;
    },

    setBaseURL(baseURL: string): void {
      instance.defaults.baseURL = baseURL;
    },

    setConfig(config: Partial<AxiosRequestConfig>): void {
      Object.assign(instance.defaults, config);
    }
  };
}
