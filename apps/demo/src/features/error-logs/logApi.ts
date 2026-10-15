import { api } from "../../lib/api";

export type Method = "GET" | "POST" | "PUT" | "DELETE";
export type LogStatus = "open" | "in_progress" | "resolved";

export interface ErrorLog {
  id: string;
  message: string;
  method: Method;
  path: string;
  statusCode: number;
  status: LogStatus;
  assignee: string | null;
  createdAt: string;
}

export interface ErrorLogDetail extends ErrorLog {
  stack: string;
}

export interface LogQuery {
  q: string;
  method: string;
  status: string;
  /** `YYYY-MM-DD`. 비어 있으면 기간을 따지지 않습니다 */
  from: string;
  to: string;
  page: number;
  size: number;
  sort: string;
  order: "asc" | "desc" | "none";
}

export interface LogPage {
  rows: ErrorLog[];
  total: number;
}

export interface LogSummary {
  open: number;
  inProgress: number;
  resolved: number;
  today: number;
  /** 지난 7일, 오래된 날부터 */
  daily: { date: string; count: number }[];
  topPaths: { path: string; count: number }[];
  /** 하루 넘게 아무도 맡지 않은 오류 */
  unattended: ErrorLog[];
}

export const METHODS: Method[] = ["GET", "POST", "PUT", "DELETE"];

export const LOG_STATUSES: { name: string; value: LogStatus }[] = [
  { name: "열림", value: "open" },
  { name: "처리 중", value: "in_progress" },
  { name: "해결", value: "resolved" }
];

/** 요청은 앱이 함께 쓰는 클라이언트(lib/api.ts)로 보냅니다. 화면은 이 함수들만 부릅니다 */
export const logApi = {
  list: (query: LogQuery) => api.get<LogPage>("/logs", query),
  detail: (id: string) => api.get<ErrorLogDetail>(`/logs/${id}`),
  setStatus: (id: string, status: LogStatus) => api.patch<ErrorLog>(`/logs/${id}`, { status }),
  remove: (id: string) => api.delete<null>(`/logs/${id}`),
  summary: () => api.get<LogSummary>("/logs/summary")
};

/** 해결됐고 30일이 지난 로그만 지울 수 있습니다. 화면과 서버가 같은 규칙을 씁니다 */
export const canRemove = (log: ErrorLog, now = Date.now()) => log.status === "resolved" && now - Date.parse(log.createdAt) > 30 * 86_400_000;
