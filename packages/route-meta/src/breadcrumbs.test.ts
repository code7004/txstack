import { describe, expect, it } from "vitest";
import type { RouteTree } from "./types";
import { getBreadcrumbs } from "./utils";

/**
 * `getBreadcrumbs` 는 **라우터 밖에서** 쓴다. 이 파일은 `.test.ts` 라 node 환경에서 돈다 —
 * 라우터 · DOM 없이 주소 하나로 칸이 나온다는 증거다.
 *
 * 칸이 되는 규칙은 `breadcrumbs.test.tsx`(훅)와 같다. 훅이 이 함수를 부르므로 여기서는
 * 함수에만 있는 것(basename · 쿼리 · 트리 기억)을 중심으로 본다.
 */
const TREE = {
  Contents: {
    path: "/",
    element: null,
    meta: { label: "Contents", hidden: true, breadcrumb: false },
    children: {
      Dashboard: {
        path: "/dashboard",
        element: null,
        meta: { label: "대시보드" },
        children: { DashboardIndex: { index: true, element: null, meta: { label: "대시보드", hidden: true } } }
      },
      Users: {
        path: "/user",
        element: null,
        meta: { label: "유저관리" },
        children: {
          UsersIndex: { path: "/user", element: null, meta: { label: "활성유저", hidden: true } },
          DormantUsers: { path: "/user/dormant", element: null, meta: { label: "휴면유저" } },
          UserDetail: { path: "/user/:id", element: null, meta: { label: "회원 상세" } }
        }
      }
    }
  }
} satisfies RouteTree;

const labels = (pathname: string, basename?: string, tree: RouteTree = TREE) => getBreadcrumbs(tree, pathname, basename).map((crumb) => crumb.label);

describe("getBreadcrumbs — 라우터 없이", () => {
  it("주소 하나로 키 · 주소 · 글자를 준다", () => {
    expect(getBreadcrumbs(TREE, "/user/dormant")).toEqual([
      { key: "Users", path: "/user", label: "유저관리", meta: TREE.Contents.children.Users.meta },
      { key: "DormantUsers", path: "/user/dormant", label: "휴면유저", meta: TREE.Contents.children.Users.children.DormantUsers.meta }
    ]);
  });

  it("훅과 같은 규칙이다 — 루트 빼기 · 같은 주소 합치기 · index", () => {
    expect(labels("/user")).toEqual(["유저관리"]);
    expect(labels("/dashboard")).toEqual(["대시보드"]);
  });

  it("동적 경로의 path 는 실제 주소다", () => {
    expect(getBreadcrumbs(TREE, "/user/42").at(-1)?.path).toBe("/user/42");
  });

  it("쿼리 · 조각은 보지 않는다", () => {
    expect(getBreadcrumbs(TREE, "/user/dormant?page=2#top")).toEqual(getBreadcrumbs(TREE, "/user/dormant"));
  });

  it("매칭이 없으면 빈 배열이다", () => {
    expect(getBreadcrumbs(TREE, "/nowhere")).toEqual([]);
  });

  it("부를 때마다 새 배열이다", () => {
    expect(getBreadcrumbs(TREE, "/user")).not.toBe(getBreadcrumbs(TREE, "/user"));
  });
});

/**
 * 라우터에 `basename` 을 준 앱은 `window.location.pathname` 에 그것이 붙어 있다.
 * 그대로 넘기면 아무것도 맞지 않는다 — 같은 값을 넘긴다.
 */
describe("getBreadcrumbs — basename", () => {
  it("basename 을 주면 그만큼 떼고 맞춘다", () => {
    expect(labels("/admin/user/dormant", "/admin")).toEqual(["유저관리", "휴면유저"]);
  });

  it("칸의 path 는 basename 을 뗀 라우터 안의 주소다 — NavLink 의 to 에 그대로", () => {
    expect(getBreadcrumbs(TREE, "/admin/user/dormant", "/admin").map((crumb) => crumb.path)).toEqual(["/user", "/user/dormant"]);
  });

  it("basename 을 안 주면 붙은 주소는 맞지 않는다", () => {
    expect(labels("/admin/user/dormant")).toEqual([]);
  });

  it("basename 밖의 주소는 맞지 않는다", () => {
    expect(labels("/other/user/dormant", "/admin")).toEqual([]);
  });
});

/** 트리마다 라우터 형식을 한 번만 만든다. 기억한 것이 다른 트리로 새면 안 된다 */
describe("getBreadcrumbs — 트리 기억", () => {
  it("트리 두 개를 번갈아 넘겨도 섞이지 않는다", () => {
    const other: RouteTree = { shop: { path: "/shop", element: null, meta: { label: "가게" } } };

    expect(labels("/shop", undefined, other)).toEqual(["가게"]);
    expect(labels("/shop")).toEqual([]);
    expect(labels("/user/dormant", undefined, other)).toEqual([]);
    expect(labels("/user/dormant")).toEqual(["유저관리", "휴면유저"]);
  });
});
