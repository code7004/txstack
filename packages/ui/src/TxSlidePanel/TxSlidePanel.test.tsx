import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TxSlidePanel } from "./TxSlidePanel";

/**
 * 원본은 `role="dialog" aria-modal="true"` 를 달아 놓고 **포커스 트랩이 없었다** —
 * 갇혔다고 알려 놓고 Tab 으로 뒤 화면에 나갔다. 닫기 X 는 `<svg onClick>` 이라 키보드로
 * 못 눌렀고, Escape 는 `window` 리스너라 패널이 둘이면 한 번에 둘 다 닫혔다.
 * 크기 기본값은 Tailwind 클래스(`w-80 h-screen`)여서 **`top`/`bottom` 이 화면을 통째로 덮었다.**
 *
 * **`<dialog>` 로 옮겨서 트랩과 top layer 는 브라우저가 맡는다.** 그래서 여기서는
 * "브라우저에게 제대로 넘겼는가" 와 "우리가 맡은 것(닫는 길·스크롤·이름·방향)" 을 본다.
 */

afterEach(() => {
  cleanup();
  document.body.style.overflow = "";
});

/** jsdom 30 에는 `showModal` 이 없다. 네이티브 경로를 보려면 심어 줘야 한다. */
const withNativeDialog = () => {
  const proto = window.HTMLDialogElement.prototype as unknown as Record<string, unknown>;
  const calls = { showModal: 0, close: 0 };

  proto.showModal = function showModal(this: HTMLDialogElement) {
    calls.showModal += 1;
    this.setAttribute("open", "");
  };
  proto.close = function close(this: HTMLDialogElement) {
    calls.close += 1;
    this.removeAttribute("open");
  };

  return {
    calls,
    restore: () => {
      delete proto.showModal;
      delete proto.close;
    }
  };
};

const dialogOf = (container: HTMLElement) => container.querySelector("dialog")!;

describe("TxSlidePanel — 여닫기", () => {
  it("open 이 아니면 열려 있지 않다", () => {
    const { container } = render(
      <TxSlidePanel open={false} onClose={vi.fn()} title="필터">
        내용
      </TxSlidePanel>
    );

    expect(dialogOf(container).hasAttribute("open")).toBe(false);
  });

  it("open 이면 열린다", () => {
    const { container } = render(
      <TxSlidePanel open onClose={vi.fn()} title="필터">
        내용
      </TxSlidePanel>
    );

    expect(dialogOf(container).hasAttribute("open")).toBe(true);
    expect(screen.getByText("내용")).toBeTruthy();
  });

  /** 속성만 붙이면 자리를 차지하는 요소일 뿐이다. 트랩도 top layer 도 안 켜진다. */
  it("showModal() 로 연다 — 속성으로 여는 게 아니다", () => {
    const native = withNativeDialog();

    try {
      const { rerender } = render(
        <TxSlidePanel open={false} onClose={vi.fn()}>
          내용
        </TxSlidePanel>
      );
      expect(native.calls.showModal).toBe(0);

      rerender(
        <TxSlidePanel open onClose={vi.fn()}>
          내용
        </TxSlidePanel>
      );
      expect(native.calls.showModal).toBe(1);
    } finally {
      native.restore();
    }
  });

  it("닫으면 close() 를 부른다", () => {
    const native = withNativeDialog();

    try {
      const { rerender } = render(
        <TxSlidePanel open onClose={vi.fn()}>
          내용
        </TxSlidePanel>
      );

      rerender(
        <TxSlidePanel open={false} onClose={vi.fn()}>
          내용
        </TxSlidePanel>
      );
      expect(native.calls.close).toBe(1);
    } finally {
      native.restore();
    }
  });

  /** 소비자가 테스트에서 이 컴포넌트를 렌더해도 깨지지 않아야 한다. */
  it("showModal 이 없는 환경에서도 내용이 그려진다", () => {
    const { container } = render(
      <TxSlidePanel open onClose={vi.fn()}>
        내용
      </TxSlidePanel>
    );

    expect(dialogOf(container).hasAttribute("open")).toBe(true);
    expect(screen.getByText("내용")).toBeTruthy();
  });
});

