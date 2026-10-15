import { createHttpClient } from "@txstack/axios";

/**
 * **앱이 함께 쓰는 HTTP 클라이언트 하나.** 화면은 이 파일을 직접 쓰지 않고 각 기능의
 * `*Api.ts` 를 거칩니다.
 *
 * 실제 서버로 바꾸려면 `.env` 에 `VITE_API_URL` 을 적습니다. 그러면 main.tsx 가 가짜 서버를
 * 끼우지 않고 그 주소로 요청합니다. 응답 형식이 `{ body: ... }` 가 아니면 `unwrap` 을,
 * 인증 방식이 다르면 `getToken` · `onUnauthorized` 를 서버에 맞게 고칩니다.
 */
export const API_URL = import.meta.env.VITE_API_URL as string | undefined;

export const api = createHttpClient({
  baseURL: API_URL || "/api",
  timeout: 10_000,
  getToken: () => localStorage.getItem("accessToken"),
  unwrap: (data) => (data as { body: unknown }).body
});
