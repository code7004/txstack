import { TxButton } from "../TxButton";
import { cm } from "../tx-ui.utils";
import type { TxPaginationLabels, TxPaginationProps } from "./TxPagination.types";

const DEFAULT_LABELS: Required<TxPaginationLabels> = {
  nav: "페이지 이동",
  prevGroup: "이전 묶음",
  prev: "이전",
  next: "다음",
  nextGroup: "다음 묶음",
  page: (page) => `${page}쪽`
};

/**
 * 쪽 번호. **그리드와 무관하다** — 카드 목록이든 표든 서버가 `offset`·`total` 로 주는 자리면 쓴다.
 *
 * ```tsx
 * <TxPagination currentPage={page} totalRows={total} pageSize={50} onChangePage={setPage} />
 * ```
 *
 * - `currentPage` 는 **1부터** 센다
 * - 쪽이 하나뿐이면 아무것도 그리지 않는다 — 고를 것이 없는 자리를 채우지 않는다
 * - 번호는 `pageButtonCount` 개씩 묶어 보여 주고, `«` `»` 가 묶음째 옮긴다
 *
 * 겉모습은 CSS 변수로 바꾼다 — `.tx-pagination { --tx-pagination-gap: … }`.
 *
 * 명세: `docs/001_ui/016_TxPagination.md`
 */
export const TxPagination = ({ currentPage, totalRows, pageSize = 10, pageButtonCount = 10, maxPage, onChangePage, hideStepButtons = false, hideGroupButtons = false, labels, className, style }: TxPaginationProps) => {
  const text = { ...DEFAULT_LABELS, ...labels };

  /*
    상한을 컴포넌트가 정하지 않는다. 원본은 `Math.floor(10000 / pageSize)` 를 박아 뒀는데
    그 1만은 검색엔진이 돌려주는 결과 창의 한계였다 — 백엔드 사정이 UI 로 새어 든 것이다.
  */
  const totalPages = pageSize > 0 ? Math.min(Math.ceil(totalRows / pageSize), maxPage ?? Infinity) : 0;

  // 고를 것이 하나뿐이면 그리지 않는다.
  if (totalPages < 2) return null;

  const groupIndex = Math.floor((Math.max(1, currentPage) - 1) / pageButtonCount);
  const firstPage = groupIndex * pageButtonCount + 1;
  const lastPage = Math.min(totalPages, firstPage + pageButtonCount - 1);
  const pages = Array.from({ length: lastPage - firstPage + 1 }, (_, index) => firstPage + index);

  const goTo = (page: number) => {
    const next = Math.min(Math.max(page, 1), totalPages);
    // 같은 쪽이면 알리지 않는다. 원본은 여기서 콜백 둘이 동시에 나갔다.
    if (next !== currentPage) onChangePage?.(next);
  };

  return (
    <nav data-tag="TxPagination" aria-label={text.nav} className={cm("tx-pagination", className)} style={style}>
      {!hideGroupButtons && <TxPaginationStep label="«" title={text.prevGroup} disabled={firstPage <= 1} onClick={() => goTo(firstPage - pageButtonCount)} />}
      {!hideStepButtons && <TxPaginationStep label="‹" title={text.prev} disabled={currentPage <= 1} onClick={() => goTo(currentPage - 1)} />}

      {pages.map((page) => (
        <TxButton
          key={page}
          type="button"
          label={`${page}`}
          aria-label={text.page(page)}
          // 지금 쪽은 링크가 아니라 현재 위치다. 스크린리더가 그렇게 읽어야 한다.
          aria-current={page === currentPage ? "page" : undefined}
          variant={page === currentPage ? "primary" : "secondary"}
          className="tx-pagination__page"
          onClick={() => goTo(page)}
        />
      ))}

      {!hideStepButtons && <TxPaginationStep label="›" title={text.next} disabled={currentPage >= totalPages} onClick={() => goTo(currentPage + 1)} />}
      {!hideGroupButtons && <TxPaginationStep label="»" title={text.nextGroup} disabled={lastPage >= totalPages} onClick={() => goTo(firstPage + pageButtonCount)} />}
    </nav>
  );
};

/** 화살표 버튼. 글자는 기호라 스크린리더에는 `aria-label` 이 읽힌다. */
const TxPaginationStep = ({ label, title, disabled, onClick }: { label: string; title: string; disabled: boolean; onClick: () => void }) => (
  <TxButton type="button" label={label} aria-label={title} title={title} variant="secondary" disabled={disabled} className="tx-pagination__step" onClick={onClick} />
);