describe("TxSlidePanel — 닫는 길은 셋, 콜백은 하나다", () => {
  it("닫기 버튼으로 닫는다", () => {
    const onClose = vi.fn();
    render(
      <TxSlidePanel open onClose={onClose} title="필터">
        내용
      </TxSlidePanel>
    );

    fireEvent.click(screen.getByRole("button", { name: "닫기" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  /** 원본은 `<svg onClick>` 이라 키보드로 도달할 수 없었고 버튼으로 읽히지도 않았다. */
  it("닫기는 진짜 버튼이다", () => {
    render(
      <TxSlidePanel open onClose={vi.fn()} title="필터">
        내용
      </TxSlidePanel>
    );

    const close = screen.getByRole("button", { name: "닫기" });
    expect(close.tagName).toBe("BUTTON");
    expect(close.getAttribute("type")).toBe("button");
  });

  it("닫기 버튼의 이름을 바꿀 수 있다", () => {
    render(
      <TxSlidePanel open onClose={vi.fn()} closeLabel="Close">
        내용
      </TxSlidePanel>
    );

    expect(screen.getByRole("button", { name: "Close" })).toBeTruthy();
  });

  it("hideCloseButton 이면 닫기 버튼이 없다", () => {
    render(
      <TxSlidePanel open onClose={vi.fn()} hideCloseButton title="필터">
        내용
      </TxSlidePanel>
    );

    expect(screen.queryByRole("button", { name: "닫기" })).toBeNull();
  });

  it("바탕을 누르면 닫힌다", () => {
    const onClose = vi.fn();
    const { container } = render(
      <TxSlidePanel open onClose={onClose}>
        내용
      </TxSlidePanel>
    );

    fireEvent.click(dialogOf(container));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  /** 원본은 안쪽에 stopPropagation 을 걸었다. 그건 소비자의 부모 핸들러까지 죽인다. */
  it("안쪽을 누르면 닫히지 않는다", () => {
    const onClose = vi.fn();
    render(
      <TxSlidePanel open onClose={onClose}>
        내용
      </TxSlidePanel>
    );

    fireEvent.click(screen.getByText("내용"));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("안쪽 클릭이 소비자의 부모 핸들러까지 올라간다", () => {
    const onParentClick = vi.fn();
    render(
      <div onClick={onParentClick}>
        <TxSlidePanel open onClose={vi.fn()}>
          내용
        </TxSlidePanel>
      </div>
    );

    fireEvent.click(screen.getByText("내용"));
    expect(onParentClick).toHaveBeenCalledTimes(1);
  });

  it("closeOnBackdrop 을 끄면 바탕을 눌러도 안 닫힌다", () => {
    const onClose = vi.fn();
    const { container } = render(
      <TxSlidePanel open onClose={onClose} closeOnBackdrop={false}>
        내용
      </TxSlidePanel>
    );

    fireEvent.click(dialogOf(container));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("Escape 로 닫는다", () => {
    const onClose = vi.fn();
    const { container } = render(
      <TxSlidePanel open onClose={onClose}>
        내용
      </TxSlidePanel>
    );

    fireEvent.keyDown(dialogOf(container), { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closeOnEscape 를 끄면 Escape 로 안 닫힌다", () => {
    const onClose = vi.fn();
    const { container } = render(
      <TxSlidePanel open onClose={onClose} closeOnEscape={false}>
        내용
      </TxSlidePanel>
    );

    fireEvent.keyDown(dialogOf(container), { key: "Escape" });
    expect(onClose).not.toHaveBeenCalled();
  });

  /**
   * 안 막으면 브라우저가 스스로 닫아 버려서 패널은 사라졌는데 `open` 은 `true` 로 남는다.
   * 화면과 상태가 갈린다.
   */
  it("Escape 의 기본 동작을 막는다", () => {
    const { container } = render(
      <TxSlidePanel open onClose={vi.fn()}>
        내용
      </TxSlidePanel>
    );

    const event = new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true });
    fireEvent(dialogOf(container), event);

    expect(event.defaultPrevented).toBe(true);
  });

  /** Escape 는 우리 keydown 으로도 오고 UA 의 close request 로도 온다. */
  it("Escape 가 두 길로 와도 onClose 는 한 번이다", () => {
    const onClose = vi.fn();
    const { container } = render(
      <TxSlidePanel open onClose={onClose}>
        내용
      </TxSlidePanel>
    );

    const dialog = dialogOf(container);
    fireEvent.keyDown(dialog, { key: "Escape" });
    fireEvent(dialog, new Event("cancel", { bubbles: false, cancelable: true }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  /** 원본은 `window` 에 리스너를 걸어서 패널이 둘이면 둘 다 닫혔다. */
  it("Escape 가 다른 패널을 닫지 않는다", () => {
    const onCloseA = vi.fn();
    const onCloseB = vi.fn();

    render(
      <>
        <TxSlidePanel open onClose={onCloseA} title="A">
          A 내용
        </TxSlidePanel>
        <TxSlidePanel open onClose={onCloseB} title="B">
          B 내용
        </TxSlidePanel>
      </>
    );

    const [, second] = [...document.querySelectorAll("dialog")];
    fireEvent.keyDown(second, { key: "Escape" });

    expect(onCloseB).toHaveBeenCalledTimes(1);
    expect(onCloseA).not.toHaveBeenCalled();
  });

  it("Escape 가 아닌 키에는 반응하지 않는다", () => {
    const onClose = vi.fn();
    const { container } = render(
      <TxSlidePanel open onClose={onClose}>
        내용
      </TxSlidePanel>
    );

    fireEvent.keyDown(dialogOf(container), { key: "Enter" });
    expect(onClose).not.toHaveBeenCalled();
  });
});

describe("TxSlidePanel — 방향", () => {
  it("기본은 오른쪽이다", () => {
    const { container } = render(
      <TxSlidePanel open onClose={vi.fn()}>
        내용
      </TxSlidePanel>
    );

    expect(dialogOf(container).dataset.side).toBe("right");
  });

  it.each(["left", "right", "top", "bottom"] as const)("side=%s 를 그대로 싣는다", (side) => {
    const { container } = render(
      <TxSlidePanel open onClose={vi.fn()} side={side}>
        내용
      </TxSlidePanel>
    );

    expect(dialogOf(container).dataset.side).toBe(side);
  });
});

describe("TxSlidePanel — 스크린리더", () => {
  /** 원본은 `role="dialog"` 를 오버레이까지 품은 바깥 요소에 붙였다. */
  it("dialog 로 읽힌다", () => {
    render(
      <TxSlidePanel open onClose={vi.fn()} title="필터">
        내용
      </TxSlidePanel>
    );

    expect(screen.getByRole("dialog")).toBeTruthy();
  });

  /** 원본은 제목과 이어지지 않아 패널의 이름이 없었다. */
  it("제목이 패널의 이름이 된다", () => {
    render(
      <TxSlidePanel open onClose={vi.fn()} title="필터">
        내용
      </TxSlidePanel>
    );

    expect(screen.getByRole("dialog", { name: "필터" })).toBeTruthy();
  });

  /** 제목 `id` 가 하드코딩이면 패널이 둘일 때 겹친다. */
  it("패널이 둘이어도 제목 id 가 겹치지 않는다", () => {
    render(
      <>
        <TxSlidePanel open onClose={vi.fn()} title="A">
          A 내용
        </TxSlidePanel>
        <TxSlidePanel open onClose={vi.fn()} title="B">
          B 내용
        </TxSlidePanel>
      </>
    );

    expect(screen.getByRole("dialog", { name: "A" })).toBeTruthy();
    expect(screen.getByRole("dialog", { name: "B" })).toBeTruthy();
  });

  it("제목이 없으면 이름을 지어내지 않는다", () => {
    const { container } = render(
      <TxSlidePanel open onClose={vi.fn()}>
        내용
      </TxSlidePanel>
    );

    expect(dialogOf(container).hasAttribute("aria-labelledby")).toBe(false);
  });

  /** `<dialog>` 는 스스로 모달이다. 손으로 단 `aria-modal` 은 거짓이 될 수 있다. */
  it("aria-modal 을 손으로 달지 않는다", () => {
    const { container } = render(
      <TxSlidePanel open onClose={vi.fn()} title="필터">
        내용
      </TxSlidePanel>
    );

    expect(dialogOf(container).hasAttribute("aria-modal")).toBe(false);
  });

  /** 원본의 오버레이는 화면을 덮는 `<button aria-label="Close panel">` 이었다. */
  it("화면을 덮는 버튼을 만들지 않는다", () => {
    render(
      <TxSlidePanel open onClose={vi.fn()} title="필터">
        내용
      </TxSlidePanel>
    );

    expect(screen.getAllByRole("button")).toHaveLength(1);
  });
});

describe("TxSlidePanel — 배경 스크롤", () => {
  it("열려 있는 동안 배경이 안 움직인다", () => {
    const { rerender } = render(
      <TxSlidePanel open onClose={vi.fn()}>
        내용
      </TxSlidePanel>
    );
    expect(document.body.style.overflow).toBe("hidden");

    rerender(
      <TxSlidePanel open={false} onClose={vi.fn()}>
        내용
      </TxSlidePanel>
    );
    expect(document.body.style.overflow).toBe("");
  });

  /** 원본은 각자 저장·복원해서 둘이 겹치면 어긋났다. */
  it("둘이 겹쳐도 안쪽이 닫힐 때 스크롤이 풀리지 않는다", () => {
    const { rerender } = render(
      <>
        <TxSlidePanel open onClose={vi.fn()}>
          A
        </TxSlidePanel>
        <TxSlidePanel open onClose={vi.fn()}>
          B
        </TxSlidePanel>
      </>
    );

    rerender(
      <>
        <TxSlidePanel open onClose={vi.fn()}>
          A
        </TxSlidePanel>
        <TxSlidePanel open={false} onClose={vi.fn()}>
          B
        </TxSlidePanel>
      </>
    );
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("소비자가 주고 있던 값으로 되돌린다", () => {
    document.body.style.overflow = "clip";

    const { rerender } = render(
      <TxSlidePanel open onClose={vi.fn()}>
        내용
      </TxSlidePanel>
    );
    rerender(
      <TxSlidePanel open={false} onClose={vi.fn()}>
        내용
      </TxSlidePanel>
    );

    expect(document.body.style.overflow).toBe("clip");
  });
});

describe("TxSlidePanel — 겉", () => {
  it("className 은 덧붙는다 — 교체하지 않는다", () => {
    const { container } = render(
      <TxSlidePanel open onClose={vi.fn()} className="my-panel">
        내용
      </TxSlidePanel>
    );

    const dialog = dialogOf(container);
    expect(dialog.classList.contains("tx-slide-panel")).toBe(true);
    expect(dialog.classList.contains("my-panel")).toBe(true);
  });

  it("안쪽 슬롯에 클래스를 줄 수 있다", () => {
    const { container } = render(
      <TxSlidePanel open onClose={vi.fn()} title="필터" classNames={{ panel: "p1", header: "h1", body: "b1" }}>
        내용
      </TxSlidePanel>
    );

    expect(container.querySelector(".tx-slide-panel__panel.p1")).toBeTruthy();
    expect(container.querySelector(".tx-slide-panel__header.h1")).toBeTruthy();
    expect(container.querySelector(".tx-slide-panel__body.b1")).toBeTruthy();
  });

  it("나머지 props 는 dialog 로 간다", () => {
    const { container } = render(
      <TxSlidePanel open onClose={vi.fn()} id="filters" data-testid="panel">
        내용
      </TxSlidePanel>
    );

    const dialog = dialogOf(container);
    expect(dialog.id).toBe("filters");
    expect(dialog.dataset.testid).toBe("panel");
  });

  it("data-tag 를 단다", () => {
    const { container } = render(
      <TxSlidePanel open onClose={vi.fn()}>
        내용
      </TxSlidePanel>
    );

    expect(dialogOf(container).dataset.tag).toBe("TxSlidePanel");
  });
});

describe("TxSlidePanel — CSS 계약", () => {
  const here = import.meta.dirname;
  const strip = (text: string) => text.replace(/\/\*[\s\S]*?\*\//g, "");

  const css = strip(readFileSync(join(here, "TxSlidePanel.css"), "utf8"));
  const tokens = strip(readFileSync(join(here, "..", "tokens.css"), "utf8"));
  const styles = readFileSync(join(here, "..", "styles.css"), "utf8");
  const source = readFileSync(join(here, "TxSlidePanel.tsx"), "utf8");

  it("색을 하드코딩하지 않는다 — 값이 토큰으로 나가 있다", () => {
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    expect(css).toMatch(/background-color:\s*var\(--tx-slide-panel-bg\)/);
  });

  it(".dark 분기를 갖지 않는다", () => {
    expect(css).not.toContain(".dark");
  });

  it("참조하는 전역 토큰이 전부 tokens.css 에 정의돼 있다", () => {
    const referenced = new Set([...css.matchAll(/var\(\s*(--tx-(?:color|state|radius|focus)[\w-]*)/g)].map((match) => match[1]));
    expect([...referenced].filter((name) => !tokens.includes(`${name}:`))).toEqual([]);
  });

  it("styles.css 에 실려 나간다", () => {
    expect(styles).toContain('@import "./TxSlidePanel/TxSlidePanel.css" layer(tx);');
  });

  /** `<dialog>` 는 top layer 에 올라간다. z-index 를 두면 안 쓰는 값을 공개 API 로 만드는 셈이다. */
  it("z-index 를 다투지 않는다 — top layer 가 있다", () => {
    expect(css).not.toMatch(/z-index:/);
  });

  /** 밀려 나오는 움직임은 CSS 가 한다. 그래서 framer-motion 을 peer 로 달지 않는다. */
  it("애니메이션 라이브러리를 쓰지 않는다", () => {
    expect(source).not.toContain("framer-motion");
    expect(css).toContain("@starting-style");
    expect(css).toContain("allow-discrete");
  });

  it("stopPropagation 으로 클릭을 막지 않는다", () => {
    expect(source).not.toMatch(/\.stopPropagation\s*\(/);
  });

  /** 원본은 `panelClassName = "w-80 h-screen"` 이 기본값이라 Tailwind 없이는 크기가 없었다. */
  it("크기 기본값이 CSS 에 있다 — 소비자의 유틸리티 클래스에 기대지 않는다", () => {
    expect(source).not.toMatch(/w-\d|h-screen|w-screen/);
    expect(css).toMatch(/--tx-slide-panel-size:\s*\S+/);
  });

  /** 원본은 기본값의 `h-screen` 이 위아래 방향의 `w-screen` 과 겹쳐 화면을 통째로 덮었다. */
  it("네 방향이 각자 자기 축만 정한다", () => {
    for (const side of ["left", "right", "top", "bottom"]) {
      expect(css, side).toContain(`[data-side="${side}"]`);
    }

    // 좌우는 폭이, 위아래는 높이가 크기다
    expect(css).toMatch(/\[data-side="left"\],\s*\.tx-slide-panel\[data-side="right"\]\s*\{[^}]*width:\s*min\(var\(--tx-slide-panel-size\)/);
    expect(css).toMatch(/\[data-side="top"\],\s*\.tx-slide-panel\[data-side="bottom"\]\s*\{[^}]*height:\s*min\(var\(--tx-slide-panel-size\)/);
  });

  /**
   * `<dialog>` 의 UA 스타일은 `left: 0; right: 0` 을, 모달에는 `top: 0; bottom: 0` 까지 준다.
   * 붙일 변만 얹으면 반대쪽 UA 값이 살아남아 폭·높이와 함께 **과잉 제약**이 되고, 패널이
   * 반대쪽 끝에 자리 잡아 화면 가운데에서 밀려 나온다.
   */
  it("네 변을 전부 정한다 — UA 값이 살아남지 않는다", () => {
    // 한 방향의 규칙이 여러 블록에 나뉘어 있다(공통 축 + 붙는 변). 전부 모아서 본다
    const rule = (side: string) => [...css.matchAll(new RegExp(`\\.tx-slide-panel\\[data-side="${side}"\\][^{]*\\{([^}]*)\\}`, "g"))].map((match) => match[1]).join("\n");

    for (const [side, opposite] of [
      ["left", "right"],
      ["right", "left"],
      ["top", "bottom"],
      ["bottom", "top"]
    ] as const) {
      expect(rule(side), side).toMatch(new RegExp(`${side}:\\s*0`));
      expect(rule(side), `${side} 의 반대편 ${opposite}`).toMatch(new RegExp(`${opposite}:\\s*auto`));
    }
  });

  /** 움직임을 원치 않는다고 밝힌 사람에게는 밀지 않는다. */
  it("prefers-reduced-motion 을 지킨다", () => {
    expect(css).toContain("prefers-reduced-motion");
  });
});
