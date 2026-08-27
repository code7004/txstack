import type { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";

/** 정규화된 API 에러. `parseApiError` 의 반환 타입이다. */
export interface IApiError {
  statusCode: number;
  message: string;
  error?: string;
  path?: string;
  timestamp?: string;
}

/** `delete()` 의 두 번째 인자. DELETE 는 query 와 body 를 동시에 쓰는 경우가 있다. */
export interface DeleteOptions {
  params?: unknown;
  body?: unknown;
}

/**
 * `onRequest` 가 받는 요청 정보.
 *
 * **`data` 와 `params` 는 `maskFields` 가 적용된 뒤의 값이다.** 주입된 로거가 값을 외부로
 * 보낼 수 있으므로, 마스킹을 훅 호출 전에 끝낸다.
 */
export interface RequestLog {
  method: string;
  url: string;
  params?: unknown;
  data?: unknown;
}

/** `onResponse` 가 받는 응답 정보. */
export interface ResponseLog {
  status: number;
  method: string;
  url: string;
  data?: unknown;
  durationMs: number;
}

export interface HttpClientOptions {
  /** 필수. 예: `"/api"` 또는 `"https://api.example.com"` */
  baseURL: string;

  /**
   * 크로스 오리진 요청에 쿠키를 실을지. **기본값은 axios 와 같은 `false` 다.**
   *
   * 라이브러리가 이 값을 기본으로 켜면 소비자가 모르는 사이 인증 쿠키가 함께 나간다.
   * 쿠키 인증을 쓰는 앱이 명시적으로 켠다.
   */
  withCredentials?: boolean;

  /**
   * 모든 요청에 붙일 헤더.
   *
   * **`Content-Type` 을 여기에 고정하지 않는 편이 좋다.** axios 가 본문 종류를 보고 알아서
   * 정한다 — 평범한 객체면 `application/json`, `FormData` 면 boundary 가 붙은 `multipart/form-data`.
   * 고정해 두면 파일 업로드에서 boundary 가 빠져 서버가 본문을 못 읽는다.
   */
  headers?: Record<string, string>;

  timeout?: number;

  /**
   * 요청/응답을 콘솔에 출력한다. **`onRequest`/`onResponse` 를 주지 않은 자리에만** 기본
   * 콘솔 로거를 붙이는 편의 플래그다. 훅을 직접 주면 그쪽이 이긴다.
   *
   * 원본(chain-wallet-service)은 `import.meta.env.VITE_API_DEBUG` 를 직접 읽었는데,
   * 그러면 Vite 가 아닌 소비자(Next.js, Node, Jest)에서 깨진다. 옵션으로 주입받는다.
   */
  debug?: boolean;

  /** 로그에서 값을 가릴 필드명. 기본값: password / privateKey / token / accessToken / refreshToken */
  maskFields?: string[];

  /**
   * 요청이 나가기 직전 호출된다. **로그를 콘솔이 아닌 곳으로 보낼 때 쓴다** —
   * 자체 모니터링 대시보드, 파일, Sentry breadcrumb 등.
   */
  onRequest?: (log: RequestLog) => void;

  /** 응답이 도착하면 호출된다. `durationMs` 로 느린 요청을 걸러낼 수 있다. */
  onResponse?: (log: ResponseLog) => void;

  /** 매 요청마다 호출되어 인증 헤더를 만든다. 반환값이 없으면 헤더를 붙이지 않는다. */
  getToken?: () => string | null | undefined | Promise<string | null | undefined>;
  /** 인증 헤더 이름. 기본값 `"Authorization"` */
  authHeader?: string;
  /** 인증 스킴. 기본값 `"Bearer"`. 빈 문자열이면 토큰만 넣는다. */
  authScheme?: string;

  /** 401 응답 시 호출된다. 로그아웃 등 앱 정책을 여기서 처리한다. */
  onUnauthorized?: (error: AxiosError) => void;
  /** 모든 에러 응답에서 호출된다. (401 포함) */
  onError?: (error: AxiosError) => void;

  /**
   * 응답 봉투 해제기. 기본값은 `res.data` 를 그대로 반환한다.
   *
   * 봉투가 `{ body: T }` 형태라면: `unwrap: (data) => data.body`
   */
  unwrap?: (data: unknown) => unknown;
}

export interface HttpClient {
  /** 원본 axios 인스턴스. 이 래퍼가 커버하지 않는 케이스에 쓴다. */
  readonly instance: AxiosInstance;

  get<T>(url: string, params?: unknown, config?: AxiosRequestConfig): Promise<T>;
  post<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T>;
  put<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T>;
  patch<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T>;
  delete<T>(url: string, options?: DeleteOptions, config?: AxiosRequestConfig): Promise<T>;

  /** 봉투를 거치지 않는 원본 응답. 파일 다운로드용. 브라우저·Node 양쪽에서 `Blob` 을 준다. */
  getBlob(url: string, config?: AxiosRequestConfig): Promise<Blob>;
  /** 봉투를 거치지 않는 원본 응답. 텍스트(CSV 등)용. */
  getText(url: string, config?: AxiosRequestConfig): Promise<string>;

  setBaseURL(baseURL: string): void;
  setConfig(config: Partial<AxiosRequestConfig>): void;
}
