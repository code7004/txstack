import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TxForm } from "./TxForm";
import { TxFormDayPicker } from "./TxFormDayPicker";

/**
 * 원본에서 고친 것이 **배선과 배치** 두 갈래다.
 *
 * - 배선: 캡션이 `<div>` 라 컨트롤과 이어지지 않았고, 에러는 화면에만 떠서 스크린리더에 닿지 않았다
 * - 배치: `labelWidth` 는 아무 일도 하지 않았고, warning·error 는 같은 좌표에 포개졌다
 *
 * 그래서 "이름이 이어지는가 · 메시지가 이어지는가 · 자리가 하나인가" 를 여러 각도에서 못 박는다.
 */

afterEach(cleanup);

describe("TxForm — 폼 자체", () => {
  it("onSubmit 은 preventDefault 가 이미 걸려 있다", () => {
    const onSubmit = vi.fn();
    const { container } = render(<TxForm onSubmit={onSubmit} />);

    const evt = new Event("submit", { bubbles: true, cancelable: true });
    container.querySelector("form")!.dispatchEvent(evt);

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(evt.defaultPrevented).toBe(true);
  });

  it("onSubmit 을 안 줘도 기본 동작을 막는다 — 페이지가 넘어가지 않는다", () => {
    const { container } = render(<TxForm />);

    const evt = new Event("submit", { bubbles: true, cancelable: true });
    container.querySelector("form")!.dispatchEvent(evt);

    expect(evt.defaultPrevented).toBe(true);
  });

  /** 원본은 `labelWidth="w-24"` 라 Tailwind 를 쓰지 않는 소비자에게는 아무 값도 아니었다. */
  it("labelWidth 는 CSS 변수로 내려간다 — 클래스 문자열이 아니다", () => {
    const { container } = render(<TxForm labelWidth="8rem" />);
    const form = container.querySelector("form")!;

    expect(form.style.getPropertyValue("--tx-form-label-width")).toBe("8rem");
    expect(form.hasAttribute("data-label-width")).toBe(true);
    expect(form.className).not.toContain("8rem");
  });

  it("labelWidth 를 안 주면 배치 표시가 붙지 않는다", () => {
    const { container } = render(<TxForm />);
    expect(container.querySelector("form")!.hasAttribute("data-label-width")).toBe(false);
  });

  it("소비자의 style 을 지우지 않는다", () => {
    const { container } = render(<TxForm labelWidth="8rem" style={{ maxWidth: "40rem" }} />);
    const form = container.querySelector("form")!;

    expect(form.style.maxWidth).toBe("40rem");
    expect(form.style.getPropertyValue("--tx-form-label-width")).toBe("8rem");
  });

  it("className 은 기본 클래스를 덧붙는다 — 교체가 아니다", () => {
    const { container } = render(<TxForm className="grid grid-cols-2" />);
    const form = container.querySelector("form")!;

    expect(form.classList.contains("tx-form")).toBe(true);
    expect(form.classList.contains("grid")).toBe(true);
  });
});

describe("TxForm — 캡션이 컨트롤의 이름이 된다", () => {
  it("입력창은 label 로 찾을 수 있다", () => {
    render(
      <TxForm>
        <TxForm.Input caption="이름" />
      </TxForm>
    );

    expect(screen.getByLabelText("이름").tagName).toBe("INPUT");
  });

  /**
   * 브라우저가 캡션 클릭을 컨트롤로 넘겨 주는 근거가 `for` ↔ `id` 다.
   * (jsdom 은 label 클릭으로 포커스를 옮기지 않아 연결 자체를 본다.)
   */
  it("캡션의 for 가 컨트롤의 id 를 정확히 가리킨다", () => {
    const { container } = render(
      <TxForm>
        <TxForm.Input caption="이름" />
      </TxForm>
    );

    const label = container.querySelector("label")!;
    expect(label.getAttribute("for")).toBe(screen.getByLabelText("이름").id);
  });

  it("텍스트영역·검색·자유입력도 같다", () => {
    render(
      <TxForm>
        <TxForm.Textarea caption="메모" />
        <TxForm.SearchInput caption="키워드" />
        <TxForm.Combobox caption="도시" data={["서울"]} />
      </TxForm>
    );

    expect(screen.getByLabelText("메모").tagName).toBe("TEXTAREA");
    expect(screen.getByLabelText("키워드").tagName).toBe("INPUT");
    expect(screen.getByLabelText("도시").getAttribute("role")).toBe("combobox");
  });

  /**
   * 드롭다운의 헤드는 `<div role="combobox">` 다. `<label for>` 는 `<input>` 처럼
   * **이름을 붙일 수 있는 요소**에만 먹으므로 여기서는 `aria-labelledby` 로 잇는다.
   */
  it("드롭다운은 aria-labelledby 로 이어진다 — for 가 안 먹는 컨트롤이다", () => {
    const { container } = render(
      <TxForm>
        <TxForm.Dropdown caption="나이" data={[20, 21]} />
      </TxForm>
    );

    expect(screen.getByLabelText("나이").getAttribute("role")).toBe("combobox");
    // 가리키는 곳이 없는 htmlFor 를 만들지 않는다
    expect(container.querySelector("label")).toBeNull();
  });

  /**
   * 체크박스는 `label` 로 자기 이름을 이미 갖고 있다. 캡션까지 이름으로 이으면
   * 스크린리더가 "약관 동의합니다" 로 겹쳐 읽는다.
   */
  it("체크박스의 이름은 label 하나다 — 캡션이 겹쳐 읽히지 않는다", () => {
    render(
      <TxForm>
        <TxForm.CheckBox caption="약관" label="동의합니다" />
      </TxForm>
    );

    const box = screen.getByRole("checkbox", { name: "동의합니다" });
    expect(box.hasAttribute("aria-labelledby")).toBe(false);
  });

  it("소비자가 준 id 가 이긴다", () => {
    render(
      <TxForm>
        <TxForm.Input caption="이름" id="custom-id" />
      </TxForm>
    );

    expect(screen.getByLabelText("이름").id).toBe("custom-id");
  });
});

