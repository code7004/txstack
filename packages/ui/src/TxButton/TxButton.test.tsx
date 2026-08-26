import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TxThemeProvider } from "../TxTheme";
import { TxButton } from "./TxButton";

/**
 * `001-TxButton-S3`. 명세는 `docs/001_ui/components/02_TxButton.md`.
 *
 * S2 에서 고친 결함을 못박는다. 각 테스트에 결함 ID 를 달아 두었다.
 *
 * **jsdom 의 한계는 TxSpinner 때와 같다** — Tailwind CSS 가 없으므로 "어떻게 보이는가" 는 검증할 수 없다.
 * 그래서 여기서는 **그 결과를 만드는 입력**(속성·클래스 토큰·호출 횟수)만 지킨다.
 * 실제 렌더 모양은 Storybook 에서 사람이 본다.
 */

afterEach(cleanup);

const renderButton = (ui: React.ReactElement) => {
  const { container } = render(ui);
  const btn = container.querySelector<HTMLButtonElement>('[data-tag="TxButton"]');
  if (!btn) throw new Error("TxButton 이 버튼을 렌더하지 않았다");
  return btn;
};

describe("TxButton — 폼 안전성", () => {
  it("type 기본값이 button 이다 (D1)", () => {
    // 지정하지 않으면 HTML 기본값이 submit 이라, TxForm 안의 모든 버튼이 폼을 제출했다.
    expect(renderButton(<TxButton label="확인" />).type).toBe("button");
  });

  it("type=submit 을 주면 그대로 통과한다 (D1)", () => {
    expect(renderButton(<TxButton label="제출" type="submit" />).type).toBe("submit");
  });

  it("폼 안에서 기본 버튼은 제출하지 않는다 (D1)", () => {
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    const { container } = render(
      <form onSubmit={onSubmit}>
        <TxButton label="취소" />
      </form>
    );

    container.querySelector<HTMLButtonElement>('[data-tag="TxButton"]')!.click();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe("TxButton — variant", () => {
  it("모든 variant 가 base 를 통과한다 (D2)", () => {
    // 예전에는 text 만 분기로 base 를 건너뛰어 포커스 링과 disabled 스타일을 잃었다.
    for (const variant of ["primary", "secondary", "danger", "ghost", "text"] as const) {
      const cls = renderButton(<TxButton label={variant} variant={variant} />).className;
      expect(cls, `${variant} 가 disabled 스타일을 잃었다`).toContain("disabled:opacity-50");
      expect(cls, `${variant} 가 포커스 링을 잃었다`).toContain("focus-visible:ring-2");
      cleanup();
    }
  });

  it("표면을 지우는 variant 는 다크모드에서도 지운다 (D7)", () => {
    // base 의 dark:bg-gray-800 은 bg-transparent 하나로 안 지워진다. dark: 는 별도 variant 다.
    for (const variant of ["ghost", "text"] as const) {
      const cls = renderButton(<TxButton label={variant} variant={variant} />).className;
      expect(cls, `${variant} 가 다크모드에서 배경이 남는다`).toContain("dark:bg-transparent");
      cleanup();
    }
  });
});

describe("TxButton — 로딩", () => {
  it("Promise 를 반환하면 잠기고, 풀리면 돌아온다", async () => {
    let resolve!: () => void;
    const btn = renderButton(<TxButton label="저장" onClick={() => new Promise<void>((r) => (resolve = r))} />);

    fireEvent.click(btn);
    await waitFor(() => expect(btn.disabled).toBe(true));

    resolve();
    await waitFor(() => expect(btn.disabled).toBe(false));
  });

  it("잠긴 동안 두 번째 클릭이 실행되지 않는다", async () => {
    const onClick = vi.fn(() => new Promise<void>(() => {}));
    const btn = renderButton(<TxButton label="저장" onClick={onClick} />);

    fireEvent.click(btn);
    await waitFor(() => expect(btn.disabled).toBe(true));
    fireEvent.click(btn);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("동기 onClick 은 로딩 상태로 들어가지 않는다 (D5)", () => {
    // 예전에는 동기 핸들러에도 setState(true) 를 걸어 스피너가 한 프레임 깜빡였다.
    const onClick = vi.fn();
    const btn = renderButton(<TxButton label="확인" onClick={onClick} />);

    fireEvent.click(btn);

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(btn.disabled).toBe(false);
    expect(btn.className).not.toContain("cursor-wait");
  });

  it("disabled 는 cursor-wait 가 아니다 (D4)", () => {
    // 로딩과 비활성은 다른 상태다. base 의 disabled:cursor-not-allowed 가 맡는다.
    expect(renderButton(<TxButton label="확인" disabled />).className).not.toContain("cursor-wait");
  });
});

describe("TxButton — 접근성", () => {
  it("aria-label 을 자동으로 붙이지 않는다 (D3)", () => {
    // 보이는 글자가 있는 버튼에는 불필요하고, title 과 label 이 다르면 화면과 낭독이 어긋난다.
    const btn = renderButton(<TxButton label="저장" title="눌러서 저장" />);

    expect(btn.getAttribute("aria-label")).toBeNull();
    expect(btn.textContent).toContain("저장");
    expect(btn.getAttribute("title")).toBe("눌러서 저장");
  });

  it("소비자가 준 aria-label 은 그대로 통과한다", () => {
    expect(renderButton(<TxButton aria-label="닫기" />).getAttribute("aria-label")).toBe("닫기");
  });

  it("onEnter 없이도 Enter 로 눌린다", () => {
    // 폐기한 onEnter 의 존재 이유가 없었음을 못박는다 — 버튼은 원래 Enter 로 click 이 발생한다.
    const onClick = vi.fn();
    const btn = renderButton(<TxButton label="확인" onClick={onClick} />);

    fireEvent.click(btn); // 브라우저가 Enter 를 click 으로 바꿔 보내는 경로
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe("TxButton — 커스터마이징 3단", () => {
  it("className 은 기본 클래스와 병합된다", () => {
    const cls = renderButton(<TxButton label="확인" className="rounded-full" />).className;

    expect(cls).toContain("rounded-full");
    expect(cls).toContain("font-medium");
  });

  it("인스턴스 theme 이 기본 테마를 이긴다", () => {
    const cls = renderButton(<TxButton label="확인" theme={{ variants: { primary: "bg-emerald-600" } }} />).className;

    expect(cls).toContain("bg-emerald-600");
    expect(cls).not.toContain("bg-blue-500");
  });

  it("TxThemeProvider 가 전역 기본값이 된다", () => {
    const cls = renderButton(
      <TxThemeProvider theme={{ TxButton: { variants: { primary: "bg-violet-600" } } }}>
        <TxButton label="확인" />
      </TxThemeProvider>
    ).className;

    expect(cls).toContain("bg-violet-600");
  });

  it("인스턴스 theme 이 Provider 를 이긴다 — 3단 우선순위", () => {
    const cls = renderButton(
      <TxThemeProvider theme={{ TxButton: { variants: { primary: "bg-violet-600" } } }}>
        <TxButton label="확인" theme={{ variants: { primary: "bg-emerald-600" } }} />
      </TxThemeProvider>
    ).className;

    expect(cls).toContain("bg-emerald-600");
    expect(cls).not.toContain("bg-violet-600");
  });

  it("Provider 로 없던 variant 를 추가할 수 있다", () => {
    const cls = renderButton(
      <TxThemeProvider theme={{ TxButton: { variants: { brand: "bg-black text-white" } } }}>
        <TxButton label="확인" variant="brand" />
      </TxThemeProvider>
    ).className;

    expect(cls).toContain("bg-black");
  });

  it("Provider 없이도 동작한다 — 감싸는 것은 선택이다", () => {
    expect(renderButton(<TxButton label="확인" />).className).toContain("bg-blue-500");
  });
});

describe("TxButton — 그 밖의 계약", () => {
  it("data-tag 를 붙인다", () => {
    expect(renderButton(<TxButton label="확인" />).getAttribute("data-tag")).toBe("TxButton");
  });

  it("label 이 없으면 children 을 쓴다", () => {
    expect(renderButton(<TxButton>내용</TxButton>).textContent).toContain("내용");
  });
});
