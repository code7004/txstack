import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type CSSProperties, type ReactNode } from "react";
import { MemoryRouter, NavLink, Outlet, useRoutes } from "react-router-dom";
import { buildRouteObjects, getNavigableRoutes, useCurrentRouteNode, type CanAccess, type NavRoute, type RouteTree } from "@txstack/route-meta";
import { TxAppShell, TxButton, TxFlex, TxGrid, TxNavBar, TxSideNav } from "@txstack/ui";

/**
 * 화면 하나. 여기서는 이야기를 짧게 두려고 한 컴포넌트로 돌려쓴다 —
 * 실제 앱이라면 각 라우트가 자기 화면을 갖는다.
 */
const Page = ({ title, children }: { title: string; children?: ReactNode }) => (
  <section className="flex flex-col gap-2">
    <h1 className="text-lg font-semibold">{title}</h1>
    {children ?? <p className="text-slate-500 dark:text-slate-400">주소가 바뀐 것을 위 메뉴와 아래 브레드크럼이 함께 따라온다.</p>}
    <Outlet />
  </section>
);

/**
 * **단일 출처.** 라우터도 메뉴도 브레드크럼도 여기서만 나온다.
 *
 * `satisfies` 로 붙인다 — `routes.boards.children.notice.path` 가 에디터에서 정확히 뜬다.
 * 타입 주석(`const routes: RouteTree = …`)으로 붙이면 키가 `string` 으로 넓어져 자동완성이 죽는다.
 */
const routes = {
  dashboard: {
    path: "/",
    element: <Page title="대시보드" />,
    meta: { label: "대시보드", icon: "◧" }
  },
  boards: {
    path: "/boards",
    element: <Page title="게시판" />,
    meta: { label: "게시판", icon: "▤" },
    children: {
      notice: { path: "/boards/notice", element: <Page title="공지" />, meta: { label: "공지" } },
      qna: { path: "/boards/qna", element: <Page title="문의" />, meta: { label: "문의" } },
      // 메뉴에는 없지만 주소로는 열린다. 목록에서 버튼으로 들어가는 화면이다
      write: { path: "/boards/write", element: <Page title="글쓰기" />, meta: { label: "글쓰기", hidden: true } }
    }
  },
  members: {
    path: "/members",
    element: <Page title="회원" />,
    meta: { label: "회원", icon: "☺" },
    children: {
      list: { path: "/members/list", element: <Page title="회원 목록" />, meta: { label: "목록" } },
      grade: { path: "/members/grade", element: <Page title="등급" />, meta: { label: "등급" } }
    }
  },
  admin: {
    path: "/admin",
    element: <Page title="관리" />,
    meta: { label: "관리", icon: "⚙", permissions: ["admin"] }
  },
  legacy: {
    path: "/legacy",
    element: <Page title="옛 화면" />,
    enabled: false,
    meta: { label: "옛 화면" }
  }
} satisfies RouteTree;

/* --- 이어 붙이는 자리 — 이게 레시피의 전부다 -------------------------------------- */

/**
 * **`NavRoute` 하나가 `TxSideNav.Item` 하나다.** 자식도 같은 형태라 재귀가 한 갈래다.
 *
 * 자식을 가진 항목은 스스로 링크가 되지 않고 **펼치는 버튼**이 된다 — 부모의 화면도
 * 필요하면 트리에 index 자식을 두고 그것을 첫 칸으로 올린다.
 */
const sideItem = (item: NavRoute): ReactNode =>
  item.children ? (
    <TxSideNav.Item key={item.key} icon={item.meta?.icon} label={item.meta?.label ?? item.key} defaultOpen>
      {item.children.map(sideItem)}
    </TxSideNav.Item>
  ) : (
    <TxSideNav.Item key={item.key} icon={item.meta?.icon} label={item.meta?.label ?? item.key} as={NavLink} to={item.path} />
  );

