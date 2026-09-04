import { cm } from "../tx-ui.utils";
import type { TxBadgeProps } from "./TxBadge.types";

/**
 * 무언가에 붙는 알림 점·개수.
 *
 * @example
 * ```tsx
 * <TxBadge count={3}>
 *   <TxButton label="알림" variant="secondary" />
 * </TxBadge>
 *
 * <TxBadge dot label="새 소식 있음">
 *   <TxIconBell />
 * </TxBadge>
 * ```
 *
 * **혼자 서는 이름표는 `TxTag` 다.** 이쪽은 **무언가에 얹히는** 것이라, 감싼 것의 자리를
 * 밀지 않고 모서리에 겹쳐 앉는다.
 *
 * **숫자만으로는 무엇의 수인지 알 수 없다.** 기본 안내는 `"알림 3개"` 인데, 무엇의
 * 알림인지는 `label` 로 준다 — `"읽지 않은 메일 3개"`.
 *
 * 겉모습은 CSS 변수로 바꾼다 — `.tx-badge { --tx-badge-size: 1.25rem }`.
 *
 * 명세: `docs/001_ui/031_TxBadge.md`
 */
export const TxBadge = ({ count, max = 99, showZero = false, dot = false, variant = "danger", placement = "top-right", label, className, children, ...props }: TxBadgeProps) => {
  // 수가 없으면 점이다. 0 은 알릴 것이 없으므로 기본으로 감춘다
  const hasCount = count != null && (count !== 0 || showZero);
  const asDot = dot || !hasCount;
  const shown = hasCount && count > max ? `${max}+` : String(count ?? "");

  // 아무것도 알릴 것이 없으면 그리지 않는다. 빈 점이 남으면 없는 알림이 있어 보인다
  const visible = dot || hasCount;

  const mark = visible ? (
    <span
      data-tag="TxBadge"
      data-variant={variant}
      data-placement={placement}
      data-dot={asDot ? "" : undefined}
      data-standalone={children == null ? "" : undefined}
      className={cm("tx-badge", children == null && className)}
      {...(children == null ? props : {})}
    >
      {/* 보이는 숫자는 장식이다. 뜻은 아래 글자가 나른다 — 둘 다 읽히면 두 번 듣는다 */}
      {!asDot && <span aria-hidden>{shown}</span>}

      <span className="tx-badge__label">{label ?? (hasCount ? `알림 ${shown}개` : "새 소식 있음")}</span>
    </span>
  ) : null;

  if (children == null) return mark;

  return (
    <span {...props} className={cm("tx-badge-anchor", className)} data-tag="TxBadge.Anchor">
      {children}
      {mark}
    </span>
  );
};
