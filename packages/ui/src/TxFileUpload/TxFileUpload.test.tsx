import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TxFileUpload } from "./TxFileUpload";
import { formatBytes, resetUploadIdForTest } from "./TxFileUpload.utils";

/**
 * **어디로 어떻게 보내는지 모른다.** 주소도 헤더도 응답 봉투도 앱의 것이라 `uploader` 로
 * 주입받는다 — 그것을 패키지가 정하면 그 규약을 쓰는 앱에서만 쓸 수 있다.
 *
 * 그래서 여기서 보는 것은 **주입한 것을 제대로 부르는가**, **파일 단위로 다시 시도하는가**,
 * 그리고 **키보드로도 파일을 고를 수 있는가** 다.
 */

beforeEach(() => resetUploadIdForTest());
afterEach(cleanup);

const file = (name: string, size = 100) => {
  const made = new File(["x"], name, { type: "text/plain" });
  Object.defineProperty(made, "size", { value: size });
  return made;
};

const inputOf = (container: HTMLElement) => container.querySelector('input[type="file"]') as HTMLInputElement;

const drop = async (container: HTMLElement, files: File[]) => {
  await act(async () => {
    fireEvent.change(inputOf(container), { target: { files } });
  });
};

describe("크기 표기", () => {
  it.each([
    [500, "500 B"],
    [1536, "1.5 KB"],
    [1024 * 1024 * 3, "3.0 MB"]
  ])("%s 바이트를 %s 로 적는다", (bytes, text) => {
    expect(formatBytes(bytes)).toBe(text);
  });
});

describe("TxFileUpload — 고르기", () => {
  /** 끌어다 놓기만 두면 키보드로는 파일을 고를 길이 없다. */
  it("눌러서 고르는 길이 있다 — 진짜 버튼이다", () => {
    render(<TxFileUpload />);

    const button = screen.getByRole("button");
    expect(button.tagName).toBe("BUTTON");
    expect(button.getAttribute("type")).toBe("button");
  });

  it("진짜 file 입력을 함께 둔다", () => {
    const { container } = render(<TxFileUpload accept="image/*" />);

    const input = inputOf(container);
    expect(input).toBeTruthy();
    expect(input.accept).toBe("image/*");
    expect(input.multiple).toBe(true);
  });

  it("고른 파일이 목록에 뜬다", async () => {
    const { container } = render(<TxFileUpload />);

    await drop(container, [file("a.txt"), file("b.txt")]);
    expect(screen.getByText("a.txt")).toBeTruthy();
    expect(screen.getByText("b.txt")).toBeTruthy();
  });

  it("목록이 바뀌면 알려 준다", async () => {
    const onChange = vi.fn();
    const { container } = render(<TxFileUpload onChange={onChange} />);

    await drop(container, [file("a.txt")]);
    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls.at(-1)![0]).toHaveLength(1);
  });

  /** 같은 파일을 두 번 골라도 두 줄이 한 값을 가리키면 하나를 지울 때 둘 다 사라진다. */
  it("같은 파일을 두 번 골라도 줄이 따로 선다", async () => {
    const { container } = render(<TxFileUpload />);

    await drop(container, [file("a.txt")]);
    await drop(container, [file("a.txt")]);

    expect(screen.getAllByText("a.txt")).toHaveLength(2);
  });

  it("maxFiles 를 넘게 고르면 앞에서부터 받는다", async () => {
    const { container } = render(<TxFileUpload maxFiles={2} />);

    await drop(container, [file("a.txt"), file("b.txt"), file("c.txt")]);
    expect(screen.queryByText("c.txt")).toBeNull();
  });

  /** 올려 보고 나서 알려 주면 그동안 기다린 것이 헛수고다. */
  it("큰 파일은 고르는 순간 실패로 표시한다", async () => {
    const uploader = vi.fn();
    const { container } = render(<TxFileUpload maxSize={1000} uploader={uploader} />);

    await drop(container, [file("big.txt", 5000)]);

    expect(screen.getByText(/1000 B 까지 올릴 수 있습니다/)).toBeTruthy();
    expect(uploader).not.toHaveBeenCalled();
  });
});

