import type { CSSProperties } from "react";

export interface TxPaginationProps {
  /** 지금 보고 있는 쪽. **1부터 센다.** */
  currentPage: number;
  /** 전체 행 수. 쪽수는 이 값과 `pageSize` 로 계산한다. */
  totalRows: number;
  /** 한 쪽에 담기는 행 수. 기본 `10`. */
  pageSize?: number;

  /** 한 번에 보여 줄 쪽 번호 개수. 기본 `10`. */
  pageButtonCount?: number;

  /**
   * 마지막 쪽의 상한. **서버가 더 못 주는 자리에만 준다.**
   *
   * 예를 들어 검색엔진이 결과를 1만 건까지만 돌려준다면 `maxPage={Math.floor(10000 / pageSize)}` 다.
   * 그 사정은 소비자만 알고 있으므로 컴포넌트가 정하지 않는다.
   */
  maxPage?: number;

  /** 쪽이 바뀔 때. **바뀔 때만** 온다 — 같은 쪽을 다시 눌러도 오지 않는다. */
  onChangePage?: (page: number) => void;

  /**
   * 좁은 자리에서 번호 대신 `‹ 3 / 12 ›` 로 줄인다. 기본 `"auto"`.
   *
   * - `"auto"` — **놓인 자리의 폭**을 보고 저절로 바꾼다(32rem 아래). 화면 폭이 아니라서 옆 패널 안에서도 맞는다
   * - `true` — 늘 줄인 모양
   * - `false` — 늘 번호 모양. 자리가 모자라면 두 줄로 넘어간다
   *
   * 줄인 모양에는 `«` `»` 가 없다 — 넘길 묶음이 보이지 않는다.
   * `"auto"` 는 놓인 자리의 폭을 다 쓴다(`width: 100%`). 정렬은 `--tx-pagination-justify` 로 바꾼다.
   */
  compact?: boolean | "auto";

  /** `‹` `›` (한 쪽씩) 버튼을 숨긴다. */
  hideStepButtons?: boolean;
  /** `«` `»` (묶음째) 버튼을 숨긴다. */
  hideGroupButtons?: boolean;

  /** 버튼에 붙일 이름. 스크린리더가 읽는다. */
  labels?: TxPaginationLabels;

  className?: string;
  /** `className` 과 같은 자리에 붙는다. 토큰을 인라인으로 줄 때 쓴다. */
  style?: CSSProperties;
}

/**
 * 문구를 번역해서 그대로 준다. **키를 주고 안에서 번역하지 않는다** —
 * 어느 쪽이 맞는지 헷갈리는 이중 경로가 생긴다 (`TxCapsLockCheck` 에서 겪었다).
 */
export interface TxPaginationLabels {
  /** 기본 `"페이지 이동"`. `<nav>` 의 이름이다. */
  nav?: string;
  /** 기본 `"이전 묶음"`. */
  prevGroup?: string;
  /** 기본 `"이전"`. */
  prev?: string;
  /** 기본 `"다음"`. */
  next?: string;
  /** 기본 `"다음 묶음"`. */
  nextGroup?: string;
  /** 쪽 번호 버튼. 기본 `(page) => \`${page}쪽\``. */
  page?: (page: number) => string;
  /** 줄인 모양의 `3 / 12`. 기본 `(page, total) => \`${total}쪽 중 ${page}쪽\``. */
  status?: (page: number, total: number) => string;
}
