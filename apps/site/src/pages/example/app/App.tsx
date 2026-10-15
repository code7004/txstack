import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouteRenderer, getNavigableRoutes, useCurrentRouteNode, type NavRoute } from "@txstack/route-meta";
import { TxAppShell, TxBreadcrumb, TxButton, TxSideNav } from "@txstack/ui";
import { TxAgGridProvider } from "@txstack/ui/aggrid";
import { AllCommunityModule, ModuleRegistry, colorSchemeDarkBlue, themeQuartz } from "ag-grid-community";
import { useEffect, useState, type ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { routes } from "./routes";

/*
 * 세 화면을 앱 하나로 묶는 자리. main.tsx 는 Getting Started 그대로입니다 —
 * `<BrowserRouter><App /></BrowserRouter>` 와 스타일시트(index.css) 한 줄.
 */

// 표(TxAgGrid)가 쓰는 ag-grid 모듈. 앱에서 한 번 등록합니다
ModuleRegistry.registerModules([AllCommunityModule]);

const queryClient = new QueryClient();

/**
 * 메뉴 한 칸. **자식이 있으면 펼치는 묶음, 없으면 링크입니다.** 자식도 같은 모양(NavRoute)이라
 * 이 함수 하나가 몇 단이든 그립니다.
 */
const menuItem = (item: NavRoute): ReactNode =>
  item.children ? (
    <TxSideNav.Item key={item.key} label={item.meta?.label ?? item.key} icon={item.meta?.icon} defaultOpen>
      {item.children.map(menuItem)}
    </TxSideNav.Item>
  ) : (
    <TxSideNav.Item key={item.key} label={item.meta?.label ?? item.key} icon={item.meta?.icon} as={NavLink} to={item.path} />
  );

type Role = "admin" | "viewer";

export function App() {
  // 지금 사용자의 역할. 실제 앱이라면 로그인 정보에서 옵니다
  const [role, setRole] = useState<Role>("admin");

  // 권한 판정은 앱이 정합니다. 라이브러리는 판정 함수만 받습니다 — 뷰어로 바꾸면 "관리" 묶음이 빠집니다
  const menu = getNavigableRoutes(routes, (permissions) => permissions.includes(role));

  // 지금 위치. matches 는 바깥 묶음부터 지금 화면까지의 사슬이라 그대로 경로 표시가 됩니다
  const { meta, matches } = useCurrentRouteNode(routes);
  const trail = matches.filter((node) => node.meta?.label);

  useEffect(() => {
    document.title = meta?.label ? `${meta.label} — 운영 관리` : "운영 관리";
  }, [meta]);

  // 다크 모드는 <html class="dark"> 하나로 켭니다. 표 안쪽은 ag-grid 테마가 그리므로 함께 바꿉니다
  const [dark, setDark] = useState(false);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <QueryClientProvider client={queryClient}>
      <TxAgGridProvider theme={dark ? themeQuartz.withPart(colorSchemeDarkBlue) : themeQuartz}>
        <TxAppShell
          header={
            <div className="flex w-full items-center gap-2">
              <span className="font-semibold">운영 관리</span>
              <TxButton label={role === "admin" ? "뷰어로 보기" : "관리자로 보기"} variant="ghost" className="ms-auto" onClick={() => setRole((prev) => (prev === "admin" ? "viewer" : "admin"))} />
              <TxButton icon label={dark ? "☀" : "☾"} aria-label={dark ? "밝게" : "어둡게"} variant="ghost" onClick={() => setDark((prev) => !prev)} />
            </div>
          }
          left={<TxSideNav className="p-3">{menu.map(menuItem)}</TxSideNav>}
        >
          <main className="flex flex-col gap-4 p-6">
            {meta?.label && (
              <header className="flex flex-col gap-1">
                <TxBreadcrumb>
                  {trail.map((node, index) =>
                    index < trail.length - 1 ? (
                      <TxBreadcrumb.Item key={node.path} as={NavLink} to={node.path!}>
                        {node.meta?.label}
                      </TxBreadcrumb.Item>
                    ) : (
                      <TxBreadcrumb.Item key={node.path}>{node.meta?.label}</TxBreadcrumb.Item>
                    )
                  )}
                </TxBreadcrumb>
                <h1 className="text-2xl font-semibold">{meta.label}</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">{meta.description}</p>
              </header>
            )}
            <RouteRenderer tree={routes} />
          </main>
        </TxAppShell>
      </TxAgGridProvider>
    </QueryClientProvider>
  );
}
