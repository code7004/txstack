import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TxCopyButton } from "./TxCopyButton";

/**
 * 원본의 `TxClipboardButton` 은 `<div onClick>{📋}</div>` 라 키보드로 못 눌렀고,
 * 버튼으로 읽히지도 않았고, **복사됐는지 알 길도 없었다.** 그래서 3차에서 잘랐다가
 * 5차에서 되살린 것이다. 여기서 보는 것도 그 셋이다.
 */

let written: string[] = [];

beforeEach(() => {
  written = [];
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: {
      writeText: vi.fn(async (text: string) => {
        written.push(text);
      })
    }
  });
});

afterEach(() => {
  cleanup();
  Reflect.deleteProperty(navigator, "clipboard");
  Reflect.deleteProperty(document, "execCommand");
});

/**
 * jsdom 에는 `execCommand` 가 **아예 없다.** 없는 것은 감시할 수 없으므로 먼저 심는다 —
 * 실제 브라우저에서는 있으니, 여기서 보는 것은 "있을 때 그 길로 가는가" 다.
 */
const withExecCommand = (result: boolean) => {
  const spy = vi.fn(() => result);
  Object.defineProperty(document, "execCommand", { configurable: true, value: spy });
  return spy;
};

const click = async () => {
  await act(async () => {
    fireEvent.click(screen.getByRole("button"));
  });
};

describe("TxCopyButton — 복사", () => {
  /** 원본은 버튼이 아니라 키보드로 못 눌렀다. */
  it("진짜 버튼이다", () => {
    render(<TxCopyButton value="key-123" />);

    const button = screen.getByRole("button");
    expect(button.tagName).toBe("BUTTON");
    expect(button.getAttribute("type")).toBe("button");
  });

  it("누르면 클립보드에 넣는다", async () => {
    render(<TxCopyButton value="key-123" />);

    await click();
    expect(written).toEqual(["key-123"]);
  });

  /** 지금 화면에 있는 값을 그때 읽어야 할 때가 있다. */
  it("함수를 주면 누를 때 부른다", async () => {
    let current = "처음";
    render(<TxCopyButton value={() => current} />);

    current = "바뀐 뒤";
    await click();

    expect(written).toEqual(["바뀐 뒤"]);
  });

  it("복사한 값을 알려 준다", async () => {
    const onCopied = vi.fn();
    render(<TxCopyButton value="key-123" onCopied={onCopied} />);

    await click();
    expect(onCopied).toHaveBeenCalledWith("key-123");
  });
});

describe("TxCopyButton — 복사했다고 알린다", () => {
  it("기본 글자가 있다", () => {
    render(<TxCopyButton value="x" />);
    expect(screen.getByRole("button", { name: /복사/ })).toBeTruthy();
  });

  /** 눌러도 아무 일이 없어 보이면 복사가 됐는지 알 길이 없다. */
  it("누르면 글자가 바뀐다", async () => {
    render(<TxCopyButton value="x" />);

    await click();
    expect(screen.getByRole("button").textContent).toBe("복사했습니다");
  });

  it("잠시 뒤 되돌아온다", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });

    try {
      render(<TxCopyButton value="x" duration={1000} />);
      await click();
      expect(screen.getByRole("button").textContent).toBe("복사했습니다");

      await act(async () => {
        await vi.advanceTimersByTimeAsync(1100);
      });
      expect(screen.getByRole("button").textContent).toBe("복사");
    } finally {
      vi.useRealTimers();
    }
  });

  it("글자를 바꿀 수 있다", async () => {
    render(<TxCopyButton value="x" label="키 복사" copiedLabel="됐습니다" />);

    expect(screen.getByRole("button").textContent).toBe("키 복사");
    await click();
    expect(screen.getByRole("button").textContent).toBe("됐습니다");
  });

  /**
   * 버튼 글자가 바뀌는 것만으로는 스크린리더가 읽지 않는다 — 포커스가 그 위에 있을 때만
   * 다시 읽히고, 마우스로 눌렀다면 아무 소식이 없다.
   */
  it("스크린리더에도 소식이 간다", async () => {
    const { container } = render(<TxCopyButton value="x" />);
    const status = container.querySelector(".tx-copy-button__status")!;

    expect(status.getAttribute("role")).toBe("status");
    expect(status.getAttribute("aria-live")).toBe("polite");
    expect(status.textContent).toBe("");

    await click();
    expect(status.textContent).toBe("복사했습니다");
  });
});

