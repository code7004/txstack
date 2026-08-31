import { useState, type CSSProperties } from "react";
import { cm } from "../tx-ui.utils";
import type { TxSliderProps, TxSliderValue } from "./TxSlider.types";

const toPair = (value: TxSliderValue): [number, number] => (Array.isArray(value) ? value : [0, value]);

/**
 * 값을 끌어 고르는 자리.
 *
 * @example
 * ```tsx
 * <TxSlider value={volume} onChange={setVolume} max={100} />
 * <TxSlider value={[10, 80]} onChange={setRange} label={["최소", "최대"]} />
 * ```
 *
 * **네이티브 `<input type="range">` 다.** 그래서 키보드(←→ · Home · End · PageUp/Down)와
 * 스크린리더 안내(`"50, 슬라이더"`)를 브라우저가 맡는다. 손으로 짠 슬라이더가 가장 자주
 * 빠뜨리는 것이 그 둘이다.
 *
 * 배열을 주면 **손잡이가 둘**이 된다. 겹쳐 놓은 두 `<input>` 이라 키보드도 그대로 되고,
 * **서로를 넘어가지 않는다** — 시작이 끝보다 커지면 값이 뒤집혀 읽힌다.
 *
 * 겉모습은 CSS 변수로 바꾼다 — `.tx-slider { --tx-slider-thumb-size: 1.5rem }`.
 *
 * 명세: `docs/001_ui.md`
 */
export const TxSlider = ({ value, defaultValue = 0, onChange, min = 0, max = 100, step = 1, disabled = false, showValue = false, label, className, style, ...props }: TxSliderProps) => {
  const controlled = value !== undefined;
  const [own, setOwn] = useState<TxSliderValue>(defaultValue);
  const current = controlled ? value : own;

  const dual = Array.isArray(current);
  const [start, end] = toPair(current);

  const settle = (next: TxSliderValue) => {
    if (!controlled) setOwn(next);
    onChange?.(next);
  };

  /** 두 손잡이가 서로를 넘어가면 값이 뒤집혀 읽힌다. 넘지 못하게 가둔다. */
  const move = (index: 0 | 1, raw: number) => {
    if (!dual) {
      settle(raw);
      return;
    }

    settle(index === 0 ? [Math.min(raw, end), end] : [start, Math.max(raw, start)]);
  };

  const span = max - min || 1;
  const fill = { "--tx-slider-from": `${((dual ? start : min) - min) / span}`, "--tx-slider-to": `${(end - min) / span}` } as CSSProperties;

  const labels: [string, string] = Array.isArray(label) ? label : [label ?? "시작", label ?? "값"];
  const text = typeof showValue === "function" ? showValue(current) : dual ? `${start} – ${end}` : String(end);

  return (
    <div {...props} data-tag="TxSlider" data-dual={dual ? "" : undefined} data-disabled={disabled ? "" : undefined} className={cm("tx-slider", className)} style={{ ...fill, ...style }}>
      <div className="tx-slider__track">
        {/* 고른 구간. 값에서 나온 두 비율로 그린다 */}
        <div className="tx-slider__fill" aria-hidden />

        {dual && (
          <input type="range" className="tx-slider__input" aria-label={labels[0]} min={min} max={max} step={step} value={start} disabled={disabled} onChange={(evt) => move(0, Number(evt.target.value))} />
        )}

        <input type="range" className="tx-slider__input" aria-label={dual ? labels[1] : (label as string | undefined)} min={min} max={max} step={step} value={end} disabled={disabled} onChange={(evt) => move(1, Number(evt.target.value))} />
      </div>

      {/* 손잡이가 이미 값을 알린다. 이 글자는 눈으로 보는 사람 몫이다 */}
      {showValue !== false && (
        <span className="tx-slider__value" aria-hidden>
          {text}
        </span>
      )}
    </div>
  );
};
