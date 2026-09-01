import type { HTMLAttributes } from "react";
import { createPortal } from "react-dom";
import { cm } from "../tx-ui.utils";
import { TxSpinner } from "../TxSpinner";

export interface TxLoadingProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** 문구. 비우면 스피너만 나온다 */
  text?: string;
  /** 표시 여부. **배열을 주면 그 배열이 비어 있는 동안** 보인다. 기본 `true` */
  visible?: boolean | readonly unknown[];
  /** 화면 전체를 덮는다. `document.body` 로 포털된다 */
  fullScreen?: boolean;
  /** 안쪽 슬롯. 바깥 겉은 `className` 이 맡는다 */
  classNames?: { icon?: string; text?: string; backdrop?: string };
}

/**
 * "로딩 중" 을 화면에 세우는 자리. **언제 보일지**와 **옆에 붙는 문구**, **전체화면 딤**을 맡는다.
 *
 * - `visible` 에 **배열**을 주면 그 배열이 비어 있는 동안 보인다. `data.length === 0` 을 따로 계산하지 않는다
 * - `fullScreen` 은 `document.body` 로 포털된다 — 조상의 `transform` 안에 갇히지 않는다
 * - 문구의 색·크기를 정하지 않는다. 놓인 자리의 글자를 따라간다
 *
 * @example
 * ```tsx
 * <TxLoading visible={rows} text="목록을 불러오는 중" />
 * <TxLoading visible={isNavigating} text="이동 중" fullScreen />
 * ```
 *
 * 아이콘 크기·딤·쌓임 순서는 CSS 변수로 바꾼다 — `.tx-loading { --tx-loading-icon-size: 3em }`.
 *
 * 회전 아이콘 자체는 `TxSpinner` 가 소유한다. 속도는 `--tx-spinner-duration` 이다.
 *
 * 명세: `docs/001_ui/003_TxLoading.md`
 */
export const TxLoading = ({ visible = true, text, fullScreen = false, className, classNames, role, ...props }: TxLoadingProps) => {
  // 표시 여부는 visible 로만 결정한다. 배열이면 "빈 배열 = 로딩 표시" 규약을 유지한다 (TxCard.isLoading 과 같다).
  // (text 유무로 표시를 결정하면 로딩이 끝나도 text 가 남아 오버레이가 안 꺼지는 버그가 있었다.)
  const isShow = visible === true || (Array.isArray(visible) && visible.length === 0);

  if (!isShow) return null;

  // 안내는 **한 자리에서만** 한다. 래퍼와 스피너를 둘 다 live region 으로 만들면 같은 내용이 두 번 읽힌다.
  //  - 문구가 있으면 이 래퍼가 그 문구를 읽는다 → 스피너는 장식이다
  //  - 문구가 없으면 읽을 내용이 없으므로 TxSpinner 의 기본 안내("Loading")에 맡긴다 → 래퍼에 role 을 걸지 않는다
  const node = (
    // 통과 props 를 먼저 편다. 아래 계약 속성(data-*·class)은 덮이면 안 된다.
    <div {...props} data-tag="TxLoading" data-full-screen={fullScreen ? "" : undefined} role={text ? (role ?? "status") : role} className={cm("tx-loading", className)}>
      {/*
        딤을 **첫 자식**으로 둔다. 포지션 요소는 비포지션 형제보다 나중에 그려지므로,
        아래 두 슬롯이 position: relative 를 받아야 딤 위로 올라온다 (TxLoading.css).
      */}
      {fullScreen && <div className={cm("tx-loading__backdrop", classNames?.backdrop)} />}
      <span className={cm("tx-loading__icon", classNames?.icon)}>
        <TxSpinner decorative={!!text} />
      </span>
      {/* 조건 렌더다. 무조건 렌더하면 문구 없이 쓸 때 빈 슬롯이 여백만 남긴다 */}
      {text && <span className={cm("tx-loading__text", classNames?.text)}>{text}</span>}
    </div>
  );

  if (!fullScreen) return node;

  // SSR 에는 document 가 없다. 첫 렌더에서는 아무것도 내지 않고 하이드레이션 뒤에 붙는다 —
  // 로딩 표시는 클라이언트에서 의미가 생기는 것이라 이 절충을 받아들인다.
  if (typeof document === "undefined") return null;

  return createPortal(node, document.body);
};
