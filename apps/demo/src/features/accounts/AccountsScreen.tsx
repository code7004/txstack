import { useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { parseApiError } from "@txstack/axios";
import { useUrlQuery } from "@txstack/hooks/useUrlQuery";
import { TxButton, TxDialog, TxDropdown, TxSearchInput, TxTag, TxToast, type TxTagVariant } from "@txstack/ui";
import { TxAgGrid } from "@txstack/ui/aggrid";
import { AccountForm } from "./AccountForm";
import { ROLES, STATUSES, accountApi, type Account, type Status } from "./accountApi";

const PAGE_SIZE = 10;

const roleName = (value: string) => ROLES.find((role) => role.value === value)?.name ?? value;
const STATUS_TAG: Record<Status, { name: string; variant: TxTagVariant }> = {
  active: { name: "사용 중", variant: "success" },
  invited: { name: "초대됨", variant: "info" },
  suspended: { name: "정지", variant: "danger" }
};

export function AccountsScreen() {
  // 검색어 · 필터 · 정렬 · 페이지는 모두 주소에 담습니다. 새로고침하거나 주소를 보내도 같은 화면이 열립니다
  const [query, setQuery] = useUrlQuery({ defaults: { q: "", role: "", status: "", page: 1, sort: "", order: "none" } });
  const listQuery = { ...query, order: query.order as "asc" | "desc" | "none", size: PAGE_SIZE };

  // 주소가 곧 쿼리 키입니다. 조건이 바뀌면 다시 부르고, 받는 동안에는 이전 페이지를 그대로 보여 줍니다
  const {
    data = { rows: [], total: 0 },
    isFetching,
    error
  } = useQuery({
    queryKey: ["accounts", listQuery],
    queryFn: () => accountApi.list(listQuery),
    placeholderData: keepPreviousData
  });

  const queryClient = useQueryClient();
  const remove = useMutation({
    mutationFn: accountApi.remove,
    // "accounts" 로 시작하는 쿼리를 모두 낡은 것으로 표시합니다. 지금 보는 목록은 바로 다시 불립니다
    onSuccess: ({ removed }) => {
      TxToast.show({ variant: "info", title: `${removed}개를 삭제했습니다` });
      void queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
    // 소유자 계정을 함께 고르면 서버가 403 으로 거절합니다
    onError: (cause) => TxToast.show({ variant: "danger", title: "삭제하지 못했습니다", message: parseApiError(cause).message })
  });

  const [selected, setSelected] = useState<Account[]>([]);
  const [editing, setEditing] = useState<Account | "new" | null>(null);

  // 필터가 바뀌면 1페이지부터 다시 봅니다
  const filter = (next: Partial<typeof query>) => setQuery({ ...next, page: 1 });

  const removeSelected = async () => {
    const names = selected.map((account) => account.name);
    const yes = await TxDialog.confirm({
      title: `계정 ${selected.length}개를 삭제할까요?`,
      message: names.length > 3 ? `${names.slice(0, 3).join(", ")} 외 ${names.length - 3}명` : names.join(", "),
      tone: "danger",
      confirmLabel: "삭제"
    });
    // mutateAsync 의 Promise 를 돌려주므로 끝날 때까지 버튼이 잠깁니다. 실패는 onError 가 알립니다
    if (yes) await remove.mutateAsync(selected.map((account) => account.id)).catch(() => undefined);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <TxSearchInput placeholder="아이디, 이름, 메일" aria-label="계정 검색" defaultValue={query.q} className="w-56" onSubmitText={(q) => filter({ q })} onClear={() => filter({ q: "" })} />
        <TxDropdown aria-label="역할" data={[{ name: "모든 역할", value: "" }, ...ROLES]} value={query.role} onChangeText={(role) => filter({ role: role ?? "" })} className="w-32" />
        <TxDropdown aria-label="상태" data={[{ name: "모든 상태", value: "" }, ...STATUSES]} value={query.status} onChangeText={(status) => filter({ status: status ?? "" })} className="w-32" />
        <span className="text-sm text-slate-500 dark:text-slate-400">{error ? parseApiError(error).message : `${data.total}개`}</span>

        <div className="ms-auto flex gap-2">
          <TxButton label={`선택 삭제${selected.length ? ` (${selected.length})` : ""}`} variant="danger" disabled={!selected.length} onClick={removeSelected} />
          <TxButton label="새 계정" onClick={() => setEditing("new")} />
        </div>
      </div>

      {/* 열이 많은 표는 좁은 화면에서 옆으로 밉니다. 터치 화면은 스크롤 막대가 안 보여서 알려 줍니다 */}
      <p className="-mb-1 text-xs text-slate-500 sm:hidden dark:text-slate-400">표는 옆으로 밀면 나머지 열이 보입니다 →</p>
      {/* 표는 감싸는 자리의 높이를 채웁니다 */}
      <div className="flex h-[28rem] flex-col sm:h-[34rem]">
        <TxAgGrid<Account>
          rowData={data.rows}
          isLoading={isFetching}
          getRowId={({ data: row }) => row.id}
          defaultColDef={{ flex: 1, minWidth: 110 }}
          option={{
            headers: ["username", "name", "email", "role", "status", "teams", "lastLoginAt", "actions"],
            serverSortColumns: ["username", "name", "role", "lastLoginAt"],
            rowSelection: { mode: "multiRow" },
            customColumnDefs: [
              { field: "username", headerName: "아이디", minWidth: 140 },
              { field: "name", headerName: "이름" },
              { field: "email", headerName: "메일", minWidth: 200 },
              { field: "role", headerName: "역할", valueFormatter: ({ value }) => roleName(String(value)) },
              {
                field: "status",
                headerName: "상태",
                cellRenderer: ({ value }: { value: Status }) => (
                  <TxTag variant={STATUS_TAG[value].variant} dot>
                    {STATUS_TAG[value].name}
                  </TxTag>
                )
              },
              { field: "teams", headerName: "팀", valueFormatter: ({ value }) => (value as string[]).join(", ") },
              { field: "lastLoginAt", headerName: "마지막 접속", valueFormatter: ({ value }) => (value as string | null) ?? "—" },
              {
                // 행 데이터에 없는 열은 field 대신 colId 로 줍니다. headers 의 "actions" 자리를 이 정의가 채웁니다
                colId: "actions",
                headerName: "",
                maxWidth: 90,
                sortable: false,
                pinned: "right",
                cellStyle: { display: "flex", alignItems: "center" },
                cellRenderer: ({ data: row }: { data: Account }) => <TxButton label="수정" variant="text" onClick={() => setEditing(row)} />
              }
            ]
          }}
          sortState={{ key: query.sort || undefined, value: query.order as "asc" | "desc" | "none" }}
          onChangeSort={(next) => setQuery({ sort: next.key ?? "", order: next.value, page: 1 })}
          onSelectionChanged={(event) => setSelected(event.api.getSelectedRows())}
          pagination={{ currentPage: query.page, totalRows: data.total, pageSize: PAGE_SIZE, onChangePage: (page) => setQuery({ page }) }}
        />
      </div>

      <AccountForm target={editing} onClose={() => setEditing(null)} onSaved={() => setEditing(null)} />
    </div>
  );
}
