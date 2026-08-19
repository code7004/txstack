import { Children, Fragment, isValidElement, type ReactElement, type ReactNode } from "react";
import type { ITxLayoutMiddleProps, ITxLayoutPanelSlotProps, TLayoutSlotComponent, TResolvedLayoutSlots, TTxLayoutResizableSlot, TTxLayoutSize, TTxLayoutSlot } from "./TxLayout.types";

export function createLayoutSlot<P>(slot: TTxLayoutSlot) {
  // 슬롯 컴포넌트는 직접 렌더링하지 않고 부모 TxLayout이 children에서 해석한다.
  return Object.assign((() => null) as React.FC<P>, {
    txLayoutSlot: slot,
    displayName: `TxLayout.${slot[0].toUpperCase()}${slot.slice(1)}`
  }) as TLayoutSlotComponent<P>;
}

export function normalizeSize(size: TTxLayoutSize) {
  return typeof size === "number" ? `${size}px` : size;
}

export function parsePixelSize(size: TTxLayoutSize) {
  if (typeof size === "number" && Number.isFinite(size)) return size;
  if (typeof size !== "string") return null;

  const matched = size.trim().match(/^(-?\d+(?:\.\d+)?)px$/);
  if (!matched) return null;

  return Number(matched[1]);
}

export function clampSize(size: number, minSize?: number, maxSize?: number) {
  let nextSize = size;
  if (minSize != null) nextSize = Math.max(nextSize, minSize);
  if (maxSize != null) nextSize = Math.min(nextSize, maxSize);
  return nextSize;
}

export function isResizableSlot(slot: TTxLayoutSlot): slot is TTxLayoutResizableSlot {
  return slot === "left" || slot === "right" || slot === "bottom";
}

export function getHandleClassName(slot: TTxLayoutResizableSlot) {
  switch (slot) {
    case "left":
      return "right-0 top-0 h-full w-3 cursor-col-resize";
    case "right":
      return "left-0 top-0 h-full w-3 cursor-col-resize";
    case "bottom":
      return "left-0 top-0 h-3 w-full cursor-row-resize";
  }
}

export function getHandleIconClassName(slot: TTxLayoutResizableSlot) {
  switch (slot) {
    case "left":
    case "right":
      return "h-9 w-9";
    case "bottom":
      return "h-9 w-9";
  }
}

export function getHandleIconPositionClassName(slot: TTxLayoutResizableSlot) {
  switch (slot) {
    case "left":
      return "right-[-12px] top-1/2 -translate-y-1/2";
    case "right":
      return "left-[-12px] top-1/2 -translate-y-1/2";
    case "bottom":
      return "left-1/2 top-[-12px] -translate-x-1/2";
  }
}

export function collectLayoutSlots(children: ReactNode): TResolvedLayoutSlots {
  const slots: Partial<TResolvedLayoutSlots> = {};

  const visit = (node: ReactNode) => {
    Children.forEach(node, (child) => {
      if (child == null || typeof child === "boolean") return;

      if (!isValidElement(child)) {
        throw new Error("TxLayout children must be TxLayout.Top, Left, Middle, Right, or Bottom.");
      }

      if (child.type === Fragment) {
        visit((child as ReactElement<{ children?: ReactNode }>).props.children);
        return;
      }

      const slot = (child.type as Partial<TLayoutSlotComponent<unknown>>).txLayoutSlot;
      if (!slot) {
        throw new Error("TxLayout only accepts TxLayout.Top, Left, Middle, Right, or Bottom as direct children.");
      }

      if (slots[slot]) {
        throw new Error(`TxLayout.${slot[0].toUpperCase()}${slot.slice(1)} can only be used once.`);
      }

      const element = child as ReactElement<ITxLayoutPanelSlotProps | ITxLayoutMiddleProps>;
      slots[slot] = element.props as never;
    });
  };

  visit(children);

  if (!slots.middle) {
    throw new Error("TxLayout.Middle is required.");
  }

  return slots as TResolvedLayoutSlots;
}
