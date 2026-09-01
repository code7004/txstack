import { useId, useState, type SVGProps } from "react";
import { cm } from "../tx-ui.utils";
import type { TxCardProps } from "./TxCard.types";
import { TxCardFooter } from "./TxCardFooter";

/**
 * 내용을 담는 상자. **테두리·모서리·그림자·여백을 한 자리에서 정한다.**
 *
 * ```tsx
 * <TxCard title="서버 상태">
 *   <p>정상</p>
 *   <TxCard.Footer>마지막 확인 3분 전</TxCard.Footer>
 * </TxCard>
 * ```
 *
 * **하는 일은 상자와 슬롯, 그리고 접기까지다.** 로딩 표시는 `TxLoading` 이 하고,
 * 링크는 소비자가 내용 안에 넣는다 — 카드가 라우터를 알 이유가 없다.
 *
 * 겉모습은 CSS 변수로 바꾼다 — `.tx-card { --tx-card-padding: 2rem }`.
 *
 * 명세: `docs/001_ui/020_TxCard.md`
 */
export const TxCardBase = ({ title, collapsible = false, collapsed, defaultCollapsed = false, onChangeCollapsed, collapseLabel = "접기", expandLabel = "펼치기", className, classNames, children, ...props }: TxCardProps) => {
  const bodyId = useId();

  // collapsed 를 주면 controlled 다. 원본은 값을 state 로 복사하고 effect 로 맞춰서,
  // 소비자가 콜백을 받고 안 바꿔도 카드가 멋대로 접혔다.
  const [inner, setInner] = useState(defaultCollapsed);
  const isCollapsed = collapsible && (collapsed ?? inner);

  const toggle = () => {
    const next = !isCollapsed;

    if (collapsed == null) setInner(next);
    onChangeCollapsed?.(next);
  };

  // 접는 버튼이 제목 줄에 앉으므로, 접을 수 있으면 제목이 없어도 줄은 그린다.
  const hasHeader = title != null || collapsible;

  return (
    <div {...props} data-tag="TxCard" data-collapsed={isCollapsed ? "" : undefined} className={cm("tx-card", className)}>
      {hasHeader && (
        <div className={cm("tx-card__header", classNames?.header)}>
          <div className={cm("tx-card__title", classNames?.title)}>{title}</div>

          {collapsible && (
            <button
              type="button"
              className="tx-card__toggle"
              // 상태는 aria-expanded 가 알린다. 글자는 다음에 할 일을 가리킨다
              aria-expanded={!isCollapsed}
              aria-controls={bodyId}
              aria-label={isCollapsed ? expandLabel : collapseLabel}
              onClick={toggle}
            >
              <ChevronIcon aria-hidden="true" />
            </button>
          )}
        </div>
      )}

      {/*
        접혀도 요소를 지우지 않는다. `hidden` 이면 aria-controls 가 가리키는 곳이 그대로 있고,
        안에 있던 폼 값도 살아남는다 — 펼쳤을 때 처음부터 다시 치지 않아도 된다.
      */}
      <div id={bodyId} hidden={isCollapsed} className={cm("tx-card__body", classNames?.body)}>
        {children}
      </div>
    </div>
  );
};

/** 접힘 표시. `1em` · `currentColor` 규약이라 놓인 자리의 크기와 색을 따라온다. */
const ChevronIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const TxCard = Object.assign(TxCardBase, { Footer: TxCardFooter });
