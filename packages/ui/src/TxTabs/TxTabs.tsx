import { useId, useRef, useState, type KeyboardEvent } from "react";
import { cm } from "../tx-ui.utils";
import type { TxTabsProps } from "./TxTabs.types";

/**
 * 탭. **머리말 한 줄과 그 아래 본문 한 칸.**
 *
 * ```tsx
 * <TxTabs
 *   tabs={[
 *     { label: "정보", content: <UserInfo /> },
 *     { label: "기록", content: <History /> }
 *   ]}
 * />
 * ```
 *
 * - `label` 은 `ReactNode` 다 — 배지·아이콘이 그대로 들어간다
 * - **`content` 를 안 주면 패널을 그리지 않는다.** 전환 스위치로만 쓸 수 있다
 * - `value` 를 주면 controlled, 안 주면 uncontrolled
 *
 * 키보드는 WAI-ARIA 탭 규약을 따른다. **탭 줄 전체가 Tab 한 번**이고, 그 안에서
 * ←→ 로 옮기며 Home·End 로 양 끝에 간다. 화살표를 누르면 **그 자리에서 바로 전환된다.**
 *
 * 겉모습은 CSS 변수로 바꾼다 — `.tx-tabs { --tx-tabs-accent: … }`.
 *
 * 명세: `docs/001_ui.md`
 */
export const TxTabs = ({ tabs, value, defaultValue = 0, onChange, className, classNames, "aria-label": ariaLabel, ...props }: TxTabsProps) => {
  const baseId = useId();
  const listRef = useRef<HTMLDivElement>(null);

  // value 를 주면 controlled 다. 원본은 값을 state 로 복사하고 effect 로 맞춰서,
  // 소비자가 onChange 를 받고 안 바꿔도 화면이 멋대로 바뀌었다.
  const [inner, setInner] = useState(defaultValue);
  const selected = value ?? inner;

  const tabId = (index: number) => `${baseId}-tab-${index}`;
  const panelId = (index: number) => `${baseId}-panel-${index}`;

  const select = (index: number) => {
    if (index === selected || tabs[index]?.disabled) return;

    if (value == null) setInner(index);
    onChange?.(index);
  };

  /** 다음으로 고를 수 있는 탭. 비활성은 건너뛰고 양 끝에서 감긴다. */
  const step = (from: number, delta: number) => {
    for (let offset = 1; offset <= tabs.length; offset += 1) {
      const next = (from + delta * offset + tabs.length * offset) % tabs.length;
      if (!tabs[next]?.disabled) return next;
    }
    return from;
  };

  const hdKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const first = tabs.findIndex((tab) => !tab.disabled);
    const last = tabs.length - 1 - [...tabs].reverse().findIndex((tab) => !tab.disabled);

    const next = {
      ArrowLeft: () => step(selected, -1),
      ArrowRight: () => step(selected, 1),
      Home: () => first,
      End: () => last
    }[event.key];

    if (!next || first < 0) return;

    event.preventDefault();
    const index = next();
    select(index);
    // 골라진 탭만 탭 순서에 있으므로 포커스를 따라 옮긴다
    listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[index]?.focus();
  };

  // 하나라도 본문을 가진 항목이 있으면 패널 자리를 만든다.
  const hasPanel = tabs.some((tab) => tab.content != null);

  return (
    <div {...props} data-tag="TxTabs" className={cm("tx-tabs", className)}>
      <div ref={listRef} role="tablist" aria-label={ariaLabel} className={cm("tx-tabs__list", classNames?.list)} onKeyDown={hdKeyDown}>
        {tabs.map((tab, index) => (
          <button
            key={index}
            type="button"
            role="tab"
            id={tabId(index)}
            aria-label={tab["aria-label"]}
            aria-selected={index === selected}
            aria-controls={hasPanel ? panelId(index) : undefined}
            disabled={tab.disabled}
            /**
             * roving tabindex. **골라진 탭 하나만 탭 순서에 넣는다** —
             * 원본은 전부 넣어서 탭이 10개면 Tab 을 10번 눌러야 지나갔다.
             */
            tabIndex={index === selected ? 0 : -1}
            data-selected={index === selected ? "" : undefined}
            className={cm("tx-tabs__tab", classNames?.tab)}
            onClick={() => select(index)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {hasPanel && (
        <div
          role="tabpanel"
          id={panelId(selected)}
          aria-labelledby={tabId(selected)}
          // 본문이 길어 스크롤이 생기면 키보드만 쓰는 사람도 그 안을 훑어야 한다
          tabIndex={0}
          className={cm("tx-tabs__panel", classNames?.panel)}
        >
          {tabs[selected]?.content}
        </div>
      )}
    </div>
  );
};
