import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TxDropdown } from "../TxDropdown";
import { TxContextMenu } from "./TxContextMenu";
import { TxDropMenu } from "./TxDropMenu";

/**
 * 두 메뉴는 **여는 방법과 뜨는 자리**만 다르고 나머지는 같은 속(`TxMenuShell`)이 맡는다.
 * 그래서 항목·키보드·포커스는 **한 번만** 만들면 되고, 여기서는 그것이 정말 하나인지를 본다.
 *
 * 원본 둘은 `role="menu"` 도 화살표 이동도 포커스 관리도 없었고,
 * `react-router` 의 `NavLink` 를 직접 import 해서 다른 라우터를 쓰는 소비자는 쓸 수 없었다.
 */

afterEach(cleanup);

const MENU = (
  <>
    <TxDropMenu.Item onClick={() => {}}>첫째</TxDropMenu.Item>
    <TxDropMenu.Divider />
    <TxDropMenu.Item onClick={() => {}}>둘째</TxDropMenu.Item>
    <TxDropMenu.Item onClick={() => {}}>셋째</TxDropMenu.Item>
  </>
);

const openDropMenu = async () => {
  fireEvent.click(screen.getByRole("button", { name: "메뉴" }));
  return screen.findByRole("menu");
};

describe("TxDropMenu — 여닫기", () => {
  it("트리거를 누르면 열린다", async () => {
    render(<TxDropMenu menu={MENU}>메뉴</TxDropMenu>);

    expect(screen.queryByRole("menu")).toBeNull();
    expect(await openDropMenu()).toBeTruthy();
  });

  it("다시 누르면 닫힌다", async () => {
    render(<TxDropMenu menu={MENU}>메뉴</TxDropMenu>);
    await openDropMenu();

    fireEvent.click(screen.getByRole("button", { name: "메뉴" }));
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
  });

  it("항목을 누르면 닫힌다", async () => {
    const onClick = vi.fn();
    render(<TxDropMenu menu={<TxDropMenu.Item onClick={onClick}>로그아웃</TxDropMenu.Item>}>메뉴</TxDropMenu>);
    await openDropMenu();

    fireEvent.click(screen.getByRole("menuitem", { name: "로그아웃" }));

    expect(onClick).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
  });

  /** 메뉴 안에서 값을 고르는 줄이 있다. 고를 때마다 닫히면 못 쓴다. */
  it("keepOpen 을 준 항목은 닫지 않는다", async () => {
    render(<TxDropMenu menu={<TxDropMenu.Item keepOpen>테마</TxDropMenu.Item>}>메뉴</TxDropMenu>);
    await openDropMenu();

    fireEvent.click(screen.getByRole("menuitem", { name: "테마" }));
    expect(screen.getByRole("menu")).toBeTruthy();
  });

  it("열림이 바뀔 때 알려 준다", async () => {
    const onOpenChange = vi.fn();
    render(
      <TxDropMenu menu={MENU} onOpenChange={onOpenChange}>
        메뉴
      </TxDropMenu>
    );

    await openDropMenu();
    expect(onOpenChange).toHaveBeenLastCalledWith(true);

    fireEvent.keyDown(screen.getByRole("menu"), { key: "Tab" });
    await waitFor(() => expect(onOpenChange).toHaveBeenLastCalledWith(false));
  });

  /** hover 로 여는 메뉴도 눌러서 열려야 한다 — 터치에는 hover 가 없다. */
  it("hover 메뉴도 눌러서 열린다", async () => {
    render(
      <TxDropMenu menu={MENU} trigger="hover">
        메뉴
      </TxDropMenu>
    );

    expect(await openDropMenu()).toBeTruthy();
  });
});

