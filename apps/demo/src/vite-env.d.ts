/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 실제 서버 주소. 비워 두면 가짜 서버(src/mock)로 동작합니다 */
  readonly VITE_API_URL?: string;
}
