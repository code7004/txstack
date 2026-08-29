import { TxIconClose } from "../TxIcons";
import { cm } from "../tx-ui.utils";
import { TX_ALERT_ICONS, TX_ALERT_LABELS } from "./TxAlert.icons";
import type { TxAlertProps } from "./TxAlert.types";
import { TxAlertActions } from "./TxAlertActions";

/**
 * 페이지 안에 박히는 안내 상자.
 *
 * @example
 * ```tsx
 * <TxAlert variant="danger">저장하지 못했습니다.</TxAlert>
 *
 * <TxAlert variant="warning" title="결제 수단이 곧 만료됩니다">
 *   9월 30일 이후에는 자동 결제가 중단됩니다.
 *   <TxAlert.Actions>
 *     <TxButton label="카드 변경" />
 *   </TxAlert.Actions>
 * </TxAlert>
 * ```
 *
 * **뜨는 것이 아니라 자리를 차지한다.** 나타났다 사라지는 알림은 `TxToast` 가 맡고,
 * 그쪽이 이 겉모습을 그대로 쓴다 — `variant` 어휘도 같다.
 *
 * 갈래는 **색과 아이콘과 글자 셋으로** 알린다. 색만으로 알리면 색을 못 보는 사람에게
 * 아무것도 남지 않는다.
 *
 * 겉모습은 CSS 변수로 바꾼다 — `.tx-alert { --tx-alert-radius: 0 }`.
 *
 * 명세: `docs/001_ui.md`
 */
export const TxAlertBase = ({ variant = "info", title, icon, onClose, closeLabel = "닫기", announce = false, variantLabel, className, classNames, children, ...props }: TxAlertProps) => {
  const Icon = TX_ALERT_ICONS[variant];
  const label = variantLabel ?? TX_ALERT_LABELS[variant];

  return (
    <div
      {...props}
      data-tag="TxAlert"
      data-variant={variant}
      className={cm("tx-alert", className)}
      // 나타나는 순간 읽어야 하는 것만 라이브 리전이 된다. 페이지에 처음부터 있던 안내를
      // 읽어 주면 읽는 흐름을 끊는다
      role={announce ? (variant === "danger" ? "alert" : "status") : undefined}
    >
      {icon !== false && (
        <span className={cm("tx-alert__icon", classNames?.icon)} data-tag="TxAlert.Icon">
          {icon ?? <Icon />}
        </span>
      )}

      <div className="tx-alert__main">
        {/* 아이콘은 장식이라 스크린리더에 안 읽힌다. 갈래는 이 글자가 알린다 */}
        <span className="tx-alert__label">{`${label}: `}</span>

        {title != null && (
          <p className={cm("tx-alert__title", classNames?.title)} data-tag="TxAlert.Title">
            {title}
          </p>
        )}

        <div className={cm("tx-alert__body", classNames?.body)}>{children}</div>
      </div>

      {onClose && (
        <button type="button" className="tx-alert__close" aria-label={closeLabel} onClick={onClose}>
          <TxIconClose />
        </button>
      )}
    </div>
  );
};

export const TxAlert = Object.assign(TxAlertBase, { Actions: TxAlertActions });
