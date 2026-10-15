import { RouteRenderer, getNavigableRoutes, useCurrentRouteNode } from "@txstack/route-meta";
import { TxAgGridProvider } from "@txstack/ui/aggrid";
import { TxAppShell, TxButton, TxDropdown, TxSideNav } from "@txstack/ui";
import { colorSchemeDarkBlue, themeQuartz } from "ag-grid-community";
import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { routes } from "./routes";

type Role = "admin" | "viewer";

const ROLES: { name: string; value: Role }[] = [
  { name: "관리자", value: "admin" },
  { name: "뷰어", value: "viewer" }
];

/** 다크 모드는 `<html class="dark">` 하나로 켭니다. 처음에는 시스템 설정을 따릅니다 */
function useTheme() {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("txstack-demo-theme");
    return saved ? saved === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("txstack-demo-theme", dark ? "dark" : "light");
  }, [dark]);

  return { dark, toggle: () => setDark((prev) => !prev) };
}

export function App() {
  const { dark, toggle } = useTheme();

  /*
   * 지금 사용자의 역할. 실제 앱이라면 로그인 정보에서 옵니다. 여기서는 머리 줄에서 바꿔 볼 수 있게 했습니다 —
   * 뷰어로 바꾸면 `permissions: ["admin"]` 인 "계정" 이 메뉴에서 빠집니다.
   */
  const [role, setRole] = useState<Role>("admin");
  const menu = useMemo(() => getNavigableRoutes(routes, (permissions) => permissions.includes(role)), [role]);

  // 지금 화면의 이름과 설명도 라우트 트리에서 꺼냅니다
  const { meta } = useCurrentRouteNode(routes);

  useEffect(() => {
    document.title = meta?.label ? `${meta.label} — txstack demo` : "txstack demo";
  }, [meta]);

  return (
    // 표 안쪽 색은 ag-grid 테마가 그립니다. 앱의 다크 모드에 맞춰 테마를 바꿉니다
    <TxAgGridProvider theme={dark ? themeQuartz.withPart(colorSchemeDarkBlue) : themeQuartz}>
      <TxAppShell
        header={
          <div className="flex w-full items-center gap-2">
            <span className="font-mono font-semibold whitespace-nowrap">txstack demo</span>
            <div className="ms-auto flex items-center gap-2">
              <TxDropdown aria-label="역할" data={ROLES} value={role} onChangeText={(value) => setRole((value as Role) ?? "admin")} className="w-32" />
              <TxButton icon label={dark ? "☀" : "☾"} aria-label={dark ? "밝게" : "어둡게"} variant="ghost" onClick={toggle} />
            </div>
          </div>
        }
        left={
          <TxSideNav className="p-3">
            {menu.map((item) => (
              <TxSideNav.Item key={item.key} label={item.meta?.label ?? item.key} as={NavLink} to={item.path} />
            ))}
          </TxSideNav>
        }
        style={{ "--tx-app-shell-left-width": "12rem" } as React.CSSProperties}
      >
        <main className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-6 sm:px-6">
          {meta?.label && (
            <header className="flex flex-col gap-1">
              <h1 className="text-2xl font-semibold">{meta.label}</h1>
              {meta.description && <p className="text-sm text-slate-500 dark:text-slate-400">{meta.description}</p>}
            </header>
          )}
          <RouteRenderer tree={routes} />
        </main>
      </TxAppShell>
    </TxAgGridProvider>
  );
}
