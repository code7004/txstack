import { buildRouteObjects, getNavigableRoutes, useCurrentRouteNode, type NavRoute } from "@txstack/route-meta";
import { useEffect, useState, type ReactNode } from "react";
import { NavLink, useRoutes } from "react-router-dom";
import { TxAppShell, TxButton, TxNavBar, TxSideNav } from "@txstack/ui";
import { SiteFooter } from "./pages/SiteFooter";
import { routes } from "./routes";

/**
 * **모듈 상수로 둔다.** 렌더마다 다시 만들면 라우터가 매번 트리를 읽고,
 * `useCurrentRouteNode` 의 반환도 매번 새 객체가 된다.
 */
const ROUTE_OBJECTS = buildRouteObjects(routes);
const MENU = getNavigableRoutes(routes);

const STORAGE_KEY = "txstack-site-theme";

/** 다크모드는 `<html class="dark">` 토글이다. 어느 시점에 켤지는 앱이 정한다. */
function useTheme() {
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return false;

    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved ? saved === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    window.localStorage.setItem(STORAGE_KEY, dark ? "dark" : "light");
  }, [dark]);

  return { dark, toggle: () => setDark((prev) => !prev) };
}

/** 가로 줄 한 칸. 자식이 있으면 그 자식들이 패널의 링크가 된다. */
/**
 * 가로 줄 한 칸. **제목은 링크이고 `▾` 버튼이 패널을 연다** — 그래서 `Documents` 를 눌러도
 * 그 묶음의 인덱스 화면으로 간다. 자식이 없으면 그냥 링크다.
 */
const barItem = (item: NavRoute) => (
  <TxNavBar.Item
    key={item.key}
    label={item.meta?.label ?? item.key}
    as={NavLink}
    to={item.path}
    toggleLabel="하위 메뉴"
    panel={
      item.children && (
        <div className="flex flex-col items-start gap-1">
          {item.children.map((child) => (
            <NavLink key={child.key} to={child.path} className="rounded px-1 py-0.5 hover:underline">
              {child.meta?.label ?? child.key}
            </NavLink>
          ))}
        </div>
      )
    }
  />
);

/**
 * 왼쪽 줄 한 칸. **자식이 있으면 펼치는 항목**이 된다 — `Documents › Guide › Tokens` 처럼
 * 세 단까지 간다. 자식을 가진 항목은 스스로 링크가 되지 않으므로, 그 화면으로 가는 길은
 * 가로 줄의 패널이 맡는다.
 */
const sideItem = (item: NavRoute): ReactNode =>
  item.children ? (
    <TxSideNav.Item key={item.key} label={item.meta?.label ?? item.key} defaultOpen>
      {item.children.map(sideItem)}
    </TxSideNav.Item>
  ) : (
    <TxSideNav.Item key={item.key} label={item.meta?.label ?? item.key} as={NavLink} to={item.path} />
  );

/** 지금 있는 자리의 하위 항목. 없으면 왼쪽 줄을 세우지 않는다. */
function useSubMenu(): NavRoute[] | undefined {
  const { matches } = useCurrentRouteNode(routes);
  const top = matches[0];

  return MENU.find((item) => item.path === top?.path)?.children;
}

function Layout({ children }: { children: ReactNode }) {
  const { dark, toggle } = useTheme();
  const sub = useSubMenu();

  return (
    <TxAppShell
      header={
        <div className="flex w-full items-center gap-3">
          {/* 이름은 모노스페이스로 — 도구라는 신호가 여기서 먼저 온다 */}
          <NavLink to="/" className="font-mono text-base font-semibold tracking-tight">
            txstack
          </NavLink>

          <div className="ms-auto flex items-center gap-1">
            <a href="https://github.com/code7004/txstack" className="rounded px-3 py-2 text-sm hover:underline" target="_blank" rel="noreferrer">
              GitHub
            </a>
            {/* 아이콘 하나로 줄여 헤더가 붐비지 않게 한다. 이름은 스크린리더가 읽는다 */}
            <TxButton label={dark ? "☀" : "☾"} aria-label={dark ? "밝게" : "어둡게"} variant="ghost" onClick={toggle} />
          </div>
        </div>
      }
      top={<TxNavBar>{MENU.map(barItem)}</TxNavBar>}
      /* 하위 항목이 있는 섹션에서만 왼쪽 줄이 선다 — 없는 화면에서 빈 기둥이 남지 않는다 */
      left={
        sub && (
          /* 셸의 `left` 는 여백을 정하지 않는다 — 무엇이 들어올지 모르기 때문이다. 여기서 준다 */
          <TxSideNav className="p-3">{sub.map(sideItem)}</TxSideNav>
        )
      }
      /* 맨 아래 줄. 셸이 자리와 경계선을 주고, 안의 배치는 사이트가 정한다 */
      footer={<SiteFooter />}
      style={{ "--tx-app-shell-left-width": "13rem" } as React.CSSProperties}
    >
      <div className="px-6 py-8">{children}</div>
    </TxAppShell>
  );
}

export function App() {
  const screen = useRoutes(ROUTE_OBJECTS);

  return <Layout>{screen}</Layout>;
}
