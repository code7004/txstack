import { createHttpClient } from "@txstack/axios";
import { AxiosError, type AxiosAdapter, type AxiosResponse } from "axios";

export type Role = "owner" | "admin" | "member" | "viewer";
export type Status = "active" | "invited" | "suspended";

export interface Account {
  id: string;
  username: string;
  name: string;
  email: string;
  role: Role;
  status: Status;
  teams: string[];
  lastLoginAt: string | null;
  createdAt: string;
}

/** 새로 만들 때만 비밀번호를 보냅니다. 고칠 때는 비밀번호를 건드리지 않습니다 */
export type AccountDraft = Pick<Account, "username" | "name" | "email" | "role" | "status" | "teams"> & { password?: string };

export interface AccountQuery {
  q: string;
  role: string;
  status: string;
  page: number;
  size: number;
  sort: string;
  order: "asc" | "desc" | "none";
}

export interface AccountPage {
  rows: Account[];
  total: number;
}

export const ROLES: { name: string; value: Role }[] = [
  { name: "소유자", value: "owner" },
  { name: "관리자", value: "admin" },
  { name: "멤버", value: "member" },
  { name: "뷰어", value: "viewer" }
];

export const STATUSES: { name: string; value: Status }[] = [
  { name: "사용 중", value: "active" },
  { name: "초대됨", value: "invited" },
  { name: "정지", value: "suspended" }
];

export const TEAMS = ["플랫폼", "결제", "검색", "데이터", "디자인"];

/** 서버가 { body: ... } 형식으로 보낸다고 가정합니다. 실제 서비스의 응답 형식에 맞춰 바꿔 주세요 */
export const api = createHttpClient({
  baseURL: "/api",
  timeout: 10_000,
  getToken: () => localStorage.getItem("accessToken"),
  unwrap: (data) => (data as { body: unknown }).body
});

export const accountApi = {
  list: (query: AccountQuery) => api.get<AccountPage>("/accounts", query),
  create: (draft: AccountDraft) => api.post<Account>("/accounts", draft),
  update: (id: string, draft: AccountDraft) => api.put<Account>(`/accounts/${id}`, draft),
  remove: (ids: string[]) => api.delete<{ removed: number }>("/accounts", { body: { ids } })
};

/* ------------------------------------------------------------------------------------------
 * 여기부터는 예제용 가짜 서버입니다. 실제 앱에서는 이 아래를 모두 지우면 진짜 서버로 요청합니다.
 * ------------------------------------------------------------------------------------------ */

const PEOPLE = [
  ["kim.haneul", "김하늘"],
  ["park.doyun", "박도윤"],
  ["lee.seoa", "이서아"],
  ["choi.minjun", "최민준"],
  ["jung.yuna", "정유나"],
  ["han.jiho", "한지호"],
  ["oh.serin", "오세린"],
  ["yoon.hajun", "윤하준"],
  ["jang.seoyun", "장서윤"],
  ["lim.jian", "임지안"],
  ["kang.minseo", "강민서"],
  ["shin.yejun", "신예준"]
] as const;

const day = (offset: number) => new Date(Date.UTC(2026, 9, 14) - offset * 86_400_000).toISOString().slice(0, 10);

let accounts: Account[] = Array.from({ length: 36 }, (_, index) => {
  const [username, name] = PEOPLE[index % PEOPLE.length]!;
  const suffix = index < PEOPLE.length ? "" : String(Math.floor(index / PEOPLE.length) + 1);
  const status: Status = index % 11 === 5 ? "suspended" : index % 7 === 3 ? "invited" : "active";

  return {
    id: `A-${2001 + index}`,
    username: `${username}${suffix}`,
    name: `${name}${suffix ? ` ${suffix}` : ""}`,
    email: `${username}${suffix}@example.com`,
    role: index === 0 ? "owner" : (["admin", "member", "member", "viewer"] as const)[index % 4]!,
    status,
    teams: [TEAMS[index % TEAMS.length]!, ...(index % 3 === 0 ? [TEAMS[(index + 2) % TEAMS.length]!] : [])],
    lastLoginAt: status === "invited" ? null : day((index * 3) % 40),
    createdAt: day(60 + index * 5)
  };
});

let nextId = 2001 + accounts.length;

const fakeServer: AxiosAdapter = async (config) => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const ok = (body: unknown) => ({ status: 200, statusText: "OK", data: { body }, headers: {}, config, request: {} }) as AxiosResponse;
  const fail = (status: number, message: string) => {
    const response = { status, statusText: String(status), data: { statusCode: status, message }, headers: {}, config, request: {} } as AxiosResponse;
    return new AxiosError(message, AxiosError.ERR_BAD_REQUEST, config, {}, response);
  };

  const method = config.method?.toUpperCase();
  const id = config.url?.match(/^\/accounts\/(.+)$/)?.[1];
  const body = typeof config.data === "string" ? (JSON.parse(config.data) as unknown) : undefined;

  const taken = (username: string, except?: string) => accounts.some((account) => account.username === username && account.id !== except);

  if (method === "GET" && config.url === "/accounts") {
    const { q, role, status, page, size, sort, order } = config.params as AccountQuery;
    const keyword = q.trim().toLowerCase();

    let found = accounts.filter((account) => (!keyword || `${account.username} ${account.name} ${account.email}`.toLowerCase().includes(keyword)) && (!role || account.role === role) && (!status || account.status === status));

    if (sort && order !== "none") {
      const key = sort as keyof Account;
      found = [...found].sort((a, b) => String(a[key] ?? "").localeCompare(String(b[key] ?? "")) * (order === "asc" ? 1 : -1));
    }

    return ok({ rows: found.slice((page - 1) * size, page * size), total: found.length });
  }

  if (method === "POST" && config.url === "/accounts") {
    const draft = body as AccountDraft;
    if (taken(draft.username)) throw fail(409, `이미 쓰고 있는 아이디입니다: ${draft.username}`);

    const account: Account = { ...draft, id: `A-${nextId++}`, lastLoginAt: null, createdAt: day(0) };
    delete (account as AccountDraft).password;
    accounts = [account, ...accounts];
    return ok(account);
  }

  if (method === "PUT" && id) {
    const draft = body as AccountDraft;
    const current = accounts.find((account) => account.id === id);
    if (!current) throw fail(404, "없는 계정입니다");
    if (taken(draft.username, id)) throw fail(409, `이미 쓰고 있는 아이디입니다: ${draft.username}`);

    const account = { ...current, ...draft };
    accounts = accounts.map((item) => (item.id === id ? account : item));
    return ok(account);
  }

  if (method === "DELETE" && config.url === "/accounts") {
    const { ids } = body as { ids: string[] };
    if (accounts.some((account) => ids.includes(account.id) && account.role === "owner")) throw fail(403, "소유자 계정은 삭제할 수 없습니다");

    accounts = accounts.filter((account) => !ids.includes(account.id));
    return ok({ removed: ids.length });
  }

  throw fail(404, "없는 주소입니다");
};

api.setConfig({ adapter: fakeServer });
