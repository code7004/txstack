import { describe, expect, it } from "vitest";
import type { RouteHandle, RouteTree } from "./types";
import { buildRouteObjects, getNavigableRoutes } from "./utils";

/**
 * 라우트 정의 트리에서 "실행 계층(Router)" 과 "네비게이션 계층(GNB)" 이 각각 무엇을 걸러내는지 고정한다.
 *
 * 두 계층의 필터 규칙이 다르다는 점이 이 패키지의 핵심이다:
 * - Router 는 `enabled` 만 본다. `hidden` 인 라우트도 주소로는 접근돼야 하기 때문이다.
 * - 메뉴는 `enabled` · `hidden` · `permissions` · index 여부를 모두 본다.
 *
 * 이 파일은 `.test.ts` 라 **node 환경에서 돈다** — 두 함수가 DOM 없이 동작한다는 증거다.
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

  it("meta 는 실행 계층 최상위로 넘기지 않는다", () => {
    expect(built.every((r) => !("meta" in r))).toBe(true);
  });

  it("children 도 재귀적으로 필터링한다", () => {
    const group = built.find((r) => r.path === "/group");
    expect(group?.children?.map((c) => c.path)).toEqual(["/group/a", "/group/b"]);
  });

  it("index 라우트는 path 도 children 도 갖지 않는다", () => {
    const index = built.find((r) => r.index);

    expect(index).toBeDefined();
    expect(index && "children" in index).toBe(false);
    // React Router 는 index route 에 path 가 있으면 런타임 에러를 낸다.
    expect(index?.path).toBeUndefined();
  });

  it("handle 에 원본 노드를 심어 되찾을 수 있게 한다", () => {
    const group = built.find((r) => r.path === "/group");
    const handle = group?.handle as RouteHandle;

    expect(handle.node).toBe(TREE.group);
    expect(handle.node.meta?.label).toBe("그룹");
  });
});

describe("getNavigableRoutes", () => {
  it("index·hidden·disabled·권한노드를 모두 제외한다", () => {
    expect(getNavigableRoutes(TREE).map((n) => n.path)).toEqual(["/", "/group"]);
  });

  it("canAccess 가 통과시키면 권한 노드도 노출된다", () => {
    const menu = getNavigableRoutes(TREE, (perms) => perms.includes("admin"));
    expect(menu.map((n) => n.path)).toEqual(["/", "/admin", "/group"]);
  });

  it("canAccess 가 막으면 제외된다", () => {
    const menu = getNavigableRoutes(TREE, (perms) => perms.includes("user"));
    expect(menu.map((n) => n.path)).toEqual(["/", "/group"]);
  });

  it("canAccess 는 권한이 걸린 노드에만 호출된다", () => {
    const seen: string[][] = [];
    getNavigableRoutes(TREE, (perms) => {
      seen.push(perms);
      return true;
    });

    expect(seen).toEqual([["admin"]]);
  });

  it("children 도 필터링하되 원본 키를 보존한다", () => {
    const group = getNavigableRoutes(TREE).find((n) => n.path === "/group");

    // 원본은 살아남은 자식을 path 로 다시 묶어 `visible` 이 `/group/a` 로 바뀌었다.
    expect(Object.keys(group?.children ?? {})).toEqual(["visible"]);
  });

  it("자식이 전부 걸러지면 children 을 지운다", () => {
    const tree: RouteTree = {
      group: {
        path: "/group",
        element: null,
        children: {
          a: { path: "/group/a", element: null, meta: { hidden: true } },
          b: { path: "/group/b", element: null, enabled: false }
        }
      }
    };

    const group = getNavigableRoutes(tree)[0];

    // 원본은 `{ ...node }` 로 퍼뜨려 걸러낸 자식이 그대로 남았다.
    expect(group.children).toBeUndefined();
  });

  it("원본 트리를 변형하지 않는다", () => {
    getNavigableRoutes(TREE);
    expect(Object.keys((TREE.group as { children: RouteTree }).children)).toEqual(["visible", "hiddenChild", "disabledChild"]);
  });
});
