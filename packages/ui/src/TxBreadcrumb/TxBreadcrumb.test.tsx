import { cleanup, render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { TxBreadcrumb } from "./TxBreadcrumb";
import type { TxBreadcrumbProps } from "./TxBreadcrumb.types";

/**
 * 경로에서 가장 조심할 것은 **마지막 칸**이다 — 지금 있는 자리를 다시 누르게 두면
 * 어디로 가는지 알 수 없고, 스크린리더도 "지금 여기" 를 알 길이 없다.
 *
 * 가르는 `/` 를 글자로 넣으면 칸마다 "슬래시" 가 읽혀 정작 경로가 안 읽힌다.
 */

afterEach(cleanup);

/** 라우터를 안 쓰는 테스트라 평범한 `<a>` 로 대신한다. */
const Link = ({ to, ...props }: { to: string; children?: React.ReactNode }) => <a href={to} {...props} />;

const PATH = (
  <>
    <TxBreadcrumb.Item as={Link} to="/">
      홈
    </TxBreadcrumb.Item>
    <TxBreadcrumb.Item as={Link} to="/orders">
      주문
    </TxBreadcrumb.Item>
    <TxBreadcrumb.Item>8213</TxBreadcrumb.Item>
  </>
);

describe("TxBreadcrumb — 무엇으로 읽히나", () => {
  /** 순서가 뜻을 갖는 목록이라 `<ul>` 이 아니다. */
  it("nav 안의 ol 이다", () => {
    const { container } = render(<TxBreadcrumb>{PATH}</TxBreadcrumb>);

    const nav = screen.getByRole("navigation", { name: "경로" });
    expect(nav.tagName).toBe("NAV");
    expect(container.querySelector("ol")).toBeTruthy();
    expect(container.querySelectorAll("li")).toHaveLength(3);
  });

  it("이름을 바꿀 수 있다", () => {
    render(<TxBreadcrumb label="현재 위치">{PATH}</TxBreadcrumb>);
    expect(screen.getByRole("navigation", { name: "현재 위치" })).toBeTruthy();
  });

  /** 칸마다 "슬래시" 가 읽히면 정작 경로가 안 읽힌다. */
  it("가르는 표시는 읽히지 않는다", () => {
    const { container } = render(<TxBreadcrumb>{PATH}</TxBreadcrumb>);

    const separators = container.querySelectorAll(".tx-breadcrumb__separator");
    expect(separators).toHaveLength(2);
    expect([...separators].every((node) => node.getAttribute("aria-hidden") === "true")).toBe(true);
  });

  it("첫 칸 앞에는 가를 것이 없다", () => {
    const { container } = render(<TxBreadcrumb>{PATH}</TxBreadcrumb>);
    expect(container.querySelectorAll("li")[0].querySelector(".tx-breadcrumb__separator")).toBeNull();
  });
});

describe("TxBreadcrumb — 마지막 칸", () => {
  it("지금 자리로 알린다", () => {
    render(<TxBreadcrumb>{PATH}</TxBreadcrumb>);
    expect(screen.getByText("8213").getAttribute("aria-current")).toBe("page");
  });

  it("앞의 칸에는 그 표시가 없다", () => {
    render(<TxBreadcrumb>{PATH}</TxBreadcrumb>);
    expect(screen.getByText("주문").hasAttribute("aria-current")).toBe(false);
  });

  /** 지금 있는 자리를 다시 누르게 두면 어디로 가는지 알 수 없다. */
  it("as 로 링크를 줘도 마지막은 링크가 아니다", () => {
    render(
      <TxBreadcrumb>
        <TxBreadcrumb.Item as={Link} to="/">
          홈
        </TxBreadcrumb.Item>
        <TxBreadcrumb.Item as={Link} to="/orders">
          주문
        </TxBreadcrumb.Item>
      </TxBreadcrumb>
    );

    expect(screen.getByText("홈").tagName).toBe("A");
    expect(screen.getByText("주문").tagName).toBe("SPAN");
  });

  it("current 를 직접 줄 수도 있다", () => {
    render(
      <TxBreadcrumb>
        <TxBreadcrumb.Item current>지금</TxBreadcrumb.Item>
        <TxBreadcrumb.Item as={Link} to="/next">
          다음
        </TxBreadcrumb.Item>
      </TxBreadcrumb>
    );

    expect(screen.getByText("지금").getAttribute("aria-current")).toBe("page");
  });
});

describe("TxBreadcrumb — 라우터를 알지 못한다", () => {
  it("as 로 링크 컴포넌트를 갈아끼운다", () => {
    render(<TxBreadcrumb>{PATH}</TxBreadcrumb>);

    const home = screen.getByText("홈");
    expect(home.tagName).toBe("A");
    expect(home.getAttribute("href")).toBe("/");
  });

  it("react-router 를 import 하지 않는다", () => {
    const here = import.meta.dirname;

    for (const file of ["TxBreadcrumb.tsx", "TxBreadcrumbItem.tsx", "TxBreadcrumb.types.ts"]) {
      expect(readFileSync(join(here, file), "utf8"), file).not.toMatch(/from\s+["']react-router/);
    }
  });

  /** 데이터는 route-meta 가 만들지만 ui 는 그 패키지를 모른다. 모양만 맞춘다. */
  it("route-meta 를 import 하지 않는다", () => {
    const here = import.meta.dirname;

    for (const file of ["TxBreadcrumb.tsx", "TxBreadcrumbItem.tsx", "TxBreadcrumb.types.ts"]) {
      expect(readFileSync(join(here, file), "utf8"), file).not.toMatch(/from\s+["']@txstack\/route-meta/);
    }
  });
});

/**
 * 칸이 다른 데서 만들어져 오면(`useBreadcrumbs`) `items` 로 넘긴다. **손으로 적은 것과 같은 것을 그려야 한다** —
 * 마지막 칸 · 접기 · 가름표가 두 모양에서 갈리면 안 된다.
 */
describe("TxBreadcrumb — items", () => {
  const ITEMS = [
    { key: "home", label: "홈", path: "/" },
    { key: "orders", label: "주문", path: "/orders" },
    { key: "order", label: "8213", path: "/orders/8213" }
  ];

  it("손으로 적은 것과 같은 DOM 을 그린다", () => {
    const byHand = render(<TxBreadcrumb>{PATH}</TxBreadcrumb>).container.innerHTML;
    cleanup();
    const byData = render(<TxBreadcrumb items={[ITEMS[0], ITEMS[1], { label: "8213" }]} itemAs={Link} />).container.innerHTML;

    expect(byData).toBe(byHand);
  });

  it("기본은 a 이고 href 로 건다", () => {
    render(<TxBreadcrumb items={ITEMS} />);

    const orders = screen.getByText("주문");
    expect(orders.tagName).toBe("A");
    expect(orders.getAttribute("href")).toBe("/orders");
  });

  it("컴포넌트를 주면 to 로 건다", () => {
    const seen: string[] = [];
    const Spy = ({ to, ...props }: { to: string; children?: React.ReactNode }) => {
      seen.push(to);
      return <a href={to} {...props} />;
    };
    render(<TxBreadcrumb items={ITEMS} itemAs={Spy} />);

    expect(seen).toEqual(["/", "/orders"]);
  });

  it("마지막 칸은 path 가 있어도 글자이고 지금 자리다", () => {
    render(<TxBreadcrumb items={ITEMS} />);

    const last = screen.getByText("8213");
    expect(last.tagName).toBe("SPAN");
    expect(last.getAttribute("aria-current")).toBe("page");
  });

  it("path 가 없는 칸은 글자다", () => {
    render(<TxBreadcrumb items={[{ label: "설정" }, ITEMS[2]]} />);
    expect(screen.getByText("설정").tagName).toBe("SPAN");
  });

  it("itemProps 가 기본을 이긴다", () => {
    const NextLink = ({ href, ...props }: { href: string; children?: React.ReactNode }) => <a data-next href={href} {...props} />;
    render(<TxBreadcrumb items={ITEMS} itemAs={NextLink} itemProps={(item) => ({ href: item.path })} />);

    expect(screen.getByText("주문").getAttribute("href")).toBe("/orders");
    expect(screen.getByText("주문").hasAttribute("data-next")).toBe(true);
  });

  it("current 를 직접 줄 수 있다", () => {
    render(<TxBreadcrumb items={[ITEMS[0], { ...ITEMS[1], current: true }, ITEMS[2]]} />);
    expect(screen.getByText("주문").getAttribute("aria-current")).toBe("page");
  });

  it("key 가 없어도 순번으로 그린다", () => {
    const { container } = render(<TxBreadcrumb items={[{ label: "가", path: "/a" }, { label: "나" }]} />);
    expect(container.querySelectorAll("li")).toHaveLength(2);
  });

  it("접기가 그대로 먹는다", () => {
    const many = ["가", "나", "다", "라", "마"].map((label) => ({ key: label, label, path: `/${label}` }));
    const { container } = render(<TxBreadcrumb items={many} maxItems={3} />);

    expect([...container.querySelectorAll("li")].map((li) => li.textContent?.trim())).toEqual(["가", "…", "라", "마"]);
    expect(screen.getByText("마").getAttribute("aria-current")).toBe("page");
  });

  /** 둘 다 주면 어느 쪽이 그려지는지 알 수 없다. `tsc` 가 지킨다. */
  it("children 과 함께 줄 수 없다 (타입)", () => {
    // @ts-expect-error — items 와 children 은 하나만
    const both: TxBreadcrumbProps = { items: ITEMS, children: "x" };
    expect(both).toBeTruthy();
  });

  it("빈 배열이면 칸이 없다 — 매칭이 없는 주소", () => {
    const { container } = render(<TxBreadcrumb items={[]} />);
    expect(container.querySelectorAll("li")).toHaveLength(0);
  });

  it("items · itemAs · itemProps 는 nav 에 새지 않는다", () => {
    render(<TxBreadcrumb items={ITEMS} itemAs={Link} />);
    const nav = screen.getByRole("navigation");

    expect(nav.hasAttribute("items")).toBe(false);
    expect(nav.hasAttribute("itemas")).toBe(false);
  });
});

/**
 * `Children.toArray` 는 조각(`<>…</>`)을 한 개로 센다. 그대로 두면 **경로 전체가
 * 한 칸이 되어** 가름표도 안 생기고 "지금 자리" 도 엉뚱한 데 붙는다.
 */
describe("TxBreadcrumb — 조각으로 묶어도 한 칸씩 센다", () => {
  it("조각 안의 칸을 펴낸다", () => {
    const { container } = render(
      <TxBreadcrumb>
        <>
          <TxBreadcrumb.Item as={Link} to="/">
            홈
          </TxBreadcrumb.Item>
          <TxBreadcrumb.Item>주문</TxBreadcrumb.Item>
        </>
      </TxBreadcrumb>
    );

    expect(container.querySelectorAll("li")).toHaveLength(2);
    expect(screen.getByText("주문").getAttribute("aria-current")).toBe("page");
  });

  it("map 으로 만든 것도 센다", () => {
    const { container } = render(
      <TxBreadcrumb>
        {["가", "나", "다"].map((name) => (
          <TxBreadcrumb.Item key={name}>{name}</TxBreadcrumb.Item>
        ))}
      </TxBreadcrumb>
    );

    expect(container.querySelectorAll("li")).toHaveLength(3);
  });

  it("조건부로 빠진 칸은 세지 않는다", () => {
    const show = false as boolean;
    const { container } = render(
      <TxBreadcrumb>
        <TxBreadcrumb.Item>가</TxBreadcrumb.Item>
        {show && <TxBreadcrumb.Item>안 보임</TxBreadcrumb.Item>}
        <TxBreadcrumb.Item>나</TxBreadcrumb.Item>
      </TxBreadcrumb>
    );

    expect(container.querySelectorAll("li")).toHaveLength(2);
  });
});

describe("TxBreadcrumb — 접기", () => {
  const LONG = (
    <>
      <TxBreadcrumb.Item as={Link} to="/">
        홈
      </TxBreadcrumb.Item>
      <TxBreadcrumb.Item as={Link} to="/a">
        가
      </TxBreadcrumb.Item>
      <TxBreadcrumb.Item as={Link} to="/b">
        나
      </TxBreadcrumb.Item>
      <TxBreadcrumb.Item as={Link} to="/c">
        다
      </TxBreadcrumb.Item>
      <TxBreadcrumb.Item>라</TxBreadcrumb.Item>
    </>
  );

  it("기본은 접지 않는다", () => {
    const { container } = render(<TxBreadcrumb>{LONG}</TxBreadcrumb>);
    expect(container.querySelectorAll("li")).toHaveLength(5);
  });

  /** 어디서 왔고 지금 어디인지가 경로의 요점이다. */
  it("maxItems 를 넘으면 가운데를 접는다", () => {
    render(<TxBreadcrumb maxItems={3}>{LONG}</TxBreadcrumb>);

    expect(screen.getByText("홈")).toBeTruthy();
    expect(screen.getByText("다")).toBeTruthy();
    expect(screen.getByText("라")).toBeTruthy();
    expect(screen.queryByText("가")).toBeNull();
    expect(screen.getByText("…")).toBeTruthy();
  });

  it("끝에서 몇 개를 남길지 정한다", () => {
    render(
      <TxBreadcrumb maxItems={3} itemsAfterCollapse={1}>
        {LONG}
      </TxBreadcrumb>
    );

    expect(screen.getByText("라")).toBeTruthy();
    expect(screen.queryByText("다")).toBeNull();
  });

  /** 접었어도 마지막은 늘 마지막이다. */
  it("접어도 마지막 칸은 지금 자리다", () => {
    render(<TxBreadcrumb maxItems={3}>{LONG}</TxBreadcrumb>);
    expect(screen.getByText("라").getAttribute("aria-current")).toBe("page");
  });

  it("접힌 표시는 읽히지 않는다", () => {
    const { container } = render(<TxBreadcrumb maxItems={3}>{LONG}</TxBreadcrumb>);
    expect(container.querySelector(".tx-breadcrumb__gap")?.getAttribute("aria-hidden")).toBe("true");
  });
});

describe("TxBreadcrumb — CSS 계약", () => {
  const here = import.meta.dirname;
  const strip = (text: string) => text.replace(/\/\*[\s\S]*?\*\//g, "");

  const css = strip(readFileSync(join(here, "TxBreadcrumb.css"), "utf8"));
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
    expect(styles).toContain('@import "./TxBreadcrumb/TxBreadcrumb.css" layer(tx);');
  });

  /** 글자로 넣으면 스크린리더가 칸마다 읽는다. */
  it("가르는 표시를 CSS 가 그린다", () => {
    expect(css).toMatch(/--tx-breadcrumb-separator:/);
    expect(css).toMatch(/\.tx-breadcrumb__separator:empty::before\s*\{[^}]*content:\s*var\(--tx-breadcrumb-separator\)/);
  });

  /** 누를 수 있는 것과 없는 것이 눈으로도 갈려야 한다. */
  it("링크일 때만 밑줄이 뜬다", () => {
    expect(css).toMatch(/a\.tx-breadcrumb__item:hover/);
  });
});
