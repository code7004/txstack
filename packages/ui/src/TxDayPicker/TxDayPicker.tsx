import { useId, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import { TxInputLike } from "../TxInput/TxInputLike";
import { TxPopup } from "../TxPopup";
import { cm } from "../tx-ui.utils";
import { CALENDAR_CLASS_NAMES } from "./TxDayPicker.calendar";
import { useVisibleMonth } from "./TxDayPicker.month";
import type { TxDayPickerProps } from "./TxDayPicker.types";
import { formatDate, startOfDay } from "./TxDayPicker.utils";

/**
 * 날짜 하나를 고른다.
 *
 * ```tsx
 * import { TxDayPicker } from "@txstack/ui/daypicker";
 *
 * <TxDayPicker value={date} onChange={setDate} />
 * ```
 *
 * `value` 를 주면 controlled 다. 고른 날짜는 **그날 00:00** 으로 맞춰서 준다.
 *
 * 달력은 **고른 날의 달**로 열린다. 아직 고른 것이 없으면 이번 달이다.
 * 열어 둔 채 밖에서 값을 바꿔도 그 날이 안 보이는 달이면 **그 달로 따라간다.**
 *
 * 달력은 화면 맨 위 층으로 뜬다 — `overflow: hidden` 안에 넣어도 잘리지 않고,
 * 아래가 좁으면 위로 뒤집고, **스크롤해도 따라간다.**
 *
 * 기간을 고르려면 `TxDayPickerRange` 를 쓴다.
 *
 * 명세: `docs/001_ui.md`
 */
export function TxDayPicker({ value, defaultValue, onChange, placeholder = "날짜 선택", format = "YYYY-MM-DD", keepOpen = false, disabled = false, id, className, style, ...rest }: TxDayPickerProps) {
  const [inner, setInner] = useState<Date | undefined>(defaultValue);
  const selected = value ?? inner;

  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  const [month, setMonth] = useVisibleMonth(selected, open);

  const hdSelect = (date: Date | undefined) => {
    const next = date ? startOfDay(date) : undefined;

    if (value === undefined) setInner(next);
    onChange?.(next);

    if (!keepOpen) setOpen(false);
  };

  return (
    <div ref={anchorRef} data-tag="TxDayPicker" data-open={open ? "" : undefined} className={cm("tx-daypicker", className)} style={style}>
      <TxInputLike
        value={selected ? formatDate(selected, format) : ""}
        placeholder={placeholder}
        id={id}
        ariaLabel={rest["aria-label"]}
        ariaLabelledBy={rest["aria-labelledby"]}
        ariaDescribedBy={rest["aria-describedby"]}
        ariaInvalid={rest["aria-invalid"]}
        // 달력은 목록이 아니라 대화상자다. 열림 상태는 여기서만 아니까 직접 넘긴다.
        ariaHasPopup="dialog"
        ariaExpanded={open}
        ariaControls={open ? panelId : undefined}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        onKeyDown={(e) => {
          if (disabled) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
          }
        }}
      />

      <TxPopup anchorRef={anchorRef} open={open} onClose={() => setOpen(false)} id={panelId} role="dialog" aria-label={placeholder} matchAnchorWidth={false} maxHeight="none" className="tx-daypicker__panel">
        {/* 펴 놓을 달은 우리가 쥔다 — 안 쥐면 고른 날이 언제든 늘 오늘 달로 열린다. */}
        <DayPicker mode="single" selected={selected} onSelect={hdSelect} month={month} onMonthChange={setMonth} autoFocus classNames={CALENDAR_CLASS_NAMES} />
      </TxPopup>
    </div>
  );
}