describe("TxFileUpload — 올리기", () => {
  it("uploader 를 파일마다 부른다", async () => {
    const uploader = vi.fn(async (_file: File) => {});
    const { container } = render(<TxFileUpload uploader={uploader} />);

    await drop(container, [file("a.txt"), file("b.txt")]);

    await waitFor(() => expect(uploader).toHaveBeenCalledTimes(2));
    expect((uploader.mock.calls[0][0] as File).name).toBe("a.txt");
  });

  it("uploader 가 없으면 고르기만 한다", async () => {
    const { container } = render(<TxFileUpload />);

    await drop(container, [file("a.txt")]);
    expect(screen.getByText(/대기/)).toBeTruthy();
  });

  it("끝나면 완료로 바뀐다", async () => {
    const { container } = render(<TxFileUpload uploader={async () => {}} />);

    await drop(container, [file("a.txt")]);
    await waitFor(() => expect(screen.getByText(/완료/)).toBeTruthy());
  });

  it("진행률을 받아 막대에 싣는다", async () => {
    let report: ((percent: number) => void) | undefined;
    const uploader = vi.fn(
      (_file: File, ctx: { onProgress: (percent: number) => void }) =>
        new Promise<void>(() => {
          report = ctx.onProgress;
        })
    );

    const { container } = render(<TxFileUpload uploader={uploader} />);
    await drop(container, [file("a.txt")]);

    await waitFor(() => expect(report).toBeTruthy());
    await act(async () => report!(40));

    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe("40");
  });

  it("실패하면 까닭을 보여 준다", async () => {
    const { container } = render(
      <TxFileUpload
        uploader={async () => {
          throw new Error("서버가 거절했습니다");
        }}
      />
    );

    await drop(container, [file("a.txt")]);
    await waitFor(() => expect(screen.getByText(/서버가 거절했습니다/)).toBeTruthy());
  });

  /** 열 개 중 하나가 실패했다고 다 올린 아홉을 또 보내지 않는다. */
  it("실패한 파일만 다시 시도한다", async () => {
    let attempts = 0;
    const uploader = vi.fn(async (target: File) => {
      if (target.name === "bad.txt") {
        attempts += 1;
        throw new Error("실패");
      }
    });

    const { container } = render(<TxFileUpload uploader={uploader} />);
    await drop(container, [file("ok.txt"), file("bad.txt")]);

    await waitFor(() => expect(screen.getByRole("button", { name: "다시" })).toBeTruthy());
    expect(uploader).toHaveBeenCalledTimes(2);

    await act(async () => {
      screen.getByRole("button", { name: "다시" }).click();
    });

    await waitFor(() => expect(attempts).toBe(2));
    // 성공한 것은 다시 보내지 않는다
    expect(uploader.mock.calls.filter((call) => (call[0] as File).name === "ok.txt")).toHaveLength(1);
  });

  it("취소 손잡이를 함께 넘긴다", async () => {
    const uploader = vi.fn(async (_file: File, ctx: { signal: AbortSignal }) => {
      expect(ctx.signal).toBeInstanceOf(AbortSignal);
    });

    const { container } = render(<TxFileUpload uploader={uploader} />);
    await drop(container, [file("a.txt")]);

    await waitFor(() => expect(uploader).toHaveBeenCalled());
  });

  /** 뺀 줄의 응답이 늦게 오면 없는 줄을 고치게 된다. */
  it("줄을 빼면 올리던 것도 끊는다", async () => {
    let signal: AbortSignal | undefined;
    const uploader = vi.fn(
      (_file: File, ctx: { signal: AbortSignal }) =>
        new Promise<void>(() => {
          signal = ctx.signal;
        })
    );

    const { container } = render(<TxFileUpload uploader={uploader} />);
    await drop(container, [file("a.txt")]);
    await waitFor(() => expect(signal).toBeTruthy());

    await act(async () => {
      screen.getByRole("button", { name: /빼기/ }).click();
    });

    expect(signal!.aborted).toBe(true);
    expect(screen.queryByText("a.txt")).toBeNull();
  });
});

describe("TxFileUpload — CSS 계약", () => {
  const here = import.meta.dirname;
  const strip = (text: string) => text.replace(/\/\*[\s\S]*?\*\//g, "");

  const css = strip(readFileSync(join(here, "TxFileUpload.css"), "utf8"));
  const tokens = strip(readFileSync(join(here, "..", "tokens.css"), "utf8"));
  const styles = readFileSync(join(here, "..", "styles.css"), "utf8");

  it("색을 하드코딩하지 않는다", () => {
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b/i);
  });

  it(".dark 분기를 갖지 않는다", () => {
    expect(css).not.toContain(".dark");
  });

  it("참조하는 전역 토큰이 전부 tokens.css 에 정의돼 있다", () => {
    const referenced = new Set([...css.matchAll(/var\(\s*(--tx-(?:color|state|radius|focus)[\w-]*)/g)].map((match) => match[1]));
    expect([...referenced].filter((name) => !tokens.includes(`${name}:`))).toEqual([]);
  });

  it("styles.css 에 실려 나간다", () => {
    expect(styles).toContain('@import "./TxFileUpload/TxFileUpload.css" layer(tx);');
  });

  /** `display: none` 이면 `<form>` 제출에 안 실리고 파일 고르기 창을 여는 표준 길도 잃는다. */
  it("file 입력을 화면에서만 지운다", () => {
    const rule = css.match(/\.tx-file-upload__input\s*\{([^}]*)\}/)?.[1] ?? "";

    expect(rule).not.toMatch(/display:\s*none/);
    expect(rule).toMatch(/clip-path:/);
  });

  /** 진행률은 `TxProgress` 가 그린다. 같은 것을 두 곳이 그리면 모양이 갈린다. */
  it("진행률 막대를 다시 그리지 않는다", () => {
    expect(css).not.toContain("--tx-progress-");
    expect(css).not.toMatch(/\.tx-progress__/);
  });
});
