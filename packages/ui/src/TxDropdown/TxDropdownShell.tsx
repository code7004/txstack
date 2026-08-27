import { useCallback, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cm } from "../tx-ui.utils";
import { TxIconCheck } from "../TxIcons";
import { TxPopup } from "../TxPopup";
import type { TxDropdownItem, TxDropdownItemRender } from "./TxDropdown.types";

/** 목록에 실제로 그려지는 한 줄. 골라졌는지까지 계산된 상태다. */
export interface ShellItem {
  item: TxDropdownItem<unknown>;
  selected: boolean;
}

export interface TxDropdownShellProps {
  items: ShellItem[];
  /** 닫혀 있을 때 헤더에 보일 글자. */
  head: string;
  /** 고른 것이 없어 자리표시 글자를 보여 주는 중인가. */
  empty: boolean;
  multiple: boolean;

  onPick: (index: number) => void;
  /** 한 줄을 고르면 닫는다. 하나만 고르는 쪽이 켠다. */
  closeOnPick?: boolean;
  /** 다중 선택의 "전체" 줄. 없으면 그 줄을 그리지 않는다. */
  onPickAll?: () => void;
  /** 확인 버튼. 없으면 버튼을 그리지 않는다. */
  onSubmit?: () => void;
  submitLabel?: string;
  /** 닫힐 때. 확인 버튼 모드에서 되돌리기에 쓴다. */
  onClosed?: () => void;

  locale?: (text: string) => string;
  renderItem?: (info: TxDropdownItemRender) => ReactNode;
  maxHeight?: number | string;

  disabled?: boolean;
  id?: string;
  className?: string;
  style?: React.CSSProperties;
  classNames?: { head?: string; list?: string; item?: string };
  "aria-label"?: string;
}

/**
 * **내부 전용.** `TxDropdown` 과 `TxDropdownMulti` 가 함께 쓰는 속.
 *
 * 값의 모양(하나냐 여럿이냐)은 바깥이 정하고, 여기서는 **여닫기·키보드·목록 그리기**만 맡는다.
 *
 * ## 키보드
 *
 * 포커스는 **헤더 버튼 하나**에만 있다. 목록 줄은 탭 순서에 넣지 않고
 * `aria-activedescendant` 로 지금 짚고 있는 줄을 가리킨다 — 그게 listbox 의 표준이고,
 * 줄이 100개일 때 Tab 을 100번 눌러야 하는 일이 없다.
 *
 * **Tab 을 가로채지 않는다.** 열린 채로 Tab 을 누르면 닫히고 다음 요소로 나간다.
 */
