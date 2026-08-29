import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TxButton } from "../TxButton";
import { TxModal } from "./TxModal";

/**
 * 이 컴포넌트에서 고친 것은 대부분 **접근성과 상태 일치**다 — 포커스가 배경에 남았고,
 * Tab 이 모달 밖으로 새어 나갔고, 닫기 아이콘은 키보드로 못 눌렀고, 제목 `id` 는 하드코딩이라
 * 모달이 둘이면 겹쳤다.
 *
 * **`<dialog>` 로 옮겨서 트랩과 top layer 는 브라우저가 맡는다.** 그래서 여기서는
 * "브라우저에게 제대로 넘겼는가" 와 "우리가 맡은 것(닫는 길·스크롤·이름)이 맞는가" 를 본다.
 * 트랩 자체는 브라우저 동작이라 jsdom 으로는 볼 수 없다.
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

describe("TxModal — 여닫기", () => {
  it("open 이 아니면 열려 있지 않다", () => {
    const { container } = render(
      <TxModal open={false} onClose={vi.fn()} title="제목">
        내용
      </TxModal>
    );

    expect(dialogOf(container).hasAttribute("open")).toBe(false);
  });

  it("open 이면 열린다", () => {
    const { container } = render(
      <TxModal open onClose={vi.fn()} title="제목">
        내용
      </TxModal>
    );

    expect(dialogOf(container).hasAttribute("open")).toBe(true);
    expect(screen.getByText("내용")).toBeTruthy();
  });

  /**
   * `showModal()` 을 불러야 top layer 와 포커스 트랩이 켜진다. `open` 속성만 붙이면
   * 그냥 자리를 차지하는 요소일 뿐이다.
   */
  it("있으면 showModal 로 연다 — 속성만 붙이지 않는다", () => {
    const native = withNativeDialog();

    try {
      const { rerender, container } = render(
        <TxModal open={false} onClose={vi.fn()}>
          내용
        </TxModal>
      );
      rerender(
        <TxModal open onClose={vi.fn()}>
          내용
        </TxModal>
      );

      expect(native.calls.showModal).toBe(1);
      expect(dialogOf(container).hasAttribute("open")).toBe(true);

      rerender(
        <TxModal open={false} onClose={vi.fn()}>
          내용
        </TxModal>
      );
      expect(native.calls.close).toBe(1);
    } finally {
      native.restore();
    }
  });

  /** showModal 이 없는 환경(jsdom 등)에서도 소비자 테스트가 깨지지 않아야 한다. */
  it("showModal 이 없으면 속성으로 연다 — 던지지 않는다", () => {
    expect(typeof window.HTMLDialogElement.prototype.showModal).toBe("undefined");

    const { container } = render(
      <TxModal open onClose={vi.fn()}>
        내용
      </TxModal>
    );

    expect(dialogOf(container).hasAttribute("open")).toBe(true);
  });
});

