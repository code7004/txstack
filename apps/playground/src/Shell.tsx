import { getNavigableRoutes, useCurrentRouteNode } from "@txstack/route-meta";
import { TxButton, TxFlex } from "@txstack/ui";
import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { MenuRoutes } from "./menu";

/**
 * 좌측 메뉴는 하드코딩이 아니라 `getNavigableRoutes(MenuRoutes)` 의 결과다.
 * `enabled: false` 와 `meta.hidden: true` 인 라우트가 자동으로 빠지는지 확인할 수 있다.
 *
 * 하위 페이지에는 `Outlet context` 로 트리를 내려준다. import 로 넘기면 순환 참조가 된다.
 */
export const Shell = () => {
  const [isDark, _isDark] = useState(true);
  const { node } = useCurrentRouteNode(MenuRoutes);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  const menus = getNavigableRoutes(MenuRoutes);

  return (
    <div className="flex min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <aside className="w-56 shrink-0 border-r border-slate-200 p-3 dark:border-slate-800">
        {/* 홈은 index 라우트라 getNavigableRoutes 결과에 들어가지 않는다. 로고를 홈 링크로 쓴다. */}
        <NavLink to="/" className="block px-2 pb-3">
          <div className="text-base font-bold">txstack</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">playground</div>
        </NavLink>

        <nav className="flex flex-col gap-0.5">
          {menus.map((menu) => (
            <NavLink
              key={menu.path}
              to={menu.path ?? "/"}
              end
              className={({ isActive }) => `rounded px-2 py-1.5 text-sm transition-colors ${isActive ? "bg-blue-500 text-white" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"}`}
            >
              {menu.meta?.label ?? menu.path}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="flex-1 overflow-x-hidden">
        <TxFlex className="items-start justify-between border-b border-slate-200 px-5 py-3 dark:border-slate-800">
          <div>
            <h1 className="text-lg font-bold">{node?.meta?.label ?? "txstack"}</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">{node?.meta?.description}</p>
          </div>
          <TxButton label={isDark ? "라이트" : "다크"} variant="secondary" onClick={() => _isDark((prev) => !prev)} />
        </TxFlex>

        <div className="p-5">
          <Outlet context={MenuRoutes} />
        </div>
      </main>
    </div>
  );
};
