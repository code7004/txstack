import type { RouteTree } from "@txstack/route-meta";
import { Suspense, lazy, type ReactNode } from "react";
import { HomePage } from "./pages/HomePage";
import { HooksPage } from "./pages/HooksPage";
import { NetworkPage } from "./pages/NetworkPage";
import { RouteMetaPage } from "./pages/RouteMetaPage";
import { UiButtonPage } from "./pages/UiButtonPage";
import { UiDataPage } from "./pages/UiDataPage";
import { UiDropdownPage } from "./pages/UiDropdownPage";
import { UiFormPage } from "./pages/UiFormPage";
import { UiInputPage } from "./pages/UiInputPage";
import { UiOverlayPage } from "./pages/UiOverlayPage";

/**
 * 서브패스를 쓰는 두 페이지는 lazy 로 붙인다.
 *
 * 정적 import 로 두면 프로덕션 번들에서 ag-grid / react-day-picker 가 코어와 한 덩어리로 합쳐져,
 * "서브패스를 쓰는 화면에서만 받아진다" 는 이 라이브러리의 설계 근거가 실제로 성립하지 않는다.
 * lazy 로 잘라두면 dev 든 프로덕션 빌드든 해당 메뉴로 이동할 때 처음 청크를 받는다.
 */
const AgGridPage = lazy(() => import("./pages/AgGridPage").then((m) => ({ default: m.AgGridPage })));
const DayPickerPage = lazy(() => import("./pages/DayPickerPage").then((m) => ({ default: m.DayPickerPage })));

const deferred = (node: ReactNode) => <Suspense fallback={<div className="p-4 text-sm text-slate-500">불러오는 중…</div>}>{node}</Suspense>;

/**
 * 메뉴/라우터가 공유하는 페이지 트리.
 *
 * `Shell` 을 import 하지 않는다 — Shell 이 이 트리를 읽어야 하는데, 한 모듈에 같이 두면
 * 순환 import 가 되어 진입 순서에 따라 `Cannot access 'Shell' before initialization` 로 깨진다.
 */
export const MenuRoutes: RouteTree = {
  home: {
    path: "/",
    index: true,
    element: <HomePage />,
    meta: { label: "개요", description: "4개 패키지가 서로 어떻게 물려 있는지" }
  },
  input: {
    path: "/ui/input",
    element: <UiInputPage />,
    meta: { label: "Input", description: "TxInput · TxSearchInput · TxTextarea · TxCheckBox" }
  },
  button: {
    path: "/ui/button",
    element: <UiButtonPage />,
    meta: { label: "Button", description: "TxButton · TxToolTip · TxClipboardButton · TxSpinner" }
  },
  dropdown: {
    path: "/ui/dropdown",
    element: <UiDropdownPage />,
    meta: { label: "Dropdown", description: "TxDropdown · TxDropdownMulti" }
  },
  form: {
    path: "/ui/form",
    element: <UiFormPage />,
    meta: { label: "Form", description: "TxForm 컴파운드 컴포넌트" }
  },
  overlay: {
    path: "/ui/overlay",
    element: <UiOverlayPage />,
    meta: { label: "Overlay", description: "TxModal · TxSlidePanel · TxDropMenu · TxContextMenu · TxTabs" }
  },
  data: {
    path: "/ui/data",
    element: <UiDataPage />,
    meta: { label: "Data", description: "TxCard · TxJsonTree · TxCoolTable" }
  },
  aggrid: {
    path: "/ui/aggrid",
    element: deferred(<AgGridPage />),
    meta: { label: "AgGrid ↗", description: "@txstack/ui/aggrid 서브패스" }
  },
  daypicker: {
    path: "/ui/daypicker",
    element: deferred(<DayPickerPage />),
    meta: { label: "DayPicker ↗", description: "@txstack/ui/daypicker 서브패스" }
  },
  hooks: {
    path: "/hooks",
    element: <HooksPage />,
    meta: { label: "hooks", description: "@txstack/hooks — useUrlQuery · useStateForObject · useSafePolling" }
  },
  routeMeta: {
    path: "/route-meta",
    element: <RouteMetaPage />,
    meta: { label: "route-meta", description: "@txstack/route-meta — 이 화면의 메뉴가 만들어지는 방식" }
  },
  network: {
    path: "/network",
    element: <NetworkPage />,
    meta: { label: "network", description: "@txstack/network — 토큰 주입 · 401 · 봉투 해제" }
  },
  disabledExample: {
    path: "/disabled",
    element: <div />,
    enabled: false,
    meta: { label: "비활성 예시" }
  },
  hiddenExample: {
    path: "/hidden",
    element: <div className="p-4">메뉴에 안 보이지만 URL 로는 접근되는 라우트다.</div>,
    meta: { label: "숨김 예시", hidden: true }
  }
};
