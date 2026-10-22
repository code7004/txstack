import { forwardRef, useId, useImperativeHandle, useMemo, useRef, useState } from "react";
import { DayPicker, type DateRange, type Matcher } from "react-day-picker";
import { TxInputLike } from "../TxInput/TxInputLike";
import { TxPopup } from "../TxPopup";
import { cm } from "../tx-ui.utils";
import { boundMatchers } from "./TxDayPicker.bounds";
import { CALENDAR_CLASS_NAMES } from "./TxDayPicker.calendar";
import { useVisibleMonth } from "./TxDayPicker.month";
import type { TxDateRange, TxDayPickerRangeProps, TxDayPickerRangeRef } from "./TxDayPicker.types";
import { addDays, endOfDay, formatDate, startOfDay } from "./TxDayPicker.utils";

const EMPTY: TxDateRange = [undefined, undefined];

const toNums = (range: TxDateRange): [number | undefined, number | undefined] => [range[0]?.getTime(), range[1]?.getTime()];
const toDateRange = (range: TxDateRange): DateRange | undefined => (range[0] || range[1] ? { from: range[0], to: range[1] } : undefined);

/**
 * 기간을 고른다.
 *
 * ```tsx
 * import { TxDayPickerRange } from "@txstack/ui/daypicker";
 *
 * <TxDayPickerRange value={period} onChange={setPeriod} />
 * ```
 *
 * 시작은 **그날 00:00**, 끝은 **그날 23:59:59.999** 로 맞춰서 준다. 그대로 서버에 넘기면
 * 마지막 날이 통째로 포함된다.
 *
 * `maxDays` 를 주면 시작일을 고른 뒤 **범위를 넘는 날짜가 아예 눌리지 않는다.**
 * `min` · `max` 는 그와 따로 늘 걸린다 — 오늘까지만이면 `max={new Date()}`. 둘 다 주면 둘 다 건다.
 *
 * `onSubmit*` 을 주면 확인 버튼이 생기고 `onChange*` 는 불리지 않는다 —
 * 기간을 고치는 동안 서버를 치지 않으려는 자리에 쓴다.
 *
 * `ref` 로 값을 넣을 수 있다. `header` 에 "최근 7일" 같은 버튼을 두고 거기서 부른다.
 * **넣은 기간이 안 보이는 달이면 달력이 그 달로 따라간다** — `value` 로 넣어도 같다.
 *
 * 명세: `docs/001_ui/013_TxDayPicker.md`
 */
