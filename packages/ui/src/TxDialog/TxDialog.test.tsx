import { act, screen, waitFor } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { TxDialog } from "./TxDialog";
import { resetForTest } from "./TxDialog.store";

/**
 * 네이티브 `alert` · `confirm` 을 대신하는 자리다. 그래서 보는 것은 **약속이 제대로 끝나는가** 다 —
 * 어느 길로 닫히든 값이 정확히 한 번, 맞게 돌아와야 한다. 값이 안 오면 소비자의 `await` 가
 * 영원히 멈춘다.
 *
 * 창 자체(포커스 트랩·Escape)는 `TxModal` 의 테스트가 본다. 바깥 클릭을 막는 것은
 * 여기서 정한 규칙이라 여기서 본다.
 */

afterEach(() => {
  act(() => resetForTest());
});

const clickButton = async (name: string) => {
  const button = await screen.findByRole("button", { name });
  await act(async () => {
    button.click();
  });
};

describe("TxDialog.alert", () => {
  it("문구를 보여 주고, 확인을 누르면 끝난다", async () => {
    let done = false;
    const promise = TxDialog.alert("처리할 수 없습니다.").then(() => (done = true));

    expect(await screen.findByText("처리할 수 없습니다.")).toBeTruthy();
    expect(done).toBe(false);

    await clickButton("확인");
    await promise;
    expect(done).toBe(true);
  });

  it("취소 버튼이 없다 — 답이 하나뿐이다", async () => {
    const promise = TxDialog.alert("알림");
    await screen.findByText("알림");

    expect(screen.getAllByRole("button").map((button) => button.textContent)).toEqual(["확인"]);
    await clickButton("확인");
    await promise;
  });
});

describe("TxDialog.confirm", () => {
  it("확인은 true", async () => {
    const promise = TxDialog.confirm("로그아웃 하시겠습니까?");
    await screen.findByText("로그아웃 하시겠습니까?");

    await clickButton("확인");
    expect(await promise).toBe(true);
  });

  it("취소는 false", async () => {
    const promise = TxDialog.confirm("정말?");
    await screen.findByText("정말?");

    await clickButton("취소");
    expect(await promise).toBe(false);
  });

  /**
   * 오른쪽 위 X 는 없다. 취소 버튼이 이미 있는데 같은 뜻의 길이 둘이면 답이 둘로 보인다.
   * 네이티브 `confirm` 에도 X 가 없다.
   */
  it("오른쪽 위 닫기(X) 버튼이 없다", async () => {
    const promise = TxDialog.confirm("정말?");
    await screen.findByText("정말?");

    expect(screen.queryByRole("button", { name: "닫기" })).toBeNull();
    expect(screen.getAllByRole("button").map((button) => button.textContent)).toEqual(["취소", "확인"]);

    await clickButton("취소");
    expect(await promise).toBe(false);
  });
});

describe("TxDialog — 답하기 전에는 닫히지 않는다", () => {
  /**
   * 네이티브 `alert` · `confirm` 은 바깥을 눌러도 안 닫힌다.
   * `confirm` 에서 바깥을 잘못 누르면 조용히 "취소를 골랐다" 가 되어 버린다 — 그건 답이 아니다.
   */
  it("바깥(바탕)을 눌러도 안 닫힌다", async () => {
    let settled = false;
    const promise = TxDialog.confirm("정말?").then((value) => {
      settled = true;
      return value;
    });
    await screen.findByText("정말?");

    const dialog = document.querySelector("dialog")!;
    await act(async () => {
      dialog.click();
    });

    expect(settled).toBe(false);
    expect(screen.getByText("정말?")).toBeTruthy();

    await clickButton("확인");
    expect(await promise).toBe(true);
  });

  /** 바깥 클릭만 막는다. Escape 는 네이티브 `confirm` 처럼 취소로 친다. */
  it("Escape 는 취소로 친다", async () => {
    const promise = TxDialog.confirm("정말?");
    await screen.findByText("정말?");

    const dialog = document.querySelector("dialog")!;
    await act(async () => {
      dialog.dispatchEvent(new Event("cancel", { bubbles: false, cancelable: true }));
    });

    expect(await promise).toBe(false);
  });
});

