import { Children, useEffect, useRef, useState, type CSSProperties, type Ref } from "react";
import { TxIconPause, TxIconPlay } from "../TxIcons";
import { cm } from "../tx-ui.utils";
import { usePauseWhenReduced } from "../tx-ui.hooks";
import { slideMs, useFlowDuration } from "./TxTicker.hook";
import type { TxTickerProps } from "./TxTicker.types";

/**
 * 저절로 움직이는 공지 줄.
 *
 * @example
 * ```tsx
 * // 세로 — 한 줄씩 올라간다
 * <TxTicker>
 *   <a href="/notice/1">점검 안내 — 9월 3일 02:00~04:00</a>
 *   <a href="/notice/2">새 기능이 추가되었습니다</a>
 * </TxTicker>
 *
 * // 가로 — 끊임없이 흐른다
 * <TxTicker flow speed={40}>
 *   <span>BTC 62,145,000</span>
 *   <span>ETH 3,410,000</span>
 * </TxTicker>
 * ```
 *
 * **자식 하나가 항목 하나다.** 링크든 글자든 그대로 넣는다.
 *
 * **멈출 수 있어야 저절로 움직여도 된다** (WCAG 2.2.2). 그래서 멈춤 버튼은 없앨 수 없다 —
 * `controls={false}` 는 화면에서 감출 뿐이고 Tab 이 닿으면 나타난다.
 * 얹거나 초점이 가도 멈춘다 — 읽는 동안 지나가 버리면 안 된다.
 *
 * **움직임을 줄여 달라고 한 사람에게는 멈춘 채로 시작한다.** 첫 항목이 그대로 서 있고,
 * 보고 싶으면 재생을 누른다.
 *
 * 항목이 하나뿐이면 움직일 것이 없으므로 **버튼도 그리지 않는다.**
 *
 * `controls={false}` 로 버튼을 **화면에서 감출 수 있다.** 없어지는 것은 아니라서
 * 초점이 오면 나타난다 — 깨끗한 줄과 멈출 수 있음을 둘 다 가진다.
 *
 * 겉모습은 CSS 변수로 바꾼다 — `.tx-ticker { --tx-ticker-line: 2rem }`.
 *
 * 명세: `docs/001_ui/046_TxTicker.md`
 */
export function TxTicker({ flow = false, interval = 4000, speed = 40, controls = true, pauseLabel = "멈춤", playLabel = "재생", className, children, ...props }: TxTickerProps) {
  const items = Children.toArray(children);
  const count = items.length;

  /** 흐르는 쪽은 하나만 있어도 흐른다. 한 줄씩 바꾸는 쪽은 바꿀 것이 있어야 움직인다. */
  const animated = flow ? count > 0 : count > 1;

  const [running, setRunning] = useState(true);
  usePauseWhenReduced(setRunning);

  /** 얹혀 있거나 초점이 안에 있다. 읽는 중이라는 뜻이다. */
  const [held, setHeld] = useState(false);
  const moving = animated && running && !held;

  const trackRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const duration = useFlowDuration(listRef, speed, flow);

  const [index, setIndex] = useState(0);
  /** 마지막(복제한 첫 줄)에서 처음으로 돌아갈 때만 켠다. 그 한 번은 미끄러지지 않는다. */
  const [instant, setInstant] = useState(false);

  useEffect(() => {
    if (flow || !moving) return;

    const id = setInterval(() => setIndex((prev) => prev + 1), interval);
    return () => clearInterval(id);
  }, [flow, moving, interval]);

  /**
   * **이어 붙인 첫 줄까지 갔으면 미끄러짐이 끝나는 때에 맞춰 소리 없이 처음으로 돌린다.**
   *
   * `transitionend` 로 잡지 않는다 — 전이가 꺼져 있으면(움직임을 줄이는 설정, 애니메이션이
   * 없는 환경) 그 이벤트가 영영 오지 않아 **끝을 지나 빈자리로 계속 올라간다.**
   * 걸리는 시간은 CSS 에서 재 온다.
   *
   * 멈춤 상태와 무관하게 돈다. 마침 그때 손을 얹었다고 복제한 줄에 머물면 안 된다.
   */
  useEffect(() => {
    if (flow || index < count) return;

    const id = setTimeout(() => {
      setInstant(true);
      setIndex(0);
    }, slideMs(trackRef.current));

    return () => clearTimeout(id);
  }, [flow, index, count]);

  /** 켠 다음 프레임에 끈다. 껐다 켜는 사이에 리셋이 그려진다. */
  useEffect(() => {
    if (!instant) return;

    const id = requestAnimationFrame(() => setInstant(false));
    return () => cancelAnimationFrame(id);
  }, [instant]);

  if (!count) return null;

  /** 같은 목록을 두 번 그린다. **잴 쪽에만 `ref` 를 준다** — 둘에 주면 나중 것이 이긴다. */
  const renderList = (ref?: Ref<HTMLUListElement>) => (
    <ul ref={ref} className="tx-ticker__list">
      {items.map((item, at) => (
        <li key={at} className="tx-ticker__item">
          {item}
        </li>
      ))}
    </ul>
  );

  return (
    <div {...props} data-tag="TxTicker" data-flow={flow ? "" : undefined} data-moving={moving ? "" : undefined} className={cm("tx-ticker", className)}>
      {/*
        멈춤은 **읽는 자리**에만 건다. 버튼까지 여기 들어오면 버튼에 손을 얹는 것만으로
        멈춰서, 눌러도 아무 일이 없는 것처럼 보인다.
      */}
      <div
        className="tx-ticker__viewport"
        onPointerEnter={() => setHeld(true)}
        onPointerLeave={() => setHeld(false)}
        onFocus={() => setHeld(true)}
        onBlur={() => setHeld(false)}
      >
        {/*
          세로가 어디까지 올라갔는지는 **인라인 `transform`** 이 쥔다. 커스텀 프로퍼티만
          바꾸면 전이가 걸리는지가 브라우저마다 다르다 — 속성이 바뀌면 어디서나 미끄러진다.
        */}
        {flow ? (
          <div className="tx-ticker__track" style={{ "--tx-ticker-duration": duration } as CSSProperties}>
            {renderList(listRef)}

            {/*
              한 벌을 더 붙여 반만큼 밀면 이음매가 보이지 않는다.
              **`inert` 라 읽히지도 눌리지도 않는다** — 같은 링크가 두 번 잡히면 안 된다.
            */}
            <div className="tx-ticker__clone" aria-hidden inert>
              {renderList()}
            </div>
          </div>
        ) : (
          <div ref={trackRef} className="tx-ticker__track" data-index={index} data-instant={instant ? "" : undefined} style={{ transform: `translateY(calc(var(--tx-ticker-line) * ${-index}))` }}>
            {renderList()}

            {/* 마지막에서 처음으로 이어 붙이는 한 줄. 위로 되감기지 않게 한다 */}
            <div className="tx-ticker__clone" aria-hidden inert>
              <ul className="tx-ticker__list">
                <li className="tx-ticker__item">{items[0]}</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/*
        `controls={false}` 는 **감추는 것이지 없애는 것이 아니다.** 초점이 오면 나타난다 —
        저절로 움직이는 것에 멈출 수단이 없으면 안 된다.
      */}
      {animated && (
        <button type="button" className="tx-ticker__toggle" data-hidden={controls ? undefined : ""} aria-label={running ? pauseLabel : playLabel} onClick={() => setRunning((prev) => !prev)}>
          {running ? <TxIconPause /> : <TxIconPlay />}
        </button>
      )}
    </div>
  );
}
