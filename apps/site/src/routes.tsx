import type { RouteTree } from "@txstack/route-meta";
import { page } from "./lib/page";
import { SectionLayout } from "./pages/SectionLayout";

/**
 * 화면은 그 주소에 처음 들어올 때 받는다(`lib/page`). 묶음의 껍데기(`SectionLayout`)는 작아서 바로 싣는다.
 */
const AboutHome = page(() => import("./pages/AboutHome"), "AboutHome", "pages/AboutHome.tsx");
const CaseStudy = page(() => import("./pages/CaseStudy"), "CaseStudy", "pages/CaseStudy.tsx");
const ApiAxios = page(() => import("./pages/api/ApiAxios"), "ApiAxios", "pages/api/ApiAxios.tsx");
const ApiHome = page(() => import("./pages/ApiHome"), "ApiHome", "pages/ApiHome.tsx");
const ApiHooks = page(() => import("./pages/api/ApiHooks"), "ApiHooks", "pages/api/ApiHooks.tsx");
const ApiRouteMeta = page(() => import("./pages/api/ApiRouteMeta"), "ApiRouteMeta", "pages/api/ApiRouteMeta.tsx");
const ApiUi = page(() => import("./pages/api/ApiUi"), "ApiUi", "pages/api/ApiUi.tsx");
const Components = page(() => import("./pages/Components"), "Components", "pages/Components.tsx");
const Contact = page(() => import("./pages/Contact"), "Contact", "pages/Contact.tsx");
const DocsHome = page(() => import("./pages/DocsHome"), "DocsHome", "pages/DocsHome.tsx");
const ExampleAccounts = page(() => import("./pages/example/ExampleAccounts"), "ExampleAccounts", "pages/example/ExampleAccounts.tsx");
const ExampleApp = page(() => import("./pages/example/ExampleApp"), "ExampleApp", "pages/example/ExampleApp.tsx");
const ExampleRoutes = page(() => import("./pages/example/ExampleRoutes"), "ExampleRoutes", "pages/example/ExampleRoutes.tsx");
const ExampleDashboard = page(() => import("./pages/example/ExampleDashboard"), "ExampleDashboard", "pages/example/ExampleDashboard.tsx");
const ExampleErrorLogs = page(() => import("./pages/example/ExampleErrorLogs"), "ExampleErrorLogs", "pages/example/ExampleErrorLogs.tsx");
const ExampleGithub = page(() => import("./pages/example/ExampleGithub"), "ExampleGithub", "pages/example/ExampleGithub.tsx");
const ExampleHome = page(() => import("./pages/example/ExampleHome"), "ExampleHome", "pages/example/ExampleHome.tsx");
const ExampleLayout = page(() => import("./pages/example/ExampleLayout"), "ExampleLayout", "pages/example/ExampleLayout.tsx");
const GuideDarkMode = page(() => import("./pages/guide/GuideDarkMode"), "GuideDarkMode", "pages/guide/GuideDarkMode.tsx");
const GuideDialogs = page(() => import("./pages/guide/GuideDialogs"), "GuideDialogs", "pages/guide/GuideDialogs.tsx");
const GuideForms = page(() => import("./pages/guide/GuideForms"), "GuideForms", "pages/guide/GuideForms.tsx");
const GuideHttpClient = page(() => import("./pages/guide/GuideHttpClient"), "GuideHttpClient", "pages/guide/GuideHttpClient.tsx");
const GuideHome = page(() => import("./pages/guide/GuideHome"), "GuideHome", "pages/guide/GuideHome.tsx");
const GuideLayout = page(() => import("./pages/guide/GuideLayout"), "GuideLayout", "pages/guide/GuideLayout.tsx");
const GuideRouting = page(() => import("./pages/guide/GuideRouting"), "GuideRouting", "pages/guide/GuideRouting.tsx");
const GuideTables = page(() => import("./pages/guide/GuideTables"), "GuideTables", "pages/guide/GuideTables.tsx");
const GuideStyling = page(() => import("./pages/guide/GuideStyling"), "GuideStyling", "pages/guide/GuideStyling.tsx");
const GuideUrlState = page(() => import("./pages/guide/GuideUrlState"), "GuideUrlState", "pages/guide/GuideUrlState.tsx");
const Home = page(() => import("./pages/Home"), "Home", "pages/Home.tsx");
const NotFound = page(() => import("./pages/NotFound"), "NotFound", "pages/NotFound.tsx");
const Profile = page(() => import("./pages/Profile"), "Profile", "pages/Profile.tsx");
const Start = page(() => import("./pages/Start"), "Start", "pages/Start.tsx");
const Tutorial = page(() => import("./pages/Tutorial"), "Tutorial", "pages/Tutorial.tsx");