export function TxDropdownShell({
  items,
  head,
  empty,
  multiple,
  onPick,
  closeOnPick = false,
  onPickAll,
  onSubmit,
  submitLabel = "확인",
  onClosed,
  locale = (t) => t,
  renderItem,
  maxHeight = "20rem",
  disabled = false,
  id,
  className,
  style,
  classNames,
  ...rest
}: TxDropdownShellProps) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const anchorRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const reactId = useId();
  const listId = `${reactId}-list`;
  const optionId = (index: number) => `${reactId}-opt-${index}`;

  /** 다중 선택은 "전체" 줄이 맨 위(-1)에 있어 거기서부터 짚는다. */
  const first = onPickAll ? -1 : 0;
  const last = items.length - 1;

  const pick = useCallback(
    (index: number) => {
      onPick(index);
      if (closeOnPick) {
        setOpen(false);
        setActive(-1);
      }
    },
    [onPick, closeOnPick]
  );

  const close = useCallback(() => {
    setOpen(false);
    setActive(-1);
    onClosed?.();
  }, [onClosed]);

  /** 확인은 값을 넘기고 닫는다. `onClosed`(되돌리기)는 부르지 않는다 — 방금 확정했기 때문이다. */
  const submit = useCallback(() => {
    onSubmit?.();
    setOpen(false);
    setActive(-1);
  }, [onSubmit]);

  // 짚은 줄이 보이는 영역 밖으로 나가면 따라간다. 없으면 긴 목록에서 하이라이트를 잃는다.
  useEffect(() => {
    if (!open) return;
    // scrollIntoView 는 모든 환경에 있는 것이 아니다(jsdom 등). 없으면 그냥 넘어간다.
    listRef.current?.querySelector<HTMLElement>(`#${CSS.escape(optionId(active))}`)?.scrollIntoView?.({ block: "nearest" });
    // optionId 는 렌더마다 같은 문자열을 만든다. active 와 open 만 보면 된다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, open]);

  const hdKeyDown = (evt: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;

    if (!open) {
      if (evt.key === "Enter" || evt.key === " " || evt.key === "ArrowDown") {
        evt.preventDefault();
        setOpen(true);
        setActive(first);
      }
      return;
    }

    switch (evt.key) {
      case "ArrowDown":
        evt.preventDefault();
        setActive((i) => (i >= last ? first : i + 1));
        break;
      case "ArrowUp":
        evt.preventDefault();
        setActive((i) => (i <= first ? last : i - 1));
        break;
      case "Home":
        evt.preventDefault();
        setActive(first);
        break;
      case "End":
        evt.preventDefault();
        setActive(last);
        break;
      case "Enter":
      case " ":
        evt.preventDefault();
        if (active === -1 && onPickAll) onPickAll();
        else if (active >= 0) pick(active);
        break;
      case "Escape":
        evt.preventDefault();
        close();
        break;
      // Tab 은 가로채지 않는다. 닫고 다음 요소로 보낸다 — 열린 채로 갇히면 안 된다.
      case "Tab":
        close();
        break;
    }
  };

  const rendered = useMemo(
    () =>
      items.map(({ item, selected }, index) => {
        const info: TxDropdownItemRender = { item, selected, active: index === active, multiple };

        return (
          <div
            key={`${item.name}-${String(item.value)}-${index}`}
            id={optionId(index)}
            role="option"
            aria-selected={selected}
            data-tag="TxDropdown.Item"
            data-selected={selected ? "" : undefined}
            data-active={index === active ? "" : undefined}
            className={cm("tx-dropdown__item", classNames?.item)}
            // 줄은 탭 순서에 넣지 않는다. 포커스는 헤더 하나가 갖는다.
            onPointerDown={(e) => e.preventDefault()}
            onClick={() => pick(index)}
            onPointerEnter={() => setActive(index)}
          >
            {renderItem ? (
              renderItem(info)
            ) : (
              <>
                {multiple && (
                  <span aria-hidden="true" className="tx-dropdown__check">
                    {selected && <TxIconCheck />}
                  </span>
                )}
                <span className="tx-dropdown__item-name">{locale(item.name)}</span>
                {!multiple && selected && (
                  <span aria-hidden="true" className="tx-dropdown__check">
                    <TxIconCheck />
                  </span>
                )}
              </>
            )}
          </div>
        );
      }),
    // optionId·onPick 은 렌더마다 같은 일을 한다. 목록 모양을 정하는 값만 본다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, active, multiple, locale, renderItem, classNames?.item, pick]
  );

  const allSelected = items.length > 0 && items.every((i) => i.selected);
  const someSelected = items.some((i) => i.selected);

  return (
    <div data-tag="TxDropdown" data-open={open ? "" : undefined} data-disabled={disabled ? "" : undefined} className={cm("tx-dropdown", className)} style={style}>
      {/*
        포커스를 받는 것은 이 버튼 하나다. 원본은 바깥 div 가 tabIndex 를 갖고 안쪽 div 가
        role="button" 을 갖고 있어서, 스크린리더가 읽는 대상과 실제 포커스 대상이 달랐다.
      */}
      <div
        {...rest}
        ref={anchorRef}
        id={id}
        role="combobox"
        tabIndex={disabled ? -1 : 0}
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-haspopup="listbox"
        aria-disabled={disabled || undefined}
        aria-activedescendant={open && active >= 0 ? optionId(active) : undefined}
        data-tag="TxDropdown.Head"
        data-empty={empty ? "" : undefined}
        className={cm("tx-dropdown__head", classNames?.head)}
        onClick={() => !disabled && (open ? close() : (setOpen(true), setActive(first)))}
        onKeyDown={hdKeyDown}
      >
        <span className="tx-dropdown__head-text">{head}</span>
        <ArrowIcon aria-hidden="true" className="tx-dropdown__arrow" />
      </div>

      <TxPopup anchorRef={anchorRef} open={open} onClose={close} maxHeight={maxHeight} id={listId} role="listbox" aria-multiselectable={multiple || undefined} className={cm("tx-dropdown__list", classNames?.list)}>
        <div ref={listRef} className="tx-dropdown__list-inner">
          {onPickAll && (
            <>
              <div
                id={optionId(-1)}
                role="option"
                aria-selected={allSelected}
                data-tag="TxDropdown.Item"
                data-selected={allSelected ? "" : undefined}
                data-active={active === -1 ? "" : undefined}
                className={cm("tx-dropdown__item", classNames?.item)}
                onPointerDown={(e) => e.preventDefault()}
                onClick={onPickAll}
                onPointerEnter={() => setActive(-1)}
              >
                <span aria-hidden="true" className="tx-dropdown__check" data-partial={!allSelected && someSelected ? "" : undefined}>
                  {(allSelected || someSelected) && <TxIconCheck />}
                </span>
                <span className="tx-dropdown__item-name">{locale("전체 선택")}</span>
              </div>
              <hr className="tx-dropdown__divider" />
            </>
          )}

          {rendered}

          {onSubmit && (
            <div className="tx-dropdown__submit">
              <button type="button" className="tx-dropdown__submit-button" onPointerDown={(e) => e.preventDefault()} onClick={submit}>
                {locale(submitLabel)}
              </button>
            </div>
          )}
        </div>
      </TxPopup>
    </div>
  );
}

function ArrowIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" {...props}>
      <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="m18 9l-6 6l-6-6" />
    </svg>
  );
}
