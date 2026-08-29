import type { SVGProps } from "react";
import type { TxAlertVariant } from "./TxAlert.types";

/**
 * **내부 전용.** 갈래마다 기본으로 붙는 아이콘.
 *
 * 공개 아이콘 목록(`TxIcons`)을 늘리지 않는다 — 거기 이름을 더하는 것은 공개 API 를
 * 늘리는 일이라 따로 정할 문제다. `TxToast` 가 같은 어휘를 쓰므로 여기서 함께 가져간다.
 *
 * 전부 `1em` · `currentColor` 규약이라 놓인 자리의 크기와 색을 따라온다.
 */
const base: SVGProps<SVGSVGElement> = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  width: "1em",
  height: "1em",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true
};

const TxAlertIconInfo = () => (
  <svg {...base}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 16v-5M12 8h.01" />
  </svg>
);

const TxAlertIconSuccess = () => (
  <svg {...base}>
    <circle cx="12" cy="12" r="9" />
    <path d="m8.5 12.5l2.5 2.5l4.5-5" />
  </svg>
);

const TxAlertIconWarning = () => (
  <svg {...base}>
    <path d="M10.3 4.3L2.6 18a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0" />
    <path d="M12 9v4M12 17h.01" />
  </svg>
);

const TxAlertIconDanger = () => (
  <svg {...base}>
    <circle cx="12" cy="12" r="9" />
    <path d="m15 9l-6 6M9 9l6 6" />
  </svg>
);

export const TX_ALERT_ICONS: Record<TxAlertVariant, () => React.JSX.Element> = {
  info: TxAlertIconInfo,
  success: TxAlertIconSuccess,
  warning: TxAlertIconWarning,
  danger: TxAlertIconDanger
};

/**
 * 갈래를 글자로도 알린다. **색과 아이콘만으로는 뜻이 전해지지 않는다** —
 * 색을 못 보는 사람과 스크린리더에는 아무것도 남지 않는다 (WCAG 1.4.1).
 */
export const TX_ALERT_LABELS: Record<TxAlertVariant, string> = {
  info: "안내",
  success: "완료",
  warning: "주의",
  danger: "오류"
};