describe("TxDropMenu — 키보드와 포커스", () => {
  /** 메뉴는 열면 안으로 들어가는 것이 규약이다. 원본은 포커스를 옮기지 않았다. */
  it("열면 첫 줄로 포커스가 들어간다", async () => {
    render(<TxDropMenu menu={MENU}>메뉴</TxDropMenu>);
    await openDropMenu();

    await waitFor(() => expect(document.activeElement?.textContent).toBe("첫째"));
  });

  it("↓ 로도 열린다", async () => {
    render(<TxDropMenu menu={MENU}>메뉴</TxDropMenu>);

    fireEvent.keyDown(screen.getByRole("button", { name: "메뉴" }), { key: "ArrowDown" });
    expect(await screen.findByRole("menu")).toBeTruthy();
  });

  it("↑↓ 로 옮기고 양 끝에서 감긴다", async () => {
    render(<TxDropMenu menu={MENU}>메뉴</TxDropMenu>);
    const menu = await openDropMenu();
    await waitFor(() => expect(document.activeElement?.textContent).toBe("첫째"));

    fireEvent.keyDown(menu, { key: "ArrowDown" });
    expect(document.activeElement?.textContent).toBe("둘째");

    fireEvent.keyDown(menu, { key: "ArrowUp" });
    fireEvent.keyDown(menu, { key: "ArrowUp" });
    expect(document.activeElement?.textContent).toBe("셋째");
  });

  it("Home·End 로 양 끝에 간다", async () => {
    render(<TxDropMenu menu={MENU}>메뉴</TxDropMenu>);
    const menu = await openDropMenu();

    fireEvent.keyDown(menu, { key: "End" });
    expect(document.activeElement?.textContent).toBe("셋째");

    fireEvent.keyDown(menu, { key: "Home" });
    expect(document.activeElement?.textContent).toBe("첫째");
  });

  /**
   * 되돌리지 않으면 닫은 뒤 포커스가 `<body>` 로 떨어진다.
   * 키보드만 쓰는 사람은 처음부터 Tab 을 다시 눌러야 한다.
   */
  it("닫으면 포커스가 트리거로 돌아온다", async () => {
    render(<TxDropMenu menu={MENU}>메뉴</TxDropMenu>);
    const menu = await openDropMenu();
    await waitFor(() => expect(document.activeElement?.textContent).toBe("첫째"));

    fireEvent.keyDown(menu, { key: "Escape" });

    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole("button", { name: "메뉴" })));
  });

  /** 메뉴에서 Tab 은 빠져나가는 것이 아니라 닫는 것이다. */
  it("Tab 은 메뉴를 닫는다", async () => {
    render(<TxDropMenu menu={MENU}>메뉴</TxDropMenu>);
    const menu = await openDropMenu();

    fireEvent.keyDown(menu, { key: "Tab" });
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
  });

  /** 줄마다 탭 정거장을 만들면 열 줄에 Tab 을 열 번 눌러야 한다. */
  it("줄은 탭 순서에 들어가지 않는다", async () => {
    render(<TxDropMenu menu={MENU}>메뉴</TxDropMenu>);
    await openDropMenu();

    expect(screen.getAllByRole("menuitem").map((item) => (item as HTMLElement).tabIndex)).toEqual([-1, -1, -1]);
  });
});

