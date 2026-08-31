import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { cm } from "../tx-ui.utils";
import type { TxScrollAreaProps } from "./TxScrollArea.types";

/** 소수점 스크롤 때문에 정확히 끝에 닿지 않는다. 1px 은 끝으로 본다. */
const EDGE = 1;

/**
 * 넘치는 내용을 굴려 보는 자리. **양 끝이 흐려져 더 있다는 것을 알린다.**
 *
 * @example
 * ```tsx
 * <TxScrollArea size="12rem" label="약관">
 *   <p>…긴 글…</p>
 * </TxScrollArea>
 * ```
 *
 * 흐림은 **더 볼 것이 있는 쪽에만** 생긴다. 맨 위에 있으면 위는 또렷하고 아래만 흐리다 —
 * 양쪽을 늘 흐리게 두면 끝에 닿았는지 알 수 없다.
 *
 * **스크롤 위치는 JS 가 읽는다.** CSS 만으로 하려면 `mask-attachment: local` 이 있어야
 * 하는데 **어느 브라우저에도 구현돼 있지 않고**, 스크롤 기반 애니메이션은 없는 곳에서
 * 흐림이 통째로 사라진다 — 그건 이 컴포넌트가 하는 일의 전부다.
 *
 * 겉모습은 CSS 변수로 바꾼다 — `.tx-scroll-area { --tx-scroll-area-fade: 3rem }`.
 *
 * 명세: `docs/001_ui.md`
 */
export const TxScrollArea = ({ orientation = "vertical", size, focusable = true, label, className, style, children, ...props }: TxScrollAreaProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: true });

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;

    const vertical = orientation === "vertical";
    const position = vertical ? el.scrollTop : el.scrollLeft;
    const total = vertical ? el.scrollHeight : el.scrollWidth;
    const visible = vertical ? el.clientHeight : el.clientWidth;

    // 넘치지 않으면 양 끝 모두 "끝" 이다 — 흐릴 것이 없다
    const next = { start: position <= EDGE, end: position + visible >= total - EDGE };

    // 같은 값을 다시 넣으면 매 렌더마다 도는 이 효과가 무한히 돈다
    setEdges((current) => (current.start === next.start && current.end === next.end ? current : next));
  }, [orientation]);

  /**
   * **deps 를 두지 않는다.** 내용이 바뀌면 넘침도 바뀌는데, 그것은 부모가 다시 그릴 때
   * 일어나므로 매 렌더 뒤에 다시 재는 것이 가장 확실하다. 값이 그대로면 위에서 멈춘다.
   */
  useEffect(update);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.addEventListener("scroll", update, { passive: true });

    // 자리가 좁아지면 안 넘치던 것이 넘친다. 창 크기가 아니라 이 상자를 본다
    const observer = new ResizeObserver(update);
    observer.observe(el);

    return () => {
      el.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, [update]);

  return (
    <div
      {...props}
      ref={ref}
      data-tag="TxScrollArea"
      data-orientation={orientation}
      // 흐림은 **더 볼 것이 있는 쪽에만** 생긴다. 끝에 닿았는지가 이것으로 보인다
      data-at-start={edges.start ? "" : undefined}
      data-at-end={edges.end ? "" : undefined}
      className={cm("tx-scroll-area", className)}
      style={{ "--tx-scroll-area-size": size, ...style } as CSSProperties}
      // 마우스 없이는 안쪽에 닿을 길이 없는 자리가 나온다
      tabIndex={focusable ? 0 : undefined}
      role={focusable ? "group" : undefined}
      aria-label={focusable ? label : undefined}
    >
      {children}
    </div>
  );
};
