import { getNavigableRoutes, useCurrentRouteNode, type NavRoute, type RouteTree } from "@txstack/route-meta";
import { TxAlert, TxBreadcrumb, TxSideNav, TxSwitch } from "@txstack/ui";
import { useState, type ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { CodeBlock } from "../../components/CodeBlock";
import { Block, Demo, Page, SideBySide } from "../../components/Page";
import { routes } from "../../routes";

const muted = "text-slate-600 dark:text-slate-300";

/**
 * 권한 예제용 작은 트리. **화면(`element`)은 없어도 된다** — 메뉴만 만들어 보는 자리라
 * 라우터에 올리지 않는다. 누르면 이동하지 않고 고른 이름만 바뀐다.
 */
const SAMPLE = {
  dashboard: { path: "/dashboard", meta: { label: "대시보드" } },
  members: {
    path: "/members",
    meta: { label: "회원" },
    children: {
      list: { path: "/members/list", meta: { label: "회원 목록" } },
      detail: { path: "/members/:id", meta: { label: "회원 상세", hidden: true } }
    }
  },
  settings: {
    path: "/settings",
    meta: { label: "설정", permissions: ["admin"] },
    children: {
      roles: { path: "/settings/roles", meta: { label: "권한 관리", permissions: ["admin"] } },
      audit: { path: "/settings/audit", meta: { label: "감사 로그", permissions: ["admin"] } }
    }
  }
} satisfies RouteTree;

/** 이 페이지의 위치. 사이트의 진짜 트리에서 읽는다 */
function CurrentPlace() {
  const { matches } = useCurrentRouteNode(routes);
  const chain = matches.filter((node) => node.meta?.label);

  return (
    <TxBreadcrumb>
      <TxBreadcrumb.Item as={Link} to="/">
        Home
      </TxBreadcrumb.Item>
      {chain.map((node, index) =>
        index < chain.length - 1 && node.path ? (
          <TxBreadcrumb.Item key={node.path} as={NavLink} to={node.path}>
            {node.meta?.label}
          </TxBreadcrumb.Item>
        ) : (
          <TxBreadcrumb.Item key={index}>{node.meta?.label}</TxBreadcrumb.Item>
        )
      )}
    </TxBreadcrumb>
  );
}

/** 권한을 켜고 끄면 메뉴가 바뀐다. 판정은 앱이 넘기는 함수 하나다 */
function PermissionDemo() {
  const [admin, setAdmin] = useState(false);
  const [picked, setPicked] = useState("대시보드");

  const menu = getNavigableRoutes(SAMPLE, (permissions) => admin && permissions.includes("admin"));

  const item = (node: NavRoute): ReactNode =>
    node.children ? (
      <TxSideNav.Item key={node.key} label={node.meta?.label ?? node.key} defaultOpen>
        {node.children.map(item)}
      </TxSideNav.Item>
    ) : (
      <TxSideNav.Item key={node.key} label={node.meta?.label ?? node.key} as="button" type="button" aria-current={picked === node.meta?.label ? "page" : undefined} onClick={() => setPicked(node.meta?.label ?? "")} />
    );

  return (
    <div className="flex flex-col gap-4">
      <TxSwitch label="관리자로 보기" checked={admin} onChangeBool={setAdmin} />
      <div className="grid gap-4 sm:grid-cols-[12rem_1fr]">
        <TxSideNav>{menu.map(item)}</TxSideNav>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          선택: <strong className="text-[color:var(--tx-color-text)]">{picked}</strong>
          <br />
          &quot;회원 상세&quot;는 <code>hidden</code>이라 메뉴에는 없지만, 주소로는 열립니다.
        </p>
      </div>
    </div>
  );
}

export function GuideRouting() {
  return (
    <Page
      title="Routing & Menu"
      lead={
        <>
          라우트를 한 곳에 선언하면 라우터, 메뉴, 현재 위치 표시가 모두 거기서 만들어집니다. <code>@txstack/route-meta</code>를 사용합니다.
        </>
      }
    >
      <Block title="왜 한 곳에 모으나요">
        <p className={muted}>라우트 정의와 메뉴 정의를 따로 관리하면, 주소를 하나 바꿀 때 두 곳을 고쳐야 합니다. 한 곳을 잊으면 메뉴가 없는 페이지를 가리키게 됩니다. 라우트 트리 하나만 두고 나머지는 모두 거기서 만들면 이런 일이 생기지 않습니다.</p>
        <CodeBlock language="text" title="트리 하나에서 만들어지는 것">{`routes (라우트 트리)
 ├─ buildRouteObjects   → 라우터에 넘길 라우트 목록
 ├─ getNavigableRoutes  → 메뉴
 └─ useCurrentRouteNode → 현재 위치 (경로 표시, 탭 제목)`}</CodeBlock>
      </Block>

      <Block title="이 사이트가 예제입니다">
        <p className={muted}>이 사이트의 위쪽 메뉴, 왼쪽 메뉴, 메뉴에 마우스를 올리면 펼쳐지는 사이트 지도, 브라우저 탭 제목이 모두 라우트 트리 하나에서 만들어집니다. 아래 경로 표시도 같은 트리에서 지금 위치를 읽은 것입니다.</p>
        <Demo>
          <CurrentPlace />
        </Demo>
      </Block>

      <Block title="1. 라우트 선언하기">
        <p className={muted}>
          화면마다 주소(<code>path</code>), 화면(<code>element</code>), 메뉴에 보일 정보(<code>meta</code>)를 함께 적습니다. 하위 화면은 <code>children</code>에 넣습니다.
        </p>
        <CodeBlock title="src/routes.tsx">{`import type { RouteTree } from "@txstack/route-meta";

export const routes = {
  home: { path: "/", element: <Home />, meta: { label: "홈" } },

  members: {
    path: "/members",
    element: <Outlet />,
    meta: { label: "회원" },
    children: {
      index: { index: true, element: <MemberList /> },                         // /members 첫 화면
      detail: { path: "/members/:id", element: <MemberDetail />, meta: { label: "회원 상세", hidden: true } }
    }
  },

  settings: { path: "/settings", element: <Settings />, meta: { label: "설정", permissions: ["admin"] } }
} satisfies RouteTree;`}</CodeBlock>
        <TxAlert variant="info" title="satisfies로 붙여 주세요">
          <code>const routes: RouteTree = …</code>처럼 타입을 지정하면 <code>routes.members.children.detail</code> 같은 자동 완성이 사라집니다. <code>satisfies</code>는 형식만 검사하고 원래 모양을 그대로 남깁니다.
        </TxAlert>
      </Block>

      <Block title="2. 라우터에 연결하기">
        <p className={muted}>
          <code>buildRouteObjects</code>가 트리를 React Router가 읽는 형식으로 바꿉니다. 렌더링할 때마다 다시 만들지 않도록 모듈 상수로 둡니다.
        </p>
        <CodeBlock title="src/App.tsx">{`import { buildRouteObjects } from "@txstack/route-meta";
import { useRoutes } from "react-router-dom";

const ROUTE_OBJECTS = buildRouteObjects(routes);

export function App() {
  return useRoutes(ROUTE_OBJECTS);
}`}</CodeBlock>
      </Block>

      <Block title="3. 메뉴 그리기">
        <p className={muted}>
          <code>getNavigableRoutes</code>는 메뉴에 보일 항목만 골라 줍니다. 숨긴 화면(<code>hidden</code>)과 첫 화면(<code>index</code>)은 빠집니다. 결과는 <code>{"{ key, path, meta, children }"}</code> 모양이라 <code>TxSideNav</code>나{" "}
          <code>TxNavBar</code>로 바로 그릴 수 있습니다.
        </p>
        <CodeBlock title="src/Menu.tsx">{`import { getNavigableRoutes, type NavRoute } from "@txstack/route-meta";
import { TxSideNav } from "@txstack/ui";
import { NavLink } from "react-router-dom";

const MENU = getNavigableRoutes(routes);

const item = (node: NavRoute) =>
  node.children ? (
    <TxSideNav.Item key={node.key} label={node.meta?.label}>{node.children.map(item)}</TxSideNav.Item>
  ) : (
    <TxSideNav.Item key={node.key} label={node.meta?.label} as={NavLink} to={node.path} />
  );

export const Menu = () => <TxSideNav>{MENU.map(item)}</TxSideNav>;`}</CodeBlock>
        <p className={muted}>
          두 패키지는 서로를 모릅니다. 메뉴 컴포넌트가 <code>as={"{NavLink}"}</code>로 링크를 받을 수 있게 열어 두었고, 둘을 잇는 코드는 위처럼 앱에 둡니다.
        </p>
      </Block>

      <Block title="4. 현재 위치 표시하기">
        <p className={muted}>
          <code>useCurrentRouteNode</code>는 지금 주소에 맞는 라우트와, 맨 위부터 이어지는 경로(<code>matches</code>)를 돌려줍니다. 경로 표시나 탭 제목을 만들 때 씁니다.
        </p>
        <CodeBlock title="src/Breadcrumb.tsx">{`const { matches } = useCurrentRouteNode(routes);

<TxBreadcrumb>
  {matches.map((node) => (
    <TxBreadcrumb.Item key={node.path} as={NavLink} to={node.path}>{node.meta?.label}</TxBreadcrumb.Item>
  ))}
</TxBreadcrumb>`}</CodeBlock>
      </Block>

      <Block title="5. 권한에 따라 메뉴 거르기">
        <p className={muted}>
          <code>meta.permissions</code>가 있는 항목은 앱이 넘긴 판정 함수로 보일지 말지 정합니다. 권한을 어떻게 나눌지는 앱이 정하고, 라이브러리는 함수를 부르기만 합니다. 판정 함수를 넘기지 않으면 권한이 걸린 항목은 모두 숨겨집니다.
        </p>
        <SideBySide>
          <CodeBlock title="권한 판정">{`const menu = getNavigableRoutes(routes, (permissions) =>
  permissions.some((p) => user.roles.includes(p))
);`}</CodeBlock>
          <Demo>
            <PermissionDemo />
          </Demo>
        </SideBySide>
        <TxAlert variant="warning" title="메뉴에서 숨기는 것은 보안이 아닙니다">
          메뉴에서 빠져도 주소를 알면 화면은 열립니다. 실제 접근 제한은 화면이나 서버에서 따로 확인해야 합니다.
        </TxAlert>
      </Block>

      <p className={muted}>
        옵션 전체는{" "}
        <Link to="/api/route-meta" className="underline">
          API › route-meta
        </Link>
        에 정리해 두었습니다.
      </p>
    </Page>
  );
}
