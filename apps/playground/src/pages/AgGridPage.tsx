import { TxCard, TxFlex } from "@txstack/ui";
// ⬇ 서브패스. 이 import 가 있는 페이지에서만 ag-grid 가 로드된다.
import { AGGrid_Theme_TYPE, TxAgGrid, TxAgGridProvider, type ITxAgGridOption, type ITxAgGridSortChange } from "@txstack/ui/aggrid";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { useMemo, useState } from "react";
import { StateBox } from "./StateBox";

/**
 * ⚠ ag-grid 모듈 등록은 **소비 앱의 책임**이다.
 *
 * 라이브러리가 대신 등록하지 않는 이유: ag-grid 는 트리셰이킹을 위해 명시적 등록을 요구한다.
 * 여기서 `AllCommunityModule` 을 강제하면 필요한 모듈만 고르거나 enterprise 모듈을 쓰는 선택지를 뺏는다.
 * 등록을 빠뜨리면 그리드가 빈 화면으로 뜨고 콘솔에 ag-grid error #272 가 찍힌다.
 */
ModuleRegistry.registerModules([AllCommunityModule]);

interface IDemoRow {
  status: string;
  username: string;
  amount: number;
  createdAt: string;
}

const ROWS: IDemoRow[] = [
  { status: "active", username: "alex", amount: 1250000, createdAt: "2026-07-16 09:12" },
  { status: "pending", username: "mika", amount: 840000, createdAt: "2026-07-15 18:44" },
  { status: "blocked", username: "june", amount: 3120000, createdAt: "2026-07-14 11:05" }
];

export const AgGridPage = () => {
  const [sortState, _sortState] = useState<ITxAgGridSortChange<IDemoRow>>();

  // 원본 저장소의 `useTxAgGridOption` 훅은 도메인 필드명과 앱 컴포넌트를 하드코딩하고 있어
  // 라이브러리로 옮기지 않았다. option 은 이렇게 평범한 객체로 직접 만든다.
  const option = useMemo<ITxAgGridOption<IDemoRow>>(
    () => ({
      headers: ["status", "username", "amount", "createdAt"],
      serverSortColumns: "*",
      customColumnDefs: [
        { field: "status", width: 120 },
        { field: "username", width: 140 },
        { field: "amount", cellClass: "text-end", valueFormatter: (params) => (params.value ? Number(params.value).toLocaleString() : "0") }
      ]
    }),
    []
  );

  return (
    <TxFlex className="flex-col gap-4">
      <TxCard caption="TxAgGrid — @txstack/ui/aggrid">
        <TxCard.Content className="h-[360px]">
          {/* 테마는 Provider 로 주입한다. 앱의 다크모드 상태와 연동하면 된다. */}
          <TxAgGridProvider themeId={AGGrid_Theme_TYPE.QuartzDarkBlue}>
            <TxAgGrid<IDemoRow> rowData={ROWS} option={option} offset={0} sortState={sortState} onChangeSort={_sortState} defaultColDef={{ flex: 1, sortable: true, resizable: true }} enableCellTextSelection locale={(key) => key} />
          </TxAgGridProvider>
        </TxCard.Content>
      </TxCard>

      <TxCard caption="소비 앱이 해줘야 하는 것">
        <TxCard.Content>
          <ul className="list-disc pl-5 text-sm text-slate-600 dark:text-slate-300">
            <li>
              <code>ModuleRegistry.registerModules([AllCommunityModule])</code> — 빠뜨리면 그리드가 빈 화면으로 뜬다.
            </li>
            <li>
              <code>TxAgGridProvider</code> 로 테마 주입 — 다크모드와 연동하려면 <code>themeId</code> 를 상태에 물린다.
            </li>
          </ul>
        </TxCard.Content>
      </TxCard>

      <StateBox caption="정렬 상태 (서버 정렬 연동용)" value={sortState ?? null} />
    </TxFlex>
  );
};
