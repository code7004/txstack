import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TxDayPicker } from "./TxDayPicker";
import type { TxDayPickerRangeRef } from "./TxDayPicker.types";
import { addDays, diffDays, endOfDay, formatDate, startOfDay } from "./TxDayPicker.utils";
import { TxDayPickerRange } from "./TxDayPickerRange";

/**
 * 이 컴포넌트에서 고친 것 중 무거운 셋은 **팝업을 각자 다시 만들던 것**,
 * **라이브러리가 `alert()` 를 띄우던 것**, 그리고 **서드파티 CSS 를 소비자 번들에 밀어넣던 것**이다.
 */

afterEach(cleanup);

const trigger = () => screen.getAllByRole("button")[0];
const panel = () => screen.queryByRole("dialog");
const open = () => fireEvent.click(trigger());
/**
 * 날짜 버튼을 **글자로** 찾는다.
 *
 * 접근성 이름은 "2026년 8월 20일 목요일" 처럼 전체 날짜 문장이라 숫자로는 못 고른다.
 * 그리고 옆 달에서 흘러온 날(`--outside`)과 두 번째 달에도 같은 숫자가 있으므로,
 * 달을 정해 그 안에서만 찾는다.
 */
const dayButton = (day: string, monthIndex = 0) => {
  const months = [...document.querySelectorAll(".tx-daypicker__month")];
  const scope = months[monthIndex] ?? document.body;

  const found = [...scope.querySelectorAll<HTMLButtonElement>(".tx-daypicker__day-button")].find((el) => el.textContent?.trim() === day && !el.closest(".tx-daypicker__day--outside"));

  if (!found) throw new Error(`${day}일 버튼을 찾지 못했다`);
  return found;
};

describe("날짜 유틸", () => {
  it("긴 토큰부터 바꾼다 — YYYY 가 YY 두 번으로 쪼개지지 않는다", () => {
    const date = new Date(2026, 7, 27, 13, 5, 9);

    expect(formatDate(date, "YYYY-MM-DD")).toBe("2026-08-27");
    expect(formatDate(date, "YY/MM/DD HH:mm:ss")).toBe("26/08/27 13:05:09");
  });

  it("하루의 경계를 잡는다", () => {
    const date = new Date(2026, 7, 27, 13, 5, 9, 500);

    expect(startOfDay(date).getHours()).toBe(0);
    expect(startOfDay(date).getMilliseconds()).toBe(0);
    expect(endOfDay(date).getHours()).toBe(23);
    expect(endOfDay(date).getMilliseconds()).toBe(999);
  });

  it("addDays 는 달을 넘어간다", () => {
    expect(formatDate(addDays(new Date(2026, 7, 30), 3), "YYYY-MM-DD")).toBe("2026-09-02");
  });

  /** 밀리초로 나누면 서머타임이 있는 지역에서 하루가 23시간이 되어 결과가 어긋난다. */
  it("일수 차이는 시각을 보지 않는다", () => {
    expect(diffDays(new Date(2026, 7, 1, 23, 59), new Date(2026, 7, 2, 0, 1))).toBe(1);
    expect(diffDays(new Date(2026, 7, 1), new Date(2026, 7, 1))).toBe(0);
  });
});