describe("TxDialog — 옵션", () => {
  it("문구 하나만 줘도, 옵션 객체를 줘도 된다", async () => {
    const first = TxDialog.confirm("짧게");
    await screen.findByText("짧게");
    await clickButton("확인");
    expect(await first).toBe(true);

    const second = TxDialog.confirm({ title: "제목", message: "본문", confirmLabel: "재시도", cancelLabel: "그만" });
    expect(await screen.findByText("제목")).toBeTruthy();
    expect(screen.getByText("본문")).toBeTruthy();
    expect(screen.getByRole("button", { name: "재시도" })).toBeTruthy();

    await clickButton("그만");
    expect(await second).toBe(false);
  });

  it("제목이 창의 이름이 된다", async () => {
    const promise = TxDialog.alert({ title: "오류", message: "다시 시도하세요" });
    await screen.findByText("오류");

    const dialog = document.querySelector("dialog")!;
    expect(document.getElementById(dialog.getAttribute("aria-labelledby")!)?.textContent).toBe("오류");

    await clickButton("확인");
    await promise;
  });

  it("문구를 앱 전체에서 바꿀 수 있다", async () => {
    TxDialog.configure({ labels: { confirm: "OK", cancel: "Cancel" } });

    const promise = TxDialog.confirm("bye?");
    await screen.findByText("bye?");

    expect(screen.getByRole("button", { name: "OK" })).toBeTruthy();
    await clickButton("Cancel");
    expect(await promise).toBe(false);
  });
});

describe("TxDialog — 줄 세우기", () => {
  /** 사용자는 한 번에 하나만 답할 수 있다. 겹쳐 띄우면 어느 것에 답한 건지 알 수 없다. */
  it("연달아 불러도 겹치지 않고 차례로 뜬다", async () => {
    const first = TxDialog.confirm("첫째");
    const second = TxDialog.confirm("둘째");

    await screen.findByText("첫째");
    expect(screen.queryByText("둘째")).toBeNull();

    await clickButton("확인");
    expect(await first).toBe(true);

    expect(await screen.findByText("둘째")).toBeTruthy();
    await clickButton("취소");
    expect(await second).toBe(false);
  });

  it("줄이 비면 창이 사라진다", async () => {
    const promise = TxDialog.alert("하나뿐");
    await screen.findByText("하나뿐");

    await clickButton("확인");
    await promise;

    await waitFor(() => expect(document.querySelector("dialog")?.hasAttribute("open")).toBe(false));
  });
});

describe("TxDialog — 그릴 자리", () => {
  /** import 만으로 DOM 을 건드리면 이 기능을 안 쓰는 소비자에게도 빈 요소가 남는다. */
  it("부를 때 자리를 만든다", async () => {
    const promise = TxDialog.alert("생겼나");
    await screen.findByText("생겼나");

    expect(document.querySelectorAll("[data-tx-dialog-root]")).toHaveLength(1);

    await clickButton("확인");
    await promise;
  });

  it("여러 번 불러도 자리는 하나다", async () => {
    const first = TxDialog.alert("하나");
    await screen.findByText("하나");
    await clickButton("확인");
    await first;

    const second = TxDialog.alert("둘");
    await screen.findByText("둘");
    expect(document.querySelectorAll("[data-tx-dialog-root]")).toHaveLength(1);

    await clickButton("확인");
    await second;
  });
});

describe("TxDialog — CSS 계약", () => {
  const here = import.meta.dirname;
  const strip = (text: string) => text.replace(/\/\*[\s\S]*?\*\//g, "");

  const css = strip(readFileSync(join(here, "TxDialog.css"), "utf8"));
  const styles = readFileSync(join(here, "..", "styles.css"), "utf8");

  it("색을 하드코딩하지 않는다", () => {
    expect(css.match(/#[0-9a-fA-F]{3,8}\b|\brgba?\([^)]*\)/g) ?? []).toEqual([]);
  });

  it(".dark 분기를 갖지 않는다", () => {
    expect(css).not.toContain(".dark");
  });

  it("styles.css 에 실려 나간다", () => {
    expect(styles).toContain('@import "./TxDialog/TxDialog.css" layer(tx);');
  });

  it("TxModal 뒤에 실린다 — 모달의 토큰을 덮으려면 순서가 뒤여야 한다", () => {
    expect(styles.indexOf("TxDialog/TxDialog.css")).toBeGreaterThan(styles.indexOf("TxModal/TxModal.css"));
  });

  /**
   * 앱에서 옮겨 올 문구에 `\n` 이 들어 있다.
   * 한 줄로 뭉치면 옮겨 온 문구가 망가진다.
   */
  it("줄바꿈을 그대로 보인다", () => {
    expect(css).toContain("white-space: pre-line");
  });

  /** 창의 겉은 TxModal 이 소유한다. 두 곳이 같은 것을 정하면 토큰이 안 먹는다. */
  it("모달의 겉모습을 다시 그리지 않는다", () => {
    expect(css).not.toContain("box-shadow");
    expect(css).not.toContain("border-radius");
  });
});
