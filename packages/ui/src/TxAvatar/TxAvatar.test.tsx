import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TxAvatar } from "./TxAvatar";
import { toInitials } from "./TxAvatar.utils";
import { TxAvatarGroup } from "./TxAvatarGroup";

afterEach(cleanup);

const avatar = () => document.querySelector<HTMLElement>('[data-tag="TxAvatar"]')!;
const image = () => document.querySelector<HTMLImageElement>(".tx-avatar__image");
const initials = () => document.querySelector<HTMLElement>(".tx-avatar__initials");
const icon = () => document.querySelector<HTMLElement>(".tx-avatar__icon");

describe("이니셜 만들기", () => {
  it("띄어 쓴 이름은 덩어리마다 첫 글자다", () => {
    expect(toInitials("Jaehoon Kim")).toBe("JK");
    expect(toInitials("ada lovelace")).toBe("AL");
    // 셋 이상이어도 둘까지다. 칸이 좁다
    expect(toInitials("Johann Sebastian Bach")).toBe("JS");
  });

  it("붙여 쓴 한글 이름은 뒤 두 글자다", () => {
    expect(toInitials("김재훈")).toBe("재훈");
    expect(toInitials("남궁민수")).toBe("민수");
    expect(toInitials("김")).toBe("김");
  });

  /** 뒤 두 글자 규칙을 라틴 글자에 그대로 대면 "Jaehoon" 이 "on" 이 된다. */
  it("붙여 쓴 라틴 이름은 첫 글자 하나다", () => {
    expect(toInitials("Jaehoon")).toBe("J");
    expect(toInitials("madonna")).toBe("M");
  });

  it("빈 이름은 빈 글자다 — 아이콘으로 떨어질 자리다", () => {
    expect(toInitials("")).toBe("");
    expect(toInitials("   ")).toBe("");
  });

  /** 코드 포인트로 자른다. 글자 수로 자르면 이모지가 반쪽으로 잘린다. */
  it("이모지가 든 이름을 반쪽으로 자르지 않는다", () => {
    expect(toInitials("🐙 문어")).toBe("🐙문");
  });
});

describe("TxAvatar — 떨어지는 순서", () => {
  it("사진을 주면 사진을 그린다", () => {
    render(<TxAvatar src="/me.png" name="김재훈" />);

    expect(image()?.getAttribute("src")).toBe("/me.png");
    expect(initials()).toBeNull();
  });

  /** 주소를 줬는데 못 불러와도 빈칸이 남으면 안 된다. */
  it("사진이 깨지면 이니셜로 떨어진다", () => {
    render(<TxAvatar src="/none.png" name="김재훈" />);

    fireEvent.error(image()!);

    expect(image()).toBeNull();
    expect(initials()?.textContent).toBe("재훈");
  });

  /** 목록에서 자리를 돌려 쓰는 아바타가 남의 실패를 물려받으면 안 된다. */
  it("사진 주소가 바뀌면 다시 시도한다", () => {
    const { rerender } = render(<TxAvatar src="/none.png" name="김재훈" />);

    fireEvent.error(image()!);
    expect(image()).toBeNull();

    rerender(<TxAvatar src="/other.png" name="김재훈" />);
    expect(image()?.getAttribute("src")).toBe("/other.png");
  });

  it("사진이 없으면 이니셜, 이름도 없으면 아이콘이다", () => {
    const { rerender } = render(<TxAvatar name="김재훈" />);
    expect(initials()?.textContent).toBe("재훈");

    rerender(<TxAvatar />);
    expect(initials()).toBeNull();
    expect(icon()).not.toBeNull();
  });

  it("initials 로 직접 준 것이 이름보다 앞선다", () => {
    render(<TxAvatar name="김재훈" initials="JH" />);
    expect(initials()?.textContent).toBe("JH");
  });

  it("icon 으로 마지막 그림을 갈아 끼운다", () => {
    render(<TxAvatar icon={<span data-mine>🐙</span>} />);
    expect(document.querySelector("[data-mine]")).not.toBeNull();
  });
});

