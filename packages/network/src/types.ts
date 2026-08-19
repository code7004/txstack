import type { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";

/**
 * 서버 공통 응답 봉투의 대표적인 형태.
 *
 * 이 패키지는 이 형태를 **강제하지 않는다.** 서비스마다 봉투 규약이 다르므로
 * 실제 해제는 `HttpClientOptions.unwrap` 으로 주입한다. 이 타입은 참고용 기본값이다.
 */
export interface IApiResponse<T> {
  success: boolean;
  status: string;
  data: T;
  limit: number;
  offset: number;
  total: number;
  message: string;
}

/** 정규화된 API 에러. `parseApiError` 의 반환 타입이다. */
export interface IApiError {
  statusCode: number;
  message: string;
  error?: string;
  path?: string;
  timestamp?: string;
}

/** `del()` 의 두 번째 인자. DELETE 는 query 와 body 를 동시에 쓰는 경우가 있다. */
export interface DeleteOptions {
  params?: unknown;
  body?: unknown;
}

export interface HttpClientOptions {
  /** 필수. 예: `"/api"` 또는 `"https://api.example.com"` */
  baseURL: string;
  withCredentials?: boolean;
  headers?: Record<string, string>;
  timeout?: number;

  /**
   * 요청/응답 로그를 콘솔에 출력한다.
   *
   * 원본(chain-wallet-service)은 `import.meta.env.VITE_API_DEBUG` 를 직접 읽었는데,
   * 그러면 Vite 가 아닌 소비자(Next.js, Node, Jest)에서 깨진다. 옵션으로 주입받는다.
   */
  debug?: boolean;
  /** debug 로깅 시 값을 가릴 필드명. 기본값: password / privateKey / token / accessToken / refreshToken */
  maskFields?: string[];

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
  del<T>(url: string, options?: DeleteOptions, config?: AxiosRequestConfig): Promise<T>;

  /** 봉투를 거치지 않는 원본 응답. 파일 다운로드용. */
  getBlob(url: string, config?: AxiosRequestConfig): Promise<Blob>;
  /** 봉투를 거치지 않는 원본 응답. 텍스트(CSV 등)용. */
  getText(url: string, config?: AxiosRequestConfig): Promise<string>;

  setBaseURL(baseURL: string): void;
  setConfig(config: Partial<AxiosRequestConfig>): void;
}