/**
 * **이 사이트의 단일 출처.** 라우터도 메뉴도 브레드크럼도 여기서 나온다.
 *
 * 이 파일이 곧 `@txstack/route-meta` 를 진짜로 쓰는 자리다 — 카탈로그의 레시피는
 * `MemoryRouter` 안에서 돌았지만 여기서는 **주소창 · 새로고침 · 딥링크**를 그대로 겪는다.
 *
 * `satisfies` 로 붙인다 — `routes.docs.children.guide.path` 가 에디터에서 정확히 뜬다.
 * 타입 주석으로 붙이면 키가 `string` 으로 넓어져 자동완성이 죽는다.
 *
 * **가로 줄은 다섯 칸만 둔다.** 항목이 아홉이면 눈이 한 번에 못 읽는다 — 성격이 같은 것을
 * 묶어 `Documents` · `About` 아래로 내리고, **깊이는 셋까지만** 간다.
 *
 * **묶음마다 인덱스 화면을 트리에 선언한다**(`index: true`). 그래서 제목(`/docs`)을 눌러도
 * 빈 화면이 아니라 그 묶음의 안내가 나온다. 인덱스 라우트는 경로가 없어 **메뉴에는 오르지
 * 않는다** — `getNavigableRoutes` 가 걸러 준다.
 *
 * 메뉴에 보이는 글자(`label`)는 영어다. 설명은 한국어로 쓰되 주제·항목 이름은 영어로 —
 * 패키지 이름과 폴더가 영어라 섞이면 찾기가 어렵다.
 */