describe("TxDayPicker — 하나 고르기", () => {
  it("처음에는 닫혀 있고 자리표시 글자를 보여 준다", () => {
    render(<TxDayPicker placeholder="날짜 선택" />);

    expect(panel()).toBeNull();
    expect(trigger().textContent).toContain("날짜 선택");
    expect(trigger().getAttribute("aria-expanded")).toBe("false");
  });

  it("눌러서 열고 다시 눌러서 닫는다", () => {
    render(<TxDayPicker />);

    open();
    expect(panel()).not.toBeNull();
    expect(trigger().getAttribute("aria-expanded")).toBe("true");

    open();
    expect(panel()).toBeNull();
  });

  /** 원본은 TxInputLike 를 쓰면서 열림 상태를 안 넘겨, 스크린리더가 늘 "닫힘" 으로 들었다. */
  it("달력이라 dialog 로 알린다", () => {
    render(<TxDayPicker />);

    expect(trigger().getAttribute("aria-haspopup")).toBe("dialog");
    open();
    expect(trigger().getAttribute("aria-controls")).toBe(panel()!.id);
  });

  it("고르면 그날 00:00 으로 준다", () => {
    const onChange = vi.fn();
    render(<TxDayPicker defaultValue={new Date(2026, 7, 15)} onChange={onChange} />);

    open();
    fireEvent.click(dayButton("20"));

    const picked = onChange.mock.calls[0][0] as Date;
    expect(picked.getDate()).toBe(20);
    expect(picked.getHours()).toBe(0);
    expect(picked.getMilliseconds()).toBe(0);
  });

  it("고르면 닫히고 글자가 바뀐다", () => {
    render(<TxDayPicker defaultValue={new Date(2026, 7, 15)} />);

    open();
    fireEvent.click(dayButton("20"));

    expect(panel()).toBeNull();
    expect(trigger().textContent).toContain("2026-08-20");
  });

  it("keepOpen 이면 고른 뒤에도 열려 있다", () => {
    render(<TxDayPicker defaultValue={new Date(2026, 7, 15)} keepOpen />);

    open();
    fireEvent.click(dayButton("20"));
    expect(panel()).not.toBeNull();
  });

  it("format 으로 보여 줄 형식을 바꾼다", () => {
    render(<TxDayPicker defaultValue={new Date(2026, 7, 15)} format="YYYY년 MM월 DD일" />);
    expect(trigger().textContent).toContain("2026년 08월 15일");
  });

  it("controlled 는 value 가 주인이다", () => {
    const { rerender } = render(<TxDayPicker value={new Date(2026, 7, 15)} onChange={() => {}} />);
    expect(trigger().textContent).toContain("2026-08-15");

    open();
    fireEvent.click(dayButton("20"));
    expect(trigger().textContent).toContain("2026-08-15");

    rerender(<TxDayPicker value={new Date(2026, 7, 20)} onChange={() => {}} />);
    expect(trigger().textContent).toContain("2026-08-20");
  });

  /** 원본은 absolute 로 띄워 overflow: hidden 조상 안에서 잘렸다. */
  it("달력을 body 로 띄운다 — 조상에 갇히지 않는다", () => {
    const { container } = render(
      <div style={{ overflow: "hidden" }}>
        <TxDayPicker />
      </div>
    );

    open();
    expect(container.querySelector('[role="dialog"]')).toBeNull();
    expect(document.body.querySelector('[data-tag="TxPopup"] [role="dialog"], [data-tag="TxPopup"][role="dialog"]')).not.toBeNull();
  });

  it("바깥을 누르면 닫힌다", () => {
    render(<TxDayPicker />);

    open();
    fireEvent.pointerDown(document.body);
    expect(panel()).toBeNull();
  });

  it("disabled 면 열리지 않는다", () => {
    render(<TxDayPicker disabled />);

    open();
    expect(panel()).toBeNull();
  });
});

describe("TxDayPickerRange — 기간 고르기", () => {
  const between = (from: Date, to: Date) => ({ defaultValue: [from, to] as [Date, Date] });

  it("시작은 00:00, 끝은 23:59:59.999 로 준다", () => {
    const onChange = vi.fn();
    render(<TxDayPickerRange defaultValue={[new Date(2026, 7, 1), undefined]} onChange={onChange} />);

    open();
    fireEvent.click(dayButton("10"));

    const [from, to] = onChange.mock.calls.at(-1)![0] as [Date, Date];
    expect(from.getHours()).toBe(0);
    expect(to.getHours()).toBe(23);
    expect(to.getMilliseconds()).toBe(999);
  });

  it("밀리초 콜백을 함께 부른다", () => {
    const onChange = vi.fn();
    const onChangeNums = vi.fn();
    render(<TxDayPickerRange {...between(new Date(2026, 7, 1), new Date(2026, 7, 5))} onChange={onChange} onChangeNums={onChangeNums} />);

    open();
    fireEvent.click(dayButton("12"));

    expect(onChange).toHaveBeenCalled();
    expect(onChangeNums).toHaveBeenCalled();
    expect(typeof (onChangeNums.mock.calls.at(-1)![0] as number[])[0]).toBe("number");
  });

  it("고른 기간을 글자로 보여 준다", () => {
    render(<TxDayPickerRange {...between(new Date(2026, 7, 1), new Date(2026, 7, 5))} />);
    expect(trigger().textContent).toContain("2026-08-01 ~ 2026-08-05");
  });

  it("시작만 골랐으면 물결까지만 보여 준다", () => {
    render(<TxDayPickerRange defaultValue={[new Date(2026, 7, 1), undefined]} />);
    expect(trigger().textContent).toContain("2026-08-01 ~");
  });

  /**
   * 원본은 고르고 나서 alert() 로 알리고 값을 보정했다. 브라우저 모달로 흐름을 끊는 데다
   * 문구를 바꿀 수도 없었다.
   */
  it("maxDays 를 넘는 날은 아예 눌리지 않는다", () => {
    render(<TxDayPickerRange defaultValue={[new Date(2026, 7, 10), undefined]} maxDays={5} />);

    open();
    // 10일부터 5일이면 14일까지. 15일은 막힌다.
    expect(dayButton("14").disabled).toBe(false);
    expect(dayButton("15").disabled).toBe(true);
    expect(dayButton("9").disabled).toBe(true);
  });

  it("기간이 다 정해지면 다시 아무 날이나 고를 수 있다", () => {
    render(<TxDayPickerRange {...between(new Date(2026, 7, 10), new Date(2026, 7, 12))} maxDays={5} />);

    open();
    expect(dayButton("25").disabled).toBe(false);
  });

  it("지우기 버튼이 값을 비운다", () => {
    const onChange = vi.fn();
    render(<TxDayPickerRange {...between(new Date(2026, 7, 1), new Date(2026, 7, 5))} onChange={onChange} />);

    // 0번은 여는 트리거, 1번이 지우기다.
    fireEvent.click(screen.getAllByRole("button")[1]);
    expect(onChange).toHaveBeenCalledWith([undefined, undefined]);
  });
});

