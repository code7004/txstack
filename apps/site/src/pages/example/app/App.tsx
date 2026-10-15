import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouteRenderer, getNavigableRoutes, useCurrentRouteNode } from "@txstack/route-meta";
import { TxAppShell, TxButton, TxSideNav } from "@txstack/ui";
import { TxAgGridProvider } from "@txstack/ui/aggrid";
import { AllCommunityModule, ModuleRegistry, colorSchemeDarkBlue, themeQuartz } from "ag-grid-community";
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { routes } from "./routes";

/*
 * 세 화면을 앱 하나로 묶는 자리. main.tsx 는 Getting Started 그대로입니다 —
 * `<BrowserRouter><App /></BrowserRouter>` 와 스타일시트(index.css) 한 줄.
 */

// 표(TxAgGrid)가 쓰는 ag-grid 모듈. 앱에서 한 번 등록합니다
ModuleRegistry.registerModules([AllCommunityModule]);

const queryClient = new QueryClient();

// 지금 사용자의 역할. 실제 앱이라면 로그인 정보에서 옵니다 — "viewer" 로 바꾸면 "계정" 이 메뉴에서 빠집니다
const role = "admin";
const menu = getNavigableRoutes(routes, (permissions) => permissions.includes(role));

export function App() {
  // 다크 모드는 <html class="dark"> 하나로 켭니다. 표 안쪽은 ag-grid 테마가 그리므로 함께 바꿉니다
  const [dark, setDark] = useState(false);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  // 지금 화면의 이름과 설명도 라우트 트리에서 꺼냅니다
  const { meta } = useCurrentRouteNode(routes);

  return (
    <QueryClientProvider client={queryClient}>
      <TxAgGridProvider theme={dark ? themeQuartz.withPart(colorSchemeDarkBlue) : themeQuartz}>
        <TxAppShell
          header={
            <div className="flex w-full items-center">
              <span className="font-semibold">운영 관리</span>
              <TxButton icon label={dark ? "☀" : "☾"} aria-label={dark ? "밝게" : "어둡게"} variant="ghost" className="ms-auto" onClick={() => setDark((prev) => !prev)} />
            </div>
          }
          left={
            <TxSideNav className="p-3">
              {menu.map((item) => (
                <TxSideNav.Item key={item.key} label={item.meta?.label ?? item.key} as={NavLink} to={item.path} />
              ))}
            </TxSideNav>
          }
        >
          <main className="flex flex-col gap-4 p-6">
            {meta?.label && (
              <header>
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
