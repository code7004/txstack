import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import type { TxAppShellPanel, TxAppShellPanelSlot, TxAppShellProps, TxAppShellResizeLimit } from "./TxAppShell.types";

/**
 * **내부 전용.** 화면이 이 폭보다 좁은가.
 *
 * 셸은 화면 전체를 짜는 것이라 **화면 폭을 재는 것이 맞다** — `TxGrid` 가 놓인 자리를
 * 보는 것과 다른 자리다. CSS 로는 `breakpoint` 를 prop 으로 받을 길이 없다(미디어 쿼리는
 * 커스텀 프로퍼티를 못 읽는다).
 *
 * 서버에서는 `false` 로 시작한다 — 넓은 쪽이 기본 모양이다.
 */
export function useNarrow(breakpoint: number) {
  const [narrow, setNarrow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const query = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const update = () => setNarrow(query.matches);

    update();
    query.addEventListener("change", update);

    return () => query.removeEventListener("change", update);
  }, [breakpoint]);

  return narrow;
}

/**
 * **내부 전용.** 내리면 숨고 올리면 나온다.
 *
 * 맨 위 가까이에서는 늘 보인다 — 조금 내렸다고 숨으면 헤더가 깜빡이는 것처럼 보인다.
 */
export function useHideOnScroll(enabled: boolean) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    let last = window.scrollY;

    const onScroll = () => {
      const now = window.scrollY;

      // 손떨림만큼 움직인 것으로 숨기지 않는다
      if (Math.abs(now - last) < 8) return;

      setHidden(now > last && now > 80);
      last = now;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [enabled]);

  return enabled && hidden;
}

/** 이보다 작게는 못 줄인다. 손잡이가 손가락보다 작아지면 다시 잡을 수 없다. */
const MIN_SIZE = 120;

/** 패널을 늘려도 본문에 이만큼은 남긴다. **한계를 안 줘도 화면이 안 무너지는 이유다.** */
const MAIN_MIN_INLINE = 240;
const MAIN_MIN_BLOCK = 160;

/** 화살표 한 번에 움직이는 거리. */
const STEP = 16;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const limitOf = (panel: TxAppShellPanel | undefined): TxAppShellResizeLimit | null => {
  if (!panel?.resize) return null;
  return panel.resize === true ? {} : panel.resize;
};

/**
 * 자리마다 어떤 CSS 변수를 쥐는가. **폭은 셸이 갖는다** — 슬롯이 제 크기를 정하면
 * 패널과 슬롯이 서로 다른 값을 믿는다.
 */
const VARIABLE = {
  left: "--tx-app-shell-left-width",
  right: "--tx-app-shell-right-width",
  bottom: "--tx-app-shell-bottom-height"
} as const;

type Drag = { vertical: boolean; from: number; size: number; step: number; min: number; max: number };

/**
 * **내부 전용.** 끌어서 좌우 패널과 아래 패널의 크기를 바꾼다.
 *
 * 한계를 안 줘도 **본문이 남을 만큼만** 늘어난다 — 이건 셸만 알 수 있는 값이라
 * 크기 조절을 독립 부품이 아니라 셸이 맡기로 한 이유다.
 */
