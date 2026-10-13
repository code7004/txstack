import { createHttpClient } from "@txstack/axios";
import { AxiosError, type AxiosAdapter, type AxiosResponse } from "axios";

export interface Member {
  id: string;
  name: string;
  email: string;
  joinedAt: string;
}

export interface MemberPage {
  rows: Member[];
  total: number;
}

/** 서버가 { body: ... } 로 감싸 보낸다고 가정한다. 실제 서비스의 응답 형식에 맞춰 바꾼다 */
export const api = createHttpClient({
  baseURL: "/api",
  timeout: 10_000,
  getToken: () => localStorage.getItem("accessToken"),
  unwrap: (data) => (data as { body: unknown }).body
});

/* ------------------------------------------------------------------------------------------
 * 여기부터는 예제용 가짜 서버입니다. 실제 앱에서는 이 아래를 모두 지우면 진짜 서버로 요청합니다.
 * ------------------------------------------------------------------------------------------ */

const NAMES = ["김하늘", "박도윤", "이서아", "최민준", "정유나", "한지호", "오세린"];

let members: Member[] = Array.from({ length: 23 }, (_, index) => ({
  id: `M-${1041 + index}`,
  name: `${NAMES[index % NAMES.length]}${index < NAMES.length ? "" : ` ${Math.floor(index / NAMES.length) + 1}`}`,
  email: `user${index + 1}@example.com`,
  joinedAt: `2025-${String((index % 12) + 1).padStart(2, "0")}-1${index % 9}`
}));

const fakeServer: AxiosAdapter = async (config) => {
  await new Promise((resolve) => setTimeout(resolve, 250));

  const ok = (body: unknown) => ({ status: 200, statusText: "OK", data: { body }, headers: {}, config, request: {} }) as AxiosResponse;
  const fail = (status: number, message: string) => {
    const response = { status, statusText: String(status), data: { statusCode: status, message }, headers: {}, config, request: {} } as AxiosResponse;
    return new AxiosError(message, AxiosError.ERR_BAD_REQUEST, config, {}, response);
  };

  const method = config.method?.toUpperCase();
  const id = config.url?.match(/^\/members\/(.+)$/)?.[1];

  if (method === "GET" && config.url === "/members") {
    const { q = "", page = 1, size = 5 } = config.params as { q?: string; page?: number; size?: number };
    const found = members.filter((m) => `${m.name} ${m.email}`.toLowerCase().includes(q.toLowerCase()));
    return ok({ rows: found.slice((page - 1) * size, page * size), total: found.length });
  }

  if (method === "POST" && config.url === "/members") {
    const draft = JSON.parse(config.data as string) as Pick<Member, "name" | "email">;
    if (!draft.name?.trim()) throw fail(400, "이름은 비워 둘 수 없습니다");

    const member = { id: `M-${1041 + members.length}`, name: draft.name, email: draft.email || "—", joinedAt: new Date().toISOString().slice(0, 10) };
    members = [member, ...members];
    return ok(member);
  }

  if (method === "DELETE" && id) {
    members = members.filter((m) => m.id !== id);
    return ok(null);
  }

  throw fail(404, "없는 주소입니다");
};

api.setConfig({ adapter: fakeServer });