export const TxDayPickerRange = forwardRef<TxDayPickerRangeRef, TxDayPickerRangeProps>(function TxDayPickerRange(
  {
    value,
    defaultValue = EMPTY,
    onChange,
    onChangeNums,
    onSubmit,
    onSubmitNums,
    submitLabel = "확인",
    maxDays,
    header,
    footer,
    numberOfMonths = 2,
    placeholder = "기간 선택",
    format = "YYYY-MM-DD",
    keepOpen = true,
    disabled = false,
    min,
    max,
    id,
    className,
    style,
    ...rest
  },
  ref
) {
  const [inner, setInner] = useState<TxDateRange>(defaultValue);
  const committed = value ?? inner;
  const useSubmit = Boolean(onSubmit || onSubmitNums);

  /**
   * 확인 버튼 모드에서는 **누르기 전까지 밖으로 나가지 않는다.**
   * 고르는 동안의 값을 따로 들고, 확인하면 넘기고 그냥 닫으면 버린다.
   */
  const [draft, setDraft] = useState<TxDateRange | null>(null);
  const current = draft ?? committed;

  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  const [month, setMonth] = useVisibleMonth(current[0], open, numberOfMonths, min, max);

  const close = () => {
    setOpen(false);
    if (useSubmit) setDraft(null);
  };

  const apply = (next: TxDateRange) => {
    if (useSubmit) {
      setDraft(next);
      return;
    }

    if (value === undefined) setInner(next);
    onChange?.(next);
    onChangeNums?.(toNums(next));
  };

  useImperativeHandle(ref, () => ({
    getValue: () => current,
    setValue: (next) => apply([next[0] && startOfDay(next[0]), next[1] && endOfDay(next[1])]),
    clear: () => apply(EMPTY),
    open: () => setOpen(true),
    close
  }));

  /**
   * 시작일만 고른 상태에서 **범위를 넘는 날을 막는다.**
   *
   * 원본은 고르고 나서 `alert()` 로 알리고 값을 보정했다. 브라우저 모달로 흐름을 끊는 데다
   * 문구를 바꿀 수도 없었다 — 애초에 못 고르게 하는 편이 낫다.
   */
  // 날짜 단위로만 본다 — 렌더마다 새 Date 를 받아도(`max={new Date()}`) 같은 날이면 다시 만들지 않는다
  const minDay = min && startOfDay(min).getTime();
  const maxDay = max && startOfDay(max).getTime();

  const blocked = useMemo<Matcher[]>(() => {
    const bounds = boundMatchers(minDay === undefined ? undefined : new Date(minDay), maxDay === undefined ? undefined : new Date(maxDay));
    const from = current[0];
    if (!maxDays || !from || current[1]) return bounds;

    return [...bounds, { before: startOfDay(from), after: endOfDay(addDays(from, maxDays - 1)) } as Matcher];
  }, [maxDays, current, minDay, maxDay]);

  /**
   * **두 번 눌러 정한다** — 시작을 기다리는 중이 아니면 누른 날이 새 시작이고, 기다리는 중이면 끝이다.
   *
   * 라이브러리가 주는 기간(`_next`)을 그대로 쓰지 않는다. 첫 클릭을 "하루짜리 기간"(`10일 ~ 10일`)으로
   * 주고, 정해진 기간에서 다시 누르면 끝을 늘인다 — 그렇게 읽으면 시작만 고른 순간이 없어서 `maxDays` 가
   * 한 번도 걸리지 않았고, 정해진 기간을 몇 달로 늘일 수 있었다. 누른 날(`triggerDate`)만 본다.
   */
  const hdSelect = (_next: DateRange | undefined, triggerDate: Date) => {
    const start = current[0];
    const waitingEnd = start && !current[1];

    // 시작만 고른 중간 상태. 아직 기간이 아니므로 끝 경계를 맞추지 않는다.
    if (!waitingEnd) {
      apply([startOfDay(triggerDate), undefined]);
      return;
    }

    // 시작보다 앞을 눌러도 기간이다 — 앞뒤를 바로잡는다(`maxDays` 가 있으면 앞은 애초에 막혀 있다)
    const [from, to] = triggerDate < start ? [triggerDate, start] : [start, triggerDate];
    apply([startOfDay(from), endOfDay(to)]);
    if (!keepOpen && !useSubmit) setOpen(false);
  };

  const hdSubmit = () => {
    const next = current;
    setDraft(null);
    if (value === undefined) setInner(next);

    onSubmit?.(next);
    onSubmitNums?.(toNums(next));
    setOpen(false);
  };

  const display = current[0] && current[1] ? `${formatDate(current[0], format)} ~ ${formatDate(current[1], format)}` : current[0] ? `${formatDate(current[0], format)} ~` : "";

  return (
    <div ref={anchorRef} data-tag="TxDayPickerRange" data-open={open ? "" : undefined} className={cm("tx-daypicker", className)} style={style}>
      <TxInputLike
        value={display}
        placeholder={placeholder}
        id={id}
        ariaLabel={rest["aria-label"]}
        ariaLabelledBy={rest["aria-labelledby"]}
        ariaDescribedBy={rest["aria-describedby"]}
        ariaInvalid={rest["aria-invalid"]}
        ariaHasPopup="dialog"
        ariaExpanded={open}
        ariaControls={open ? panelId : undefined}
        onClick={() => !disabled && (open ? close() : setOpen(true))}
        onKeyDown={(e) => {
          if (disabled) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
          }
        }}
        onClear={current[0] || current[1] ? () => apply(EMPTY) : undefined}
      />

      <TxPopup anchorRef={anchorRef} open={open} onClose={close} id={panelId} role="dialog" aria-label={placeholder} matchAnchorWidth={false} maxHeight="none" className="tx-daypicker__panel">
        {header && <div className="tx-daypicker__header">{header}</div>}

        <DayPicker
          mode="range"
          selected={toDateRange(current)}
          onSelect={hdSelect}
          disabled={blocked}
          startMonth={min}
          endMonth={max}
          numberOfMonths={numberOfMonths}
          month={month}
          onMonthChange={setMonth}
          autoFocus
          classNames={CALENDAR_CLASS_NAMES}
        />

        {footer && <div className="tx-daypicker__footer">{footer}</div>}

        {useSubmit && (
          <div className="tx-daypicker__submit">
            <button type="button" className="tx-daypicker__submit-button" disabled={!current[0] || !current[1]} onClick={hdSubmit}>
              {submitLabel}
            </button>
          </div>
        )}
      </TxPopup>
    </div>
  );
});
