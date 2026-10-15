import { createHttpClient } from "@txstack/axios";
import { AxiosError, type AxiosAdapter, type AxiosResponse } from "axios";

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

/** 서버가 { body: ... } 형식으로 보낸다고 가정합니다. 실제 앱에서는 클라이언트를 한 곳(src/lib/api.ts)에 두고 함께 씁니다 */
export const api = createHttpClient({
  baseURL: "/api",
  timeout: 10_000,
  getToken: () => localStorage.getItem("accessToken"),
  unwrap: (data) => (data as { body: unknown }).body
});

export const logApi = {
  list: (query: LogQuery) => api.get<LogPage>("/logs", query),
  detail: (id: string) => api.get<ErrorLogDetail>(`/logs/${id}`),
  setStatus: (id: string, status: LogStatus) => api.patch<ErrorLog>(`/logs/${id}`, { status }),
  remove: (id: string) => api.delete<null>(`/logs/${id}`),
  summary: () => api.get<LogSummary>("/logs/summary")
};

/** 해결됐고 30일이 지난 로그만 지울 수 있습니다. 화면과 서버가 같은 규칙을 씁니다 */
export const canRemove = (log: ErrorLog, now = Date.now()) => log.status === "resolved" && now - Date.parse(log.createdAt) > 30 * 86_400_000;

/* ------------------------------------------------------------------------------------------
 * 여기부터는 예제용 가짜 서버입니다. 실제 앱에서는 이 아래를 모두 지우면 진짜 서버로 요청합니다.
 * ------------------------------------------------------------------------------------------ */

const SAMPLES: { method: Method; path: string; statusCode: number; message: string; name: string }[] = [
  { method: "POST", path: "/orders", statusCode: 500, message: "재고를 줄이는 중 잠금 시간이 초과되었습니다", name: "LockTimeoutError" },
  { method: "GET", path: "/orders/:id", statusCode: 500, message: "Cannot read properties of undefined (reading 'items')", name: "TypeError" },
  { method: "PUT", path: "/members/:id", statusCode: 409, message: "다른 사용자가 먼저 수정했습니다", name: "ConflictError" },
  { method: "GET", path: "/reports/daily", statusCode: 504, message: "집계 서버가 응답하지 않습니다", name: "GatewayTimeoutError" },
  { method: "POST", path: "/payments", statusCode: 502, message: "결제 대행사 응답 형식이 올바르지 않습니다", name: "UpstreamError" },
  { method: "DELETE", path: "/files/:id", statusCode: 500, message: "저장소에서 파일을 지우지 못했습니다", name: "StorageError" },
  { method: "GET", path: "/search", statusCode: 500, message: "검색 색인이 열려 있지 않습니다", name: "IndexClosedError" },
  { method: "POST", path: "/auth/refresh", statusCode: 500, message: "토큰 서명 키를 찾지 못했습니다", name: "KeyNotFoundError" }
];

const ASSIGNEES = ["김하늘", "박도윤", "이서아"];
const HOUR = 3_600_000;
/** 가짜 데이터의 "지금". 예제가 언제 열려도 같은 화면이 나오도록 고정합니다 */
const NOW = Date.parse("2026-10-14T15:00:00+09:00");
const dateOf = (iso: string) => new Date(Date.parse(iso) + 9 * HOUR).toISOString().slice(0, 10);

let logs: ErrorLogDetail[] = Array.from({ length: 140 }, (_, index) => {
  const sample = SAMPLES[(index * 5) % SAMPLES.length]!;
  // 최근일수록 촘촘하게 — 처음 30개는 이틀 안, 나머지는 두 달에 걸쳐 흩어집니다
  const ago = index < 30 ? index * 1.5 * HOUR : (48 + (index - 30) * 13) * HOUR;
  const status: LogStatus = index < 12 ? (index % 4 === 0 ? "in_progress" : "open") : index % 6 === 0 ? "open" : index % 5 === 0 ? "in_progress" : "resolved";

  return {
    id: `E-${String(9140 - index)}`,
    ...sample,
    status,
    assignee: status === "open" && index % 4 !== 0 ? null : ASSIGNEES[index % ASSIGNEES.length]!,
    createdAt: new Date(NOW - ago).toISOString(),
    stack: `${sample.name}: ${sample.message}\n    at handle (src/routes${sample.path.replace(/:id/, "[id]")}.ts:${40 + (index % 30)}:${11 + (index % 7)})\n    at Router.dispatch (src/server/router.ts:88:14)\n    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)`
  };
});

