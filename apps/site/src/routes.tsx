import type { RouteTree } from "@txstack/route-meta";
import { AboutHome } from "./pages/AboutHome";
import { ApiHome } from "./pages/ApiHome";
import { Components } from "./pages/Components";
import { Contact } from "./pages/Contact";
import { DocsHome } from "./pages/DocsHome";
import { Examples } from "./pages/Examples";
import { Guide } from "./pages/Guide";
import { Home } from "./pages/Home";
import { NotFound } from "./pages/NotFound";
import { Profile } from "./pages/Profile";
import { Section } from "./pages/Section";
import { SectionLayout } from "./pages/SectionLayout";
import { Start } from "./pages/Start";

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
    meta: { label: "Home", description: "txstack 이 무엇이고 왜 있는가" }
  },

  docs: {
    path: "/docs",
    element: <SectionLayout />,
    meta: { label: "Documents", description: "설치부터 한 화면 만들기까지" },
    children: {
      index: { index: true, element: <DocsHome /> },

      start: {
        path: "/docs/start",
        element: <Start />,
        meta: { label: "Getting Started", description: "설치하고 첫 화면을 세우기까지" }
      },

      guide: {
        path: "/docs/guide",
        element: <Guide />,
        meta: { label: "Guide", description: "겉모습 · 다크모드 · 화면 골격" },
        children: {
          index: { index: true, element: <Section title="Guide" /> },
          tokens: { path: "/docs/guide/tokens", element: <Section title="Tokens" />, meta: { label: "Tokens" } },
          darkMode: { path: "/docs/guide/dark-mode", element: <Section title="Dark mode" />, meta: { label: "Dark mode" } },
          layout: { path: "/docs/guide/layout", element: <Section title="Layout" />, meta: { label: "Layout" } }
        }
      },

      components: {
        path: "/docs/components",
        element: <Components />,
        meta: { label: "Components", description: "부품 카탈로그(Storybook)" }
      },

      tutorial: {
        path: "/docs/tutorial",
        element: <Section title="Tutorial" />,
        meta: { label: "Tutorial", description: "한 화면을 처음부터 끝까지" }
      }
    }
  },

  api: {
    path: "/api",
    element: <SectionLayout />,
    meta: { label: "API", description: "네 패키지가 무엇을 내보내는가" },
    children: {
      index: { index: true, element: <ApiHome /> },
      ui: { path: "/api/ui", element: <Section title="@txstack/ui" />, meta: { label: "ui" } },
      routeMeta: { path: "/api/route-meta", element: <Section title="@txstack/route-meta" />, meta: { label: "route-meta" } },
      hooks: { path: "/api/hooks", element: <Section title="@txstack/hooks" />, meta: { label: "hooks" } },
      axios: { path: "/api/axios", element: <Section title="@txstack/axios" />, meta: { label: "axios" } }
    }
  },

  example: {
    path: "/example",
    element: <Examples />,
    meta: { label: "Example", description: "진짜 데이터를 부르는 화면들" }
  },

  /**
   * **`Contact` 를 묶음 이름으로 두면 `Contact > Contact` 가 된다.** 그래서 `About` 이다.
   * 순서는 "누가 만들었나 → 어떻게 닿나" 로 뒀다.
   */
  about: {
    path: "/about",
    element: <SectionLayout />,
    meta: { label: "About", description: "만든 사람과 묻는 자리" },
    children: {
      index: { index: true, element: <AboutHome /> },
      profile: { path: "/about/profile", element: <Profile />, meta: { label: "Profile" } },
      contact: { path: "/about/contact", element: <Contact />, meta: { label: "Contact" } }
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