describe("TxForm — 메시지 자리는 하나다", () => {
  const messageOf = (container: HTMLElement) => container.querySelector<HTMLElement>(".tx-form-field__message")!;

  it("error 가 warning 을 가린다 — 원본은 둘을 같은 자리에 포개 그렸다", () => {
    const { container } = render(
      <TxForm>
        <TxForm.Input caption="값" warning="경고" error="에러" />
      </TxForm>
    );

    expect(container.querySelectorAll(".tx-form-field__message")).toHaveLength(1);
    expect(messageOf(container).textContent).toBe("에러");
    expect(messageOf(container).getAttribute("data-tone")).toBe("error");
  });

  it("warning 만 있으면 warning 이 뜬다", () => {
    const { container } = render(
      <TxForm>
        <TxForm.Input caption="값" warning="곧 사용할 수 없습니다" />
      </TxForm>
    );

    expect(messageOf(container).getAttribute("data-tone")).toBe("warning");
  });

  /** 원본은 문구 앞에 `warning ` · `error ` 를 영어로 박아 넣었다. 소비자가 못 바꿨다. */
  it("문구를 지어내지 않는다 — 준 것만 나온다", () => {
    const { container } = render(
      <TxForm>
        <TxForm.Input caption="값" error="필수 항목입니다" />
      </TxForm>
    );

    expect(messageOf(container).textContent).toBe("필수 항목입니다");
  });

  /**
   * live region 은 **미리 자리잡고 있어야** 안에서 바뀐 내용을 읽어 준다.
   * 나중에 삽입하면 화면엔 떠도 안 읽힐 수 있다.
   */
  it("메시지가 없어도 요소는 늘 자리에 있다", () => {
    const { container } = render(
      <TxForm>
        <TxForm.Input caption="값" />
      </TxForm>
    );

    const message = messageOf(container);
    expect(message).toBeTruthy();
    expect(message.getAttribute("aria-live")).toBe("polite");
    expect(message.hasAttribute("data-tone")).toBe(false);
    expect(message.textContent).toBe("");
  });
});

describe("TxForm — 에러가 스크린리더에 닿는다", () => {
  it("error 가 있으면 aria-invalid 와 aria-describedby 가 붙는다", () => {
    render(
      <TxForm>
        <TxForm.Input caption="이름" error="필수 항목입니다" />
      </TxForm>
    );

    const input = screen.getByLabelText("이름");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(document.getElementById(input.getAttribute("aria-describedby")!)?.textContent).toBe("필수 항목입니다");
  });

  it("error 가 없으면 아무것도 붙지 않는다", () => {
    render(
      <TxForm>
        <TxForm.Input caption="이름" />
      </TxForm>
    );

    const input = screen.getByLabelText("이름");
    expect(input.hasAttribute("aria-invalid")).toBe(false);
    expect(input.hasAttribute("aria-describedby")).toBe(false);
  });

  it("warning 도 설명으로 이어진다 — 유효하지 않다고는 하지 않는다", () => {
    render(
      <TxForm>
        <TxForm.Input caption="이름" warning="곧 바뀝니다" />
      </TxForm>
    );

    const input = screen.getByLabelText("이름");
    expect(input.hasAttribute("aria-invalid")).toBe(false);
    expect(document.getElementById(input.getAttribute("aria-describedby")!)?.textContent).toBe("곧 바뀝니다");
  });

  it("소비자가 준 aria-describedby 를 지우지 않는다 — 함께 간다", () => {
    render(
      <TxForm>
        <p id="hint">영문 소문자만</p>
        <TxForm.Input caption="아이디" error="이미 쓰는 아이디입니다" aria-describedby="hint" />
      </TxForm>
    );

    const described = screen.getByLabelText("아이디").getAttribute("aria-describedby")!.split(" ");
    expect(described).toContain("hint");
    expect(described).toHaveLength(2);
  });

  it("드롭다운·체크박스도 같은 배선을 받는다", () => {
    render(
      <TxForm>
        <TxForm.Dropdown caption="나이" data={[20]} error="골라야 합니다" />
        <TxForm.CheckBox label="동의합니다" error="필수입니다" />
      </TxForm>
    );

    for (const name of ["나이", "동의합니다"]) {
      const control = screen.getByLabelText(name);
      expect(control.getAttribute("aria-invalid"), name).toBe("true");
      expect(document.getElementById(control.getAttribute("aria-describedby")!), name).toBeTruthy();
    }
  });
});

