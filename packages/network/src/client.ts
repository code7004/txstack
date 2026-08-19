import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios";
import { attachInterceptors } from "./interceptors";
import type { DeleteOptions, HttpClient, HttpClientOptions } from "./types";

/**
 * HTTP 클라이언트를 만든다.
 *
 * 화면·훅·`*.api.ts` 는 저수준 `axios`/`fetch` 를 직접 쓰지 않고 이 클라이언트로만 호출한다.
 *
 * - `get/post/put/patch/del` : `unwrap` 을 거친 응답 본문을 반환한다.
 * - `getBlob/getText`        : 봉투가 없는 원본 응답(파일 다운로드 등)을 그대로 반환한다.
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
  if (!options.baseURL) throw new Error("[@txstack/network] baseURL is required");

  const instance = axios.create({
    baseURL: options.baseURL,
    withCredentials: options.withCredentials ?? true,
    timeout: options.timeout,
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    }
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

    async del<T>(url: string, deleteOptions?: DeleteOptions, config?: AxiosRequestConfig): Promise<T> {
      return take<T>(
        await instance.delete(url, {
          params: deleteOptions?.params,
          data: deleteOptions?.body,
          ...config
        })
      );
    },

    async getBlob(url: string, config?: AxiosRequestConfig): Promise<Blob> {
      const res = await instance.get<Blob>(url, { ...config, responseType: "blob" });
      return res.data;
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