describe("TxContextMenu — 오른쪽 버튼", () => {
  const CTX = (
    <>
      <TxContextMenu.Item onClick={() => {}}>복사</TxContextMenu.Item>
      <TxContextMenu.Item onClick={() => {}}>삭제</TxContextMenu.Item>
    </>
  );

  it("오른쪽 버튼으로 열린다", async () => {
    const { container } = render(<TxContextMenu menu={CTX}>대상</TxContextMenu>);

    expect(screen.queryByRole("menu")).toBeNull();
    fireEvent.contextMenu(container.querySelector('[data-tag="TxContextMenu"]')!);

    expect(await screen.findByRole("menu")).toBeTruthy();
  });

  /** 막지 않으면 브라우저 기본 메뉴가 우리 것 위에 겹쳐 뜬다. */
  it("브라우저 기본 메뉴를 막는다", () => {
    const { container } = render(<TxContextMenu menu={CTX}>대상</TxContextMenu>);

    const prevented = !fireEvent.contextMenu(container.querySelector('[data-tag="TxContextMenu"]')!);
    expect(prevented).toBe(true);
  });

  it("왼쪽 클릭으로는 안 열린다 — 기본은 오른쪽이다", () => {
    const { container } = render(<TxContextMenu menu={CTX}>대상</TxContextMenu>);

    fireEvent.click(container.querySelector('[data-tag="TxContextMenu"]')!);
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("both 면 왼쪽으로도 열린다 — 터치를 함께 받는 자리", async () => {
    const { container } = render(
      <TxContextMenu menu={CTX} button="both">
        대상
      </TxContextMenu>
    );

    fireEvent.click(container.querySelector('[data-tag="TxContextMenu"]')!);
    expect(await screen.findByRole("menu")).toBeTruthy();
  });

  it("감싼 것이 그대로 나온다 — 큰 것도 children 이다", () => {
    render(
      <TxContextMenu menu={CTX}>
        <table>
          <tbody>
            <tr>
              <td>표 한 칸</td>
            </tr>
          </tbody>
        </table>
      </TxContextMenu>
    );

    expect(screen.getByText("표 한 칸")).toBeTruthy();
  });
});

describe("두 메뉴가 같은 속을 쓴다", () => {
  /** 항목이 같은 부품이라 스타일도 키보드도 갈릴 자리가 없다. */
  it("Item 과 Divider 가 같은 컴포넌트다", () => {
    expect(TxDropMenu.Item).toBe(TxContextMenu.Item);
    expect(TxDropMenu.Divider).toBe(TxContextMenu.Divider);
  });

  it("둘 다 role=menu 와 menuitem 으로 그린다", async () => {
    const { container, unmount } = render(<TxDropMenu menu={MENU}>메뉴</TxDropMenu>);
    await openDropMenu();
    expect(screen.getAllByRole("menuitem")).toHaveLength(3);
    unmount();

    render(<TxContextMenu menu={MENU}>대상</TxContextMenu>);
    fireEvent.contextMenu(document.querySelector('[data-tag="TxContextMenu"]')!);
    await screen.findByRole("menu");
    expect(screen.getAllByRole("menuitem")).toHaveLength(3);

    expect(container).toBeTruthy();
  });

  it("둘 다 화살표로 옮긴다", async () => {
    render(<TxContextMenu menu={MENU}>대상</TxContextMenu>);
    fireEvent.contextMenu(document.querySelector('[data-tag="TxContextMenu"]')!);

    const menu = await screen.findByRole("menu");
    await waitFor(() => expect(document.activeElement?.textContent).toBe("첫째"));

    fireEvent.keyDown(menu, { key: "ArrowDown" });
    expect(document.activeElement?.textContent).toBe("둘째");
  });
});

describe("TxMenu.Item — 링크를 주입한다", () => {
  /**
   * 원본은 `react-router-dom` 의 `NavLink` 를 직접 import 했다. 그래서 루트 배럴이
   * 라우터를 끌어왔고, 다른 라우터를 쓰는 소비자는 이 컴포넌트를 쓸 수 없었다.
   */
  it("기본은 button 이다", async () => {
    render(<TxDropMenu menu={<TxDropMenu.Item>보통 줄</TxDropMenu.Item>}>메뉴</TxDropMenu>);
    await openDropMenu();

    expect(screen.getByRole("menuitem", { name: "보통 줄" }).tagName).toBe("BUTTON");
  });

  it("as 로 링크 컴포넌트를 갈아끼운다", async () => {
    const MyLink = ({ to, children, ...props }: { to: string; children?: React.ReactNode }) => (
      <a href={to} {...props}>
        {children}
      </a>
    );

    render(
      <TxDropMenu
        menu={
          <TxDropMenu.Item as={MyLink} to="/settings">
            설정
          </TxDropMenu.Item>
        }
      >
        메뉴
      </TxDropMenu>
    );
    await openDropMenu();

    const item = screen.getByRole("menuitem", { name: "설정" });
    expect(item.tagName).toBe("A");
    expect(item.getAttribute("href")).toBe("/settings");
  });

  it("라우터를 import 하지 않는다", () => {
    const dir = import.meta.dirname;
    for (const file of ["TxMenuItem.tsx", "TxMenuShell.tsx", "TxDropMenu.tsx", "TxContextMenu.tsx"]) {
      // 주석에 이름이 나오는 것은 괜찮다. 실제 import 만 본다
      expect(readFileSync(join(dir, file), "utf8"), file).not.toMatch(/from\s+["']react-router/);
    }
  });
});

/**
 * 메뉴 안에 드롭다운을 하나 놓으면 **팝업이 팝업 위에 겹친다.** 겹친 둘이 서로를
 * "바깥" 으로 보면 값을 고르는 순간 메뉴가 닫혀서 그 조합을 아예 쓸 수 없다.
 */
describe("TxMenu — 안에 든 팝업", () => {
  const openWithDropdown = async () => {
    render(
      <TxDropMenu
        menu={
          <>
            <div role="group">
              <TxDropdown data={["하나", "둘"]} aria-label="고르기" />
            </div>
            <TxDropMenu.Item onClick={() => {}}>첫째</TxDropMenu.Item>
          </>
        }
      >
        메뉴
      </TxDropMenu>
    );

    await openDropMenu();
    fireEvent.click(screen.getByRole("combobox", { name: "고르기" }));
    return screen.findByRole("listbox");
  };

  it("겹쳐 뜬 목록에서 값을 골라도 메뉴는 열려 있다", async () => {
    await openWithDropdown();

    fireEvent.pointerDown(screen.getByRole("option", { name: "둘" }));
    fireEvent.click(screen.getByRole("option", { name: "둘" }));

    await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
    expect(screen.getByRole("menu")).toBeTruthy();
  });

  it("Escape 는 위에 있는 것부터 하나씩 닫는다", async () => {
    await openWithDropdown();

    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
    expect(screen.getByRole("menu")).toBeTruthy();

    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
  });

  /** 화살표가 건너뛰면 키보드로는 그 컨트롤에 닿을 길이 없다. */
  it("화살표가 항목이 아닌 컨트롤에도 닿는다", async () => {
    render(
      <TxDropMenu
        menu={
          <>
            <div role="group">
              <TxDropdown data={["하나"]} aria-label="고르기" />
            </div>
            <TxDropMenu.Item onClick={() => {}}>첫째</TxDropMenu.Item>
          </>
        }
      >
        메뉴
      </TxDropMenu>
    );

    const menu = await openDropMenu();
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole("combobox", { name: "고르기" })));

    fireEvent.keyDown(menu, { key: "ArrowDown" });
    expect(document.activeElement?.textContent).toBe("첫째");
  });
});

describe("TxMenu — CSS 계약", () => {
  const here = import.meta.dirname;
  const strip = (text: string) => text.replace(/\/\*[\s\S]*?\*\//g, "");

  const css = strip(readFileSync(join(here, "TxMenu.css"), "utf8"));
  const tokens = strip(readFileSync(join(here, "..", "tokens.css"), "utf8"));
  const styles = readFileSync(join(here, "..", "styles.css"), "utf8");

  it("색을 하드코딩하지 않는다", () => {
    expect(css.match(/#[0-9a-fA-F]{3,8}\b|\brgba?\([^)]*\)/g) ?? []).toEqual([]);
  });

  it(".dark 분기를 갖지 않는다", () => {
    expect(css).not.toContain(".dark");
  });

  it("참조하는 전역 토큰이 전부 tokens.css 에 정의돼 있다", () => {
    const referenced = new Set([...css.matchAll(/var\(\s*(--tx-(?:color|state|radius|focus)[\w-]*)/g)].map((match) => match[1]));
    expect([...referenced].filter((name) => !tokens.includes(`${name}:`))).toEqual([]);
  });

  it("styles.css 에 실려 나간다", () => {
    expect(styles).toContain('@import "./TxMenu/TxMenu.css" layer(tx);');
  });

  /** 속이 하나이므로 겉모습도 하나다. 두 메뉴가 각자 클래스를 갖지 않는다. */
  it("두 메뉴가 같은 항목 클래스를 쓴다", () => {
    expect(css).toContain(".tx-menu__item");
    expect(css).not.toContain(".tx-drop-menu__item");
    expect(css).not.toContain(".tx-context-menu__item");
  });

  /** 쌓임 순서는 TxPopup 이 정한다. 원본은 각자 z-index 를 박아 두었다. */
  it("z-index 를 스스로 정하지 않는다", () => {
    expect(css).not.toContain("z-index");
  });
});