describe("TxDayPickerRange — 확인 버튼", () => {
  it("onSubmit 을 주면 버튼이 생기고 onChange 는 안 온다", () => {
    const onChange = vi.fn();
    const onSubmit = vi.fn();
    render(<TxDayPickerRange defaultValue={[new Date(2026, 7, 1), undefined]} onChange={onChange} onSubmit={onSubmit} />);

    open();
    fireEvent.click(dayButton("10"));

    expect(onChange).not.toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "확인" }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(panel()).toBeNull();
  });

  it("기간이 덜 정해지면 확인을 누를 수 없다", () => {
    render(<TxDayPickerRange defaultValue={[new Date(2026, 7, 1), undefined]} onSubmit={() => {}} />);

    open();
    expect((screen.getByRole("button", { name: "확인" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("확인하지 않고 닫으면 되돌아간다", () => {
    const onSubmit = vi.fn();
    render(<TxDayPickerRange defaultValue={[new Date(2026, 7, 1), new Date(2026, 7, 5)]} onSubmit={onSubmit} />);

    open();
    fireEvent.click(dayButton("20"));
    fireEvent.pointerDown(document.body);

    expect(trigger().textContent).toContain("2026-08-01 ~ 2026-08-05");
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe("TxDayPickerRange — ref", () => {
  it("setValue 로 기간을 넣고 경계를 맞춘다 — 프리셋 버튼이 쓴다", () => {
    const ref = createRef<TxDayPickerRangeRef>();
    const onChange = vi.fn();
    render(<TxDayPickerRange ref={ref} onChange={onChange} />);

    act(() => ref.current?.setValue([new Date(2026, 7, 1, 13), new Date(2026, 7, 7, 13)]));

    const [from, to] = onChange.mock.calls.at(-1)![0] as [Date, Date];
    expect(from.getHours()).toBe(0);
    expect(to.getHours()).toBe(23);
    expect(trigger().textContent).toContain("2026-08-01 ~ 2026-08-07");
  });

  it("getValue·clear·open·close 를 쓴다", () => {
    const ref = createRef<TxDayPickerRangeRef>();
    render(<TxDayPickerRange ref={ref} defaultValue={[new Date(2026, 7, 1), new Date(2026, 7, 5)]} />);

    expect(ref.current?.getValue()[0]?.getDate()).toBe(1);

    act(() => ref.current?.open());
    expect(panel()).not.toBeNull();

    act(() => ref.current?.close());
    expect(panel()).toBeNull();

    act(() => ref.current?.clear());
    expect(ref.current?.getValue()).toEqual([undefined, undefined]);
  });

  it("header·footer 를 달력 위아래에 넣는다", () => {
    render(<TxDayPickerRange header={<span data-header>프리셋</span>} footer={<span data-footer>안내</span>} />);

    open();
    expect(document.body.querySelector("[data-header]")).not.toBeNull();
    expect(document.body.querySelector("[data-footer]")).not.toBeNull();
  });
});

describe("TxDayPicker — CSS 계약과 경계", () => {
  const here = import.meta.dirname;
  const strip = (text: string) => text.replace(/\/\*[\s\S]*?\*\//g, "");

  const css = strip(readFileSync(join(here, "TxDayPicker.css"), "utf8"));
  const tokens = strip(readFileSync(join(here, "..", "tokens.css"), "utf8"));
  const styles = readFileSync(join(here, "..", "styles.css"), "utf8");

  it("색을 하드코딩하지 않는다 — 값이 토큰으로 나가 있다", () => {
    expect(css.match(/#[0-9a-fA-F]{3,8}\b|\brgba?\([^)]*\)/g) ?? []).toEqual([]);
  });

  it(".dark 분기를 컴포넌트가 갖지 않는다", () => {
    expect(css).not.toContain(".dark");
  });

  it("참조하는 전역 토큰이 전부 tokens.css 에 정의돼 있다", () => {
    const referenced = new Set([...css.matchAll(/var\(\s*(--tx-(?:color|state|radius|focus)[\w-]*)/g)].map((m) => m[1]));
    expect([...referenced].filter((name) => !tokens.includes(`${name}:`))).toEqual([]);
  });

  /**
   * 서드파티 CSS 를 import 하면 소비자의 번들러가 `node_modules` 안의 CSS 를 처리할 수 있어야
   * 하고, 그쪽이 버전을 올려 클래스 구조를 바꾸면 우리 규칙이 조용히 깨진다.
   */
  it("react-day-picker 의 CSS 를 import 하지 않는다", () => {
    // 테스트 파일 자신은 이 문자열을 본문에 갖고 있으므로 뺀다.
    const sources = readdirSync(here).filter((f) => (f.endsWith(".ts") || f.endsWith(".tsx")) && !f.includes(".test."));
    const offenders = sources.filter((f) => readFileSync(join(here, f), "utf8").includes("react-day-picker/dist"));

    expect(offenders).toEqual([]);
  });

  /** 달력·헤더·확인 버튼은 전부 팝업 안에 있다. 앵커 쪽은 껍데기 폭만 정한다. */
  const POPUP_SIDE = /__(panel|calendar|months|month|caption|nav|chevron|grid|weekday|week|day|header|footer|submit)/;

  /**
   * 팝업은 `document.body` 로 포털되므로 앵커의 자손이 아니다. CSS 변수는 DOM 을 따라
   * 상속되니 **앵커에 선언한 값은 팝업에 닿지 않는다** — 값이 통째로 사라져 칸 폭이 0 이 되거나
   * 색이 안 칠해진다. jsdom 에는 CSS 가 없어 렌더 결과로는 안 보인다.
   */
  it("팝업 안에서 쓰는 토큰을 앵커가 아니라 팝업에 선언한다", () => {
    const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([, selector, body]) => ({ selector: selector.trim(), body }));

    // 앵커 쪽 규칙에서만 선언된 토큰
    const declaredOnAnchor = new Set<string>();
    const declaredOnPopup = new Set<string>();

    for (const rule of rules) {
      const names = [...rule.body.matchAll(/(--tx-daypicker-[\w-]*)\s*:/g)].map((m) => m[1]);
      const target = rule.selector.includes("__panel") ? declaredOnPopup : rule.selector.includes(".tx-daypicker") ? declaredOnAnchor : null;
      names.forEach((name) => target?.add(name));
    }

    // 팝업 안쪽 규칙에서 쓰이는 토큰
    const usedInPopup = new Set<string>();
    for (const rule of rules) {
      if (!POPUP_SIDE.test(rule.selector)) continue;
      [...rule.body.matchAll(/var\(\s*(--tx-daypicker-[\w-]*)/g)].forEach((m) => usedInPopup.add(m[1]));
    }

    const unreachable = [...usedInPopup].filter((name) => !declaredOnPopup.has(name) && declaredOnAnchor.has(name));
    expect(unreachable, "앵커에만 선언돼 팝업에 닿지 않는 토큰").toEqual([]);
  });

  it("styles.css 에 실려 나간다 — 안 실리면 소비자에게 도달하지 않는다", () => {
    expect(styles).toContain('@import "./TxDayPicker/TxDayPicker.css" layer(tx);');
  });
});