export function useResize({ panels, onChange }: Pick<TxAppShellProps, "panels"> & { onChange: (slot: TxAppShellPanelSlot, size: number, settled: boolean) => void }) {
  const [own, setOwn] = useState<Partial<Record<TxAppShellPanelSlot, number>>>({});
  const [bounds, setBounds] = useState<Partial<Record<TxAppShellPanelSlot, { min: number; max: number }>>>({});
  const drag = useRef<Drag | null>(null);
  const last = useRef(0);

  /** 밖에서 쥔 값 → 셸이 기억하는 값 → 처음 값 순으로 이긴다. */
  const sizeOf = (slot: TxAppShellPanelSlot) => panels?.[slot]?.size ?? own[slot] ?? panels?.[slot]?.defaultSize;

  const commit = (slot: TxAppShellPanelSlot, size: number, settled: boolean) => {
    last.current = size;

    // 밖에서 쥔 자리는 밖이 정한다. 안에서 같이 쥐면 둘이 어긋난다
    if (panels?.[slot]?.size == null) setOwn((current) => ({ ...current, [slot]: size }));
    onChange(slot, size, settled);
  };

  /**
   * 이 자리가 얼마나 더 커질 수 있는가. **본문에서 빌려 온다.**
   *
   * 아래 패널은 전체 폭이라 좌우까지 담은 줄(`__body`)의 높이를 줄이고, 좌우 패널은 본문의
   * 폭을 줄인다.
   */
  const room = (pane: HTMLElement, vertical: boolean) => {
    const shell = pane.closest(".tx-app-shell");

    // 아래 패널이 본문 폭만 덮으면 본문에서, 좌우까지 덮으면 패널 줄에서 빌린다
    const inCenter = pane.parentElement?.classList.contains("tx-app-shell__center");
    const giver = shell?.querySelector(vertical && !inCenter ? ".tx-app-shell__body" : ".tx-app-shell__main");
    if (!giver) return Number.POSITIVE_INFINITY;

    const rect = giver.getBoundingClientRect();
    return Math.max(0, (vertical ? rect.height : rect.width) - (vertical ? MAIN_MIN_BLOCK : MAIN_MIN_INLINE));
  };

  /**
   * 잰 김에 한계도 남긴다. **`aria-valuemax` 는 화면을 재야만 알 수 있어서** 그러지
   * 않으면 스크린리더가 기본값 100 을 읽는다 — 폭이 298px 인데 100 이라고 읽는 셈이다.
   */
  const measure = (handle: HTMLElement, slot: TxAppShellPanelSlot, limit: TxAppShellResizeLimit) => {
    const pane = handle.parentElement!;
    const vertical = slot === "bottom";
    const rect = pane.getBoundingClientRect();
    const size = vertical ? rect.height : rect.width;
    const min = Math.max(limit.min ?? MIN_SIZE, 0);

    // 잰 값은 소수로 나온다. 그대로 두면 스크린리더가 "506.34375" 를 읽는다
    const max = Math.round(Math.max(min, limit.max ?? size + room(pane, vertical)));

    setBounds((current) => (current[slot]?.min === min && current[slot]?.max === max ? current : { ...current, [slot]: { min, max } }));

    return { pane, vertical, size, min, max };
  };

  /**
   * 끄는 방향은 자리마다 다르다. 왼쪽 패널은 오른쪽으로 끌어야 커지고, 오른쪽 패널과
   * 아래 패널은 반대다. **글 방향이 뒤집히면 좌우도 같이 뒤집힌다.**
   */
  const direction = (slot: TxAppShellPanelSlot, pane: HTMLElement) => {
    if (slot === "bottom") return -1;
    const rtl = getComputedStyle(pane).direction === "rtl";
    return (slot === "left") === rtl ? -1 : 1;
  };

  const handleProps = (slot: TxAppShellPanelSlot, name: string, label: (name: string) => string) => {
    const limit = limitOf(panels?.[slot]);
    if (!limit) return null;

    const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
      if (event.button !== 0) return;

      const handle = event.currentTarget;
      const { pane, vertical, size, min, max } = measure(handle, slot, limit);

      drag.current = { vertical, from: vertical ? event.clientY : event.clientX, size, step: direction(slot, pane), min, max };
      last.current = size;

      handle.setPointerCapture(event.pointerId);
      event.preventDefault();
    };

    const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
      const current = drag.current;
      if (!current) return;

      const moved = (current.vertical ? event.clientY : event.clientX) - current.from;

      commit(slot, Math.round(clamp(current.size + moved * current.step, current.min, current.max)), false);
    };

    const finish = (event: PointerEvent<HTMLDivElement>) => {
      if (!drag.current) return;

      drag.current = null;
      event.currentTarget.releasePointerCapture(event.pointerId);

      onChange(slot, last.current, true);
    };

    const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      const { size, min, max } = measure(event.currentTarget, slot, limit);
      const grow = slot === "left" ? ["ArrowRight", "ArrowDown"] : ["ArrowLeft", "ArrowUp"];
      const shrink = slot === "left" ? ["ArrowLeft", "ArrowUp"] : ["ArrowRight", "ArrowDown"];

      const next = grow.includes(event.key) ? size + STEP : shrink.includes(event.key) ? size - STEP : event.key === "Home" ? min : event.key === "End" ? max : null;

      if (next == null) return;

      event.preventDefault();
      const clamped = Math.round(clamp(next, min, max));

      // 키보드는 한 번 누를 때마다 끝난 것이다. 끄는 중간이 없다
      commit(slot, clamped, true);
    };

    return {
      role: "separator" as const,
      // 손잡이 자체가 가로로 누웠는지 세로로 섰는지다. 아래 패널의 것만 가로다
      "aria-orientation": (slot === "bottom" ? "horizontal" : "vertical") as "horizontal" | "vertical",
      "aria-label": label(name),
      "aria-valuenow": sizeOf(slot),
      "aria-valuemin": bounds[slot]?.min ?? limit.min ?? MIN_SIZE,
      "aria-valuemax": bounds[slot]?.max ?? limit.max,
      tabIndex: 0,
      className: `tx-app-shell__handle tx-app-shell__handle--${slot}`,
      onPointerDown,
      onPointerMove,
      onPointerUp: finish,
      onPointerCancel: finish,
      onKeyDown
    };
  };

  /** 크기를 CSS 변수로 내린다. 안 쥔 자리는 CSS 의 기본값이 그대로 산다. */
  const style = () => {
    const out: Record<string, string> = {};

    for (const slot of ["left", "right", "bottom"] as const) {
      const size = sizeOf(slot);
      if (size != null) out[VARIABLE[slot]] = `${size}px`;
    }

    return out as CSSProperties;
  };

  return { handleProps, sizeOf, style };
}

/**
 * **내부 전용.** 접었다 편다.
 *
 * 접기 전 크기는 건드리지 않는다 — `useResize` 가 쥔 값이 그대로 남아 **다시 펴면
 * 그 크기로 돌아온다.**
 */
export function useCollapse({ panels, onChange }: Pick<TxAppShellProps, "panels"> & { onChange: (slot: TxAppShellPanelSlot, collapsed: boolean) => void }) {
  const [own, setOwn] = useState<Partial<Record<TxAppShellPanelSlot, boolean>>>({});

  /** `collapse` 없이 `collapsed` 만 줘도 접힌다 — 스위치를 직접 그리는 길이다. */
  const isCollapsed = (slot: TxAppShellPanelSlot) => panels?.[slot]?.collapsed ?? own[slot] ?? panels?.[slot]?.defaultCollapsed ?? false;

  const toggleProps = (slot: TxAppShellPanelSlot, name: string, label: (name: string) => string) => {
    if (!panels?.[slot]?.collapse) return null;

    const off = isCollapsed(slot);

    return {
      type: "button" as const,
      // 접혔는지는 `aria-expanded` 가 말한다. 이름까지 바꾸면 두 번 말하는 것이 된다
      "aria-expanded": !off,
      "aria-label": label(name),
      className: `tx-app-shell__toggle tx-app-shell__toggle--${slot}`,
      onClick: () => {
        if (panels?.[slot]?.collapsed == null) setOwn((current) => ({ ...current, [slot]: !off }));
        onChange(slot, !off);
      }
    };
  };

  return { isCollapsed, toggleProps };
}
