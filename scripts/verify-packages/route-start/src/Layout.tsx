import { getNavRoutes, useBreadcrumbs } from "@txstack/route-meta";
import { TxAppShell, TxBreadcrumb, TxNavBar, TxSideNav } from "@txstack/ui";
import { NavLink, Outlet } from "react-router-dom";
import { routes } from "./routes";

export function Layout() {
  const menu = getNavRoutes(routes.app.children); // GNB · 사이드바가 함께 쓰는 메뉴
  const crumbs = useBreadcrumbs(routes); // 지금 주소까지 온 길

  return (
    <TxAppShell
      header={<strong>My App</strong>}
      top={
        <TxNavBar>
          {menu.map((item) => (
            <TxNavBar.Item key={item.key} label={item.meta?.label ?? item.key} as={NavLink} to={item.path} />
          ))}
        </TxNavBar>
      }
      left={
        <TxSideNav>
          {menu.map((item) => (
            <TxSideNav.Item key={item.key} label={item.meta?.label ?? item.key} as={NavLink} to={item.path} />
          ))}
        </TxSideNav>
      }
    >
      <TxBreadcrumb items={crumbs} itemAs={NavLink} />
      <Outlet />
    </TxAppShell>
  );
}
