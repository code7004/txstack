import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import type { HttpClientOptions, RequestLog, ResponseLog } from "./types";

const DEFAULT_MASK_FIELDS = ["password", "privateKey", "token", "accessToken", "refreshToken"];
const MASK = "******";

interface RequestMetadata {
  startTime: number;
}

type ConfigWithMetadata = InternalAxiosRequestConfig & { metadata?: RequestMetadata };

/** 브라우저 콘솔만 `%c` 스타일을 이해한다. Node 에서는 서식 문자열이 그대로 찍힌다. */
const isBrowser = typeof window !== "undefined";

/**
 * URL 을 `pathname + search` 로 줄여 로그를 짧게 만든다.
 * `window` 가 없는 환경(SSR/Node)에서도 안전하도록 origin 을 가짜 값으로 대체한다.
 */
function shortUrl(url?: string): string {
  if (!url) return "";
  const origin = isBrowser ? window.location.origin : "http://localhost";
  try {
    const parsed = new URL(url, origin);
    return parsed.pathname + parsed.search;
  } catch {
    return url;
  }
}

/**
 * 최상위 키 중 `fields` 에 해당하는 값을 가린다. **요청과 응답 둘 다 거친다** —
 * 로그인 응답이 정확히 `accessToken` 을 담는 자리이므로, 요청만 가리면 반쪽이다.
 *
 * **중첩된 객체 안까지 들어가지 않는다.** 로거가 매 요청마다 도는 자리라 깊은 순회를 피했다.
 * 민감한 값을 중첩해 보낸다면 소비자가 `onRequest`·`onResponse` 에서 직접 처리한다.
 */
function maskSensitive(data: unknown, fields: string[]): unknown {
  if (!data || typeof data !== "object" || Array.isArray(data)) return data;

  const clone = { ...(data as Record<string, unknown>) };
  fields.forEach((field) => {
    if (clone[field] !== undefined) clone[field] = MASK;
  });

  return clone;
}

function consoleRequestLogger(log: RequestLog): void {
  const title = `[REQ] ${log.method} ${log.url}`;
  if (isBrowser) console.groupCollapsed(`%c${title}`, "color: #3b82f6");
  else console.group(title);

  console.log("params:", log.params);
  console.log("data:", log.data);
  console.groupEnd();
}

function consoleResponseLogger(log: ResponseLog): void {
  const title = `[RES] ${log.status} ${log.url} (${log.durationMs}ms)`;
  if (isBrowser) console.groupCollapsed(`%c${title}`, "color: #22c55e");
  else console.group(title);

  console.log("data:", log.data);
  console.groupEnd();
}

function consoleErrorLogger(error: AxiosError): void {
  const status = error.response?.status ?? "NETWORK";
  const title = `[ERR] ${status} ${shortUrl(error.config?.url)}`;
  const message = typeof error.response?.data === "object" ? JSON.stringify(error.response?.data) : error.message;

  if (isBrowser) console.groupCollapsed(`%c${title}`, "color: #ef4444");
  else console.group(title);

  console.error(message);
  console.groupEnd();
}

/**
 * 인스턴스에 요청/응답 인터셉터를 붙인다.
 *
 * `createHttpClient` 가 내부에서 부른다. 직접 만든 axios 인스턴스에 같은 정책을 얹고 싶을 때만
 * 밖에서 쓴다.
 *
 * **debug 플래그·인증·401 처리를 전부 옵션으로 주입받는다.** 라이브러리가 앱의 인증 정책이나
 * 번들러 환경변수를 알아서는 안 되기 때문이다.
 */
export function attachInterceptors(instance: AxiosInstance, options: HttpClientOptions): void {
  const { debug = false, maskFields = DEFAULT_MASK_FIELDS, getToken, authHeader = "Authorization", authScheme = "Bearer", onUnauthorized, onError } = options;

  // debug 는 "훅을 안 준 자리에 기본 콘솔 로거를 붙인다" 는 뜻이다. 훅을 직접 주면 그쪽이 이긴다.
  const onRequest = options.onRequest ?? (debug ? consoleRequestLogger : undefined);
  const onResponse = options.onResponse ?? (debug ? consoleResponseLogger : undefined);

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

      // FormData 는 axios 가 boundary 를 포함한 Content-Type 을 직접 만들어야 한다.
      // 미리 박혀 있으면 boundary 가 빠져 서버가 본문을 못 읽는다.
      if (typeof FormData !== "undefined" && config.data instanceof FormData) {
        config.headers.delete("Content-Type");
      }

      onRequest?.({
        method: config.method?.toUpperCase() ?? "GET",
        url: shortUrl(config.url),
        params: maskSensitive(config.params, maskFields),
        data: maskSensitive(config.data, maskFields)
      });

      return config;
    },
    (error) => Promise.reject(error)
  );

  instance.interceptors.response.use(
    (response) => {
      if (onResponse) {
        const start = (response.config as ConfigWithMetadata).metadata?.startTime ?? Date.now();

        onResponse({
          status: response.status,
          method: response.config.method?.toUpperCase() ?? "GET",
          url: shortUrl(response.config.url),
          // 응답도 가린다. 주입된 로거가 값을 외부로 보낼 수 있고, 토큰은 응답에 실려 온다
          data: maskSensitive(response.data, maskFields),
          durationMs: Date.now() - start
        });
      }

      return response;
    },
    (error: AxiosError) => {
      if (debug) consoleErrorLogger(error);

      if (error.response?.status === 401) onUnauthorized?.(error);
      onError?.(error);

      return Promise.reject(error);
    }
  );
}