export const routes = {
  home: {
    path: "/",
    element: <Home />,
    meta: { label: "Home", description: "txstack 소개와 만든 이유" }
  },

  docs: {
    path: "/docs",
    element: <SectionLayout />,
    meta: { label: "Documents", description: "설치부터 화면 하나 만들기까지" },
    children: {
      index: { index: true, element: <DocsHome /> },

      start: {
        path: "/docs/start",
        element: <Start />,
        meta: { label: "Getting Started", description: "설치하고 첫 화면 띄우기" }
      },

      /**
       * **메뉴 차례가 곧 읽는 차례다** — 장 끝의 "다음" 도 이 순서를 따른다.
       * 설치 → 한 화면 만들기 → 내 화면에 맞추기 → 부품 찾아보기.
       */
      tutorial: {
        path: "/docs/tutorial",
        element: <Tutorial />,
        meta: { label: "Tutorial", description: "화면 하나를 처음부터 끝까지 만들기" }
      },

      guide: {
        path: "/docs/guide",
        element: <SectionLayout />,
        meta: { label: "Guide", description: "디자인 · 레이아웃 · 폼 · 확인 창 · 표 · 라우팅 · URL 상태 · HTTP" },
        children: {
          index: { index: true, element: <GuideHome /> },
          styling: { path: "/docs/guide/styling", element: <GuideStyling />, meta: { label: "Styling", description: "토큰으로 색 · 모서리 · 여백을, className으로 자리를 바꾸기" } },
          darkMode: { path: "/docs/guide/dark-mode", element: <GuideDarkMode />, meta: { label: "Dark mode", description: "html 클래스 하나로 컴포넌트 전체를 다크 모드로" } },
          layout: { path: "/docs/guide/layout", element: <GuideLayout />, meta: { label: "Layout", description: "TxAppShell로 헤더 · 메뉴 · 본문의 틀 잡기" } },
          forms: { path: "/docs/guide/forms", element: <GuideForms />, meta: { label: "Forms", description: "TxForm으로 입력 · 검증 · 제출까지" } },
          dialogs: { path: "/docs/guide/dialogs", element: <GuideDialogs />, meta: { label: "Dialogs & Toasts", description: "확인 창 · 알림 · 모달 · 옆 패널을 Provider 없이" } },
          tables: { path: "/docs/guide/tables", element: <GuideTables />, meta: { label: "Tables & Lists", description: "목록 방식 고르기와 TxAgGrid의 정렬 · 페이지 · 편집" } },
          // 여기부터는 ui 밖의 세 패키지 — 화면 구조 · 주소 · 서버
          routing: { path: "/docs/guide/routing", element: <GuideRouting />, meta: { label: "Routing & Menu", description: "라우트 트리 하나로 라우터 · 메뉴 · 지금 위치를" } },
          urlState: { path: "/docs/guide/url-state", element: <GuideUrlState />, meta: { label: "URL State", description: "검색 조건과 페이지를 주소에 담기" } },
          httpClient: { path: "/docs/guide/http-client", element: <GuideHttpClient />, meta: { label: "HTTP Client", description: "토큰 · 401 · 오류 메시지를 한 곳에 모은 API 클라이언트" } }
        }
      },

      components: {
        path: "/docs/components",
        element: <Components />,
        meta: { label: "Components", description: "분류별 컴포넌트 갤러리" }
      }
    }
  },

  api: {
    path: "/api",
    element: <SectionLayout />,
    meta: { label: "API", description: "네 패키지의 API 레퍼런스" },
    children: {
      index: { index: true, element: <ApiHome /> },
      ui: { path: "/api/ui", element: <ApiUi />, meta: { label: "ui", description: "Tx* 컴포넌트 49종의 props · 토큰 레퍼런스" } },
      routeMeta: { path: "/api/route-meta", element: <ApiRouteMeta />, meta: { label: "route-meta", description: "RouteTree · buildRouteObjects · getNavigableRoutes 레퍼런스" } },
      hooks: { path: "/api/hooks", element: <ApiHooks />, meta: { label: "hooks", description: "useUrlQuery · useObjectState 레퍼런스" } },
      axios: { path: "/api/axios", element: <ApiAxios />, meta: { label: "axios", description: "createHttpClient 옵션과 오류 처리 레퍼런스" } }
    }
  },

  example: {
    path: "/example",
    element: <ExampleLayout />,
    meta: { label: "Example", description: "txstack으로 끝까지 만든 화면" },
    children: {
      index: { index: true, element: <ExampleHome /> },
      app: { path: "/example/app", element: <ExampleApp />, meta: { label: "App", description: "세 화면을 묶는 App.tsx — TxAppShell · Provider" } },
      routes: { path: "/example/routes", element: <ExampleRoutes />, meta: { label: "Routes", description: "세 화면을 등록하는 routes.tsx — RouteTree" } },
      dashboard: { path: "/example/dashboard", element: <ExampleDashboard />, meta: { label: "Dashboard", description: "숫자 카드에서 걸러진 목록으로" } },
      accounts: { path: "/example/accounts", element: <ExampleAccounts />, meta: { label: "Accounts", description: "계정 목록 · 옆 패널 편집 · 일괄 삭제" } },
      errorLogs: { path: "/example/error-logs", element: <ExampleErrorLogs />, meta: { label: "Error Logs", description: "주소에 담긴 필터 · 표 안 상태 수정 · 상세 모달" } },
      github: { path: "/example/github", element: <ExampleGithub />, meta: { label: "GitHub Search", description: "GitHub API로 만든 검색 화면" } }
    }
  },

  /**
   * **`Contact` 를 묶음 이름으로 두면 `Contact > Contact` 가 된다.** 그래서 `About` 이다.
   * 순서는 "누가 만들었나 → 어떻게 닿나" 로 뒀다.
   */
  about: {
    path: "/about",
    element: <SectionLayout />,
    meta: { label: "About", description: "설계 사례 · 만든 사람 · 문의 방법" },
    children: {
      index: { index: true, element: <AboutHome /> },
      caseStudy: { path: "/about/case-study", element: <CaseStudy />, meta: { label: "Case Study", description: "무엇을 왜 나눴고, 무엇을 앱에 남겼고, 어떻게 검증하나" } },
      profile: { path: "/about/profile", element: <Profile />, meta: { label: "Profile", description: "만든 사람 소개" } },
      contact: { path: "/about/contact", element: <Contact />, meta: { label: "Contact", description: "질문 · 제안 · 버그 제보는 GitHub 이슈로" } }
    }
  },

  /**
   * 없는 주소. **메뉴에는 안 나오고 주소로만 닿는다** — `hidden` 이 하는 일이 그것이다.
   * `path: "*"` 는 react-router 의 splat 이라 맨 마지막에 둔다.
   */
  notFound: {
    path: "*",
    element: <NotFound />,
    meta: { label: "Not found", hidden: true }
  }
} satisfies RouteTree;
