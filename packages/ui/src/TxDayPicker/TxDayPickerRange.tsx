import dayjs from "dayjs";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DayPicker, type DateRange } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { DAY_PICKER_MODIFIERS, TxDayPickerTheme, type ITxDayPickerByRangeProps, type TTxDayPickerRangeNumsValue, type TTxDayPickerRangeValue } from ".";
import { cm, themeMerge } from "../tx-ui.utils";
import { TxButton } from "../TxButton";
import TxInputLike from "../TxInput/TxInputLike";

function getRangeKey(range: DateRange | undefined) {
  if (!range?.from && !range?.to) return "empty";

  return `${range?.from?.getTime() ?? "none"}:${range?.to?.getTime() ?? "none"}`;
}

export const TxDayPickerRange: React.FC<ITxDayPickerByRangeProps> = ({
  className,
  diffBlock,
  format = "YYYY-MM-DD",
  value,
  disabled,
  onChange,
  onChangeNums: onChangeNum,
  onSubmit,
  onSubmitNums: onSubmitNum,
  placeholder = "기간을 선택 하세요.",
  disableAutoClose = true,
  header,
  footer,
  locale,
  theme
}) => {
  const stableTheme = useMemo(() => themeMerge(TxDayPickerTheme, theme, "override"), [theme]);
  const committedRange = useMemo<DateRange | undefined>(() => {
    if (!value || value.length < 2 || value[0] == null || value[1] == null) return undefined;

    return {
      from: new Date(value[0]),
      to: new Date(value[1])
    };
  }, [value]);
  const committedRangeKey = useMemo(() => getRangeKey(committedRange), [committedRange]);
  const [draftState, _draftState] = useState<{ range: DateRange | undefined; sourceKey: string } | undefined>(undefined);
  const [open, _open] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const activeDraftState = draftState?.sourceKey === committedRangeKey ? draftState : undefined;
  const range = activeDraftState ? activeDraftState.range : committedRange;
  const initialMonth = range?.from ?? committedRange?.from;
  const rangeValue: TTxDayPickerRangeValue = [range?.from, range?.to];
  const rangeNumsValue: TTxDayPickerRangeNumsValue = [range?.from?.getTime(), range?.to?.getTime()];
  const useSubmit = !!onSubmit || !!onSubmitNum;

  const closePanel = useCallback(
    (discardDraft = useSubmit) => {
      if (discardDraft) _draftState(undefined);
      _open(false);
    },
    [useSubmit]
  );

  useEffect(() => {
    if (!open) return;

    const panel = panelRef.current;
    const wrapper = pickerRef.current;
    if (!panel || !wrapper) return;

    const panelRect = panel.getBoundingClientRect();

    panel.style.left = "0";
    panel.style.right = "auto";
    panel.style.top = "100%";
    panel.style.bottom = "auto";

    if (panelRect.right > window.innerWidth) {
      panel.style.left = "auto";
      panel.style.right = "0";
    }

    if (panelRect.left < 0) {
      panel.style.left = "0";
      panel.style.right = "auto";
    }

    if (panelRect.bottom > window.innerHeight) {
      panel.style.top = "auto";
      panel.style.bottom = "100%";
    }
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        closePanel();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [closePanel]);

  useEffect(() => {
    if (!open) return;

    const hd = () => closePanel();

    window.addEventListener("resize", hd);
    window.addEventListener("scroll", hd, true);
    return () => {
      window.removeEventListener("resize", hd);
      window.removeEventListener("scroll", hd, true);
    };
  }, [closePanel, open]);

  const emitRange = (nextRange: TTxDayPickerRangeValue, nextNums: TTxDayPickerRangeNumsValue) => {
    onChange?.(nextRange);
    onChangeNum?.(nextNums);
  };

  const submitRange = (nextRange: TTxDayPickerRangeValue, nextNums: TTxDayPickerRangeNumsValue) => {
    onSubmit?.(nextRange);
    onSubmitNum?.(nextNums);
  };

  const setDraftRange = (nextRange: TTxDayPickerRangeValue) => {
    _draftState({
      range: nextRange[0] || nextRange[1] ? { from: nextRange[0], to: nextRange[1] } : undefined,
      sourceKey: committedRangeKey
    });
  };

  const setDraftRangeNums = (nextRange: TTxDayPickerRangeNumsValue) => {
    setDraftRange([nextRange[0] == null ? undefined : new Date(nextRange[0]), nextRange[1] == null ? undefined : new Date(nextRange[1])]);
  };

  const hdClear = () => {
    _draftState({ range: undefined, sourceKey: committedRangeKey });
    if (useSubmit) return;

    emitRange([undefined, undefined], [undefined, undefined]);
    closePanel(false);
  };

  const hdSelect = (selectedRange: DateRange | undefined) => {
    if (!selectedRange?.from && !selectedRange?.to) {
      hdClear();
      return;
    }

    if (!selectedRange?.from || !selectedRange?.to) {
      _draftState({ range: selectedRange, sourceKey: committedRangeKey });
      return;
    }

    let from = dayjs(selectedRange.from).startOf("day");
    const to = dayjs(selectedRange.to).endOf("day");

    if (diffBlock && to.diff(from, "day") > diffBlock) {
      alert(`최대 ${diffBlock}일까지만 선택할 수 있습니다. 자동 보정되었습니다.`);
      from = to.subtract(diffBlock - 1, "day");
    }

    const finalRange: DateRange = { from: from.toDate(), to: to.toDate() };
    _draftState({ range: finalRange, sourceKey: committedRangeKey });

    if (!useSubmit) emitRange([finalRange.from, finalRange.to], [finalRange.from?.getTime(), finalRange.to?.getTime()]);

    if (!useSubmit && !disableAutoClose) closePanel(false);
  };

  const hdSubmit = () => {
    submitRange(rangeValue, rangeNumsValue);
    closePanel(false);
  };

  const renderHeader = () => {
    if (typeof header !== "function") return header;

    return header({
      value: rangeValue,
      valueNums: rangeNumsValue,
      onChange: (nextRange) => {
        setDraftRange(nextRange);
        if (!useSubmit) emitRange(nextRange, [nextRange[0]?.getTime(), nextRange[1]?.getTime()]);
      },
      onChangeNums: (nextRange) => {
        setDraftRangeNums(nextRange);
        if (!useSubmit) emitRange([nextRange[0] == null ? undefined : new Date(nextRange[0]), nextRange[1] == null ? undefined : new Date(nextRange[1])], nextRange);
      }
    });
  };

  const displayValue = range?.from && range?.to ? `${dayjs(range.from).format(format)} ~ ${dayjs(range.to).format(format)}` : range?.from ? `${dayjs(range.from).format(format)} ~` : "";
  const hdToggle = () => (open ? closePanel() : _open(true));

  return (
    <div ref={pickerRef} className={cm(stableTheme.wrapper, "w-full")}>
      <TxInputLike onClick={hdToggle} onKeyDown={(e) => e.key === "Enter" && hdToggle()} value={displayValue} placeholder={placeholder} className={cm(stableTheme.input, stableTheme.focus, className)} />
      {open && (
        <div ref={panelRef} role="dialog" className={stableTheme.panel}>
          {renderHeader()}
          <DayPicker disabled={disabled} locale={locale} mode="range" selected={range} onSelect={hdSelect} classNames={stableTheme.calendar} modifiersClassNames={DAY_PICKER_MODIFIERS} numberOfMonths={2} defaultMonth={initialMonth} />
          {footer}
          {useSubmit && <TxButton title="OK" label="OK" className="w-full" disabled={!range?.from || !range?.to} onClick={hdSubmit} />}
        </div>
      )}
    </div>
  );
};

/**
 * 원본의 오타(`TxDayPicker` → `TxDayPickek`)를 그대로 쓰던 코드를 위한 별칭.
 *
 * @deprecated `TxDayPickerRange` 를 사용한다.
 */
export const TxDayPickekRange = TxDayPickerRange;
