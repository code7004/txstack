import type { RouteTree } from "@txstack/route-meta";
import { Link, Navigate } from "react-router-dom";
import { TxEmptyState } from "@txstack/ui";
import { AccountsScreen } from "./features/accounts/AccountsScreen";
import { DashboardScreen } from "./features/dashboard/DashboardScreen";
import { ErrorLogsScreen } from "./features/error-logs/ErrorLogsScreen";

/**
 * **앱의 화면은 이 트리 하나가 정합니다.** 라우터 등록(RouteRenderer), 왼쪽 메뉴(getNavigableRoutes),
 * 화면 제목(useCurrentRouteNode)이 모두 여기서 나옵니다. 화면을 더하려면 이 트리에 한 줄을 더합니다.
 *
 * `permissions` 는 메뉴에서만 거릅니다. 주소로 직접 들어오는 것까지 막으려면 서버가 거절하거나
 * 화면에서 다시 확인해야 합니다.
 */
export const routes = {
  home: { index: true, element: <Navigate to="/dashboard" replace /> },
  dashboard: {
    path: "/dashboard",
    element: <DashboardScreen />,
    meta: { label: "대시보드", description: "운영 상태를 한눈에 봅니다. 카드를 누르면 그 조건이 걸린 오류 로그로 갑니다." }
  },
  accounts: {
    path: "/accounts",
    element: <AccountsScreen />,
    meta: { label: "계정", description: "계정을 찾고, 만들고, 고치고, 여러 개를 한꺼번에 지웁니다.", permissions: ["admin"] }
  },
  errorLogs: {
    path: "/error-logs",
    element: <ErrorLogsScreen />,
    meta: { label: "오류 로그", description: "서버 오류를 찾아보고, 상태를 바꾸고, 상세를 엽니다." }
  },
  notFound: {
    path: "*",
    element: (
      <TxEmptyState variant="no-result" title="없는 화면입니다" description="주소를 확인해 주세요.">
        <Link to="/dashboard" className="underline">
          대시보드로
        </Link>
      </TxEmptyState>
    ),
    meta: { hidden: true }
  }
} satisfies RouteTree;
