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

/** 이보다 깊은 곳은 들어가지 않고 줄인다. 로그 한 줄을 위해 큰 응답 전체를 도는 일을 막는다 */
const MAX_DEPTH = 8;

/**
 * URL 을 `pathname + search` 로 줄이고, **쿼리의 민감한 값을 가린다**(`?token=******`).
 * 콜백 · 내려받기 링크처럼 토큰이 주소에 실리는 자리가 있다.
 * `window` 가 없는 환경(SSR/Node)에서도 안전하도록 origin 을 가짜 값으로 대체한다.
 */
function maskUrl(url: string | undefined, fields: Set<string>): string {
  if (!url) return "";
  const origin = isBrowser ? window.location.origin : "http://localhost";
  try {
    const parsed = new URL(url, origin);
    parsed.searchParams.forEach((_, key) => {
      if (fields.has(key)) parsed.searchParams.set(key, MASK);
    });
    return parsed.pathname + parsed.search;
  } catch {
    return url;
  }
}

const isPlainObject = (value: object): value is Record<string, unknown> => {
  const proto = Object.getPrototypeOf(value) as unknown;
  return proto === Object.prototype || proto === null;
};

/**
 * 로그에 실을 값을 만든다. **원본은 건드리지 않고 가린 사본을 돌려준다.**
 *
 * - 평범한 객체와 배열은 **안쪽까지** 들어가 `fields` 에 해당하는 키의 값을 가린다
 * - JSON 문자열(`{`·`[` 로 시작)은 풀어서 가린 뒤 다시 문자열로 만든다
 * - `URLSearchParams` 는 같은 키를 가린 사본을 만든다
 * - 그 밖의 값(`FormData` · `Blob` · `ArrayBuffer` · `Date` · 클래스 인스턴스 · JSON 이 아닌 문자열)은 그대로 둔다
 * - 순환 참조는 `"[Circular]"`, `MAX_DEPTH` 보다 깊은 곳은 `"[…]"` 로 줄인다
 *
 * 키 이름은 **정확히 같을 때만** 맞춘다(대소문자 구분).
 */
function maskValue(value: unknown, fields: Set<string>, path: WeakSet<object>, depth: number): unknown {
  if (typeof value === "string") return maskJsonString(value, fields, path, depth);
  if (!value || typeof value !== "object") return value;
  if (path.has(value)) return "[Circular]";
  if (depth >= MAX_DEPTH) return "[…]";

  if (typeof URLSearchParams !== "undefined" && value instanceof URLSearchParams) {
    const copy = new URLSearchParams(value);
    copy.forEach((_, key) => {
      if (fields.has(key)) copy.set(key, MASK);
    });
    return copy;
  }

  if (!Array.isArray(value) && !isPlainObject(value)) return value;

  // 지금 내려가는 길에 있는 것만 기억한다 — 같은 객체가 형제 자리에 두 번 나오는 것은 순환이 아니다
  path.add(value);
  const masked = Array.isArray(value) ? value.map((item) => maskValue(item, fields, path, depth + 1)) : Object.fromEntries(Object.entries(value).map(([key, item]) => [key, fields.has(key) ? MASK : maskValue(item, fields, path, depth + 1)]));
  path.delete(value);

  return masked;
}

function maskJsonString(text: string, fields: Set<string>, path: WeakSet<object>, depth: number): string {
  const head = text.trimStart()[0];
  if (head !== "{" && head !== "[") return text;
  try {
    return JSON.stringify(maskValue(JSON.parse(text) as unknown, fields, path, depth));
  } catch {
    return text;
  }
}

/**
 * `fields` 에 해당하는 값을 가린다. **요청과 응답과 오류 로그를 모두 거친다** — 로그인 응답이 정확히
 * `accessToken` 을 담는 자리이고, 오류 응답이 받은 요청을 되돌려 주기도 한다.
 *
 * 로그를 남길 때만 돈다(훅이나 `debug` 가 없으면 부르지 않는다).
 */
function maskSensitive(data: unknown, fields: Set<string>): unknown {
  return maskValue(data, fields, new WeakSet(), 0);
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

function consoleErrorLogger(error: AxiosError, fields: Set<string>): void {
  const status = error.response?.status ?? "NETWORK";
  const title = `[ERR] ${status} ${maskUrl(error.config?.url, fields)}`;
  // 오류 응답도 가린다. 서버가 받은 요청(비밀번호 등)이나 토큰을 되돌려 주는 경우가 있다
  const data = error.response?.data;
  const message = data && typeof data === "object" ? JSON.stringify(maskSensitive(data, fields)) : typeof data === "string" && data ? maskJsonString(data, fields, new WeakSet(), 0) : error.message;

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
  const { debug = false, getToken, authHeader = "Authorization", authScheme = "Bearer", onUnauthorized, onError } = options;

  const maskFields = new Set(options.maskFields ?? DEFAULT_MASK_FIELDS);

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
        url: maskUrl(config.url, maskFields),
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
          url: maskUrl(response.config.url, maskFields),
          // 응답도 가린다. 주입된 로거가 값을 외부로 보낼 수 있고, 토큰은 응답에 실려 온다
          data: maskSensitive(response.data, maskFields),
          durationMs: Date.now() - start
        });
      }

      return response;
    },
    (error: AxiosError) => {
      if (debug) consoleErrorLogger(error, maskFields);

      if (error.response?.status === 401) onUnauthorized?.(error);
      onError?.(error);

      return Promise.reject(error);
    }
  );
}
