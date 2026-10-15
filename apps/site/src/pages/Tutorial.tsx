import { Link } from "react-router-dom";
import { TxAlert } from "@txstack/ui";
import { CodeBlock } from "../components/CodeBlock";
import { INSTALL_TITLE, PrePublishNote } from "../components/PrePublish";
import { Block, Demo, Page } from "../components/Page";
import { MemberScreen } from "./tutorial/MemberScreen";
import MEMBER_API_SOURCE from "./tutorial/memberApi.ts?raw";
import MEMBER_SCREEN_SOURCE from "./tutorial/MemberScreen.tsx?raw";

const muted = "text-slate-600 dark:text-slate-300";

/**
 * **네 패키지가 한 화면에서 어떻게 맞물리는지** 보이는 장. 완성 화면은 이 페이지 안에서 돈다 —
 * 요청은 `memberApi.ts` 안의 가짜 서버로 가고, 검색어 · 페이지는 이 페이지의 진짜 주소에 실린다.
 * 보이는 코드와 도는 코드는 같은 파일이다(`?raw`).
 */
export function Tutorial() {
  return (
    <Page title="Tutorial" lead="회원 목록 화면 하나를 처음부터 끝까지 만듭니다. 네 패키지를 모두 쓰고, 완성된 화면은 이 페이지에서 직접 써 볼 수 있습니다.">
      <TxAlert variant="info" title="이 화면을 만듭니다">
        검색, 목록, 페이지 이동, 회원 등록, 삭제 확인, 알림이 있는 화면입니다. 맨 아래에 <strong>그대로 붙여 넣을 수 있는 전체 코드</strong>가 있습니다.
      </TxAlert>

      <Block title="Before you start">
        <p className={muted}>
          <Link to="/docs/start" className="underline">
            Getting Started
          </Link>
          를 마친 React 앱에서 시작합니다. 이번에는 네 패키지와 함께 <code>react-router-dom</code>, <code>axios</code>가 필요하고, 화면 배치에 쓴 Tailwind도 설치합니다.
        </p>
        <CodeBlock language="bash" title={INSTALL_TITLE}>{`pnpm add @txstack/ui @txstack/route-meta @txstack/hooks @txstack/axios`}</CodeBlock>
        <PrePublishNote />
        <CodeBlock language="bash" title="sh">{`pnpm add react-router-dom axios
pnpm add -D tailwindcss @tailwindcss/vite`}</CodeBlock>
        <div className="overflow-x-auto">
          <table className="site-stack-table w-full text-sm">
            <tbody className={muted}>
              {[
                ["route-meta", "화면을 라우트에 등록하고 메뉴에 띄웁니다", "1단계"],
                ["axios", "회원 API를 부르는 클라이언트를 만듭니다", "2단계"],
                ["hooks", "검색어와 페이지를 주소에 담습니다", "3단계"],
                ["ui", "검색창, 표, 등록 폼, 확인 창, 알림을 그립니다", "4~6단계"]
              ].map(([pkg, what, step]) => (
                <tr key={pkg} className="border-b" style={{ borderColor: "var(--tx-color-border)" }}>
                  <td className="py-2 pe-4 font-mono text-xs whitespace-nowrap text-[color:var(--tx-color-text)]">{pkg}</td>
                  <td className="py-2 pe-4">{what}</td>
                  <td className="py-2 whitespace-nowrap">{step}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Block>

      <Block title="1. Register the screen — route-meta">
        <p className={muted}>
          라우트 트리에 화면을 추가합니다. <code>meta.label</code>을 적으면 메뉴에 자동으로 나타나고, 경로 표시와 탭 제목에도 쓰입니다. 라우트와 메뉴를 따로 고칠 필요가 없습니다.
        </p>
        <CodeBlock title="src/routes.tsx">{`export const routes = {
  home: { path: "/", element: <Home />, meta: { label: "홈" } },
  members: { path: "/members", element: <MemberScreen />, meta: { label: "회원" } }   // ← 추가
} satisfies RouteTree;`}</CodeBlock>
        <p className={muted}>
          라우트 트리를 라우터와 메뉴에 연결하는 방법은{" "}
          <Link to="/docs/guide/routing" className="underline">
            Routing & Menu
          </Link>
          에 있습니다.
        </p>
      </Block>

      <Block title="2. Create an API client — axios">
        <p className={muted}>클라이언트를 한 번 만들어 두고 화면마다 가져다 씁니다. 토큰을 붙이는 방법과 응답에서 데이터를 꺼내는 방법을 여기서 정합니다.</p>
        <CodeBlock title="src/memberApi.ts">{`import { createHttpClient } from "@txstack/axios";

export const api = createHttpClient({
  baseURL: "/api",
  getToken: () => localStorage.getItem("accessToken"),
  unwrap: (data) => (data as { body: unknown }).body   // 서버가 { body: ... }로 감싸 보낼 때
});`}</CodeBlock>
      </Block>

      <Block title="3. Keep the search in the URL — hooks">
        <p className={muted}>
          검색어와 페이지를 <code>useState</code> 대신 <code>useUrlQuery</code>로 둡니다. 상세 화면에 갔다가 돌아오거나 새로고침해도 조건이 그대로 남습니다.
        </p>
        <CodeBlock title="src/MemberScreen.tsx">{`const [query, setQuery] = useUrlQuery({ defaults: { q: "", page: 1 } });

// 검색어가 바뀌면 1페이지로 — 3페이지를 보다가 조건을 바꾸면 빈 화면이 나올 수 있습니다
const search = (q: string) => setQuery({ q, page: 1 });`}</CodeBlock>
      </Block>

      <Block title="4. Load the list">
        <p className={muted}>
          조건이 바뀔 때마다 2단계의 클라이언트로 목록을 불러옵니다. 실패하면 <code>parseApiError</code>로 메시지를 꺼내 알림으로 보여 줍니다.
        </p>
        <CodeBlock title="src/MemberScreen.tsx">{`useEffect(() => {
  api
    .get<MemberPage>("/members", { q: query.q, page: query.page, size: 5 })
    .then(setData)
    .catch((err) => TxToast.show({ variant: "danger", title: "목록을 불러오지 못했습니다", message: parseApiError(err).message }));
}, [query.q, query.page]);

<TxSearchInput placeholder="이름, 메일로 검색" onSubmitText={search} onClear={() => search("")} />`}</CodeBlock>
        <p className={muted}>
          <code>TxSearchInput</code>은 글자를 입력할 때(<code>onChangeText</code>)와 Enter를 눌렀을 때(<code>onSubmitText</code>)를 나눠 알려 줍니다. 서버 조회는 Enter 쪽에 연결해야 글자마다 요청이 나가지 않습니다.
        </p>
      </Block>

      <Block title="5. Registration form — ui">
        <p className={muted}>
          <code>TxForm</code>은 라벨, 입력란, 오류 메시지를 서로 연결해 줍니다. 무엇이 잘못됐는지 판단하는 것은 앱이 하고, 오류 문구를 <code>error</code>로 넘기면 입력란 아래에 표시됩니다.
        </p>
        <CodeBlock title="src/MemberScreen.tsx">{`<TxForm noValidate labelWidth="3.5rem" onSubmit={submit}>
  <TxForm.Input caption="이름" value={draft.name} onChangeText={…} error={error} required />
  <TxForm.Input caption="메일" type="email" value={draft.email} onChangeText={…} />
  <TxButton type="submit" label="저장" />
</TxForm>`}</CodeBlock>
        <TxAlert variant="warning" title="noValidate를 빼면">
          브라우저가 먼저 <code>required</code> 입력란을 검사해 자체 말풍선을 띄우고 제출을 막습니다. 그러면 앱의 오류 메시지가 나타나지 않습니다. <code>required</code>는 남겨 두세요. 화면 낭독기가 &quot;필수&quot;라고 읽어 줍니다.
        </TxAlert>
      </Block>

      <Block title="6. Confirm and notify — ui">
        <p className={muted}>
          <code>TxDialog.confirm</code>은 사용자가 고를 때까지 기다렸다가 결과를 돌려줍니다. <code>TxDialog</code>와 <code>TxToast</code>는 호출하면 스스로 화면에 자리를 만들어서, 앱에 Provider를 따로 둘 필요가 없습니다.
        </p>
        <CodeBlock title="src/MemberScreen.tsx">{`const remove = async (member: Member) => {
  const yes = await TxDialog.confirm({ title: "회원을 삭제할까요?", tone: "danger", confirmLabel: "삭제" });
  if (!yes) return;

  await api.delete(\`/members/\${member.id}\`);
  TxToast.show({ variant: "info", title: "삭제했습니다" });
};`}</CodeBlock>
        <p className={muted}>
          검색 결과가 없을 때는 빈 표 대신 <code>TxEmptyState</code>로 안내하고, 아래에는 <code>TxPagination</code>을 둡니다. 페이지를 바꾸면 <code>setQuery({"{ page }"})</code>로 주소에 담습니다.
        </p>
      </Block>

      <Block title="The finished screen">
        <p className={muted}>
          검색하고, 등록하고, 삭제해 보세요. 검색어나 페이지를 바꾸면 <strong>이 페이지의 주소</strong>가 바뀌고, 새로고침해도 같은 조건으로 열립니다. 데이터는 예제용 가짜 서버에 있어서 새로고침하면 처음 상태로 돌아갑니다.
        </p>

        <Demo>
          <MemberScreen />
        </Demo>
      </Block>

      <Block title="Run it as an app">
        <p className={muted}>
          아래 다섯 파일과 맨 아래의 두 파일(<code>memberApi.ts</code>, <code>MemberScreen.tsx</code>)이면 위 화면이 앱으로 뜹니다. Getting Started에서 만든 Vite 앱의 같은 이름 파일을 바꿉니다.
        </p>
        <CodeBlock title="vite.config.ts">{`import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()]
});`}</CodeBlock>
        <CodeBlock language="css" title="src/index.css">{`/* 레이어 순서 — txstack(tx)은 Tailwind 의 preflight(base) 뒤, 유틸리티 앞 */
@layer theme, base, tx, components, utilities;

@import "tailwindcss";
@import "@txstack/ui/styles.css";`}</CodeBlock>
        <CodeBlock title="src/main.tsx">{`import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);`}</CodeBlock>
        <CodeBlock title="src/routes.tsx">{`import type { RouteTree } from "@txstack/route-meta";
import { Navigate } from "react-router-dom";
import { MemberScreen } from "./MemberScreen";

export const routes = {
  home: { index: true, element: <Navigate to="/members" replace /> },
  members: { path: "/members", element: <MemberScreen />, meta: { label: "회원" } }
} satisfies RouteTree;`}</CodeBlock>
        <CodeBlock title="src/App.tsx">{`import { RouteRenderer, getNavigableRoutes } from "@txstack/route-meta";
import { NavLink } from "react-router-dom";
import { routes } from "./routes";

const menu = getNavigableRoutes(routes);

export function App() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 p-6">
      <nav className="flex gap-4">
        {menu.map((item) => (
          <NavLink key={item.key} to={item.path} className="font-semibold">
            {item.meta?.label}
          </NavLink>
        ))}
      </nav>
      <RouteRenderer tree={routes} />
    </div>
  );
}`}</CodeBlock>
        <CodeBlock language="bash" title="sh">{`pnpm dev`}</CodeBlock>
        <p className={muted}>
          화면이 여러 개인 앱으로 이어 가려면{" "}
          <Link to="/example#put-them-in-an-app" className="underline">
            Example › Put them in an app
          </Link>
          을 보세요. 같은 방식에 레이아웃(<code>TxAppShell</code>) · 메뉴 · TanStack Query를 더해 화면 셋을 묶습니다.
        </p>
      </Block>

      <Block title="Full code">
        <p className={muted}>
          위 화면의 소스 그대로입니다. 두 파일을 <code>src/</code>에 넣고, 1단계처럼 라우트에 <code>MemberScreen</code>을 등록하면 같은 화면이 뜹니다. 화면 배치는 Tailwind 클래스로 잡았습니다.
        </p>
        <CodeBlock title="src/memberApi.ts">{MEMBER_API_SOURCE}</CodeBlock>
        <TxAlert variant="info" title="가짜 서버 부분은 지우세요">
          <code>memberApi.ts</code>의 아래쪽은 이 페이지에서 동작하게 하려고 넣은 가짜 서버입니다. 실제 앱에서는 표시된 줄 아래를 지우면 <code>baseURL</code>의 진짜 서버로 요청합니다.
        </TxAlert>
        <CodeBlock title="src/MemberScreen.tsx">{MEMBER_SCREEN_SOURCE}</CodeBlock>
      </Block>
    </Page>
  );
}
