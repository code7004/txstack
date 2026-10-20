import { getNavRoutes, useCurrentRoute, type NavRoute, type RouteTree } from "@txstack/route-meta";
import { TxAlert, TxBreadcrumb, TxNavBar, TxSideNav, TxSwitch } from "@txstack/ui";
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
  const { matches } = useCurrentRoute(routes);
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

  const menu = getNavRoutes(SAMPLE, (permissions) => admin && permissions.includes("admin"));

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

/**
 * 가로 메뉴(GNB) 예제. **셸 라우트의 자식만** 메뉴로 쓰고, 하위가 있는 항목만 그 아래에 드롭다운을 연다.
 * 실제 관리 화면(black-message 의 GNB)과 같은 짜임이다. 누르면 이동하지 않고 고른 이름만 바뀐다.
 */
const GNB_SAMPLE = {
  login: { path: "/login", meta: { label: "로그인", hidden: true } },
  app: {
    path: "/",
    meta: { label: "앱", hidden: true },
    children: {
      dashboard: { path: "/dashboard", meta: { label: "대시보드" } },
      members: {
        path: "/members",
        meta: { label: "회원" },
        children: {
          list: { path: "/members/list", meta: { label: "회원 목록" } },
          dormant: { path: "/members/dormant", meta: { label: "휴면 회원" } },
          detail: { path: "/members/:id", meta: { label: "회원 상세", hidden: true } }
        }
      },
      stats: {
        path: "/stats",
        meta: { label: "통계" },
        children: {
          send: { path: "/stats/send", meta: { label: "발송 통계" } },
          join: { path: "/stats/join", meta: { label: "가입 통계" } }
        }
      },
      history: { path: "/history", meta: { label: "히스토리" } },
      system: {
        path: "/system",
        meta: { label: "시스템", permissions: ["admin"] },
        children: {
          admins: { path: "/system/admins", meta: { label: "관리자", permissions: ["admin"] } },
          jobs: { path: "/system/jobs", meta: { label: "작업 큐", permissions: ["admin"] } }
        }
      }
    }
  }
} satisfies RouteTree;

