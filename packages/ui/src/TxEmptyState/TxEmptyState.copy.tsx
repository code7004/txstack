import type { SVGProps } from "react";
import type { TxEmptyStateVariant } from "./TxEmptyState.types";

/**
 * **내부 전용.** 갈래마다의 기본 문구와 그림.
 *
 * 문구를 안 주면 이것이 나온다 — **"없음" 이라고만 적힌 화면을 만들지 않기 위해서다.**
 * 넷이 서로 다른 다음 행동을 가리키므로 문구도 넷이 다르다.
 */
export const TX_EMPTY_STATE_COPY: Record<TxEmptyStateVariant, { title: string; description: string }> = {
  "no-data": { title: "아직 아무것도 없습니다", description: "첫 항목을 만들면 여기에 보입니다." },
  "no-result": { title: "찾는 것이 없습니다", description: "검색어나 조건을 바꿔 보세요." },
  error: { title: "불러오지 못했습니다", description: "잠시 뒤 다시 시도해 주세요." },
  "no-permission": { title: "볼 수 있는 권한이 없습니다", description: "필요하다면 관리자에게 요청하세요." }
};

const base: SVGProps<SVGSVGElement> = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  width: "1em",
  height: "1em",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true
};

/** 빈 상자 */
const IconNoData = () => (
  <svg {...base}>
    <path d="M3 8.5 12 4l9 4.5v7L12 20l-9-4.5z" />
    <path d="M3 8.5 12 13l9-4.5M12 13v7" />
  </svg>
);

/** 돋보기 */
const IconNoResult = () => (
  <svg {...base}>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="m20 20l-4.7-4.7" />
  </svg>
);

/** 느낌표 */
const IconError = () => (
  <svg {...base}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v5M12 16h.01" />
  </svg>
);

/** 잠긴 자물쇠 */
const IconNoPermission = () => (
  <svg {...base}>
    <rect x="4" y="10" width="16" height="10" rx="2" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
  </svg>
);

export const TX_EMPTY_STATE_ICONS: Record<TxEmptyStateVariant, () => React.JSX.Element> = {
  "no-data": IconNoData,
  "no-result": IconNoResult,
  error: IconError,
  "no-permission": IconNoPermission
};
