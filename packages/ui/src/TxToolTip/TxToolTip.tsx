import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import ReactDOM from "react-dom";
import { TxTooltipTheme, cm, themeMerge, type DeepPartial } from "..";

interface ITxTooltipProps {
  tip: ReactNode;
  children: ReactNode;
  delay?: number;
  width?: number | string;
  height?: number | string;
  theme?: DeepPartial<typeof TxTooltipTheme>;
  className?: string;
}

const DEFAULT_TOOLTIP_WIDTH = 250;
const DEFAULT_TOOLTIP_HEIGHT = 80;

type TTooltipPosition = {
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
  maxWidth: number;
  maxHeight: number;
};

export const TxTooltip = ({ tip, theme, className, children, delay = 300, width, height }: ITxTooltipProps) => {
  const stableTheme = useMemo(() => themeMerge(TxTooltipTheme, theme, "override"), [theme]);
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [visible, _visible] = useState(false);
  const [position, _position] = useState<TTooltipPosition | null>(null);
  const timerRef = useRef<number>(0);

  const updatePosition = useCallback(() => {
    const rect = wrapperRef.current?.getBoundingClientRect();
    if (!rect) return;

    const tooltipRect = tooltipRef.current?.getBoundingClientRect();
    const gap = 8;
    const margin = 8;
    const edgeBuffer = 64;
    const tooltipWidth = tooltipRect?.width ?? (typeof width === "number" ? width : DEFAULT_TOOLTIP_WIDTH);
    const tooltipHeight = tooltipRect?.height ?? (typeof height === "number" ? height : DEFAULT_TOOLTIP_HEIGHT);
    const maxWidth = Math.max(0, window.innerWidth - margin * 2);
    const maxHeight = Math.max(0, window.innerHeight - margin * 2);
    const rightSpace = window.innerWidth - rect.left - margin;
    const bottomSpace = window.innerHeight - rect.bottom - margin;
    const useRightAlign = rightSpace < tooltipWidth + edgeBuffer || rect.right > window.innerWidth - edgeBuffer;
    const useTopAlign = bottomSpace < tooltipHeight + edgeBuffer || rect.bottom > window.innerHeight - edgeBuffer;
    const topBelow = rect.bottom + gap;
    const bottomAbove = window.innerHeight - rect.top + gap;

    _position({
      ...(useRightAlign ? { right: Math.max(margin, window.innerWidth - rect.right) } : { left: Math.max(margin, rect.left) }),
      ...(useTopAlign ? { bottom: Math.max(margin, bottomAbove) } : { top: Math.max(margin, topBelow) }),
      maxWidth,
      maxHeight
    });
  }, [height, width]);

  function hdEnter() {
    timerRef.current = window.setTimeout(() => {
      updatePosition();
      _visible(true);
    }, delay);
  }

  function hdLeave() {
    clearTimeout(timerRef.current);
    _visible(false);
  }

  useEffect(() => {
    if (!visible) return;

    updatePosition();
    const frame = requestAnimationFrame(updatePosition);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [updatePosition, visible]);

  return (
    <>
      <span data-tag="TxTooltip" ref={wrapperRef} onMouseEnter={hdEnter} onMouseLeave={hdLeave} className="inline-block">
        {children}
      </span>

      {visible &&
        position &&
        ReactDOM.createPortal(
          <div
            ref={tooltipRef}
            className={cm(stableTheme.base, className)}
            style={{
              left: position.left,
              right: position.right,
              top: position.top,
              bottom: position.bottom,
              width,
              height,
              maxWidth: position.maxWidth,
              maxHeight: position.maxHeight,
              overflow: "auto",
              overflowWrap: "break-word",
              wordBreak: "break-word",
              transform: "none"
            }}
            onMouseLeave={hdLeave}
            onMouseEnter={() => _visible(true)}
          >
            {tip}
          </div>,
          document.body
        )}
    </>
  );
};
