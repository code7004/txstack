import { Children, useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { TxIconChevron, TxIconPause, TxIconPlay } from "../TxIcons";
import { prefersReducedMotion, usePauseWhenReduced } from "../tx-ui.hooks";
import { cm } from "../tx-ui.utils";
import type { TxCarouselProps } from "./TxCarousel.types";

/**
 * 미끄러짐이 끝났다고 보는 시간. 넉넉히 잡는다 — 먼 거리를 미끄러지는 데 걸리는 시간보다
 * 짧으면 **가는 도중에 번호가 도로 내려간다.**
 */
const SETTLE_MS = 1500;

/** 손을 떼는 순간이 없는 스크롤(휠 · 스와이프)이 멎었다고 보는 시간. */
const SCROLL_END_MS = 140;

/** 이만큼 끌기 전에는 드래그가 아니다. 눌러서 고르거나 글자를 긁는 것을 방해하지 않는다. */
const DRAG_THRESHOLD = 4;

/**
 * **스냅을 잠시 끄고 자리를 옮긴다.** 켜 둔 채로 옮기면 브라우저가 도로 끌어당긴다.
 *
 * 되돌리는 것은 다음 프레임이다. 다만 **그 프레임이 오지 않는 자리가 있다** — 안 보이는
 * 탭, 애니메이션이 없는 환경. 스냅이 꺼진 채로 남으면 장이 딱딱 서지 않으므로 시계도 함께 건다.
 */
function jump(viewport: HTMLElement, left: number) {
  viewport.dataset.jumping = "";
  viewport.scrollLeft = left;

  const release = () => delete viewport.dataset.jumping;

  requestAnimationFrame(release);
  setTimeout(release, 100);
}

/**
 * 여러 장을 옆으로 넘겨 보는 자리.
 *
 * @example
 * ```tsx
 * <TxCarousel label="추천 상품">
 *   <img src="/a.jpg" alt="여름 신상" />
 *   <img src="/b.jpg" alt="세일" />
 * </TxCarousel>
 *
 * <TxCarousel perView={3} loop>…</TxCarousel>           // 세 장씩, 끝없이 돈다
 * <TxCarousel autoPlay interval={4000}>…</TxCarousel>   // 멈춤 버튼이 함께 생긴다
 * <TxCarousel arrows={false} dots={false}>…</TxCarousel>
 * ```
 *
 * **자식 하나가 한 장이다.**
 *
 * 넘기는 것은 **브라우저의 스크롤**이다(`scroll-snap`). 그래서 스와이프 · 휠 · 키보드 ·
 * 관성이 전부 공짜고, 화살표와 점은 그 스크롤을 부르는 버튼일 뿐이다.
 * **마우스로 끌어서도 넘긴다** — 손가락에만 있던 것을 마우스에도 준다.
 *
 * **`loop` 를 주면 끝없이 돈다.** 앞뒤에 장을 복제해 붙여서 마지막에서 처음으로 갈 때도
 * **되감기지 않고 가던 방향으로 계속 흐른다.** 복제 자리에 서면 같은 자리의 진짜 장으로
 * 소리 없이 옮겨 놓는다 — 보는 사람에게는 끝이 없는 띠다.
 *
 * `loop` 없이는 양 끝에서 화살표가 잠겨 어디쯤인지 알려 준다.
 *
 * 한 화면에 여러 장을 보이려면 `perView` 를 준다. 반응형이 필요하면 그 prop 대신
 * `--tx-carousel-per-view` 토큰을 미디어 쿼리로 바꾼다.
 *
 * 명세: `docs/001_ui/047_TxCarousel.md`
 */
export function TxCarousel({
  perView,
  loop = false,
  drag = true,
  arrows = true,
  dots = true,
  autoPlay = false,
  interval = 5000,
  controls = true,
  index,
  defaultIndex = 0,
  onChange,
  label = "슬라이드",
  prevLabel = "이전",
  nextLabel = "다음",
  pauseLabel = "멈춤",
  playLabel = "재생",
  className,
  children,
  ...props
}: TxCarouselProps) {
  const items = Children.toArray(children);
  const count = items.length;

  const looping = loop && count > 1;

  /**
   * 앞뒤에 몇 장을 복제해 붙일지. **한 화면에 보이는 만큼**이면 넘어가는 동안 빈자리가
   * 보이지 않는다. 장이 그보다 적으면 있는 만큼만 붙인다.
   */
  const edge = looping ? Math.min(count, Math.max(1, Math.round(perView ?? 1))) : 0;

  /** 화면에 실제로 그리는 줄 — `[뒤쪽 복제][진짜][앞쪽 복제]`. */
  const slots = looping ? [...items.slice(count - edge), ...items, ...items.slice(0, edge)] : items;

  /** 줄에서의 자리 → 진짜 번호. **밖에 알리는 번호는 늘 진짜 번호다.** */
  const realOf = useCallback((at: number) => (((at - edge) % count) + count) % count, [count, edge]);

  const [slot, setSlot] = useState(() => edge + Math.min(Math.max(defaultIndex, 0), Math.max(count - 1, 0)));
  const current = index ?? realOf(slot);

  const viewportRef = useRef<HTMLDivElement>(null);

  /** 인라인으로 넘어오는 콜백이라 리스너를 다시 달지 않으려고 붙잡아 둔다. */
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  /** 같은 번호를 두 번 알리지 않는다 — 눌러서 갈 때와 도착했을 때가 겹친다. */
  const toldRef = useRef(current);

  const tell = useCallback((at: number) => {
    if (toldRef.current === at) return;

    toldRef.current = at;
    onChangeRef.current?.(at);
  }, []);

  /** 줄에서 한 자리를 집는다. 줄은 넘겨 보는 자리의 첫 자식이다. */
  const slotAt = useCallback((at: number) => viewportRef.current?.children[0]?.children[at] as HTMLElement | undefined, []);

  /**
   * **가는 중이면 그 자리.** 미끄러지는 동안에는 중간 자리를 믿지 않는다.
   *
   * 스크롤은 목적지까지 가는 동안 이벤트를 수십 번 낸다. 그 값을 그대로 받으면
   * **눌러서 올려 둔 번호가 도로 내려갔다가 올라온다** — 점이 깜빡인다.
   */
  const goingRef = useRef<number | null>(null);
  const settleRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const restRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  /** 지금 자리에서 가장 가까운 칸. 장마다 폭이 달라도 맞는다. */
  const nearest = useCallback(() => {
    const viewport = viewportRef.current;
    const track = viewport?.children[0];
    if (!viewport || !track) return null;

    let found = 0;
    let best = Infinity;

    [...track.children].forEach((node, at) => {
      const gap = Math.abs((node as HTMLElement).offsetLeft - viewport.scrollLeft);
      if (gap < best) {
        best = gap;
        found = at;
      }
    });

    return found;
  }, []);

  /**
   * **복제 자리에 섰으면 같은 자리의 진짜 장으로 소리 없이 옮긴다.**
   *
   * 이 한 번의 이동이 무한 루프의 전부다. 미끄러짐 없이 옮기고 그동안 딱딱 맞춰 세우는
   * 것을 꺼 둔다 — 켜 두면 브라우저가 도로 끌어당긴다. 옮기는 거리는 진짜 장들의 폭이라
   * **화면에 보이는 그림은 옮기기 전과 똑같다.**
   */
  const rewind = useCallback(
    (at: number) => {
      if (!looping) return at;

      const home = at < edge ? at + count : at >= edge + count ? at - count : at;
      if (home === at) return at;

      const viewport = viewportRef.current;
      const target = slotAt(home);
      if (!viewport || !target) return at;

      jump(viewport, target.offsetLeft);

      return home;
    },
    [count, edge, looping, slotAt]
  );

  /** 손으로 밀어 넘긴 것을 번호가 따라잡는다. */
  const sync = useCallback(() => {
    const at = nearest();
    if (at === null) return;

    if (goingRef.current !== null) {
      if (at !== goingRef.current) return; // 아직 가는 중이다

      // 도착했다. 안전장치를 걷는다
      goingRef.current = null;
      clearTimeout(settleRef.current);
    }

    const home = rewind(at);

    setSlot(home);
    if (index === undefined) tell(realOf(home));
  }, [index, nearest, realOf, rewind, tell]);

  /**
   * **자리는 스크롤이 쥐고, 번호는 우리가 쥔다.**
   *
   * 눌러서 넘길 때 번호를 먼저 올리므로 점과 화살표가 곧바로 반응한다.
   */
  const goToSlot = useCallback(
    (next: number) => {
      const at = looping ? next : Math.max(0, Math.min(next, count - 1));

      setSlot(at);
      tell(realOf(at));

      const viewport = viewportRef.current;
      const target = slotAt(at);
      if (!viewport || !target) return;

      goingRef.current = at;

      /**
       * 미끄러짐이 끝나지 않는 자리가 있다 — 사람이 도중에 밀어 버리거나, 애니메이션이
       * 아예 돌지 않는 환경이거나. 그때는 **화면이 실제로 있는 자리**를 다시 믿는다.
       */
      clearTimeout(settleRef.current);
      settleRef.current = setTimeout(() => {
        goingRef.current = null;
        sync();
      }, SETTLE_MS);

      // 움직임을 줄여 달라고 했으면 미끄러지지 않고 곧바로 그 자리에 둔다
      const behavior = prefersReducedMotion() ? "auto" : "smooth";

      // jsdom 처럼 scrollTo 가 없는 자리에서는 위치만 옮긴다
      if (typeof viewport.scrollTo === "function") viewport.scrollTo({ left: target.offsetLeft, behavior });
      else viewport.scrollLeft = target.offsetLeft;
    },
    [count, looping, realOf, slotAt, sync, tell]
  );

  const slotRef = useRef(slot);
  slotRef.current = slot;

  /**
   * **지금 장이 있어야 할 자리에 화면을 맞춘다.** 두 번 필요하다.
   *
   * 하나는 첫 그림 — 복제가 앞에 붙어 있으므로 그냥 두면 **복제부터 보인다.**
   * 다른 하나는 자리가 좁아지거나 넓어졌을 때 — 장의 폭이 바뀌면 서 있던 자리가 어긋난다.
   *
   * **한 번 재고 마는 것으로는 모자란다.** 마운트 그 순간에는 아직 폭이 잡히지 않아
   * 전부 0 으로 읽히는 자리가 있다(브라우저 창이 막 열렸을 때가 그렇다).
   * 그래서 다음 프레임에 한 번 더 보고, 크기가 바뀔 때마다 다시 본다.
   */
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const align = () => {
      // 가는 중이거나 끄는 중이면 건드리지 않는다 — 사람이 하는 일을 가로채면 안 된다
      if (goingRef.current !== null || dragRef.current) return;

      const target = slotAt(slotRef.current);
      if (!target || Math.abs(viewport.scrollLeft - target.offsetLeft) < 1) return;

      jump(viewport, target.offsetLeft);
    };

    align();
    const frame = requestAnimationFrame(align);
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(align);
    observer?.observe(viewport);

    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
    };
  }, [looping, edge, slotAt]);

  /** 밖에서 번호를 바꾸면 화면도 따라간다. */
  useEffect(() => {
    if (index === undefined) return;

    const at = looping ? edge + index : index;
    if (at !== slot) goToSlot(at);

    // 밖이 준 번호가 바뀔 때만 움직인다
  }, [index]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    /**
     * 휠과 스와이프는 **손을 떼는 순간이 없다.** 스크롤이 멎은 뒤에 한 번 더 본다 —
     * 복제 자리에 멈춰 섰다면 그때 진짜 자리로 옮긴다.
     */
    const onScroll = () => {
      sync();

      clearTimeout(restRef.current);
      restRef.current = setTimeout(() => goingRef.current === null && sync(), SCROLL_END_MS);
    };

    viewport.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      viewport.removeEventListener("scroll", onScroll);
      clearTimeout(settleRef.current);
      clearTimeout(restRef.current);
    };
  }, [sync]);

  /**
   * **마우스로 끌어서 넘긴다.** 손가락은 원래 된다 — 브라우저의 스크롤이라 스와이프가
   * 공짜다. 마우스에는 그런 것이 없어서 여기서 만든다.
   *
   * 끄는 동안에는 **딱딱 맞춰 세우는 것을 잠시 끈다.** 켜 둔 채로 자리를 옮기면
   * 브라우저가 매번 가까운 장으로 되돌려서 끌리지 않는다.
   */
  const dragRef = useRef<{ id: number; x: number; left: number; moved: boolean } | null>(null);

  const hdDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    // 손가락·펜은 브라우저가 이미 한다. 왼쪽 버튼만 받는다
    if (!drag || event.pointerType !== "mouse" || event.button !== 0) return;

    const viewport = viewportRef.current;
    if (!viewport) return;

    dragRef.current = { id: event.pointerId, x: event.clientX, left: viewport.scrollLeft, moved: false };
  };

  const hdMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const state = dragRef.current;
    const viewport = viewportRef.current;
    if (!state || !viewport || state.id !== event.pointerId) return;

    const moved = event.clientX - state.x;

    if (!state.moved) {
      // 살짝 눌린 것은 드래그가 아니다. 여기서 잡아야 누르기·긁기가 살아난다
      if (Math.abs(moved) < DRAG_THRESHOLD) return;

      state.moved = true;

      /**
       * **React 상태가 아니라 DOM 에 직접 적는다.** 다시 그릴 때까지 기다리면 그 한 프레임
       * 동안 스냅이 살아 있어 첫 움직임이 튄다. 끄는 동안 다시 그릴 이유도 없다.
       */
      viewport.dataset.dragging = "";
      viewport.setPointerCapture?.(event.pointerId);
    }

    viewport.scrollLeft = state.left - moved;
  };

  const hdUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const state = dragRef.current;
    const viewport = viewportRef.current;
    if (!state || !viewport || state.id !== event.pointerId) return;

    dragRef.current = null;
    if (!state.moved) return;

    /**
     * **먼저 고르고 나서 스냅을 켠다.** 순서가 뒤바뀌면 브라우저가 자기 판단으로 먼저
     * 세워 버려서, 우리가 고른 장과 다른 곳에 설 수 있다.
     */
    const at = nearest();

    delete viewport.dataset.dragging;
    viewport.releasePointerCapture?.(event.pointerId);

    if (at !== null) goToSlot(at);
  };

  const [running, setRunning] = useState(true);
  usePauseWhenReduced(setRunning);

  /** 얹혀 있거나 초점이 안에 있다. 보고 있다는 뜻이다. */
  const [held, setHeld] = useState(false);
  const moving = autoPlay && count > 1 && running && !held;

  useEffect(() => {
    if (!moving) return;

    /**
     * 돌 수 있으면 **그냥 다음 칸으로 간다** — 복제를 지나며 자연스럽게 이어진다.
     * 돌지 않으면 끝에서 처음으로 되돌아온다. 안 그러면 저절로 넘어가는 것이 영영 멈춘다.
     */
    const id = setInterval(() => goToSlot(looping ? slot + 1 : (current + 1) % count), interval);
    return () => clearInterval(id);
  }, [moving, slot, current, count, looping, interval, goToSlot]);

  if (!count) return null;

  /** 화살표는 한 칸씩 민다. 돌지 않을 때만 양 끝에서 잠긴다. */
  const step = (delta: number) => goToSlot(looping ? slot + delta : current + delta);

  return (
    <section
      {...props}
      data-tag="TxCarousel"
      data-moving={moving ? "" : undefined}
      data-loop={looping ? "" : undefined}
      className={cm("tx-carousel", className)}
      // TxGrid 의 columns 와 같은 방식이다 — prop 이 토큰에 값을 써 넣는다
      style={{ "--tx-carousel-per-view": perView, ...props.style } as CSSProperties}
      // 넘기는 묶음이라는 것을 스크린리더가 먼저 말해 준다
      role="group"
      aria-roledescription="carousel"
      aria-label={label}
    >
      {/*
        화살표는 **넘겨 보는 자리에만** 얹힌다. 스크롤되는 자리 안에 두면 함께 흘러가고,
        바깥(점까지 포함한 전체)에 두면 점 높이만큼 위로 어긋난다.
      */}
      <div className="tx-carousel__frame">
        <div
          ref={viewportRef}
          className="tx-carousel__viewport"
          data-drag={drag ? "" : undefined}
          // 스크롤 되는 자리는 키보드로도 닿아야 한다 — 화살표 키로 그대로 밀린다
          tabIndex={0}
          onPointerEnter={() => setHeld(true)}
          onPointerLeave={() => setHeld(false)}
          onFocus={() => setHeld(true)}
          onBlur={() => setHeld(false)}
          onPointerDown={hdDown}
          onPointerMove={hdMove}
          onPointerUp={hdUp}
          onPointerCancel={hdUp}
          // 사진을 끌면 브라우저가 그림을 들어 올린다. 우리가 끄는 중이면 그것부터 막는다
          onDragStart={(event) => dragRef.current?.moved && event.preventDefault()}
        >
          <ul className="tx-carousel__track">
            {slots.map((item, at) => {
              /**
               * 복제는 **읽히지도 눌리지도 않는다.** 같은 장이 두 번 읽히면 몇 장인지 알 수
               * 없고, 탭이 복제 안으로 들어가면 화면이 엉뚱한 자리로 끌려간다.
               */
              const clone = looping && (at < edge || at >= edge + count);

              return (
                <li key={at} className="tx-carousel__item" data-clone={clone ? "" : undefined} {...(clone ? { "aria-hidden": true, inert: true } : { role: "group", "aria-roledescription": "slide", "aria-label": `${realOf(at) + 1} / ${count}` })}>
                  {item}
                </li>
              );
            })}
          </ul>
        </div>

        {arrows && count > 1 && (
          <>
            <button type="button" className="tx-carousel__arrow" data-dir="prev" aria-label={prevLabel} disabled={!looping && current === 0} onClick={() => step(-1)}>
              <TxIconChevron />
            </button>
            <button type="button" className="tx-carousel__arrow" data-dir="next" aria-label={nextLabel} disabled={!looping && current >= count - 1} onClick={() => step(1)}>
              <TxIconChevron />
            </button>
          </>
        )}
      </div>

      {(dots || autoPlay) && count > 1 && (
        <div className="tx-carousel__controls">
          {dots && (
            <div className="tx-carousel__dots">
              {items.map((_, at) => (
                <button
                  key={at}
                  type="button"
                  className="tx-carousel__dot"
                  data-active={at === current ? "" : undefined}
                  // 점은 그림이 아니라 "몇 번째로 간다" 는 버튼이다
                  aria-label={`${label} ${at + 1}`}
                  aria-current={at === current ? "true" : undefined}
                  onClick={() => goToSlot(edge + at)}
                />
              ))}
            </div>
          )}

          {/*
            `controls={false}` 는 **감추는 것이지 없애는 것이 아니다** — `TxTicker` 와 같은 규약이다.
            저절로 움직이는 것에 멈출 수단이 없으면 안 된다.
          */}
          {autoPlay && (
            <button type="button" className="tx-carousel__toggle" data-hidden={controls ? undefined : ""} aria-label={running ? pauseLabel : playLabel} onClick={() => setRunning((prev) => !prev)}>
              {running ? <TxIconPause /> : <TxIconPlay />}
            </button>
          )}
        </div>
      )}
    </section>
  );
}
