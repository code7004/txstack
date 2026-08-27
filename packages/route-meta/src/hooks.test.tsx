import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { useCurrentRouteNode } from "./hooks";
import type { RouteTree } from "./types";

/**
 * **정적 경로를 동적 경로보다 뒤에 뒀다.** 원본은 객체 키 순서대로 순회하며 첫 매칭을
 * 반환했기 때문에 `/users/new` 가 `/users/:id` 에 가로채였다. React Router 는 specificity 로
 * 랭킹하므로 순서와 무관하게 `/users/new` 를 고른다.
 */
const TREE: RouteTree = {
  home: { path: "/", element: null, meta: { label: "홈" } },
  users: {
    path: "/users",
    element: null,
    meta: { label: "회원" },
    children: {
      detail: { path: "/users/:id", element: null, meta: { label: "회원 상세" } },
      create: { path: "/users/new", element: null, meta: { label: "회원 등록" } }
    }
  },
  disabled: { path: "/disabled", element: null, enabled: false, meta: { label: "비활성" } },
  notFound: { path: "*", element: null, meta: { label: "없는 페이지" } }
};

function wrapper(initialEntry: string) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <MemoryRouter initialEntries={[initialEntry]}>{children}</MemoryRouter>;
  };
}

function renderAt(path: string, tree: RouteTree = TREE) {
  return renderHook(() => useCurrentRouteNode(tree), { wrapper: wrapper(path) });
}

describe("useCurrentRouteNode — 매칭", () => {
  it("정적 경로가 동적 경로보다 먼저 선언되지 않아도 이긴다", () => {
    const { result } = renderAt("/users/new");

    // 자체 정규식으로 순회하던 원본은 여기서 "회원 상세" 를 줬다.
    expect(result.current.meta?.label).toBe("회원 등록");
  });

  it("동적 경로를 매칭하고 params 를 준다", () => {
    const { result } = renderAt("/users/42");

    expect(result.current.meta?.label).toBe("회원 상세");
    expect(result.current.params).toEqual({ id: "42" });
  });

  it("루트부터 현재까지의 사슬을 준다 (브레드크럼)", () => {
    const { result } = renderAt("/users/42");

    expect(result.current.matches.map((n) => n.meta?.label)).toEqual(["회원", "회원 상세"]);
  });

  it("wildcard 는 다른 매칭이 없을 때만 걸린다", () => {
    expect(renderAt("/nowhere").result.current.meta?.label).toBe("없는 페이지");
    // 자식 탐색이 실패해도 상위 wildcard 로 새지 않는다.
    expect(renderAt("/users").result.current.meta?.label).toBe("회원");
  });

  it("enabled: false 인 라우트는 매칭되지 않는다", () => {
    const { result } = renderAt("/disabled");
    expect(result.current.meta?.label).toBe("없는 페이지");
  });

  it("매칭이 없으면 node 가 null 이다", () => {
    const tree: RouteTree = { home: { path: "/", element: null } };
    const { result } = renderAt("/nowhere", tree);

    expect(result.current.node).toBeNull();
    expect(result.current.matches).toEqual([]);
    expect(result.current.pathname).toBe("/nowhere");
  });

  it("node 는 원본 트리의 객체 그대로다", () => {
    const { result } = renderAt("/");
    expect(result.current.node).toBe(TREE.home);
  });
});

describe("useCurrentRouteNode — identity", () => {
  it("트리와 주소가 그대로면 같은 객체를 돌려준다", () => {
    const { result, rerender } = renderAt("/users/42");
    const first = result.current;

    rerender();
    rerender();

    expect(result.current).toBe(first);
  });
});
