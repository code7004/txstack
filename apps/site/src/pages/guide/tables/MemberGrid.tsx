import { useUrlQuery } from "@txstack/hooks/useUrlQuery";
import { TxToast } from "@txstack/ui";
import { TxAgGrid, TxAgGridProvider } from "@txstack/ui/aggrid";
import { AllCommunityModule, ModuleRegistry, colorSchemeDarkBlue, themeQuartz } from "ag-grid-community";
import { useMemo, useSyncExternalStore } from "react";

/**
 * **이 파일은 따로 불러온다**(`React.lazy`). ag-grid 가 무거워서, Tables 장을 열 때만 받는다.
 *
 * 모듈 등록은 앱이 한다 — 실제 앱에서는 진입점(`main.tsx`)에서 한 번이다. 여기서는 이 예제를
 * 처음 불러올 때 한 번 한다.
 */
ModuleRegistry.registerModules([AllCommunityModule]);

interface Member {
  id: string;
  name: string;
  role: string;
  team: string;
  joinedAt: string;
}

const NAMES = ["김하늘", "박도윤", "이서아", "최민준", "정유나", "한지호", "오세린", "윤하준", "장서윤", "임지안"];
const ROLES = ["관리자", "편집자", "뷰어"];
const TEAMS = ["플랫폼", "결제", "검색", "데이터"];

const MEMBERS: Member[] = Array.from({ length: 120 }, (_, index) => ({
  id: `M-${String(1001 + index)}`,
  name: `${NAMES[index % NAMES.length]} ${Math.floor(index / NAMES.length) + 1}`,
  role: ROLES[(index * 7) % ROLES.length]!,
  team: TEAMS[(index * 3) % TEAMS.length]!,
  joinedAt: `2025-${String((index % 12) + 1).padStart(2, "0")}-${String((index % 27) + 1).padStart(2, "0")}`
}));

const PAGE_SIZE = 10;

/** 사이트의 다크 모드(`<html class="dark">`)를 따라간다. 표 안쪽은 ag-grid 테마가 그린다 */
function useDark() {
  return useSyncExternalStore(
    (notify) => {
      const observer = new MutationObserver(notify);
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
      return () => observer.disconnect();
    },
    () => document.documentElement.classList.contains("dark")
  );
}

/**
 * 120명을 10명씩. **정렬과 쪽 번호는 "서버" 가 한다** — 여기서는 전체를 정렬한 뒤 잘라 주는
 * 함수가 서버 역할이다. 정렬 · 쪽은 주소에 실린다(`useUrlQuery`).
 */
export default function MemberGrid() {
  const dark = useDark();
  const [query, setQuery] = useUrlQuery({ defaults: { page: 1, sort: "", order: "none" } });

  const sort = { key: query.sort || undefined, value: query.order as "asc" | "desc" | "none" };

  const rows = useMemo(() => {
    const sorted = sort.key && sort.value !== "none" ? [...MEMBERS].sort((a, b) => String(a[sort.key as keyof Member]).localeCompare(String(b[sort.key as keyof Member])) * (sort.value === "asc" ? 1 : -1)) : MEMBERS;
    return sorted.slice((query.page - 1) * PAGE_SIZE, query.page * PAGE_SIZE);
  }, [query.page, sort.key, sort.value]);

  return (
    <TxAgGridProvider theme={dark ? themeQuartz.withPart(colorSchemeDarkBlue) : themeQuartz}>
      {/* 감싸는 자리가 높이를 가져야 표가 보인다 */}
      <div className="flex h-[30rem] flex-col">
        <TxAgGrid<Member>
          rowData={rows}
          defaultColDef={{ flex: 1, minWidth: 110 }}
          option={{ headers: ["id", "name", "role", "team", "joinedAt"], serverSortColumns: ["name", "team", "joinedAt"], editColumns: ["role"] }}
          sortState={sort}
          onChangeSort={(next) => setQuery({ sort: next.key ?? "", order: next.value, page: 1 })}
          offset={(query.page - 1) * PAGE_SIZE}
          pagination={{ currentPage: query.page, totalRows: MEMBERS.length, pageSize: PAGE_SIZE, onChangePage: (page) => setQuery({ page }) }}
          onCellValueChanged={(event) => TxToast.show({ variant: "success", title: "역할을 바꿨습니다", message: `${event.data?.name} → ${event.newValue}` })}
        />
      </div>
    </TxAgGridProvider>
  );
}
