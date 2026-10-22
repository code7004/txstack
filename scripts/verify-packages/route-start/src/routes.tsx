import type { RouteTree } from "@txstack/route-meta";
import { Navigate } from "react-router-dom";
import { Layout } from "./Layout";

// 라우터 · 메뉴 · 경로 표시가 모두 이 트리에서 나옵니다. 화면을 더하려면 여기에 한 줄을 더합니다
export const routes = {
  app: {
    path: "/",
    element: <Layout />,
    meta: { label: "앱", hidden: true, breadcrumb: false }, // 셸 — 메뉴에도 경로에도 나오지 않습니다
    children: {
      home: { index: true, element: <Navigate to="/members" replace /> },
      members: { path: "/members", element: <h1>회원</h1>, meta: { label: "회원" } },
      settings: { path: "/settings", element: <h1>설정</h1>, meta: { label: "설정" } }
    }
  }
} satisfies RouteTree;
