import { useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { parseApiError } from "@txstack/axios";
import { useUrlQuery } from "@txstack/hooks/useUrlQuery";
import { TxButton, TxDropdown, TxSearchInput, TxSwitch, TxTag, TxToast } from "@txstack/ui";
import { TxAgGrid } from "@txstack/ui/aggrid";
import { TxDayPickerRange, type TxDateRange } from "@txstack/ui/daypicker";
import { LogDetail } from "./LogDetail";
import { LOG_STATUSES, METHODS, logApi, type ErrorLog, type LogStatus } from "./logApi";

const PAGE_SIZE = 15;

/** 주소에는 `YYYY-MM-DD` 로 적고, 달력에는 Date 로 줍니다 */
const toDay = (date: Date | undefined) => (date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}` : "");
const fromDay = (day: string) => (day ? new Date(`${day}T00:00:00`) : undefined);

/** 표에는 `10-14 13:05` 처럼 짧게 적습니다 */
const toTime = (iso: string) => {
  const date = new Date(iso);
  return `${toDay(date).slice(5)} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
};

const statusName = (value: string) => LOG_STATUSES.find((item) => item.value === value)?.name ?? value;

export function ErrorLogsScreen() {
  // 조건은 모두 주소에 담습니다. 대시보드에서 "?status=open" 으로 들어오면 그 조건으로 열립니다
  const [query, setQuery] = useUrlQuery({ defaults: { q: "", method: "", status: "", from: "", to: "", page: 1, sort: "createdAt", order: "desc" } });

  const [live, setLive] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  const listQuery = { ...query, order: query.order as "asc" | "desc" | "none", size: PAGE_SIZE };
  const {
    data = { rows: [], total: 0 },
    isFetching,
    error
  } = useQuery({
    queryKey: ["logs", "list", listQuery],
    queryFn: () => logApi.list(listQuery),
    placeholderData: keepPreviousData,
    // 켜 두면 10초마다 같은 조건으로 다시 불러옵니다
    refetchInterval: live ? 10_000 : false
  });

  const filter = (next: Partial<typeof query>) => setQuery({ ...next, page: 1 });

  const queryClient = useQueryClient();
  const changeStatus = useMutation({
    mutationFn: ({ log, status }: { log: ErrorLog; status: LogStatus }) => logApi.setStatus(log.id, status),
    onSuccess: (log) => TxToast.show({ variant: "success", title: "상태를 바꿨습니다", message: `${log.id} → ${statusName(log.status)}` }),
    onError: (cause) => TxToast.show({ variant: "danger", title: "바꾸지 못했습니다", message: parseApiError(cause).message }),
    // 성공이든 실패든 "logs" 로 시작하는 쿼리를 다시 부릅니다 — 표는 서버 값으로 맞춰지고, 대시보드 숫자도 따라옵니다
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["logs"] })
  });

  const range: TxDateRange = [fromDay(query.from), fromDay(query.to)];
  const filtered = Boolean(query.q || query.method || query.status || query.from || query.to);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <TxSearchInput key={query.q} placeholder="ID, 메시지, 경로" aria-label="로그 검색" defaultValue={query.q} className="w-52" onSubmitText={(q) => filter({ q })} onClear={() => filter({ q: "" })} />
        <TxDropdown aria-label="메서드" data={[{ name: "모든 메서드", value: "" }, ...METHODS.map((method) => ({ name: method, value: method }))]} value={query.method} onChangeText={(method) => filter({ method: method ?? "" })} className="w-36" />
        <TxDropdown aria-label="상태" data={[{ name: "모든 상태", value: "" }, ...LOG_STATUSES]} value={query.status} onChangeText={(status) => filter({ status: status ?? "" })} className="w-32" />
        <TxDayPickerRange aria-label="발생 기간" placeholder="기간" value={range} onChange={([from, to]) => filter({ from: toDay(from), to: toDay(to) })} className="w-72" />
        {filtered && <TxButton label="조건 지우기" variant="text" onClick={() => setQuery({ q: "", method: "", status: "", from: "", to: "", page: 1 })} />}

        <div className="ms-auto flex items-center gap-3">
          <span className="text-sm text-slate-500 dark:text-slate-400">{error ? parseApiError(error).message : `${data.total}건`}</span>
          <TxSwitch label="10초마다 새로고침" checked={live} onChangeBool={setLive} />
        </div>
      </div>

      <div className="flex h-[28rem] flex-col sm:h-[38rem]">
        <TxAgGrid<ErrorLog>
          rowData={data.rows}
          isLoading={isFetching}
          getRowId={({ data: row }) => row.id}
          defaultColDef={{ flex: 1, minWidth: 100 }}
          option={{
            headers: ["createdAt", "id", "method", "path", "statusCode", "message", "status", "assignee"],
            serverSortColumns: ["createdAt", "id", "statusCode"],
            // 상태는 표 안에서 바로 고칩니다. 두 번 누르면 고를 수 있습니다
            editColumns: ["status"],
            customColumnDefs: [
              { field: "createdAt", headerName: "발생", minWidth: 130, valueFormatter: ({ value }) => toTime(String(value)) },
              { field: "id", headerName: "ID", maxWidth: 110 },
              { field: "method", headerName: "메서드", maxWidth: 110, cellRenderer: ({ value }: { value: string }) => <TxTag appearance="outline">{value}</TxTag> },
              { field: "path", headerName: "경로", minWidth: 140 },
              { field: "statusCode", headerName: "코드", maxWidth: 90 },
              { field: "message", headerName: "메시지", flex: 2, minWidth: 220, tooltipField: "message" },
              {
                field: "status",
                headerName: "상태",
                minWidth: 110,
                cellEditor: "agSelectCellEditor",
                cellEditorParams: { values: LOG_STATUSES.map((item) => item.value), formatValue: statusName },
                valueFormatter: ({ value }) => statusName(String(value))
              },
              { field: "assignee", headerName: "담당", maxWidth: 110, valueFormatter: ({ value }) => (value as string | null) ?? "—" }
            ]
          }}
          sortState={{ key: query.sort || undefined, value: query.order as "asc" | "desc" | "none" }}
          onChangeSort={(next) => setQuery({ sort: next.key ?? "", order: next.value, page: 1 })}
          onCellValueChanged={(event) => event.data && changeStatus.mutate({ log: event.data, status: event.newValue as LogStatus })}
          // 상태 칸은 고치는 자리라 상세를 열지 않습니다
          onCellClicked={(event) => event.colDef.field !== "status" && event.data && setOpenId(event.data.id)}
          pagination={{ currentPage: query.page, totalRows: data.total, pageSize: PAGE_SIZE, onChangePage: (page) => setQuery({ page }) }}
        />
      </div>

      <LogDetail id={openId} onClose={() => setOpenId(null)} onRemoved={() => setOpenId(null)} />
    </div>
  );
}