describe("TxCopyButton — 못 했을 때", () => {
  it("실패하면 그렇다고 말한다", async () => {
    (navigator.clipboard.writeText as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("nope"));
    // 물러서는 길도 막아 둔다
    withExecCommand(false);

    render(<TxCopyButton value="x" />);
    await click();

    await waitFor(() => expect(screen.getByRole("button").textContent).toBe("복사 실패"));
  });

  it("실패하면 onCopied 가 오지 않는다", async () => {
    (navigator.clipboard.writeText as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("nope"));
    withExecCommand(false);
    const onCopied = vi.fn();

    render(<TxCopyButton value="x" onCopied={onCopied} />);
    await click();

    expect(onCopied).not.toHaveBeenCalled();
  });

  /**
   * `navigator.clipboard` 는 보안 컨텍스트(https · localhost)에서만 있다.
   * 사내 도구가 평문 http 로 뜨는 일이 흔해서 그 길이 필요하다.
   */
  it("clipboard 가 없는 곳에서는 물러서는 길로 간다", async () => {
    Reflect.deleteProperty(navigator, "clipboard");
    const exec = withExecCommand(true);

    render(<TxCopyButton value="key-123" />);
    await click();

    expect(exec).toHaveBeenCalledWith("copy");
    expect(screen.getByRole("button").textContent).toBe("복사했습니다");
  });

  it("물러선 뒤 임시 요소를 남기지 않는다", async () => {
    Reflect.deleteProperty(navigator, "clipboard");
    withExecCommand(true);

    render(<TxCopyButton value="x" />);
    await click();

    expect(document.querySelectorAll("textarea")).toHaveLength(0);
  });
});

describe("TxCopyButton — 겉", () => {
  it("className 은 덧붙는다 — 교체하지 않는다", () => {
    render(<TxCopyButton value="x" className="mine" />);

    const button = screen.getByRole("button");
    expect(button.classList.contains("tx-copy-button")).toBe(true);
    expect(button.classList.contains("mine")).toBe(true);
  });

  /** 겉은 TxButton 이 그린다. variant 도 그쪽 것을 그대로 쓴다. */
  it("TxButton 위에 있다", () => {
    render(<TxCopyButton value="x" variant="secondary" />);

    const button = screen.getByRole("button");
    expect(button.classList.contains("tx-button")).toBe(true);
    expect(button.dataset.variant).toBe("secondary");
  });

  /**
   * `TxButton` 은 `data-tag` 를 **계약 속성으로 잠가 둔다** — 밖에서 덮이면 안 되는 것이라
   * 넘겨 봐야 버려진다. 이것은 버튼이 맞으므로 그 표시를 그대로 두고, 여기 것은
   * `.tx-copy-button` 과 `data-state` 가 알린다.
   */
  it("버튼의 표시를 뺏지 않고 자기 상태만 싣는다", async () => {
    render(<TxCopyButton value="x" />);

    const button = screen.getByRole("button");
    expect(button.dataset.tag).toBe("TxButton");
    expect(button.classList.contains("tx-copy-button")).toBe(true);
    expect(button.dataset.state).toBe("idle");

    await click();
    expect(screen.getByRole("button").dataset.state).toBe("copied");
  });
});

describe("TxCopyButton — CSS 계약", () => {
  const here = import.meta.dirname;
  const strip = (text: string) => text.replace(/\/\*[\s\S]*?\*\//g, "");

  const css = strip(readFileSync(join(here, "TxCopyButton.css"), "utf8"));
  const styles = readFileSync(join(here, "..", "styles.css"), "utf8");

  it("색을 하드코딩하지 않는다", () => {
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b/i);
  });

  it("styles.css 에 실려 나간다", () => {
    expect(styles).toContain('@import "./TxCopyButton/TxCopyButton.css" layer(tx);');
  });

  /**
   * 겉은 TxButton 이 그린다. 여기서 또 정하면 한쪽 토큰만 바꿨을 때 갈린다.
   *
   * **버튼 규칙만 본다** — 소식 자리를 화면에서 감추는 초기화(`padding: 0` 따위)는
   * 겉모습을 정하는 것이 아니다.
   */
  it("버튼의 겉모습을 다시 정하지 않는다", () => {
    const rule = css.match(/\.tx-copy-button\s*\{([^}]*)\}/)?.[1] ?? "";

    for (const property of ["background-color:", "border-radius:", "font-size:", "padding:", "color:"]) {
      expect(rule, property).not.toContain(property);
    }

    expect(css).not.toContain("--tx-button-");
  });

  /**
   * `복사` → `복사했습니다` 로 늘었다 줄면 옆에 있는 것들이 밀린다.
   * 기본 세 글자가 전부 이 폭 안에 들도록 **재서** 정했다.
   */
  it("글자가 바뀌어도 폭이 널뛰지 않는다", () => {
    expect(css).toMatch(/\.tx-copy-button\s*\{[^}]*min-inline-size:\s*var\(--tx-copy-button-min-width/);
  });

  /** `display: none` 은 라이브 리전을 통째로 없애서 아무것도 안 읽힌다. */
  it("소식 자리를 화면에서만 감춘다", () => {
    const rule = css.match(/\.tx-copy-button__status\s*\{([^}]*)\}/)?.[1] ?? "";

    expect(rule).not.toMatch(/display:\s*none/);
    expect(rule).toMatch(/clip-path:/);
  });
});
