import type { RouteTree } from "@txstack/route-meta";
import { Link, Navigate } from "react-router-dom";
import { TxEmptyState } from "@txstack/ui";
import { AccountsScreen } from "../accounts/AccountsScreen";
import { DashboardScreen } from "../dashboard/DashboardScreen";
import { ErrorLogsScreen } from "../error-logs/ErrorLogsScreen";

/**
 * **앱의 화면은 이 트리 하나가 정합니다.** 라우터 등록(RouteRenderer), 왼쪽 메뉴(getNavigableRoutes),
 * 지금 위치(useCurrentRouteNode)가 모두 여기서 나옵니다. 화면을 더하려면 이 트리에 한 줄을 더합니다.
 *
 * - `children` 이 있는 노드는 메뉴에서 **펼치는 묶음**이 됩니다. 경로는 부모 경로로 시작하는 절대경로로 씁니다
 * - `permissions` 는 메뉴에서만 거릅니다. 주소로 직접 들어오는 것까지 막으려면 서버가 거절해야 합니다
 * - `hidden` 은 메뉴에만 안 나올 뿐, 라우터에는 그대로 등록됩니다
 */
export const routes = {
  home: { index: true, element: <Navigate to="/ops/dashboard" replace /> },

  ops: {
    path: "/ops",
    meta: { label: "운영", icon: <span aria-hidden>◔</span> },
    children: {
      // 묶음 제목(/ops)으로 들어오면 첫 화면으로 보냅니다. 경로가 없어 메뉴에는 오르지 않습니다
      index: { index: true, element: <Navigate to="/ops/dashboard" replace /> },
      dashboard: {
        path: "/ops/dashboard",
        element: <DashboardScreen />,
        meta: { label: "대시보드", description: "운영 상태를 한눈에 봅니다" }
      },
      errorLogs: {
        path: "/ops/error-logs",
        element: <ErrorLogsScreen />,
        meta: { label: "오류 로그", description: "서버 오류를 찾아보고 상태를 바꿉니다" }
      }
    }
  },

  admin: {
    path: "/admin",
    // 묶음에 건 권한은 묶음째 거릅니다 — 뷰어에게는 "관리" 가 통째로 안 보입니다
    meta: { label: "관리", icon: <span aria-hidden>◉</span>, permissions: ["admin"] },
    children: {
      index: { index: true, element: <Navigate to="/admin/accounts" replace /> },
      accounts: {
        path: "/admin/accounts",
        element: <AccountsScreen />,
        meta: { label: "계정", description: "계정을 찾고, 만들고, 고치고, 지웁니다" }
      }
    }
  },

  // 없는 주소. 메뉴에는 오르지 않고(hidden) 주소로만 닿습니다
  notFound: {
    path: "*",
    element: (
      <TxEmptyState variant="no-result" title="없는 화면입니다" description="주소를 확인해 주세요.">
        <Link to="/" className="underline">
          처음으로
        </Link>
      </TxEmptyState>
    ),
    meta: { hidden: true }
  }
} satisfies RouteTree;