/** 가로 줄은 **한 겹만** 펼친다 — 자식은 패널 안의 링크가 된다. */
const barItem = (item: NavRoute) => (
  <TxNavBar.Item
    key={item.key}
    label={item.meta?.label ?? item.key}
    as={NavLink}
    to={item.path}
    panel={
      item.children && (
        <TxGrid columns={1}>
          <section className="flex flex-col items-start gap-1">
            {item.children.map((child: NavRoute) => (
              <NavLink key={child.key} to={child.path} className="rounded px-1 py-0.5 hover:underline">
                {child.meta?.label ?? child.key}
              </NavLink>
            ))}
          </section>
        </TxGrid>
      )
    }
  />
);

/** 지금 어디인지. `useCurrentRouteNode` 가 매칭 사슬을 그대로 준다. */
const Crumbs = () => {
  const { matches, pathname } = useCurrentRouteNode(routes);

  return (
    <p className="text-sm text-slate-500 dark:text-slate-400">
      <code>{pathname}</code> — {matches.map((node) => node.meta?.label ?? "?").join(" › ") || "매칭 없음"}
    </p>
  );
};

/**
 * 트리에서 만든 라우터. `useRoutes` 는 `RouteObject[]` 를 그대로 받는다.
 * **모듈 상수로 둔다** — 렌더마다 새로 만들면 라우터가 매번 트리를 다시 읽는다.
 */
const ROUTE_OBJECTS = buildRouteObjects(routes);

const Screen = () => useRoutes(ROUTE_OBJECTS);

const frame: CSSProperties = { border: "1px solid var(--tx-color-border)", borderRadius: "var(--tx-radius)", overflow: "hidden" };

const meta = {
  title: "Recipes/RouteMeta",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: [
          "**트리 하나를 선언하고 라우터 · 메뉴 · 현재위치를 전부 거기서 뽑는다.**",
          "`@txstack/route-meta` 와 `@txstack/ui` 의 메뉴 부품을 이어 붙이는 자리다.",
          "",
          "```tsx",
          'import { buildRouteObjects, getNavigableRoutes, type NavRoute } from "@txstack/route-meta";',
          'import { TxSideNav } from "@txstack/ui";',
          "",
          "const item = (n: NavRoute) => (",
          "  <TxSideNav.Item key={n.key} icon={n.meta?.icon} label={n.meta?.label ?? n.key} as={NavLink} to={n.path}>",
          "    {n.children?.map(item)}",
          "  </TxSideNav.Item>",
          ");",
          "",
          "<TxSideNav>{getNavigableRoutes(routes, canAccess).map(item)}</TxSideNav>",
          "```",
          "",
          "### 두 패키지는 서로를 모른다",
          "",
          "`@txstack/ui` 는 `route-meta` 를 import 하지 않고 그 반대도 아니다. **이어 붙이는",
          "코드는 소비자 몫**이고, 그래서 이 이야기들은 패키지가 아니라 **이 카탈로그 앱 안**에 있다.",
          "부품 쪽은 `as={NavLink}` 하나만 열어 두면 되고, 라우터를 알 필요가 없다.",
          "",
          "### 두 계층의 필터가 다르다",
          "",
          "`hidden` 인 라우트는 **메뉴에서만 빠진다** — 주소로는 열린다(`/boards/write`).",
          "`enabled: false` 는 둘 다에서 빠지고, `permissions` 는 `canAccess` 가 판정한다.",
          "`Permissions` 이야기에서 스위치를 눌러 보라.",
          "",
          "### 주소는 진짜로 바뀐다",
          "",
          "`MemoryRouter` 라 카탈로그를 벗어나지 않을 뿐, `useRoutes` 와 `NavLink` 는 앱에서와",
          "똑같이 돈다. **지금 있는 자리 표시(`aria-current`)는 `NavLink` 가 붙인다** —",
          "부품이 따로 `active` prop 을 받지 않는 이유다."
        ].join("\n")
      }
    }
  }
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** **세로 줄.** 트리의 계층이 그대로 하위메뉴가 된다. `/boards/write` 는 메뉴에 없다. */
export const SideNav: Story = {
  render: () => (
    <MemoryRouter initialEntries={["/"]}>
      <div style={frame}>
        <TxAppShell
          header={<strong className="px-1">IDK</strong>}
          breakpoint={360}
          left={<TxSideNav>{getNavigableRoutes(routes).map(sideItem)}</TxSideNav>}
          style={{ minBlockSize: "30rem", "--tx-app-shell-left-width": "fit-content" } as CSSProperties}
        >
          <TxFlex className="flex-col gap-4">
            <Screen />
            <Crumbs />
          </TxFlex>
        </TxAppShell>
      </div>
    </MemoryRouter>
  )
};

