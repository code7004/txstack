import { describe, expect, it } from "vitest";
import type { RouteTree } from "./types";
import { buildRouteObjects, getNavigableRoutes } from "./utils";

/**
 * 라우트 정의 트리에서 "실행 계층(Router)" 과 "네비게이션 계층(GNB)" 이 각각 무엇을 걸러내는지 고정한다.
 *
 * 두 계층의 필터 규칙이 다르다는 점이 이 패키지의 핵심이다:
 * - Router 는 `enabled` 만 본다. `hidden` 인 라우트도 주소로는 접근돼야 하기 때문이다.
 * - 메뉴는 `enabled` · `hidden` · `permissions` · `index`/`path` 유무를 모두 본다.
 */
const TREE: RouteTree = {
  home: { path: "/", element: null, meta: { label: "홈" } },
  fallback: { index: true, element: null },
  hidden: { path: "/hidden", element: null, meta: { label: "숨김", hidden: true } },
  disabled: { path: "/disabled", element: null, enabled: false, meta: { label: "비활성" } },
  admin: { path: "/admin", element: null, meta: { label: "관리", permissions: ["admin"] } },
  group: {
    path: "/group",
    element: null,
    meta: { label: "그룹" },
    children: {
      visible: { path: "/group/a", element: null, meta: { label: "A" } },
      hiddenChild: { path: "/group/b", element: null, meta: { label: "B", hidden: true } },
      disabledChild: { path: "/group/c", element: null, enabled: false, meta: { label: "C" } }
    }
  }
};

describe("buildRouteObjects", () => {
  const built = buildRouteObjects(TREE);

  it("enabled: false 만 제외한다", () => {
    expect(built.map((r) => r.path)).toEqual(["/", undefined, "/hidden", "/admin", "/group"]);
  });

  it("hidden 라우트도 Router 에는 등록된다 (주소 직접 접근 보장)", () => {
    expect(built.some((r) => r.path === "/hidden")).toBe(true);
  });

  it("meta 는 실행 계층으로 넘기지 않는다", () => {
    expect(built.every((r) => !("meta" in r))).toBe(true);
  });

  it("children 도 재귀적으로 필터링한다", () => {
    const group = built.find((r) => r.path === "/group");
    expect(group?.children?.map((c) => c.path)).toEqual(["/group/a", "/group/b"]);
  });

  it("index 라우트는 children 을 갖지 않는다", () => {
    const index = built.find((r) => r.index);
    expect(index).toBeDefined();
    expect(index && "children" in index).toBe(false);
  });
});

describe("getNavigableRoutes", () => {
  it("index·hidden·disabled·권한불일치를 모두 제외한다", () => {
    expect(getNavigableRoutes(TREE).map((n) => n.path)).toEqual(["/", "/group"]);
  });

  it("권한이 맞으면 노출된다", () => {
    expect(getNavigableRoutes(TREE, "admin").map((n) => n.path)).toEqual(["/", "/admin", "/group"]);
  });

  it("권한이 달라도 permissions 없는 노드는 그대로 노출된다", () => {
    expect(getNavigableRoutes(TREE, "user").map((n) => n.path)).toEqual(["/", "/group"]);
  });

  it("children 도 필터링해 RouteTree 형태로 되돌린다", () => {
    const group = getNavigableRoutes(TREE).find((n) => n.path === "/group");
    expect(Object.keys(group?.children ?? {})).toEqual(["/group/a"]);
  });

  it("원본 트리를 변형하지 않는다", () => {
    getNavigableRoutes(TREE);
    expect(Object.keys(TREE.group.children ?? {})).toEqual(["visible", "hiddenChild", "disabledChild"]);
  });
});
