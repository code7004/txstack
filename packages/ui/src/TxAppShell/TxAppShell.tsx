import { useId, useState, type CSSProperties, type ReactNode } from "react";
import { TxSlidePanel } from "../TxSlidePanel";
import { cm } from "../tx-ui.utils";
import { useCollapse, useHideOnScroll, useNarrow, useResize } from "./TxAppShell.hook";
import type { TxAppShellPanelSlot, TxAppShellProps } from "./TxAppShell.types";

const DEFAULT_LABELS = {
  skip: "본문으로 건너뛰기",
  menu: "메뉴 열기",
  top: "주 메뉴",
  left: "하위 메뉴",
  right: "관련 정보",
  bottom: "아래 패널",
  resize: (name: string) => `${name} 크기 조절`,
  toggle: (name: string) => name
};

/** 스위치가 가리키는 쪽. 접히면 반대로 뒤집혀 **다시 펴진다는 것**을 알린다. */
const ARROW: Record<TxAppShellPanelSlot, [string, string]> = {
  left: ["◂", "▸"],
  right: ["▸", "◂"],
  bottom: ["▾", "▴"]
};

/**
 * 화면 전체를 짜는 껍데기. **여섯 자리를 한 자리에서 맡는다** —
 * `header` · `top` · `left` · `right` · `bottom` · `footer`, 그리고 `children` 이 본문이다.
 *
 * @example
 * ```tsx
 * <TxAppShell header={<Brand />} top={<MainNav />} left={<SideNav />} bottom={<Console />}>
 *   <Outlet />
 * </TxAppShell>
 * ```
 *
 * 자리는 이렇게 쌓인다 — **`좌 · (본문 · 아래) · 우`.**
 *
 * ```text
 * ┌──────────────────────────────┐   bottomSpan="screen" 이면
 * │ header                       │   아래 패널이 좌우까지 덮는다
 * │ top                          │
 * ├────────┬───────────┬─────────┤   ├────────┬───────────┬────────┤
 * │ left   │ children  │ right   │   │ left   │ children  │ right  │
 * │        ├───────────┤         │   ├────────┴───────────┴────────┤
 * │        │ bottom    │         │   │ bottom                      │
 * ├────────┴───────────┴─────────┤   ├─────────────────────────────┤
 * │ footer                       │   │ footer                      │
 * └──────────────────────────────┘   └─────────────────────────────┘
 * ```
 *
 * **슬롯은 prop 으로 받는다.** 자식을 뒤져 무엇이 헤더인지 찾지 않는다 — 그렇게 하면
 * 조건부 렌더나 `memo` 한 겹에 못 찾고 엉뚱한 자리에 들어간다.
 *
 * 이름은 방향이지만 **랜드마크는 셸이 붙인다** — `top` · `left` 는 `<nav>`,
 * `right` 는 `<aside>`, `bottom` 은 `<section>` 이고 각각 이름이 다르다.
 * 좌우는 글 방향을 따른다(`inline-start` · `inline-end`).
 *
 * 셸이 맡는 것은 여섯이다.
 *
 * 1. **랜드마크** — 제자리에 두고 이름을 붙인다. 이름이 없으면 스크린리더가 "탐색" 여럿을
 *    구분하지 못한다
 * 2. **본문으로 건너뛰기** — 첫 Tab 에 나타난다. **본문이 어디인지는 셸만 안다**
 * 3. **머무는 헤더** — 붙어 있거나(`true`), 내리면 숨거나(`"hide"`), 같이 굴러간다(`false`)
 * 4. **좁아지면 `left` 를 서랍으로** — 헤더에 햄버거가 생기고 **같은 노드**를 그대로 그린다
 * 5. **크기 조절** — `resizable` 을 준 자리는 끌어서 바꾼다. 한계를 안 줘도 **본문이 남을
 *    만큼만** 늘어난다
 * 6. **접기** — `collapsible` 을 준 자리는 경계선의 스위치로 접는다. 다시 펴면 **접기 전
 *    크기로** 돌아온다
 *
 * 로고 · 메뉴 구조 · 로그인 상태는 **전부 슬롯이다.** 그것이 앱마다 다른 부분이고,
 * 넣는 순간 범용이 아니게 된다.
 *
 * 명세: `docs/001_ui/044_TxAppShell.md`
 */
