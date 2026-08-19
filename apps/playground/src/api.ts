import { createHttpClient, type IApiError } from "@txstack/network";
import type { InternalAxiosRequestConfig } from "axios";

/**
 * playground 용 HTTP 클라이언트.
 *
 * 실제 서버 없이 `@txstack/network` 를 검증하기 위해 axios adapter 를 목으로 갈아끼운다.
 * 주입 옵션(getToken / onUnauthorized / unwrap)이 실제로 동작하는지 화면에서 확인하는 것이 목적이다.
 */

export interface IDemoUser {
  id: number;
  name: string;
  role: string;
}

/** onUnauthorized 가 실제로 호출됐는지 화면에서 보기 위한 기록 */
export const authLog: string[] = [];

let token: string | null = "demo-token";

export function setToken(next: string | null) {
  token = next;
}

const api = createHttpClient({
  baseURL: "/api",
  debug: true,
  getToken: () => token,
  onUnauthorized: () => authLog.push(`401 → onUnauthorized (${new Date().toLocaleTimeString()})`),
  // 서버가 { success, body } 봉투로 감싼다고 가정
  unwrap: (data) => (data as { body: unknown }).body
});

// ── 목 서버 ────────────────────────────────────────────────────────────────
const USERS: IDemoUser[] = [
  { id: 1, name: "alex", role: "admin" },
  { id: 2, name: "mika", role: "member" },
  { id: 3, name: "june", role: "member" }
];

api.instance.defaults.adapter = async (config: InternalAxiosRequestConfig) => {
  await new Promise((resolve) => setTimeout(resolve, 400));

  const url = config.url ?? "";
  const authorization = config.headers?.get?.("Authorization") ?? null;

  const reply = (body: unknown, status = 200) => ({
    data: { success: true, body },
    status,
    statusText: "OK",
    headers: {},
    config
  });

  if (url === "/users") return reply({ users: USERS, authorization });
  if (url === "/export") return reply("id,name,role\n1,alex,admin");

  if (url === "/unauthorized") {
    const error = Object.assign(new Error("Request failed with status code 401"), {
      isAxiosError: true,
      config,
      response: { status: 401, data: { statusCode: 401, message: "token expired" } as IApiError, config, headers: {} }
    });
    throw error;
  }

  const error = Object.assign(new Error("Request failed with status code 404"), {
    isAxiosError: true,
    config,
    response: { status: 404, data: { statusCode: 404, message: `no route for ${url}` } as IApiError, config, headers: {} }
  });
  throw error;
};

export { api };