/** **가로 줄.** 자식이 있는 항목은 패널에 그 자식들을 편다. */
export const NavBar: Story = {
  render: () => (
    <MemoryRouter initialEntries={["/"]}>
      <div style={frame}>
        <TxAppShell header={<strong className="px-1">IDK</strong>} breakpoint={360} top={<TxNavBar>{getNavigableRoutes(routes).map(barItem)}</TxNavBar>} style={{ minBlockSize: "26rem" }}>
          <TxFlex className="flex-col gap-4">
            <Screen />
            <Crumbs />
          </TxFlex>
        </TxAppShell>
      </div>
    </MemoryRouter>
  )
};

/**
 * **권한은 판정 함수가 정한다.** 스위치를 누르면 `관리` 가 나타나고 사라진다 —
 * 트리는 그대로다. `canAccess` 는 `permissions` 가 걸린 노드에만 불린다.
 */
export const Permissions: Story = {
  render: function PermissionsStory() {
    const [admin, setAdmin] = useState(false);
    const canAccess: CanAccess = (permissions) => permissions.some((p) => (admin ? p === "admin" : false));
    const menu = getNavigableRoutes(routes, canAccess);

    return (
      <MemoryRouter initialEntries={["/"]}>
        <div style={frame}>
          <TxAppShell
            header={
              <TxFlex className="items-center px-1">
                <strong>IDK</strong>
                <TxButton label={admin ? "관리자로 보는 중" : "일반 사용자로 보는 중"} variant={admin ? "primary" : "ghost"} onClick={() => setAdmin((prev) => !prev)} />
              </TxFlex>
            }
            breakpoint={360}
            left={<TxSideNav>{menu.map(sideItem)}</TxSideNav>}
            style={{ minBlockSize: "30rem", "--tx-app-shell-left-width": "fit-content" } as CSSProperties}
          >
            <TxFlex className="flex-col gap-4">
              <Screen />
              <Crumbs />
              <p className="text-sm text-slate-500 dark:text-slate-400">
                메뉴에 오른 것: <code>{menu.map((item) => item.path).join(" · ")}</code>
              </p>
            </TxFlex>
          </TxAppShell>
        </div>
      </MemoryRouter>
    );
  }
};

/**
 * **메뉴에 없는 화면.** `/boards/write` 는 `hidden` 이라 메뉴에서 빠지지만 주소로는 열린다 —
 * 목록에서 버튼으로 들어가는 화면이 그렇다. 라우터와 메뉴의 필터 규칙이 다르다는 증거다.
 */
export const HiddenRoute: Story = {
  render: () => (
    <MemoryRouter initialEntries={["/boards/write"]}>
      <div style={frame}>
        <TxAppShell
          header={<strong className="px-1">IDK</strong>}
          breakpoint={360}
          left={<TxSideNav>{getNavigableRoutes(routes).map(sideItem)}</TxSideNav>}
          style={{ minBlockSize: "30rem", "--tx-app-shell-left-width": "fit-content" } as CSSProperties}
        >
          <TxFlex className="flex-col gap-4">
            <Screen />
            <Crumbs />
            <p className="text-sm text-slate-500 dark:text-slate-400">왼쪽 메뉴 어디에도 이 화면은 없다. 그래도 열려 있다.</p>
          </TxFlex>
        </TxAppShell>
      </div>
    </MemoryRouter>
  )
};
