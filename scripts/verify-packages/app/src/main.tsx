import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, NavLink } from "react-router-dom";
import { RouteTreeRenderer, buildRouteObjects, getNavRoutes, useCurrentRoute, type RouteTree } from "@txstack/route-meta";
import { useObjectState } from "@txstack/hooks/useObjectState";
import { useUrlQuery } from "@txstack/hooks/useUrlQuery";
import { TxSideNav } from "@txstack/ui";
import "@txstack/ui/styles.css";

function Members() {
  const [query, setQuery] = useUrlQuery({ defaults: { q: "", page: 1 } });
  const [form, setForm] = useObjectState({ name: "", role: "member" });
  return (
    <button type="button" onClick={() => setQuery({ page: query.page + 1 })} onFocus={() => setForm({ name: query.q })}>
      {form.name} {query.page}
    </button>
  );
}

const routes = {
  members: { path: "/members", element: <Members />, meta: { label: "회원", permissions: ["admin"] } },
  missing: { path: "*", element: <p>없음</p>, meta: { hidden: true } }
} satisfies RouteTree;

// 라우터에 붙일 객체도 만들 수 있어야 한다
export const routeObjects = buildRouteObjects(routes);

function App() {
  const menu = getNavRoutes(routes, (permissions) => permissions.includes("admin"));
  const { meta } = useCurrentRoute(routes);
  return (
    <>
      <TxSideNav>
        {menu.map((item) => (
          <TxSideNav.Item key={item.key} label={item.meta?.label ?? item.key} as={NavLink} to={item.path} />
        ))}
      </TxSideNav>
      <h1>{meta?.label}</h1>
      <RouteTreeRenderer tree={routes} />
    </>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
