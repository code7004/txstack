import { forwardRef, useCallback, useEffect, useId, useMemo, useRef, useState, type ChangeEvent, type FocusEvent, type KeyboardEvent, type ReactElement, type RefAttributes } from "react";
import { cm } from "../tx-ui.utils";
import { TxPopup } from "../TxPopup";
import type { TxComboboxItem, TxComboboxProps } from "./TxCombobox.types";

/** 보이는 글자. 객체 후보는 `label`, 없으면 `value` */
const labelOf = (item: TxComboboxItem) => (typeof item === "string" ? item : (item.label ?? item.value));

/** 고르면 오는 값. 글자 후보는 그 글자 */
const valueOf = (item: TxComboboxItem) => (typeof item === "string" ? item : item.value);

const defaultFilter = <T extends TxComboboxItem>(data: readonly T[], keyword: string): T[] => {
  const q = keyword.trim().toLowerCase();
  return q ? data.filter((item) => labelOf(item).toLowerCase().includes(q)) : [...data];
};

/**
 * 직접 쳐 넣으면서 후보도 고르는 입력창.
 *
 * ```tsx
 * <TxCombobox data={["서울", "부산", "대구"]} value={city} onChangeText={setCity} />
 * ```
 *
 * **목록에 없는 값도 그대로 들어간다.** 그게 `TxDropdown` 과 갈리는 지점이다 —
 * 정해진 것 중에서만 고르게 하려면 그쪽을 쓴다.
 *
 * - 포커스하면 후보가 전부 뜨고, 치기 시작하면 걸러진다
 * - `↑↓` 로 짚고 `Enter` 로 고른다. `Esc` 로 닫아도 **친 글자는 남는다**
 * - `Home` · `End` 는 가로채지 않는다 — 글자 안에서 커서를 옮기는 키다
 * - 후보가 하나도 없으면 목록을 닫는다. 새 값을 치는 중이라는 뜻이다
 *
 * 목록은 화면 맨 위 층으로 뜬다. `overflow: hidden` 안에 넣어도 잘리지 않는다.
 *
 * 후보는 글자이거나 객체다. 객체면 보이는 이름(`label`)과 고르면 오는 값(`value`)이 갈리고,
 * 설명(`description`) · 흐린 글자(`hint`)를 함께 그린다.
 *
 * ```tsx
 * <TxCombobox data={[{ value: "/docs/start", label: "Getting Started", hint: "Documents" }]} onPick={(to) => navigate(to)} />
 * ```
 *
 * 명세: `docs/001_ui/012_TxCombobox.md`
 */