describe("TxForm — 폼으로서 동작한다", () => {
  it("필드 값이 제출에 실린다", () => {
    const { container } = render(
      <TxForm>
        <TxForm.Input caption="이름" name="name" defaultValue="홍길동" />
        <TxForm.Textarea caption="메모" name="memo" defaultValue="안녕" />
        <TxForm.CheckBox label="동의" name="agree" value="yes" defaultChecked />
      </TxForm>
    );

    const data = new FormData(container.querySelector("form")!);
    expect(data.get("name")).toBe("홍길동");
    expect(data.get("memo")).toBe("안녕");
    expect(data.get("agree")).toBe("yes");
  });

  it("감싼 컨트롤의 콜백이 그대로 온다", () => {
    const onChangeText = vi.fn();
    render(
      <TxForm>
        <TxForm.Input caption="이름" onChangeText={onChangeText} />
      </TxForm>
    );

    fireEvent.change(screen.getByLabelText("이름"), { target: { value: "가나다" } });
    expect(onChangeText).toHaveBeenCalledWith("가나다");
  });

  it("className 은 필드 상자에 붙는다 — 그리드에 놓는 자리다", () => {
    const { container } = render(
      <TxForm>
        <TxForm.Input caption="이름" className="col-span-2" />
      </TxForm>
    );

    const field = container.querySelector(".tx-form-field")!;
    expect(field.classList.contains("col-span-2")).toBe(true);
    // 입력창까지 흘러가지 않는다
    expect(screen.getByLabelText("이름").closest(".tx-input")!.classList.contains("col-span-2")).toBe(false);
  });
});

describe("TxForm.Field — 손수 짜는 자리", () => {
  it("htmlFor 를 주면 label, 안 주면 span 이다", () => {
    const { container, rerender } = render(
      <TxForm.Field caption="커스텀" htmlFor="my-ctl">
        <input id="my-ctl" />
      </TxForm.Field>
    );
    expect(container.querySelector("label")!.getAttribute("for")).toBe("my-ctl");

    rerender(
      <TxForm.Field caption="커스텀">
        <div />
      </TxForm.Field>
    );
    // 가리키는 곳이 없는 htmlFor 를 만들지 않는다
    expect(container.querySelector("label")).toBeNull();
    expect(container.querySelector(".tx-form-field__caption")!.tagName).toBe("SPAN");
  });

  it("메시지 id 가 htmlFor 에서 규칙대로 정해진다 — 소비자가 직접 이을 수 있다", () => {
    const { container } = render(
      <TxForm.Field caption="커스텀" htmlFor="my-ctl" error="직접 검증">
        <input id="my-ctl" aria-describedby="my-ctl-message" />
      </TxForm.Field>
    );

    expect(container.querySelector("#my-ctl-message")!.textContent).toBe("직접 검증");
  });

  /** 원본은 `data-tag` 를 스프레드 앞에 둬서 통과 props 가 이름을 덮어썼다. */
  it("data-tag 가 통과 props 에 덮이지 않는다", () => {
    const { container } = render(
      // 하이픈 붙은 속성은 TS 가 막지 않는다. 그래서 원본에서 실제로 덮어써지고 있었다
      <TxForm.Field caption="커스텀" data-tag="something-else">
        <div />
      </TxForm.Field>
    );

    expect(container.querySelector("[data-tag]")!.getAttribute("data-tag")).toBe("TxForm.Field");
  });
});

