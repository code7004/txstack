import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import type { HttpClientOptions } from "./types";

const DEFAULT_MASK_FIELDS = ["password", "privateKey", "token", "accessToken", "refreshToken"];
const MASK = "******";

interface RequestMetadata {
  startTime: number;
}

type ConfigWithMetadata = InternalAxiosRequestConfig & { metadata?: RequestMetadata };

/**
 * URL 을 `pathname + search` 로 줄여 로그를 짧게 만든다.
 * `window` 가 없는 환경(SSR/Node)에서도 안전하도록 origin 을 가짜 값으로 대체한다.
 */
function shortUrl(url?: string): string {
  if (!url) return "";
  const origin = typeof window === "undefined" ? "http://localhost" : window.location.origin;
  try {
    const parsed = new URL(url, origin);
    return parsed.pathname + parsed.search;
  } catch {
    return url;
  }
}

function maskSensitive(data: unknown, fields: string[]): unknown {
  if (!data || typeof data !== "object" || Array.isArray(data)) return data;

  const clone = { ...(data as Record<string, unknown>) };
  fields.forEach((field) => {
    if (clone[field] !== undefined) clone[field] = MASK;
  });

  return clone;
}

/**
 * 인스턴스에 요청/응답 인터셉터를 붙인다.
 *
 * 원본(chain-wallet-service)과 달리 debug 플래그·인증·401 처리를 **전부 옵션으로 주입받는다.**
 * 라이브러리가 앱의 인증 정책이나 번들러 환경변수를 알아서는 안 되기 때문이다.
 */
export function attachInterceptors(instance: AxiosInstance, options: HttpClientOptions): void {
  const { debug = false, maskFields = DEFAULT_MASK_FIELDS, getToken, authHeader = "Authorization", authScheme = "Bearer", onUnauthorized, onError } = options;

  instance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      const extended = config as ConfigWithMetadata;
      extended.metadata = { startTime: Date.now() };

      if (getToken) {
        const token = await getToken();
        if (token) {
          config.headers.set(authHeader, authScheme ? `${authScheme} ${token}` : token);
        }
      }

      if (debug) {
        console.groupCollapsed(`%c[REQ] ${config.method?.toUpperCase()} ${shortUrl(config.url)}`, "color: #3b82f6");
        console.log("params:", config.params);
        console.log("data:", maskSensitive(config.data, maskFields));
        console.groupEnd();
      }

      return config;
    },
    (error) => {
      console.error("[REQUEST ERROR]", error);
      return Promise.reject(error);
    }
  );

  instance.interceptors.response.use(
    (response) => {
      if (debug) {
        const start = (response.config as ConfigWithMetadata).metadata?.startTime ?? Date.now();
        const duration = Date.now() - start;

        console.groupCollapsed(`%c[RES] ${response.status} ${shortUrl(response.config.url)} (${duration}ms)`, "color: #22c55e");
        console.log("data:", response.data);
        console.groupEnd();
      }

      return response;
    },
    (error: AxiosError) => {
      if (debug) {
        const status = error.response?.status ?? "NETWORK";
        const message = typeof error.response?.data === "object" ? JSON.stringify(error.response?.data) : error.message;

        console.groupCollapsed(`%c[ERR] ${status} ${shortUrl(error.config?.url)}`, "color: #ef4444");
        console.error(message);
        console.groupEnd();
      }

      if (error.response?.status === 401) onUnauthorized?.(error);
      onError?.(error);

      return Promise.reject(error);
    }
  );
}
