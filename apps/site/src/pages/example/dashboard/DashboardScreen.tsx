import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { parseApiError } from "@txstack/axios";
import { TxAlert, TxButton, TxCard, TxEmptyState, TxProgress, TxSkeleton, TxTag } from "@txstack/ui";
import { logApi } from "../error-logs/logApi";

/**
 * 오류 로그 화면으로 가는 주소. **이 화면의 옆 주소(`../error-logs`)로 갑니다** — 앱이 이 화면을
 * `/dashboard` 에 두든 `/admin/dashboard` 에 두든 링크가 따라옵니다(`relative="path"`).
 * 조건은 쿼리 문자열로 붙입니다. 그 화면이 useUrlQuery 로 주소를 읽으므로 걸러진 채로 열립니다.
 */
const logsUrl = (query: Record<string, string>) => `../error-logs?${new URLSearchParams(query)}`;

const card = "block rounded-lg transition hover:-translate-y-0.5 focus-visible:outline-2";

export function DashboardScreen() {
  // Error Logs 와 같은 "logs" 키 아래에 둡니다. 거기서 상태를 바꾸면 이 요약도 낡은 것으로 표시돼 다시 불립니다
  const {
    data: summary,
    error,
    refetch,
    dataUpdatedAt
  } = useQuery({
    queryKey: ["logs", "summary"],
    queryFn: logApi.summary
  });

  if (error) {
    return (
      <TxAlert variant="danger" title="요약을 불러오지 못했습니다">
        {parseApiError(error).message}
      </TxAlert>
    );
  }

  if (!summary) {
    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <TxSkeleton key={index} height="6rem" />
        ))}
      </div>
    );
  }

  const today = summary.daily.at(-1)?.date ?? "";
  const peak = Math.max(1, ...summary.daily.map((day) => day.count));
  const kpis = [
    { label: "열린 오류", value: summary.open, tone: "danger", to: logsUrl({ status: "open" }) },
    { label: "처리 중", value: summary.inProgress, tone: "warning", to: logsUrl({ status: "in_progress" }) },
    { label: "오늘 발생", value: summary.today, tone: "info", to: logsUrl({ from: today, to: today }) },
    { label: "해결", value: summary.resolved, tone: "success", to: logsUrl({ status: "resolved" }) }
  ] as const;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2 text-sm text-slate-500 dark:text-slate-400">
        <span>마지막 갱신 {new Date(dataUpdatedAt).toLocaleTimeString("ko-KR")}</span>
        {/* Promise 를 돌려주므로 끝날 때까지 버튼이 잠깁니다 */}
        <TxButton
          label="새로고침"
          variant="secondary"
          onClick={async () => {
            await refetch();
          }}
        />
      </div>

      {/* 숫자 카드. 누르면 그 조건이 걸린 오류 로그로 갑니다 */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Link key={kpi.label} to={kpi.to} relative="path" className={card}>
            <TxCard>
              {/* 이름표에 색 점을 붙여 무엇의 숫자인지와 성격을 함께 보입니다 */}
              <TxTag variant={kpi.tone} dot className="self-start whitespace-nowrap">
                {kpi.label}
              </TxTag>
              <div className="mt-2 text-3xl font-semibold tabular-nums">{kpi.value}</div>
            </TxCard>
          </Link>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <TxCard title="지난 7일">
          {/* 막대 하나가 하루입니다. 누르면 그날의 로그로 갑니다 */}
          <div className="flex h-40 items-end gap-2">
            {summary.daily.map((day) => (
              <Link key={day.date} to={logsUrl({ from: day.date, to: day.date })} relative="path" className="group flex h-full flex-1 flex-col items-center justify-end gap-1" title={`${day.date} · ${day.count}건`}>
                <span className="text-xs tabular-nums text-slate-500 dark:text-slate-400">{day.count}</span>
                <span className="w-full rounded-t bg-[color:var(--tx-color-primary)] opacity-80 group-hover:opacity-100" style={{ height: `${(day.count / peak) * 100}%`, minHeight: day.count ? 4 : 0 }} />
                <span className="text-xs whitespace-nowrap text-slate-500 dark:text-slate-400">{Number(day.date.slice(8))}일</span>
              </Link>
            ))}
          </div>
        </TxCard>

        <TxCard title="자주 나는 곳 (미해결)">
          <div className="flex flex-col gap-3">
            {summary.topPaths.map((item) => (
              <Link key={item.path} to={logsUrl({ q: item.path, status: "open" })} relative="path" className="flex flex-col gap-1 hover:underline">
                <span className="flex justify-between text-sm">
                  <span className="font-mono">{item.path}</span>
                  <span className="tabular-nums">{item.count}건</span>
                </span>
                <TxProgress value={item.count} max={summary.topPaths[0]?.count ?? 1} variant="danger" label={`${item.path} ${item.count}건`} />
              </Link>
            ))}
          </div>
        </TxCard>
      </div>

      <TxCard title="확인이 필요한 오류">
        <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">하루가 지나도록 아무도 맡지 않은 오류입니다.</p>
        {summary.unattended.length === 0 ? (
          <TxEmptyState variant="no-data" title="모두 담당자가 있습니다" description="하루 넘게 방치된 오류가 없습니다." />
        ) : (
          <ul className="flex flex-col divide-y divide-[color:var(--tx-color-border)]">
            {summary.unattended.map((log) => (
              <li key={log.id}>
                <Link to={logsUrl({ q: log.id })} relative="path" className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2 text-sm hover:underline">
                  <span className="font-mono text-slate-500 dark:text-slate-400">{log.id}</span>
                  <TxTag appearance="outline">{log.method}</TxTag>
                  <span className="order-last w-full truncate sm:order-none sm:w-auto sm:min-w-0 sm:flex-1">{log.message}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{new Date(log.createdAt).toLocaleDateString("ko-KR")}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </TxCard>
    </div>
  );
}
