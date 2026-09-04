import { useEffect, useReducer, useRef, useState, type MouseEvent, type SyntheticEvent } from "react";
import { cm } from "../tx-ui.utils";
import type { TxCollapsibleProps } from "./TxCollapsible.types";

/**
 * 눌러서 접고 펴는 한 덩이.
 *
 * **네이티브 `<details>` 다.** 그래서 여닫기 · 키보드 · 스크린리더가 상태를 읽는 것 ·
 * **접힌 내용까지 찾아 주는 페이지 내 검색**을 전부 브라우저가 맡는다. 손으로 짠 것은
 * `aria-expanded` 를 붙이는 것까지는 해도 검색까지는 못 한다.
 *
 * @example
 * ```tsx
 * <TxCollapsible title="배송 안내">
 *   주문 후 2~3일 안에 받아보실 수 있습니다.
 * </TxCollapsible>
 *
 * // 값의 주인이 되고 싶으면
 * <TxCollapsible title="배송 안내" open={open} onOpenChange={setOpen}>…</TxCollapsible>
 * ```
 *
 * 여러 덩이를 묶어 하나씩만 열리게 하려면 **`TxAccordion`** 을 쓴다 — 이것을 부품으로 쓴다.
 *
 * 겉모습은 CSS 변수로 바꾼다 — `.tx-collapsible { --tx-collapsible-padding: 1rem }`.
 *
 * 명세: `docs/001_ui/027_TxCollapsible.md`
 */
export const TxCollapsible = ({ title, open, defaultOpen = false, onOpenChange, disabled = false, hideMarker = false, titleAs, className, classNames, children, ...props }: TxCollapsibleProps) => {
  const ref = useRef<HTMLDetailsElement>(null);
  const controlled = open !== undefined;

  /**
   * uncontrolled 일 때의 값. **`defaultOpen` 을 `<details>` 에 그대로 넘기지 않는다** —
   * React 가 아는 prop 이 아니라 `defaultopen` 속성으로 새어 나간다.
   */
  const [ownOpen, setOwnOpen] = useState(defaultOpen);
  const isOpen = controlled ? open : ownOpen;

  /**
   * controlled 인데 소비자가 값을 안 바꿨을 때 **다시 그릴 구실**.
   *
   * 그러지 않으면 React 가 다시 그리지 않아 아래 효과가 돌 기회가 없고, 화면만 열린 채
   * 상태와 갈린다. 상태를 하나 더 두는 것으로는 안 된다 — 같은 값이면 React 가 그냥 건너뛴다.
   */
  const [, rerender] = useReducer((tick: number) => tick + 1, 0);

  /** `<summary>` 는 phrasing content 하나 **또는 머리말 하나**를 품도록 규정돼 있다. */
  const Title = titleAs ?? "span";

  /**
   * **controlled 일 때 DOM 을 도로 맞춘다.**
   *
   * `<details>` 는 눌리면 브라우저가 스스로 `open` 을 바꾼다. 소비자가 그 값을 안 받으면
   * React 는 prop 이 그대로라 다시 그리지 않고, **화면만 열린 채 상태와 갈린다.**
   * `TxModal` 이 `<dialog>` 에서 지나간 자리와 같다.
   */
  useEffect(() => {
    const details = ref.current;
    if (!details || !controlled) return;

    if (details.open !== open) details.open = open;
  });

  /** 브라우저가 여닫은 뒤에 온다. 우리가 여는 것이 아니라 **열렸다는 소식**이다. */
  const hdToggle = (event: SyntheticEvent<HTMLDetailsElement>) => {
    const next = event.currentTarget.open;

    if (controlled) rerender();
    else setOwnOpen(next);

    onOpenChange?.(next);
  };

  const hdSummaryClick = (event: MouseEvent<HTMLElement>) => {
    // 네이티브 `<details>` 에는 disabled 가 없다. 여는 것만 막는다
    if (disabled) event.preventDefault();
  };

  return (
    <details {...props} ref={ref} data-tag="TxCollapsible" data-disabled={disabled || undefined} className={cm("tx-collapsible", className)} open={isOpen} onToggle={hdToggle}>
      <summary
        className={cm("tx-collapsible__summary", classNames?.summary)}
        // 눌러도 안 열린다는 것을 알린다. 막는 것은 위의 click 이다
        aria-disabled={disabled || undefined}
        onClick={hdSummaryClick}
      >
        <Title className={cm("tx-collapsible__title", classNames?.title)}>{title}</Title>

        {!hideMarker && (
          <span className={cm("tx-collapsible__marker", classNames?.marker)} aria-hidden>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em">
              <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="m6 9l6 6l6-6" />
            </svg>
          </span>
        )}
      </summary>

      <div className={cm("tx-collapsible__body", classNames?.body)}>{children}</div>
    </details>
  );
};
