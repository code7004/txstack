import { buildRouteObjects } from "@txstack/route-meta";
import { useRoutes } from "react-router-dom";
import { routes } from "./routes";

const ROUTES = buildRouteObjects(routes); // 모듈 상수로 — 렌더마다 다시 만들지 않습니다

export const App = () => useRoutes(ROUTES);
