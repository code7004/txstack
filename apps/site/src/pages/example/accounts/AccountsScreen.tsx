import { useEffect, useState } from "react";
import { parseApiError } from "@txstack/axios";
import { useUrlQuery } from "@txstack/hooks/useUrlQuery";
import { TxButton, TxDialog, TxDropdown, TxSearchInput, TxTag, TxToast, type TxTagVariant } from "@txstack/ui";
import { TxAgGrid } from "@txstack/ui/aggrid";
import { AccountForm } from "./AccountForm";
import { ROLES, STATUSES, accountApi, type Account, type AccountPage, type Status } from "./accountApi";

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

  const [data, setData] = useState<AccountPage>({ rows: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(0);
  const [selected, setSelected] = useState<Account[]>([]);
  const [editing, setEditing] = useState<Account | "new" | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);

    accountApi
      .list({ q: query.q, role: query.role, status: query.status, page: query.page, sort: query.sort, order: query.order as "asc" | "desc" | "none", size: PAGE_SIZE })
      .then((page) => {
        if (!alive) return;
        setData(page);
        setSelected([]);
      })
      .catch((error) => TxToast.show({ variant: "danger", title: "목록을 불러오지 못했습니다", message: parseApiError(error).message }))
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, [query.q, query.role, query.status, query.page, query.sort, query.order, reload]);

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
    if (!yes) return;

    try {
      const { removed } = await accountApi.remove(selected.map((account) => account.id));
      TxToast.show({ variant: "info", title: `${removed}개를 삭제했습니다` });
      setReload((n) => n + 1);
    } catch (error) {
      // 소유자 계정을 함께 고르면 서버가 403 으로 거절합니다
      TxToast.show({ variant: "danger", title: "삭제하지 못했습니다", message: parseApiError(error).message });
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <TxSearchInput placeholder="아이디, 이름, 메일" aria-label="계정 검색" defaultValue={query.q} className="w-56" onSubmitText={(q) => filter({ q })} onClear={() => filter({ q: "" })} />
        <TxDropdown aria-label="역할" data={[{ name: "모든 역할", value: "" }, ...ROLES]} value={query.role} onChangeText={(role) => filter({ role: role ?? "" })} className="w-32" />
        <TxDropdown aria-label="상태" data={[{ name: "모든 상태", value: "" }, ...STATUSES]} value={query.status} onChangeText={(status) => filter({ status: status ?? "" })} className="w-32" />
        <span className="text-sm text-slate-500 dark:text-slate-400">{data.total}개</span>

        <div className="ms-auto flex gap-2">
          <TxButton label={`선택 삭제${selected.length ? ` (${selected.length})` : ""}`} variant="danger" disabled={!selected.length} onClick={removeSelected} />
          <TxButton label="새 계정" onClick={() => setEditing("new")} />
        </div>
      </div>

      {/* 표는 감싸는 자리의 높이를 채웁니다 */}
      <div className="flex h-[34rem] flex-col">
        <TxAgGrid<Account>
          rowData={data.rows}
          isLoading={loading}
          getRowId={({ data: row }) => row.id}
          defaultColDef={{ flex: 1, minWidth: 110 }}
          option={{
            headers: ["username", "name", "email", "role", "status", "teams", "lastLoginAt"],
            serverSortColumns: ["username", "name", "role", "lastLoginAt"],
            rowSelection: { mode: "multiRow" },
            customColumnDefs: [
              { field: "username", headerName: "아이디", minWidth: 140 },
              {
                field: "name",
                headerName: "이름",
                // 이름을 누르면 옆 패널에서 고칩니다. 버튼이 줄 높이에 맞도록 칸을 세로 가운데로 둡니다
                cellStyle: { display: "flex", alignItems: "center" },
                cellRenderer: ({ data: row }: { data: Account }) => <TxButton label={row.name} variant="text" onClick={() => setEditing(row)} />
              },
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
              { field: "lastLoginAt", headerName: "마지막 접속", valueFormatter: ({ value }) => (value as string | null) ?? "—" }
            ]
          }}
          sortState={{ key: query.sort || undefined, value: query.order as "asc" | "desc" | "none" }}
          onChangeSort={(next) => setQuery({ sort: next.key ?? "", order: next.value, page: 1 })}
          onSelectionChanged={(event) => setSelected(event.api.getSelectedRows())}
          pagination={{ currentPage: query.page, totalRows: data.total, pageSize: PAGE_SIZE, onChangePage: (page) => setQuery({ page }) }}
        />
      </div>

      <AccountForm
        target={editing}
        onClose={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          setReload((n) => n + 1);
        }}
      />
    </div>
  );
}
