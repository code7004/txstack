import { Link } from "react-router-dom";
import { CodeBlock } from "../../components/CodeBlock";
import { Block, Page } from "../../components/Page";
import ROUTES_SOURCE from "./app/routes.tsx?raw";
import { Packages, muted } from "./ExampleParts";

/** 세 화면을 등록하는 라우트 트리. 라우터 · 메뉴 · 지금 위치가 모두 여기서 나온다 */
export function ExampleRoutes() {
  return (
    <Page title="Routes" lead="세 화면을 등록하는 routes.tsx입니다. 이 트리 하나에서 라우터 · 왼쪽 메뉴 · 지금 위치 표시가 모두 나옵니다. 메뉴를 바꾸려면 트리만 고칩니다.">
      <Block title="The menu it makes">
        <p className={muted}>
          아래 트리를{" "}
          <Link to="/example/app" className="underline">
            App
          </Link>
          이 <code>getNavigableRoutes</code>로 읽으면 왼쪽 메뉴가 이렇게 나옵니다. 묶음 · 아이콘 · 권한 · 숨김이 모두 트리의 <code>meta</code>에서 옵니다.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <MenuPreview
            title="관리자"
            groups={[
              ["◔ 운영", ["대시보드", "오류 로그"]],
              ["◉ 관리", ["계정"]]
            ]}
          />
          <MenuPreview title="뷰어" groups={[["◔ 운영", ["대시보드", "오류 로그"]]]} note="관리 묶음은 permissions 로 빠집니다" />
        </div>
      </Block>

      <Block title="Source">
        <CodeBlock title="src/routes.tsx" maxHeight="40rem">
          {ROUTES_SOURCE}
        </CodeBlock>
        <Packages
          items={[
            ["RouteTree", "/api/route-meta#routetree"],
            ["RouteMeta", "/api/route-meta#routemeta"]
          ]}
        />
      </Block>

      <Block title="What the meta does">
        <ol className={`flex list-inside list-decimal flex-col gap-2 ${muted}`}>
          <li>
            <strong>
              <code>children</code>
            </strong>{" "}
            — 자식이 있는 노드는 메뉴에서 <strong>펼치는 묶음</strong>이 됩니다. 자식의 경로는 부모 경로로 시작하는 절대경로(<code>/ops/dashboard</code>)로 씁니다. 묶음 제목 주소(<code>/ops</code>)로 들어오면 그 안의 <code>index</code>가 첫 화면으로
            보냅니다.
          </li>
          <li>
            <strong>
              <code>label</code> · <code>description</code>
            </strong>{" "}
            — 메뉴의 이름이 되고, App이 화면 위에 제목 · 설명 · 경로 표시(운영 › 대시보드)로 씁니다.
          </li>
          <li>
            <strong>
              <code>icon</code>
            </strong>{" "}
            — 메뉴 이름 앞에 붙습니다. 아무 React 노드나 받으므로 아이콘 라이브러리의 컴포넌트를 그대로 넣어도 됩니다.
          </li>
          <li>
            <strong>
              <code>permissions</code>
            </strong>{" "}
            — 판정은 앱이 <code>getNavigableRoutes</code>에 넘기는 함수가 합니다. 묶음에 걸면 묶음째 빠집니다. 메뉴에서만 거르므로 주소로 직접 들어오는 것은 서버가 막아야 합니다.
          </li>
          <li>
            <strong>
              <code>hidden</code>
            </strong>{" "}
            — 메뉴에서만 빠지고 라우터에는 그대로 등록됩니다. 여기서는 없는 주소(<code>path: "*"</code>)를 받는 화면에 썼습니다. 목록에서 눌러 들어가는 상세 화면(<code>/admin/accounts/:id</code>)에도 씁니다.
          </li>
        </ol>
        <p className={muted}>
          트리를 라우터에 붙이는 다른 방법(<code>buildRouteObjects</code>)은{" "}
          <Link to="/docs/guide/routing" className="underline">
            Routing & Menu
          </Link>
          에 있습니다.
        </p>
      </Block>
    </Page>
  );
}

/** 트리에서 나오는 메뉴를 글자로 그린 그림. 실제 메뉴는 App 의 TxSideNav 가 그린다 */
function MenuPreview({ title, groups, note }: { title: string; groups: [group: string, items: string[]][]; note?: string }) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border p-4 text-sm" style={{ borderColor: "var(--tx-color-border)", backgroundColor: "var(--tx-color-surface)" }}>
      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{title}로 볼 때</span>
      <ul className="flex flex-col gap-1">
        {groups.map(([group, items]) => (
          <li key={group} className="flex flex-col gap-1">
            <span className="font-semibold">{group} ▾</span>
            <ul className="flex flex-col gap-1 ps-6 text-slate-600 dark:text-slate-300">
              {items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      {note && <span className="text-xs text-slate-500 dark:text-slate-400">{note}</span>}
    </div>
  );
}