export const TxAppShell = ({ header, top, left, right, bottom, bottomSpan = "main", footer, sticky = true, panels, onPanelChange, breakpoint = 960, labels, classNames, className, style, children, ...props }: TxAppShellProps) => {
  const text = { ...DEFAULT_LABELS, ...labels };
  const mainId = useId();

  const narrow = useNarrow(breakpoint);
  const hidden = useHideOnScroll(sticky === "hide");
  /**
   * **접힌 자리에는 손잡이가 없다.** 그래서 크기가 바뀌는 순간은 늘 펴져 있고,
   * 두 훅이 서로를 알 필요가 없다 — 크기 쪽은 `collapsed: false` 를 그대로 실어 보낸다.
   */
  const resize = useResize({ panels, onChange: (slot, size, settled) => onPanelChange?.(slot, { size, collapsed: false, settled }) });
  const collapse = useCollapse({ panels, onChange: (slot, next) => onPanelChange?.(slot, { size: resize.sizeOf(slot), collapsed: next, settled: true }) });
  const [drawer, setDrawer] = useState(false);

  // 좁을 때만 서랍이 있다. 서랍의 폭은 서랍 것이라 손잡이도 스위치도 같이 사라진다
  const inDrawer = narrow && left != null;

  /**
   * 세 패널이 같은 부품으로 이뤄진다 — 내용 · 크기 손잡이 · 접기 스위치.
   * **접히면 내용을 그리지 않는다.** 폭만 0 으로 두면 안의 링크에 Tab 이 그대로 닿는다.
   *
   * 내용이 한 겹 더 들어간 이유는 **스크롤이 스위치를 자르기 때문**이다 — 넘치는 것을
   * 패널이 직접 감추면 경계선 위에 얹힌 스위치가 같이 잘려 나간다.
   */
  const panel = (slot: TxAppShellPanelSlot, node: ReactNode, extra?: string) => {
    const Tag = slot === "left" ? "nav" : slot === "right" ? "aside" : "section";
    const off = collapse.isCollapsed(slot);
    const handleProps = off ? null : resize.handleProps(slot, text[slot], text.resize);
    const toggleProps = collapse.toggleProps(slot, text[slot], text.toggle);

    return (
      <Tag aria-label={text[slot]} data-collapsed={off ? "" : undefined} className={cm(`tx-app-shell__${slot}`, extra)}>
        {!off && <div className="tx-app-shell__pane">{node}</div>}
        {handleProps && <div {...handleProps} />}
        {toggleProps && (
          <button {...toggleProps}>
            <span aria-hidden>{ARROW[slot][off ? 1 : 0]}</span>
          </button>
        )}
      </Tag>
    );
  };

  const main = (
    <main id={mainId} className={cm("tx-app-shell__main", classNames?.main)}>
      {children}
    </main>
  );

  const bottomPanel = bottom != null ? panel("bottom", bottom, classNames?.bottom) : null;

  return (
    <div
      {...props}
      data-tag="TxAppShell"
      data-sticky={sticky === false ? undefined : sticky === "hide" ? "hide" : ""}
      data-hidden={hidden ? "" : undefined}
      data-narrow={narrow ? "" : undefined}
      className={cm("tx-app-shell", className)}
      style={{ "--tx-app-shell-breakpoint": `${breakpoint}px`, ...resize.style(), ...style } as CSSProperties}
    >
      {/*
        첫 Tab 에 나타난다. 메뉴가 스무 줄이면 키보드로 본문에 닿는 데 스무 번을 눌러야 하고,
        **어디가 본문인지는 셸만 안다.**
      */}
      <a href={`#${mainId}`} className="tx-app-shell__skip">
        {text.skip}
      </a>

      {(header != null || top != null || inDrawer) && (
        <header className={cm("tx-app-shell__header", classNames?.header)}>
          <div className="tx-app-shell__bar">
            {inDrawer && (
              <button type="button" className="tx-app-shell__menu" aria-label={text.menu} aria-expanded={drawer} onClick={() => setDrawer(true)}>
                <span aria-hidden>☰</span>
              </button>
            )}

            {header}
          </div>

          {/* 이름이 없으면 스크린리더가 "탐색" 여럿을 구분하지 못한다 */}
          {top != null && (
            <nav aria-label={text.top} className={cm("tx-app-shell__top", classNames?.top)}>
              {top}
            </nav>
          )}
        </header>
      )}

      <div className="tx-app-shell__body">
        {/* 넓을 때만 패널로 선다. 좁으면 아래 서랍이 같은 노드를 그린다 */}
        {left != null && !inDrawer && panel("left", left, classNames?.left)}

        {/* 아래 패널이 본문 폭만 덮으면 둘이 한 칸을 이룬다 */}
        {bottomSpan === "main" ? <div className="tx-app-shell__center">{main}{bottomPanel}</div> : main}

        {right != null && panel("right", right, classNames?.right)}
      </div>

      {/* 전체 폭이면 패널 줄 밖이다 — 좌우가 그 위에서 끝나고 그 밑을 아래 패널이 가로지른다 */}
      {bottomSpan === "screen" && bottomPanel}

      {footer != null && <footer className={cm("tx-app-shell__footer", classNames?.footer)}>{footer}</footer>}

      {/*
        **같은 노드를 그대로 쓴다.** 서랍용 메뉴를 따로 받으면 둘이 어긋나고,
        어긋난 쪽은 좁은 화면에서만 보이므로 가장 늦게 발견된다.
      */}
      {inDrawer && (
        <TxSlidePanel open={drawer} onClose={() => setDrawer(false)} side="left" title={text.left}>
          <nav aria-label={text.left}>{left}</nav>
        </TxSlidePanel>
      )}
    </div>
  );
};
