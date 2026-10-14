import { TxButton } from "../TxButton";
import { cm } from "../tx-ui.utils";
import type { TxPaginationLabels, TxPaginationProps } from "./TxPagination.types";

const DEFAULT_LABELS: Required<TxPaginationLabels> = {
  nav: "페이지 이동",
  prevGroup: "이전 묶음",
  prev: "이전",
  next: "다음",
  nextGroup: "다음 묶음",
  page: (page) => `${page}쪽`,
  status: (page, total) => `${total}쪽 중 ${page}쪽`
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
 * - 좁은 자리에서는 `‹ 3 / 12 ›` 로 줄어든다(`compact`)
 *
 * 겉모습은 CSS 변수로 바꾼다 — `.tx-pagination { --tx-pagination-gap: … }`.
 *
 * 명세: `docs/001_ui/016_TxPagination.md`
 */
export const TxPagination = ({ currentPage, totalRows, pageSize = 10, pageButtonCount = 10, maxPage, onChangePage, compact = "auto", hideStepButtons = false, hideGroupButtons = false, labels, className, style }: TxPaginationProps) => {
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

  /*
    "auto" 는 번호와 `3 / 12` 를 둘 다 그리고 CSS(container query)가 하나를 고른다.
    폭을 재는 JS 가 없어서 첫 그림부터 맞고, 크기가 바뀌어도 다시 그리지 않는다.
  */
  const showNumbers = compact !== true;
  const showStatus = compact !== false;
  const showGroups = !hideGroupButtons && compact !== true;
  const mode = compact === true ? "on" : compact === false ? "off" : "auto";

  return (
    <nav data-tag="TxPagination" data-compact={mode} aria-label={text.nav} className={cm("tx-pagination", className)} style={style}>
      {showGroups && <TxPaginationStep label="«" title={text.prevGroup} group disabled={firstPage <= 1} onClick={() => goTo(firstPage - pageButtonCount)} />}
      {!hideStepButtons && <TxPaginationStep label="‹" title={text.prev} disabled={currentPage <= 1} onClick={() => goTo(currentPage - 1)} />}

      {showStatus && (
        <span className="tx-pagination__status">
          <span aria-hidden>
            {currentPage} / {totalPages}
          </span>
          <span className="tx-pagination__status-label">{text.status(currentPage, totalPages)}</span>
        </span>
      )}

      {showNumbers &&
        pages.map((page) => (
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
      {showGroups && <TxPaginationStep label="»" title={text.nextGroup} group disabled={lastPage >= totalPages} onClick={() => goTo(firstPage + pageButtonCount)} />}
    </nav>
  );
};

/** 화살표 버튼. 글자는 기호라 스크린리더에는 `aria-label` 이 읽힌다. */
const TxPaginationStep = ({ label, title, group = false, disabled, onClick }: { label: string; title: string; group?: boolean; disabled: boolean; onClick: () => void }) => (
  <TxButton type="button" label={label} aria-label={title} title={title} variant="secondary" disabled={disabled} className={cm("tx-pagination__step", group && "tx-pagination__group")} onClick={onClick} />
);