/** 목록 응답에는 스택 트레이스를 싣지 않습니다 */
const strip = ({ stack: _, ...log }: ErrorLogDetail): ErrorLog => log;

const summary = (): LogSummary => {
  const today = dateOf(new Date(NOW).toISOString());
  const days = Array.from({ length: 7 }, (_, index) => dateOf(new Date(NOW - (6 - index) * 24 * HOUR).toISOString()));
  const paths = new Map<string, number>();
  for (const log of logs) if (log.status !== "resolved") paths.set(log.path, (paths.get(log.path) ?? 0) + 1);

  return {
    open: logs.filter((log) => log.status === "open").length,
    inProgress: logs.filter((log) => log.status === "in_progress").length,
    resolved: logs.filter((log) => log.status === "resolved").length,
    today: logs.filter((log) => dateOf(log.createdAt) === today).length,
    daily: days.map((date) => ({ date, count: logs.filter((log) => dateOf(log.createdAt) === date).length })),
    topPaths: [...paths]
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5),
    unattended: logs
      .filter((log) => log.status === "open" && !log.assignee && NOW - Date.parse(log.createdAt) > 24 * HOUR)
      .slice(0, 5)
      .map(strip)
  };
};

const fakeServer: AxiosAdapter = async (config) => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const ok = (body: unknown) => ({ status: 200, statusText: "OK", data: { body }, headers: {}, config, request: {} }) as AxiosResponse;
  const fail = (status: number, message: string) => {
    const response = { status, statusText: String(status), data: { statusCode: status, message }, headers: {}, config, request: {} } as AxiosResponse;
    return new AxiosError(message, AxiosError.ERR_BAD_REQUEST, config, {}, response);
  };

  const method = config.method?.toUpperCase();
  const id = config.url?.match(/^\/logs\/(E-\d+)$/)?.[1];
  const found = id ? logs.find((log) => log.id === id) : undefined;

  if (method === "GET" && config.url === "/logs/summary") return ok(summary());

  if (method === "GET" && config.url === "/logs") {
    const { q, method: verb, status, from, to, page, size, sort, order } = config.params as LogQuery;
    const keyword = q.trim().toLowerCase();

    let rows = logs.filter(
      (log) =>
        (!keyword || `${log.id} ${log.message} ${log.path}`.toLowerCase().includes(keyword)) && (!verb || log.method === verb) && (!status || log.status === status) && (!from || dateOf(log.createdAt) >= from) && (!to || dateOf(log.createdAt) <= to)
    );

    if (sort && order !== "none") {
      const key = sort as keyof ErrorLog;
      rows = [...rows].sort((a, b) => String(a[key] ?? "").localeCompare(String(b[key] ?? ""), undefined, { numeric: true }) * (order === "asc" ? 1 : -1));
    }

    return ok({ rows: rows.slice((page - 1) * size, page * size).map(strip), total: rows.length });
  }

  if (!found) throw fail(404, "없는 로그입니다");

  if (method === "GET") return ok(found);

  if (method === "PATCH") {
    const { status } = JSON.parse(config.data as string) as { status: LogStatus };
    const next = { ...found, status, assignee: found.assignee ?? (status === "open" ? null : "나") };
    logs = logs.map((log) => (log.id === found.id ? next : log));
    return ok(strip(next));
  }

  if (method === "DELETE") {
    if (!canRemove(found, NOW)) throw fail(409, "해결됐고 30일이 지난 로그만 지울 수 있습니다");
    logs = logs.filter((log) => log.id !== found.id);
    return ok(null);
  }

  throw fail(404, "없는 주소입니다");
};

api.setConfig({ adapter: fakeServer });
