import { cm } from "../tx-ui.utils";
import { TX_EMPTY_STATE_COPY, TX_EMPTY_STATE_ICONS } from "./TxEmptyState.copy";
import type { TxEmptyStateProps } from "./TxEmptyState.types";

/**
 * 보여 줄 것이 없을 때 그 자리에 놓는 안내.
 *
 * @example
 * ```tsx
 * {rows.length === 0 && (
 *   <TxEmptyState variant="no-result">
 *     <TxButton label="조건 지우기" variant="secondary" onClick={reset} />
 *   </TxEmptyState>
 * )}
 * ```
 *
 * **왜 비었는지를 넷으로 가른다** — `no-data`(아직 안 만듦) · `no-result`(찾았는데 없음) ·
 * `error`(불러오다 실패) · `no-permission`(권한 없음). 넷은 **사용자가 다음에 할 일이 다르다.**
 * "없음" 이라고만 적으면 그 다음이 없다.
 *
 * 문구를 안 주면 갈래마다 정해진 것이 나온다. `title` · `description` 으로 덮고,
 * **`null` 을 주면 그 줄이 아예 없어진다.**
 *
 * 겉모습은 CSS 변수로 바꾼다 — `.tx-empty-state { --tx-empty-state-padding: 4rem 1rem }`.
 *
 * 명세: `docs/001_ui/034_TxEmptyState.md`
 */
export const TxEmptyState = ({ variant = "no-data", title, description, icon, className, children, ...props }: TxEmptyStateProps) => {
  const Icon = TX_EMPTY_STATE_ICONS[variant];
  const copy = TX_EMPTY_STATE_COPY[variant];

  // `undefined` 는 "안 줬다"(기본 문구), `null` 은 "비워 둬라" 다
  const resolvedTitle = title === undefined ? copy.title : title;
  const resolvedDescription = description === undefined ? copy.description : description;

  return (
    <div {...props} data-tag="TxEmptyState" data-variant={variant} className={cm("tx-empty-state", className)}>
      {icon !== false && (
        <span className="tx-empty-state__icon" data-tag="TxEmptyState.Icon">
          {icon ?? <Icon />}
        </span>
      )}

      {/*
        **안 준 것과 일부러 비운 것을 가른다.** `??` 로는 `null` 에도 기본 문구가 돌아와서
        "여기는 설명이 필요 없다" 고 말할 길이 없다.
      */}
      {resolvedTitle != null && <p className="tx-empty-state__title">{resolvedTitle}</p>}
      {resolvedDescription != null && <p className="tx-empty-state__description">{resolvedDescription}</p>}

      {children != null && <div className="tx-empty-state__actions">{children}</div>}
    </div>
  );
};
