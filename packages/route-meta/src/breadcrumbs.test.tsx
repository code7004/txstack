import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { useBreadcrumbs } from "./hooks";
import type { RouteTree } from "./types";

/**
 * black-message 의 트리 모양 그대로다 — 레이아웃 루트(`/`)가 모든 경로 앞에 붙고, 묶음마다
 * 기본 화면이 부모와 **같은 주소**(`/user`)이거나 index 다. 문서(006)의 표를 여기서 못 박는다.
 */
const TREE = {
  Contents: {
    path: "/",
    element: null,
    meta: { label: "Contents", hidden: true, breadcrumb: false },
    children: {
      ContentsHome: { index: true, element: null, meta: { label: "홈", hidden: true, breadcrumb: false } },
      Dashboard: {
        path: "/dashboard",
        element: null,
        meta: { label: "대시보드" },
        children: { DashboardIndex: { index: true, element: null, meta: { label: "대시보드", hidden: true } } }
      },
      BlackUsers: { path: "/black", element: null, meta: { label: "블랙관리" } },
      Message: {
        path: "/message",
        element: null,
        meta: { label: "문자관리" },
        children: {
          MessageGroupDetail: { path: "/message/messagegroupdetail", element: null, meta: { label: "발송상세", hidden: true } }
        }
      },
      Users: {
        path: "/user",
        element: null,
        meta: { label: "유저관리" },
        children: {
          UsersIndex: { path: "/user", element: null, meta: { label: "활성유저", hidden: true } },
          DormantUsers: { path: "/user/dormant", element: null, meta: { label: "휴면유저" } },
          UserDetail: { path: "/user/:id", element: null, meta: { label: "회원 상세", permissions: ["admin"] } }
        }
      },
      Unlabeled: { path: "/plain", element: null, children: { Child: { path: "/plain/child", element: null, meta: { label: "자식" } } } }
    }
  }
} satisfies RouteTree;

function renderAt(path: string, tree: RouteTree = TREE) {
  return renderHook(() => useBreadcrumbs(tree), {
    wrapper: ({ children }: { children: ReactNode }) => <MemoryRouter initialEntries={[path]}>{children}</MemoryRouter>
  });
}

const labels = (path: string) => renderAt(path).result.current.map((crumb) => crumb.label);

describe("useBreadcrumbs — 칸", () => {
  it("루트부터 지금까지 키 · 주소 · 글자를 준다", () => {
    expect(renderAt("/user/dormant").result.current).toEqual([
      { key: "Users", path: "/user", label: "유저관리", meta: TREE.Contents.children.Users.meta },
      { key: "DormantUsers", path: "/user/dormant", label: "휴면유저", meta: TREE.Contents.children.Users.children.DormantUsers.meta }
    ]);
  });

  it("breadcrumb: false 인 노드는 빠지고 아래 칸은 남는다", () => {
    expect(labels("/black")).toEqual(["블랙관리"]);
  });

  it("label 이 없는 노드는 빠진다", () => {
    expect(labels("/plain/child")).toEqual(["자식"]);
  });

  it("앞 칸과 주소가 같으면 앞 칸을 남긴다 — 같은 경로의 자식", () => {
    expect(renderAt("/user").result.current.map(({ key, path }) => ({ key, path }))).toEqual([{ key: "Users", path: "/user" }]);
  });

  it("앞 칸과 주소가 같으면 앞 칸을 남긴다 — index", () => {
    expect(labels("/dashboard")).toEqual(["대시보드"]);
  });

  it("hidden 은 보지 않는다 — 메뉴에 없는 상세 화면도 나온다", () => {
    expect(labels("/message/messagegroupdetail")).toEqual(["문자관리", "발송상세"]);
  });

  it("permissions 는 보지 않는다", () => {
    expect(labels("/user/42")).toEqual(["유저관리", "회원 상세"]);
  });

  it("동적 경로의 path 는 실제 주소다", () => {
    expect(renderAt("/user/42").result.current.at(-1)?.path).toBe("/user/42");
  });

  it("주소 끝의 / 는 떼고 준다", () => {
    expect(renderAt("/user/dormant/").result.current.map((crumb) => crumb.path)).toEqual(["/user", "/user/dormant"]);
  });

  it("루트를 빼지 않으면 첫 칸이 된다 — 라이브러리가 루트를 추측하지 않는다", () => {
    const tree: RouteTree = {
      home: { path: "/", element: null, meta: { label: "홈" }, children: { orders: { path: "/orders", element: null, meta: { label: "주문" } } } }
    };
    expect(renderAt("/orders", tree).result.current.map((crumb) => crumb.label)).toEqual(["홈", "주문"]);
  });

  it("매칭이 없으면 빈 배열이다", () => {
    expect(labels("/nowhere")).toEqual([]);
  });
});

describe("useBreadcrumbs — identity", () => {
  it("트리와 주소가 그대로면 같은 배열을 돌려준다", () => {
    const { result, rerender } = renderAt("/user/dormant");
    const first = result.current;

    rerender();

    expect(result.current).toBe(first);
  });
});
