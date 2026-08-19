import { motion } from "framer-motion";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { TxLayoutTheme } from ".";
import { cm, IconDragHandleHonrizonBold, IconDragHandleVerticalBold, themeMerge, type DeepPartial } from "..";
import type { ITxLayout, ITxLayoutMiddleProps, ITxLayoutPanelSlotProps, TLayoutPanelProps, TResizeSession, TTxLayoutResizableSlot } from "./TxLayout.types";
import { clampSize, collectLayoutSlots, createLayoutSlot, getHandleClassName, getHandleIconClassName, getHandleIconPositionClassName, isResizableSlot, normalizeSize, parsePixelSize } from "./TxLayout.utils";

function renderHandleIcon(slot: TTxLayoutResizableSlot, theme: typeof TxLayoutTheme) {
  if (slot === "bottom") {
    return <IconDragHandleVerticalBold className={cm(theme.resizeHandleIcon, getHandleIconPositionClassName(slot), getHandleIconClassName(slot))} />;
  }

  return <IconDragHandleHonrizonBold className={cm(theme.resizeHandleIcon, getHandleIconPositionClassName(slot), getHandleIconClassName(slot))} />;
}

const TxLayoutTop = createLayoutSlot<ITxLayoutPanelSlotProps>("top");
const TxLayoutLeft = createLayoutSlot<ITxLayoutPanelSlotProps>("left");
const TxLayoutMiddle = createLayoutSlot<ITxLayoutMiddleProps>("middle");
const TxLayoutRight = createLayoutSlot<ITxLayoutPanelSlotProps>("right");
const TxLayoutBottom = createLayoutSlot<ITxLayoutPanelSlotProps>("bottom");