describe("TxForm — 네임스페이스", () => {
  it("필드 열 개가 붙어 있다", () => {
    for (const key of ["Field", "Flex", "Label", "Input", "SearchInput", "Textarea", "Dropdown", "DropdownMulti", "CheckBox", "Combobox"]) {
      expect(TxForm, key).toHaveProperty(key);
    }
  });

  /** 코어 배럴이 react-day-picker 를 import 하면 optional peer 가 성립하지 않는다. */
  it("날짜 필드는 네임스페이스에 없다 — 서브패스가 가져간다", () => {
    expect(TxForm).not.toHaveProperty("DayPicker");
    expect(TxForm).not.toHaveProperty("DayPickerRange");
  });
});

/**
 * 날짜 필드는 `@txstack/ui/daypicker` 서브패스에 있다. 껍데기가 `<button>` 이라
 * 드롭다운과 같은 `aria-labelledby` 배선을 쓴다.
 */
describe("TxFormDayPicker — 서브패스 필드", () => {
  it("캡션이 aria-labelledby 로 이어지고 에러가 설명으로 붙는다", () => {
    render(
      <TxForm>
        <TxFormDayPicker caption="가입일" error="날짜를 골라야 합니다" />
      </TxForm>
    );

    const trigger = screen.getByLabelText("가입일");
    expect(trigger.tagName).toBe("BUTTON");
    expect(trigger.getAttribute("aria-invalid")).toBe("true");
    expect(document.getElementById(trigger.getAttribute("aria-describedby")!)?.textContent).toBe("날짜를 골라야 합니다");
  });
});

describe("TxForm — CSS 계약", () => {
  const here = import.meta.dirname;
  const strip = (text: string) => text.replace(/\/\*[\s\S]*?\*\//g, "");

  const css = strip(readFileSync(join(here, "TxForm.css"), "utf8"));
  const tokens = strip(readFileSync(join(here, "..", "tokens.css"), "utf8"));
  const styles = readFileSync(join(here, "..", "styles.css"), "utf8");
  const controls = readFileSync(join(here, "TxFormControls.tsx"), "utf8");

  it("색을 하드코딩하지 않는다 — 값이 토큰으로 나가 있다", () => {
    expect(css.match(/#[0-9a-fA-F]{3,8}\b|\brgba?\([^)]*\)/g) ?? []).toEqual([]);
  });

  it(".dark 분기를 컴포넌트가 갖지 않는다 — 토큰만 재정의하면 따라온다", () => {
    expect(css).not.toContain(".dark");
  });

  it("참조하는 전역 토큰이 전부 tokens.css 에 정의돼 있다", () => {
    const referenced = new Set([...css.matchAll(/var\(\s*(--tx-(?:color|state|radius|focus)[\w-]*)/g)].map((m) => m[1]));
    expect([...referenced].filter((name) => !tokens.includes(`${name}:`))).toEqual([]);
  });

  it("styles.css 에 실려 나간다 — 안 실리면 소비자에게 도달하지 않는다", () => {
    expect(styles).toContain('@import "./TxForm/TxForm.css" layer(tx);');
  });

  /** 배치를 클래스가 아니라 변수로 정한다. 그래야 CSS 로도 같은 값을 줄 수 있다. */
  it("캡션 배치가 --tx-form-label-width 하나로 갈린다", () => {
    expect(css).toContain("grid-template-columns: var(--tx-form-label-width)");
    expect(css).toContain(".tx-form[data-label-width]");
  });

  /** 원본은 입력창마다 `className="w-full"` 을 박아서 소비자가 폭을 되돌릴 수 없었다. */
  it("컨트롤 폭을 Tailwind 클래스로 박지 않는다", () => {
    expect(controls).not.toContain("w-full");
  });

  it("메시지 자리를 글자 크기에서 계산한다 — 크기를 바꿔도 빈 상태와 맞는다", () => {
    expect(css).toContain("min-height: var(--tx-form-message-reserve, calc(var(--tx-form-message-font-size, 0.75rem) * var(--tx-form-message-line-height, 1.5)))");
  });

  /**
   * 필드는 폼의 **자식**이다. `.tx-form-field` 에서 토큰을 선언해 버리면 그 선언이 상속을
   * 가로막아, 소비자가 `<TxForm style={{ "--tx-form-caption-color": … }}>` 로 준 값이
   * 조용히 무시된다. Storybook 에서 실제로 그렇게 나왔다.
   */
  it("필드 토큰을 필드에서 선언하지 않는다 — 폼 위에서 준 값이 닿아야 한다", () => {
    const block = css.match(/\.tx-form-field\s*\{([^}]*)\}/)?.[1] ?? "";
    expect(block.match(/--tx-form-[\w-]+\s*:/g) ?? []).toEqual([]);
  });

  /** &nbsp; 는 스크린리더가 읽는 텍스트 노드다. 자리는 CSS 로 잡는다. */
  it("빈 자리를 문자로 채우지 않는다", () => {
    expect(readFileSync(join(here, "TxFormField.tsx"), "utf8")).not.toContain("nbsp");
  });
});
