import { createHttpClient } from "@txstack/axios";

/**
 * **앱이 함께 쓰는 HTTP 클라이언트 하나.** 화면은 이 파일을 직접 쓰지 않고 각 기능의 `*Api.ts` 를 거칩니다.
 *
 * 이 예제에서는 가짜 서버(mock/)를 axios 의 adapter 자리에 끼워 답합니다. 실제 앱에서는 그 줄을 빼고
 * `baseURL` 을 서버 주소로 바꿉니다. 응답 형식이 `{ body: ... }` 가 아니면 `unwrap` 을, 인증 방식이 다르면
 * `getToken` · `onUnauthorized` 를 서버에 맞게 고칩니다.
 */
export const api = createHttpClient({
  baseURL: "/api",
  timeout: 10_000,
  getToken: () => localStorage.getItem("accessToken"),
  unwrap: (data) => (data as { body: unknown }).body
});
