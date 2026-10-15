import { api } from "../../lib/api";

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

/** 요청은 앱이 함께 쓰는 클라이언트(lib/api.ts)로 보냅니다. 화면은 이 함수들만 부릅니다 */
export const accountApi = {
  list: (query: AccountQuery) => api.get<AccountPage>("/accounts", query),
  create: (draft: AccountDraft) => api.post<Account>("/accounts", draft),
  update: (id: string, draft: AccountDraft) => api.put<Account>(`/accounts/${id}`, draft),
  remove: (ids: string[]) => api.delete<{ removed: number }>("/accounts", { body: { ids } })
};