describe("TxAvatar — 읽히는 것", () => {
  /**
   * 사진의 `alt` 와 이니셜 글자가 함께 읽히면 같은 사람이 두 번 불린다.
   * 이름은 껍데기가 한 번만 말한다.
   */
  it("이름을 한 번만 말한다", () => {
    render(<TxAvatar src="/me.png" name="김재훈" />);

    expect(screen.getByRole("img", { name: "김재훈" })).toBe(avatar());
    expect(image()?.getAttribute("alt")).toBe("");
  });

  it("이니셜과 아이콘은 읽히지 않는다", () => {
    const { rerender } = render(<TxAvatar name="김재훈" />);
    expect(initials()?.getAttribute("aria-hidden")).toBe("true");

    rerender(<TxAvatar />);
    expect(icon()?.getAttribute("aria-hidden")).toBe("true");
  });

  /** 이름이 없으면 장식이다. 읽을 것이 없는데 role 을 주면 "이미지" 라고만 읽힌다. */
  it("이름이 없으면 role 도 이름도 주지 않는다", () => {
    render(<TxAvatar />);

    expect(avatar().getAttribute("role")).toBeNull();
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("onClick 을 주면 버튼이 되고 이름을 그대로 갖는다", () => {
    const onClick = vi.fn();
    render(<TxAvatar name="김재훈" onClick={onClick} />);

    const button = screen.getByRole("button", { name: "김재훈" });
    expect(button.tagName).toBe("BUTTON");
    expect(button.getAttribute("type")).toBe("button");

    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("onClick 이 없으면 버튼이 아니다", () => {
    render(<TxAvatar name="김재훈" />);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("크기와 모양을 data 속성으로 알린다", () => {
    render(<TxAvatar name="김재훈" size="lg" shape="square" />);

    expect(avatar().dataset.size).toBe("lg");
    expect(avatar().dataset.shape).toBe("square");
  });
});

describe("TxAvatarGroup — 겹쳐 쌓기", () => {
  const many = (count: number) => Array.from({ length: count }, (_, i) => <TxAvatar key={i} name={`사람${i}`} />);

  const cells = () => document.querySelectorAll('[data-tag="TxAvatar"]');

  it("max 를 넘으면 뒤에 +N 한 칸이 붙는다", () => {
    render(<TxAvatarGroup max={3}>{many(5)}</TxAvatarGroup>);

    // 보이는 셋 + `+2` 한 칸
    expect(cells()).toHaveLength(4);
    expect(document.querySelectorAll(".tx-avatar__initials")[3]!.textContent).toBe("+2");
  });

  /** 남은 사람이 있다는 것이 보는 사람에게만 보이면 안 된다. */
  it("+N 도 이름으로 읽힌다", () => {
    render(<TxAvatarGroup max={3}>{many(5)}</TxAvatarGroup>);
    expect(screen.getByRole("img", { name: "외 2명" })).not.toBeNull();
  });

  it("moreLabel 로 읽히는 말을 바꾼다", () => {
    render(
      <TxAvatarGroup max={2} moreLabel={(rest) => `and ${rest} more`}>
        {many(5)}
      </TxAvatarGroup>
    );

    expect(screen.getByRole("img", { name: "and 3 more" })).not.toBeNull();
  });

  it("max 안에 들면 +N 이 없다", () => {
    render(<TxAvatarGroup max={5}>{many(3)}</TxAvatarGroup>);
    expect(cells()).toHaveLength(3);
  });

  it("max 를 안 주면 준 만큼 전부 보인다", () => {
    render(<TxAvatarGroup>{many(6)}</TxAvatarGroup>);
    expect(cells()).toHaveLength(6);
  });

  it("+N 칸의 크기와 모양을 겹친 것들에 맞춘다", () => {
    render(
      <TxAvatarGroup max={1} size="lg" shape="square">
        {many(3)}
      </TxAvatarGroup>
    );

    const rest = [...cells()].at(-1) as HTMLElement;
    expect(rest.dataset.size).toBe("lg");
    expect(rest.dataset.shape).toBe("square");
  });
});

describe("TxAvatar — CSS 계약과 경계", () => {
  const here = import.meta.dirname;
  const strip = (text: string) => text.replace(/\/\*[\s\S]*?\*\//g, "");

  const css = strip(readFileSync(join(here, "TxAvatar.css"), "utf8"));
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
   * **크기는 토큰 하나에서 나온다.** 칸·글자·겹침이 각자 값을 들고 있으면 소비자가
   * `--tx-avatar-size` 만 바꿨을 때 속만 그대로 남아 어긋난다.
   */
  it("칸 · 글자 · 겹침이 전부 --tx-avatar-size 에서 나온다", () => {
    const rule = (selector: string) => css.match(new RegExp(`${selector.replace(/\./g, "\\.")}\\s*\\{([^}]*)\\}`))?.[1] ?? "";

    const shell = rule(".tx-avatar");
    expect(shell).toContain("inline-size: var(--tx-avatar-size)");
    expect(shell).toContain("block-size: var(--tx-avatar-size)");
    expect(shell).toMatch(/--tx-avatar-font-size:\s*calc\(var\(--tx-avatar-size\)/);

    expect(rule(".tx-avatar-group > \\* \\+ \\*")).toContain("var(--tx-avatar-size");
  });

  it("styles.css 에 실려 나간다 — 안 실리면 소비자에게 도달하지 않는다", () => {
    expect(styles).toContain('@import "./TxAvatar/TxAvatar.css" layer(tx);');
  });
});
