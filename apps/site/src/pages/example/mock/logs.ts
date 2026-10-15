import { canRemove, type ErrorLog, type ErrorLogDetail, type LogQuery, type LogStatus, type LogSummary, type Method } from "../error-logs/logApi";
import type { MockHandler } from "./server";

/** 오류 로그 가짜 데이터. 새로고침하면 처음 상태로 돌아갑니다 */
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

/** `/logs` 로 오는 요청을 받습니다. 맡지 않는 주소면 `undefined` 를 돌려줍니다 */
export const handleLogs: MockHandler = (config, { ok, fail }) => {
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

  if (!config.url?.startsWith("/logs")) return undefined;
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

  return undefined;
};