describe("TxModal — 닫는 길은 셋, 콜백은 하나다", () => {
  it("닫기 버튼", () => {
    const onClose = vi.fn();
    render(
      <TxModal open onClose={onClose} title="제목">
        내용
      </TxModal>
    );

    fireEvent.click(screen.getByRole("button", { name: "닫기" }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("바깥(바탕) 클릭", () => {
    const onClose = vi.fn();
    const { container } = render(
      <TxModal open onClose={onClose}>
        내용
      </TxModal>
    );

    fireEvent.click(dialogOf(container));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("안쪽을 누르면 닫히지 않는다", () => {
    const onClose = vi.fn();
    render(
      <TxModal open onClose={onClose}>
        <span>내용</span>
      </TxModal>
    );

    fireEvent.click(screen.getByText("내용"));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("closeOnBackdrop 을 끄면 바탕을 눌러도 안 닫힌다", () => {
    const onClose = vi.fn();
    const { container } = render(
      <TxModal open onClose={onClose} closeOnBackdrop={false}>
        내용
      </TxModal>
    );

    fireEvent.click(dialogOf(container));
    expect(onClose).not.toHaveBeenCalled();
  });

  /**
   * Escape 는 브라우저가 스스로 닫아 버린다. 그러면 `open` 은 여전히 `true` 라
   * 화면과 상태가 갈린다. 기본 동작을 막고 소비자가 내리게 한다.
   */
  it("Escape 는 기본 동작을 막고 onClose 만 부른다", () => {
    const onClose = vi.fn();
    const { container } = render(
      <TxModal open onClose={onClose}>
        내용
      </TxModal>
    );

    const cancel = new Event("cancel", { bubbles: false, cancelable: true });
    fireEvent(dialogOf(container), cancel);

    expect(onClose).toHaveBeenCalledOnce();
    expect(cancel.defaultPrevented).toBe(true);
  });

  /**
   * **`cancel` 이벤트에만 기대면 환경을 탄다.** 그건 DOM 이벤트가 아니라 브라우저가 판단해서
   * 보내는 close request 라, 끼워 넣은 화면에서는 오지 않는다 — 실제로 Storybook 안에서
   * Escape 가 아무 일도 하지 않았다. 그래서 keydown 을 직접 받는다.
   */
  it("Escape keydown 을 직접 받는다", () => {
    const onClose = vi.fn();
    const { container } = render(
      <TxModal open onClose={onClose}>
        내용
      </TxModal>
    );

    const event = fireEvent.keyDown(dialogOf(container), { key: "Escape" });

    expect(onClose).toHaveBeenCalledOnce();
    // 안 막으면 브라우저가 스스로 닫아서 창은 사라지고 open 은 true 로 남는다
    expect(event).toBe(false);
  });

  it("다른 키는 가로채지 않는다", () => {
    const onClose = vi.fn();
    const { container } = render(
      <TxModal open onClose={onClose}>
        내용
      </TxModal>
    );

    fireEvent.keyDown(dialogOf(container), { key: "a" });
    expect(onClose).not.toHaveBeenCalled();
  });

  it("closeOnEscape 를 끄면 Escape 가 안 먹는다", () => {
    const onClose = vi.fn();
    const { container } = render(
      <TxModal open onClose={onClose} closeOnEscape={false}>
        내용
      </TxModal>
    );

    fireEvent.keyDown(dialogOf(container), { key: "Escape" });
    const cancel = new Event("cancel", { bubbles: false, cancelable: true });
    fireEvent(dialogOf(container), cancel);

    expect(onClose).not.toHaveBeenCalled();
  });

  /** 두 경로가 다 오는 환경이 있다. 소비자의 onClose 가 두 번 실행되면 안 된다. */
  it("keydown 과 cancel 이 함께 와도 onClose 는 한 번이다", () => {
    const onClose = vi.fn();
    const { container } = render(
      <TxModal open onClose={onClose}>
        내용
      </TxModal>
    );

    fireEvent.keyDown(dialogOf(container), { key: "Escape" });
    fireEvent(dialogOf(container), new Event("cancel", { bubbles: false, cancelable: true }));

    expect(onClose).toHaveBeenCalledOnce();
  });

  /** 원본은 Escape 를 `window` 에서 들어서 겹쳐 뜬 모달이 한 번에 다 닫혔다. */
  it("window 에 키 리스너를 붙이지 않는다 — 겹친 모달이 함께 닫히지 않는다", () => {
    const onClose = vi.fn();
    render(
      <TxModal open onClose={onClose}>
        내용
      </TxModal>
    );

    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).not.toHaveBeenCalled();
  });
});

describe("TxModal — 스크린리더", () => {
  it("제목이 모달의 이름이 된다", () => {
    const { container } = render(
      <TxModal open onClose={vi.fn()} title="비밀번호 변경">
        내용
      </TxModal>
    );

    const dialog = dialogOf(container);
    expect(document.getElementById(dialog.getAttribute("aria-labelledby")!)?.textContent).toBe("비밀번호 변경");
  });

  /** 원본은 `id="txpopup-title"` 이 하드코딩이라 모달이 둘이면 겹쳤다. */
  it("제목 id 가 모달마다 다르다", () => {
    const { container } = render(
      <>
        <TxModal open onClose={vi.fn()} title="첫째">
          가
        </TxModal>
        <TxModal open onClose={vi.fn()} title="둘째">
          나
        </TxModal>
      </>
    );

    const [first, second] = [...container.querySelectorAll("dialog")].map((dialog) => dialog.getAttribute("aria-labelledby"));
    expect(first).toBeTruthy();
    expect(first).not.toBe(second);
  });

  it("제목이 없으면 이름을 가리키지 않는다 — 빈 곳을 가리키지 않는다", () => {
    const { container } = render(
      <TxModal open onClose={vi.fn()}>
        내용
      </TxModal>
    );

    expect(dialogOf(container).hasAttribute("aria-labelledby")).toBe(false);
  });

  /** 원본은 `title` 이 없으면 닫기 버튼째 사라져서 닫는 길이 ESC 뿐이었다. */
  it("제목이 없어도 닫기 버튼은 있다", () => {
    render(
      <TxModal open onClose={vi.fn()}>
        내용
      </TxModal>
    );

    expect(screen.getByRole("button", { name: "닫기" })).toBeTruthy();
  });

  it("닫기 버튼은 진짜 button 이라 키보드로 누른다", () => {
    const onClose = vi.fn();
    render(
      <TxModal open onClose={onClose}>
        내용
      </TxModal>
    );

    const close = screen.getByRole("button", { name: "닫기" });
    expect(close.tagName).toBe("BUTTON");

    close.focus();
    expect(document.activeElement).toBe(close);
  });

  /**
   * 확인·취소 버튼이 답을 받는 창(`TxDialog`)에서는 X 가 "취소" 와 뜻이 같아 답이 둘로 보인다.
   * **닫는 길을 따로 마련한 창에만 쓴다** — Escape 는 그래도 남는다.
   */
  it("hideCloseButton 으로 X 를 없앨 수 있다", () => {
    const onClose = vi.fn();
    const { container } = render(
      <TxModal open onClose={onClose} hideCloseButton title="답해야 하는 창">
        내용
      </TxModal>
    );

    expect(screen.queryByRole("button", { name: "닫기" })).toBeNull();

    // 닫는 길을 전부 없애지는 못한다
    const cancel = new Event("cancel", { bubbles: false, cancelable: true });
    fireEvent(dialogOf(container), cancel);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("닫기 버튼의 이름을 바꿀 수 있다", () => {
    render(
      <TxModal open onClose={vi.fn()} closeLabel="Close">
        내용
      </TxModal>
    );

    expect(screen.getByRole("button", { name: "Close" })).toBeTruthy();
  });
});

describe("TxModal — 배경 스크롤", () => {
  it("열려 있는 동안 배경이 멈춘다", () => {
    const { rerender } = render(
      <TxModal open onClose={vi.fn()}>
        내용
      </TxModal>
    );
    expect(document.body.style.overflow).toBe("hidden");

    rerender(
      <TxModal open={false} onClose={vi.fn()}>
        내용
      </TxModal>
    );
    expect(document.body.style.overflow).toBe("");
  });

  /** 안쪽 모달이 닫힐 때 바깥 모달이 아직 떠 있으면 스크롤은 계속 잠겨 있어야 한다. */
  it("겹쳐 떠도 세어 둔다", () => {
    const { rerender } = render(
      <>
        <TxModal open onClose={vi.fn()}>
          바깥
        </TxModal>
        <TxModal open onClose={vi.fn()}>
          안쪽
        </TxModal>
      </>
    );
    expect(document.body.style.overflow).toBe("hidden");

    rerender(
      <>
        <TxModal open onClose={vi.fn()}>
          바깥
        </TxModal>
        <TxModal open={false} onClose={vi.fn()}>
          안쪽
        </TxModal>
      </>
    );
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("소비자가 주고 있던 값으로 되돌린다", () => {
    document.body.style.overflow = "clip";

    const { rerender } = render(
      <TxModal open onClose={vi.fn()}>
        내용
      </TxModal>
    );
    rerender(
      <TxModal open={false} onClose={vi.fn()}>
        내용
      </TxModal>
    );

    expect(document.body.style.overflow).toBe("clip");
  });
});

describe("TxModal — 겉", () => {
  it("className 은 기본 클래스를 덧붙는다", () => {
    const { container } = render(
      <TxModal open onClose={vi.fn()} className="my-modal">
        내용
      </TxModal>
    );

    const dialog = dialogOf(container);
    expect(dialog.classList.contains("tx-modal")).toBe(true);
    expect(dialog.classList.contains("my-modal")).toBe(true);
  });

  it("size 가 속성으로 나간다", () => {
    const { container } = render(
      <TxModal open onClose={vi.fn()} size="lg">
        내용
      </TxModal>
    );

    expect(dialogOf(container).getAttribute("data-size")).toBe("lg");
  });

  it("Footer 는 버튼 줄이다", () => {
    const { container } = render(
      <TxModal open onClose={vi.fn()}>
        내용
        <TxModal.Footer>
          <TxButton label="저장" />
        </TxModal.Footer>
      </TxModal>
    );

    expect(container.querySelector(".tx-modal__footer")).toBeTruthy();
    expect(screen.getByRole("button", { name: "저장" })).toBeTruthy();
  });

  it("Footer 를 안 쓰면 그리지 않는다", () => {
    const { container } = render(
      <TxModal open onClose={vi.fn()}>
        내용
      </TxModal>
    );

    expect(container.querySelector(".tx-modal__footer")).toBeNull();
  });
});

describe("TxModal — CSS 계약", () => {
  const here = import.meta.dirname;
  const strip = (text: string) => text.replace(/\/\*[\s\S]*?\*\//g, "");

  const css = strip(readFileSync(join(here, "TxModal.css"), "utf8"));
  const tokens = strip(readFileSync(join(here, "..", "tokens.css"), "utf8"));
  const styles = readFileSync(join(here, "..", "styles.css"), "utf8");
  const source = readFileSync(join(here, "TxModal.tsx"), "utf8");

  it("색을 하드코딩하지 않는다 — 값이 토큰으로 나가 있다", () => {
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    expect(css).toMatch(/background-color:\s*var\(--tx-modal-bg\)/);
  });

  it(".dark 분기를 갖지 않는다", () => {
    expect(css).not.toContain(".dark");
  });

  it("참조하는 전역 토큰이 전부 tokens.css 에 정의돼 있다", () => {
    const referenced = new Set([...css.matchAll(/var\(\s*(--tx-(?:color|state|radius|focus)[\w-]*)/g)].map((match) => match[1]));
    expect([...referenced].filter((name) => !tokens.includes(`${name}:`))).toEqual([]);
  });

  it("styles.css 에 실려 나간다", () => {
    expect(styles).toContain('@import "./TxModal/TxModal.css" layer(tx);');
  });

  /** `<dialog>` 는 top layer 에 올라간다. z-index 를 두면 안 쓰는 값을 공개 API 로 만드는 셈이다. */
  it("z-index 를 다투지 않는다 — top layer 가 있다", () => {
    expect(css).not.toMatch(/z-index:\s*var\(--tx-modal-z/);
  });

  /** 여닫히는 움직임은 CSS 가 한다. 그래서 framer-motion 을 peer 로 달지 않는다. */
  it("애니메이션 라이브러리를 쓰지 않는다", () => {
    expect(source).not.toContain("framer-motion");
    expect(css).toContain("@starting-style");
    expect(css).toContain("allow-discrete");
  });

  /** 원본은 안쪽에 stopPropagation 을 걸어 소비자의 부모 클릭 핸들러까지 죽였다. */
  it("stopPropagation 으로 클릭을 막지 않는다", () => {
    expect(source).not.toMatch(/\.stopPropagation\s*\(/);
  });
});
