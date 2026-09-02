import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { useState } from "react";
import { TxAgGrid } from "@txstack/ui/aggrid";
import { TxButton, TxDropdown, TxEmptyState, TxSearchInput } from "@txstack/ui";
import { ROLE_OPTIONS, useMembers, type Member, type Role } from "./members";

/** **모듈 등록은 소비 앱의 일이다.** 카탈로그도 소비자라 여기서 한 번 한다. */
ModuleRegistry.registerModules([AllCommunityModule]);

const PAGE_SIZE = 8;

/**
 * 검색 · 필터 · 표 · 쪽 번호가 한 벌로 묶인 **목록 화면.**
 *
 * 이 조각을 `ListScreen` 과 `EditInPanel` 두 레시피가 함께 쓴다 — 목록을 두 번 짜지 않는다.
 *
 * **조회 조건이 바뀌면 1쪽으로 돌아간다.** 3쪽을 보다가 검색어를 바꿨는데 3쪽이 그대로면
 * 결과가 두 개뿐일 때 빈 화면이 나온다.
 */
export interface MemberListProps {
  /** 행을 눌렀을 때. 안 주면 행은 눌리지 않는다. */
  onPick?: (member: Member) => void;
  /** 오른쪽 위에 놓을 것 — 보통 "등록" 버튼이다. */
  actions?: React.ReactNode;
}

export function MemberList({ onPick, actions }: MemberListProps) {
  const [keyword, setKeyword] = useState("");
  const [role, setRole] = useState<Role | "">("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useMembers({ page, pageSize: PAGE_SIZE, keyword, role });

  /** 조건이 바뀌면 늘 1쪽부터. 조건과 쪽을 한 곳에서 바꾼다 */
  const search = (next: { keyword?: string; role?: Role | "" }) => {
    if (next.keyword !== undefined) setKeyword(next.keyword);
    if (next.role !== undefined) setRole(next.role);
    setPage(1);
  };

  const empty = !isLoading && data?.total === 0;

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {/* Enter 로 찾는다. 글자마다 서버를 부르면 조회가 화면보다 빨리 쌓인다 */}
        <TxSearchInput
          placeholder="이름 · 메일로 찾기"
          className="w-64"
          aria-label="회원 검색"
          onSubmitText={(value) => search({ keyword: value })}
          onClear={() => search({ keyword: "" })}
        />

        <TxDropdown data={ROLE_OPTIONS} value={role || undefined} placeholder="권한 전체" aria-label="권한 필터" className="w-36" onChangeText={(value) => search({ role: (value ?? "") as Role | "" })} />

        {(keyword || role) && <TxButton label="조건 지우기" variant="text" onClick={() => search({ keyword: "", role: "" })} />}

        <span className="text-sm text-slate-500 dark:text-slate-400">{isLoading ? "찾는 중…" : `${data?.total ?? 0}명`}</span>

        <div className="ms-auto">{actions}</div>
      </div>

      {/*
        **빈 결과는 표 대신 안내로 바꾼다.** 머리글만 남은 표는 "조회가 안 된 것" 인지
        "결과가 없는 것" 인지 알려 주지 않는다.
      */}
      {empty ? (
        <TxEmptyState variant="no-result" title="찾은 회원이 없다" description="검색어나 권한을 바꿔 보라">
          <TxButton label="조건 지우기" variant="secondary" onClick={() => search({ keyword: "", role: "" })} />
        </TxEmptyState>
      ) : (
        <TxAgGrid<Member>
          rowData={data?.rows}
          isLoading={isLoading}
          offset={(page - 1) * PAGE_SIZE}
          defaultColDef={{ flex: 1 }}
          option={{
            headers: ["name", "email", "role", "point", "joinedAt"],
            sortColumns: "*",
            customColumnDefs: [
              { field: "name", headerName: "이름", flex: 0, width: 120 },
              { field: "email", headerName: "메일", flex: 2 },
              { field: "role", headerName: "권한", flex: 0, width: 100, valueFormatter: ({ value }) => ROLE_OPTIONS.find((item) => item.value === value)?.name ?? String(value) },
              { field: "point", headerName: "포인트", flex: 0, width: 110, type: "numericColumn", valueFormatter: ({ value }) => Number(value).toLocaleString() },
              { field: "joinedAt", headerName: "가입일", flex: 0, width: 120 }
            ]
          }}
          onRowClicked={onPick && ((event) => event.data && onPick(event.data))}
          pagination={{ currentPage: page, totalRows: data?.total ?? 0, pageSize: PAGE_SIZE, onChangePage: setPage }}
        />
      )}
    </div>
  );
}