function GnbDemo() {
  const [admin, setAdmin] = useState(false);
  const [focusOnly, setFocusOnly] = useState(false);
  const [picked, setPicked] = useState("대시보드");

  // 사용자마다 달라지므로 컴포넌트 안에서 거른다. 셸 라우트(app)의 자식만 메뉴다
  const menu = getNavRoutes(GNB_SAMPLE.app.children, (permissions) => admin && permissions.includes("admin"));
  const current = (label?: string) => (picked === label ? "page" : undefined);

  // 패널 안은 진짜 <a href> 라 누르면 패널이 닫힌다. 이동만 막고 고른 이름을 바꾼다
  const subMenu = (items: NavRoute[]) => (
    <div className="flex flex-col gap-1 whitespace-nowrap">
      {items.map((item) => (
        <a
          key={item.key}
          href={`#${item.key}`}
          aria-current={current(item.meta?.label)}
          className="rounded px-1 py-0.5 hover:underline aria-[current=page]:font-semibold"
          onClick={(event) => {
            event.preventDefault();
            setPicked(item.meta?.label ?? item.key);
          }}
        >
          {item.meta?.label ?? item.key}
        </a>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-4">
        <TxSwitch label="관리자로 보기" checked={admin} onChangeBool={setAdmin} />
        <TxSwitch label='▾ 숨기기 (toggle="focus")' checked={focusOnly} onChangeBool={setFocusOnly} />
      </div>

      {/* 드롭다운이 떠오를 자리를 비워 둔다 — 비워 두지 않으면 판 밖으로 잘린다 */}
      <div className="min-h-44">
        <TxNavBar panelWidth="item" toggle={focusOnly ? "focus" : "always"}>
          {menu.map((node) => {
            const label = node.meta?.label ?? node.key;
            const pick = () => setPicked(label);

            return <TxNavBar.Item key={node.key} label={label} as="button" type="button" aria-current={current(label)} onClick={pick} panel={node.children && subMenu(node.children)} />;
          })}
        </TxNavBar>
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          선택: <strong className="text-[color:var(--tx-color-text)]">{picked}</strong>
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
      <Block title="Why one route tree">
        <p className={muted}>라우트 정의와 메뉴 정의를 따로 관리하면, 주소를 하나 바꿀 때 두 곳을 고쳐야 합니다. 한 곳을 잊으면 메뉴가 없는 페이지를 가리키게 됩니다. 라우트 트리 하나만 두고 나머지는 모두 거기서 만들면 이런 일이 생기지 않습니다.</p>
        <CodeBlock language="text" title="트리 하나에서 만들어지는 것">{`routes (라우트 트리)
 ├─ buildRouteObjects   → 라우터에 넘길 라우트 목록
 ├─ getNavRoutes  → 메뉴
 └─ useCurrentRoute → 현재 위치 (경로 표시, 탭 제목)`}</CodeBlock>
      </Block>

      <Block title="This site is the example">
        <p className={muted}>이 사이트의 위쪽 메뉴, 왼쪽 메뉴, 메뉴에 마우스를 올리면 펼쳐지는 사이트 지도, 브라우저 탭 제목이 모두 라우트 트리 하나에서 만들어집니다. 아래 경로 표시도 같은 트리에서 지금 위치를 읽은 것입니다.</p>
        <Demo>
          <CurrentPlace />
        </Demo>
      </Block>

      <Block title="1. Declare routes">
        <p className={muted}>
          화면마다 주소(<code>path</code>), 화면(<code>element</code>), 메뉴에 보일 정보(<code>meta</code>)를 함께 적습니다. 하위 화면은 <code>children</code>에 넣습니다.
        </p>
        <p className={muted}>
          관리 화면은 보통 <strong>로그인 화면</strong>과, 헤더 · 메뉴를 그리는 <strong>셸 아래의 화면들</strong>로 나뉩니다. 셸 라우트(<code>app</code>)는 메뉴에 보이지 않게 <code>hidden</code>으로 두고, 메뉴는 그 <code>children</code>에서
          만듭니다(3단계).
        </p>
        <CodeBlock title="src/routes.tsx">{`import type { RouteTree } from "@txstack/route-meta";
import { Navigate, Outlet } from "react-router-dom";

export const routes = {
  login: { path: "/login", element: <Login />, meta: { label: "로그인", hidden: true } },

  app: {
    path: "/",
    element: <AppShell />,                                        // 헤더 · 메뉴 · <Outlet /> 을 그리는 셸
    meta: { label: "앱", hidden: true },
    children: {
      home: { index: true, element: <Navigate to="/dashboard" replace /> },
      dashboard: { path: "/dashboard", element: <Dashboard />, meta: { label: "대시보드" } },

      members: {
        path: "/members",
        element: <Outlet />,
        meta: { label: "회원" },
        children: {
          index: { index: true, element: <Navigate to="/members/list" replace /> },   // 상위 메뉴를 누르면 첫 하위로
          list: { path: "/members/list", element: <MemberList />, meta: { label: "회원 목록" } },
          detail: { path: "/members/:id", element: <MemberDetail />, meta: { label: "회원 상세", hidden: true } }
        }
      },

      settings: { path: "/settings", element: <Settings />, meta: { label: "설정", permissions: ["admin"] } }
    }
  }
} satisfies RouteTree;`}</CodeBlock>
        <p className={muted}>
          상위 메뉴(<code>회원</code>)에 따로 보여 줄 화면이 없다면, 첫 화면(<code>index</code>)에서 <code>Navigate</code>로 첫 하위 화면에 보냅니다. 그러면 메뉴의 상위 제목을 눌러도 빈 화면이 나오지 않습니다.
        </p>
        <TxAlert variant="info" title="satisfies로 붙여 주세요">
          <code>const routes: RouteTree = …</code>처럼 타입을 지정하면 <code>routes.app.children.members</code> 같은 자동 완성이 사라집니다. <code>satisfies</code>는 형식만 검사하고 원래 모양을 그대로 남깁니다.
        </TxAlert>
      </Block>

      <Block title="2. Connect the router">
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

      <Block title="3. Render the menu">
        <p className={muted}>
          <code>getNavRoutes</code>는 메뉴에 보일 항목만 골라 줍니다. 숨긴 화면(<code>hidden</code>), 꺼 둔 화면(<code>enabled: false</code>), 첫 화면(<code>index</code>)은 빠집니다. 결과는 <code>{"{ key, path, meta, children }"}</code> 모양이라{" "}
          <code>TxSideNav</code>나 <code>TxNavBar</code>로 바로 그릴 수 있습니다. 셸 아래 화면만 메뉴로 쓰므로 <code>routes.app.children</code>를 넘깁니다.
        </p>

        <h3 className="mt-2 font-semibold">세로 메뉴 — TxSideNav</h3>
        <CodeBlock title="src/SideMenu.tsx">{`import { getNavRoutes, type NavRoute } from "@txstack/route-meta";
import { TxSideNav } from "@txstack/ui";
import { NavLink } from "react-router-dom";

const MENU = getNavRoutes(routes.app.children);   // 권한을 안 쓰면 모듈 상수로 한 번만 만든다

const item = (node: NavRoute) =>
  node.children ? (
    <TxSideNav.Item key={node.key} label={node.meta?.label}>{node.children.map(item)}</TxSideNav.Item>
  ) : (
    <TxSideNav.Item key={node.key} label={node.meta?.label} as={NavLink} to={node.path} />
  );

export const SideMenu = () => <TxSideNav>{MENU.map(item)}</TxSideNav>;`}</CodeBlock>

        <h3 className="mt-2 font-semibold">가로 메뉴(GNB) — TxNavBar</h3>
        <p className={muted}>
          하위가 있는 항목에만 <code>panel</code>을 주고 <code>panelWidth=&quot;item&quot;</code>으로 두면, 하위 메뉴가 <strong>그 항목 바로 아래</strong>에 펼쳐집니다. 메뉴 전체를 한 판에 펼치면 열이 상위 항목과 따로 놓여 어느 것이 어느 항목의
          하위인지 헷갈리기 쉽습니다.
        </p>
        <CodeBlock title="src/Gnb.tsx">{`import { getNavRoutes, type NavRoute } from "@txstack/route-meta";
import { TxNavBar } from "@txstack/ui";
import { NavLink } from "react-router-dom";

const SubMenu = ({ items }: { items: NavRoute[] }) => (
  <div className="flex flex-col gap-1">
    {items.map((item) => (
      <NavLink key={item.key} to={item.path}>{item.meta?.label}</NavLink>
    ))}
  </div>
);

export function Gnb() {
  const { roles } = useUser();
  // 사용자마다 달라지므로 컴포넌트 안에서 거른다
  const menu = getNavRoutes(routes.app.children, (permissions) => permissions.some((p) => roles.includes(p)));

  return (
    <TxNavBar panelWidth="item">
      {menu.map((node) => (
        <TxNavBar.Item
          key={node.key}
          label={node.meta?.label}
          as={NavLink}
          to={node.path}
          panel={node.children && <SubMenu items={node.children} />}
        />
      ))}
    </TxNavBar>
  );
}`}</CodeBlock>
        <Demo>
          <GnbDemo />
        </Demo>
        <ul className={`flex list-disc flex-col gap-1 ps-5 ${muted}`}>
          <li>
            <strong>
              <code>children</code>은 다시 거르지 않아도 됩니다.
            </strong>{" "}
            <code>getNavRoutes</code>가 숨김 · 꺼짐 · 권한을 이미 걸러, 살아남은 것만 배열로 담아 줍니다.
          </li>
          <li>
            상위 제목은 링크이고, 옆의 <code>▾</code>가 하위 메뉴를 엽니다. 마우스는 올리기만 해도 열리고, <code>▾</code>는 키보드 · 터치로 여는 길입니다. 거슬린다면 <code>toggle=&quot;focus&quot;</code>로 평소에는 숨길 수 있습니다(
            <Link to="/docs/guide/layout#horizontal-and-vertical-menus" className="underline">
              Layout
            </Link>
            ).
          </li>
          <li>
            <code>TxAppShell</code>의 <code>top</code>에 넣을 때는 <code>label</code>을 주지 않습니다. 셸이 이미 <code>&lt;nav&gt;</code>로 감쌉니다.
          </li>
          <li>
            메뉴 전체를 한눈에 보여 주려면 줄 맨 오른쪽에 <code>TxNavBar.SiteMap</code>을 둡니다. 🗺️ 를 누르면 그 안에 넣은 것이 줄 전체 폭으로 열립니다.
          </li>
        </ul>
        <p className={muted}>
          두 패키지는 서로를 모릅니다. 메뉴 컴포넌트가 <code>as={"{NavLink}"}</code>로 링크를 받을 수 있게 열어 두었고, 둘을 잇는 코드는 위처럼 앱에 둡니다.
        </p>
      </Block>

      <Block title="4. Show the current location">
        <p className={muted}>
          <code>useCurrentRoute</code>는 지금 주소에 맞는 라우트와, 맨 위부터 이어지는 경로(<code>matches</code>)를 돌려줍니다. 경로 표시나 탭 제목을 만들 때 씁니다.
        </p>
        <CodeBlock title="src/Breadcrumb.tsx">{`const { matches } = useCurrentRoute(routes);

<TxBreadcrumb>
  {matches.map((node) => (
    <TxBreadcrumb.Item key={node.path} as={NavLink} to={node.path}>{node.meta?.label}</TxBreadcrumb.Item>
  ))}
</TxBreadcrumb>`}</CodeBlock>
      </Block>

      <Block title="5. Filter the menu by permission">
        <p className={muted}>
          <code>meta.permissions</code>가 있는 항목은 앱이 넘긴 판정 함수로 보일지 말지 정합니다. 권한을 어떻게 나눌지는 앱이 정하고, 라이브러리는 함수를 부르기만 합니다. 판정 함수를 넘기지 않으면 권한이 걸린 항목은 모두 숨겨집니다. 로그인한 사람에
          따라 결과가 달라지므로, 판정은 3단계의 <code>Gnb</code>처럼 컴포넌트 안에서 합니다.
        </p>
        <SideBySide>
          <CodeBlock title="권한 판정">{`const menu = getNavRoutes(routes.app.children, (permissions) =>
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