function TxLayoutPanel({ slot, props, theme }: TLayoutPanelProps) {
  const resizeRef = useRef<TResizeSession | null>(null);
  const panelRef = useRef<HTMLElement | null>(null);
  const parsedSize = useMemo(() => parsePixelSize(props?.size ?? 0), [props?.size]);
  const [panelSize, _panelSize] = useState<number | null>(parsedSize);
  const [isDragging, _isDragging] = useState(false);

  useEffect(() => {
    return () => {
      if (resizeRef.current) {
        document.body.style.userSelect = resizeRef.current.userSelect;
      }
    };
  }, []);

  if (!props) return null;

  const { children, className, contentClassName, visible = true, animated = true, keepMounted = false, size, resizable = false, minSize, maxSize, resizeHandleClassName } = props;

  if (!visible && !keepMounted) return null;

  const isVertical = slot === "top" || slot === "bottom";
  const dimensionKey = isVertical ? "height" : "width";
  const resolvedSize = panelSize ?? parsedSize;
  const layoutSize = resolvedSize != null ? `${resolvedSize}px` : normalizeSize(size);
  const targetSize = visible ? layoutSize : 0;
  const motionStyle = isVertical ? { width: "100%" } : { height: "100%" };
  const enableResize = visible && resizable && isResizableSlot(slot) && resolvedSize != null;

  const hdResizeStart = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!enableResize) return;

    const target = event.currentTarget;
    resizeRef.current = {
      startClientX: event.clientX,
      startClientY: event.clientY,
      startSize: resolvedSize,
      currentSize: resolvedSize,
      userSelect: document.body.style.userSelect
    };

    document.body.style.userSelect = "none";
    _isDragging(true);
    target.setPointerCapture(event.pointerId);
  };

  const hdResizeMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!resizeRef.current || !isResizableSlot(slot)) return;

    const deltaX = event.clientX - resizeRef.current.startClientX;
    const deltaY = event.clientY - resizeRef.current.startClientY;
    const delta = slot === "left" ? deltaX : slot === "right" ? -deltaX : -deltaY;
    const nextSize = clampSize(resizeRef.current.startSize + delta, minSize, maxSize);

    resizeRef.current.currentSize = nextSize;
    if (panelRef.current) {
      panelRef.current.style[dimensionKey] = `${nextSize}px`;
    }
    props.onResize?.(nextSize);
  };

  const hdResizeEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!resizeRef.current) return;

    const { userSelect } = resizeRef.current;
    const finalSize = resizeRef.current.currentSize;
    resizeRef.current = null;
    document.body.style.userSelect = userSelect;
    _isDragging(false);
    event.currentTarget.releasePointerCapture(event.pointerId);

    _panelSize(finalSize);
    props.onResizeEnd?.(finalSize);
  };

  const hdResizeKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!enableResize) return;
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight" && event.key !== "ArrowUp" && event.key !== "ArrowDown") return;

    event.preventDefault();

    const step = event.shiftKey ? 24 : 12;
    const direction =
      slot === "left"
        ? event.key === "ArrowLeft"
          ? -step
          : event.key === "ArrowRight"
            ? step
            : 0
        : slot === "right"
          ? event.key === "ArrowLeft"
            ? step
            : event.key === "ArrowRight"
              ? -step
              : 0
          : event.key === "ArrowUp"
            ? step
            : event.key === "ArrowDown"
              ? -step
              : 0;

    if (direction === 0) return;

    const nextSize = clampSize(resolvedSize + direction, minSize, maxSize);
    _panelSize(nextSize);
    props.onResize?.(nextSize);
    props.onResizeEnd?.(nextSize);
  };

  return (
    <motion.section
      ref={panelRef}
      data-tag={`TxLayout.${slot[0].toUpperCase()}${slot.slice(1)}`}
      className={cm(theme.panel, enableResize && "relative", className)}
      initial={false}
      animate={
        animated && !isDragging
          ? {
              [dimensionKey]: targetSize,
              opacity: visible ? 1 : 0
            }
          : false
      }
      transition={{ type: "tween", duration: 0.22, ease: "easeOut" }}
      style={{
        ...motionStyle,
        overflow: "hidden",
        flexShrink: 0,
        [dimensionKey]: animated && !isDragging ? undefined : targetSize
      }}
      aria-hidden={!visible}
    >
      <div className={cm(theme.slotContent, contentClassName)} style={{ pointerEvents: visible ? "auto" : "none" }}>
        {children}
      </div>

      {enableResize && (
        <div
          data-tag={`TxLayout.${slot[0].toUpperCase()}${slot.slice(1)}.ResizeHandle`}
          className={cm(theme.resizeHandle, theme.resizeHandleState, getHandleClassName(slot), resizeHandleClassName)}
          role="separator"
          tabIndex={0}
          aria-orientation={slot === "bottom" ? "horizontal" : "vertical"}
          aria-label={`Resize ${slot} panel`}
          onPointerDown={hdResizeStart}
          onPointerMove={hdResizeMove}
          onPointerUp={hdResizeEnd}
          onPointerCancel={hdResizeEnd}
          onKeyDown={hdResizeKeyDown}
        >
          {renderHandleIcon(slot, theme)}
        </div>
      )}
    </motion.section>
  );
}

function TxLayoutComponent({ children, className, theme }: ITxLayout) {
  const stableTheme = useMemo(() => themeMerge(TxLayoutTheme, theme as DeepPartial<typeof TxLayoutTheme>, "override"), [theme]);
  // children 변경 시에만 슬롯 구조를 다시 계산해 불필요한 파싱을 줄인다.
  const slots = useMemo(() => collectLayoutSlots(children), [children]);

  return (
    <div data-tag="TxLayout" className={cm(stableTheme.root, className)}>
      <TxLayoutPanel slot="top" props={slots.top} theme={stableTheme} />

      <div data-tag="TxLayout.CenterRow" className={stableTheme.centerRow}>
        <TxLayoutPanel slot="left" props={slots.left} theme={stableTheme} />

        <section data-tag="TxLayout.Middle" className={cm(stableTheme.middle, slots.middle.className)}>
          <div className={cm(stableTheme.slotContent, slots.middle.contentClassName)}>{slots.middle.children}</div>
        </section>

        <TxLayoutPanel slot="right" props={slots.right} theme={stableTheme} />
      </div>

      <TxLayoutPanel slot="bottom" props={slots.bottom} theme={stableTheme} />
    </div>
  );
}

export const TxLayout = Object.assign(TxLayoutComponent, {
  Top: TxLayoutTop,
  Left: TxLayoutLeft,
  Middle: TxLayoutMiddle,
  Right: TxLayoutRight,
  Bottom: TxLayoutBottom
});