const TxComboboxBase = forwardRef<HTMLInputElement, TxComboboxProps<TxComboboxItem>>(function TxCombobox(
  { data, value, defaultValue = "", onChangeText, onPick, filter = defaultFilter, limit, moreLabel = (n) => `…${n}개 더 있습니다`, maxHeight = "20rem", className, style, classNames, onChange, onFocus, onBlur, onKeyDown, ...props },
  ref
) {
  const [inner, setInner] = useState(defaultValue);
  const text = value ?? inner;

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  /**
   * 열고 나서 글자를 쳤는가.
   *
   * 안 쳤으면 **후보를 전부 보여 준다.** 이게 없으면 값이 채워진 칸을 포커스했을 때
   * 그 값으로 걸러져 한 줄만 남고, 다른 후보를 보려면 지웠다 써야 한다.
   */
  const [typed, setTyped] = useState(false);

  const anchorRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const reactId = useId();
  const listId = `${reactId}-list`;
  const optionId = (index: number) => `${reactId}-opt-${index}`;

  const matched = useMemo(() => filter(data, typed ? text : ""), [filter, data, typed, text]);
  const shown = limit != null ? matched.slice(0, limit) : matched;
  const hidden = matched.length - shown.length;

  // 후보가 없으면 목록을 닫는다. 자유입력이라 새 값을 치는 중일 뿐이고, 빈 상자를 띄울 이유가 없다.
  const visible = open && shown.length > 0;

  const close = useCallback(() => {
    setOpen(false);
    setActive(-1);
  }, []);

  // 짚은 줄이 보이는 영역 밖으로 나가면 따라간다. 없으면 긴 목록에서 하이라이트를 잃는다.
  useEffect(() => {
    if (!visible) return;
    // scrollIntoView 는 모든 환경에 있는 것이 아니다(jsdom 등). 없으면 그냥 넘어간다.
    listRef.current?.querySelector<HTMLElement>(`#${CSS.escape(optionId(active))}`)?.scrollIntoView?.({ block: "nearest" });
    // optionId 는 렌더마다 같은 문자열을 만든다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, visible]);

  // 걸러진 목록이 짧아지면 짚고 있던 자리가 사라진다.
  useEffect(() => {
    setActive((i) => (i >= shown.length ? -1 : i));
  }, [shown.length]);

  const commit = (next: string) => {
    if (value === undefined) setInner(next);
    onChangeText?.(next);
  };

  /** 고르면 입력란에는 보이는 글자가, `onPick` 에는 값이 간다 — 글자 후보면 둘이 같다 */
  const pick = (index: number) => {
    const item = shown[index];
    if (item == null) return;

    commit(labelOf(item));
    onPick?.(valueOf(item), item);
    setTyped(false);
    close();
  };

  const hdChange = (evt: ChangeEvent<HTMLInputElement>) => {
    onChange?.(evt);
    setTyped(true);
    setOpen(true);
    setActive(-1);
    commit(evt.target.value);
  };

  const hdFocus = (evt: FocusEvent<HTMLInputElement>) => {
    onFocus?.(evt);
    setTyped(false);
    setOpen(true);
    setActive(-1);
  };

  const hdBlur = (evt: FocusEvent<HTMLInputElement>) => {
    onBlur?.(evt);
    close();
  };

  const hdKeyDown = (evt: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(evt);
    if (evt.defaultPrevented) return;

    switch (evt.key) {
      case "ArrowDown":
        evt.preventDefault();
        if (!open) {
          setTyped(false);
          setOpen(true);
          setActive(0);
          return;
        }
        setActive((i) => (i >= shown.length - 1 ? 0 : i + 1));
        break;

      case "ArrowUp":
        if (!visible) return;
        evt.preventDefault();
        setActive((i) => (i <= 0 ? shown.length - 1 : i - 1));
        break;

      case "Enter":
        // 짚은 것이 없으면 막지 않는다 — 폼 제출이나 onEnter 로 흘러가야 한다.
        if (visible && active >= 0) {
          evt.preventDefault();
          pick(active);
        }
        break;

      case "Escape":
        // 친 글자는 남긴다. 목록만 닫는다.
        if (open) {
          evt.preventDefault();
          close();
        }
        break;

      // Tab 은 가로채지 않는다. Home·End 도 마찬가지다 — 글자 안에서 커서를 옮기는 키다.
      case "Tab":
        close();
        break;
    }
  };

  return (
    // 껍데기는 .tx-input 을 함께 건다 — 폼에 나란히 놓았을 때 줄이 맞아야 한다.
    <div ref={anchorRef} data-tag="TxCombobox" data-open={visible ? "" : undefined} data-disabled={props.disabled ? "" : undefined} className={cm("tx-input", "tx-combobox", className)} style={style}>
      <input
        {...props}
        ref={ref}
        type="text"
        role="combobox"
        // 목록이 값을 대신 채워 주는 것이 아니라 후보를 제시할 뿐이다.
        aria-autocomplete="list"
        aria-expanded={visible}
        aria-controls={visible ? listId : undefined}
        aria-activedescendant={visible && active >= 0 ? optionId(active) : undefined}
        // 브라우저 자동완성이 목록 위에 겹쳐 뜨면 둘 다 못 쓴다.
        autoComplete="off"
        className={cm("tx-combobox__field", classNames?.field)}
        value={text}
        onChange={hdChange}
        onFocus={hdFocus}
        onBlur={hdBlur}
        onKeyDown={hdKeyDown}
      />

      <TxPopup anchorRef={anchorRef} open={visible} onClose={close} maxHeight={maxHeight} id={listId} role="listbox" className={cm("tx-combobox__list", classNames?.list)}>
        <div ref={listRef}>
          {shown.map((entry, index) => (
            <div
              key={`${valueOf(entry)}-${index}`}
              id={optionId(index)}
              role="option"
              aria-selected={labelOf(entry) === text}
              data-tag="TxCombobox.Item"
              data-active={index === active ? "" : undefined}
              data-rich={typeof entry === "string" ? undefined : ""}
              className={cm("tx-combobox__item", classNames?.item)}
              // 누를 때 입력창의 포커스를 뺏기지 않아야 한다. 뺏기면 blur 로 목록이 먼저 닫힌다.
              onPointerDown={(e) => e.preventDefault()}
              onClick={() => pick(index)}
              onPointerEnter={() => setActive(index)}
            >
              {typeof entry === "string" ? (
                entry
              ) : (
                <>
                  <span className="tx-combobox__label">{labelOf(entry)}</span>
                  {entry.hint != null && <span className="tx-combobox__hint">{entry.hint}</span>}
                  {entry.description != null && <span className="tx-combobox__description">{entry.description}</span>}
                </>
              )}
            </div>
          ))}

          {/* 잘렸다는 것을 알린다. 없으면 사용자는 이게 전부인 줄 안다. 고를 수 없는 줄이다. */}
          {hidden > 0 && (
            <div aria-hidden="true" data-tag="TxCombobox.More" className="tx-combobox__more">
              {moreLabel(hidden)}
            </div>
          )}
        </div>
      </TxPopup>
    </div>
  );
});

/**
 * 후보 타입으로 제네릭이 되게 겉을 씌운다. `forwardRef` 는 제네릭을 잃어서 그대로 두면 `data` 를 객체로
 * 줘도 `onPick` 의 둘째 인자가 `TxComboboxItem` 으로 넓어진다.
 */
export const TxCombobox = TxComboboxBase as <T extends TxComboboxItem = string>(props: TxComboboxProps<T> & RefAttributes<HTMLInputElement>) => ReactElement | null;
