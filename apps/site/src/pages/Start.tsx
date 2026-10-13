import { Link } from "react-router-dom";
import { TxAlert } from "@txstack/ui";
import { CodeBlock } from "../components/CodeBlock";
import { Block, Demo, Page } from "../components/Page";
import { SignUp } from "./start/SignUp";
import SIGN_UP_SOURCE from "./start/SignUp.tsx?raw";

/**
 * 설치부터 첫 화면까지. **처음 온 사람이 위에서 아래로 그대로 따라 치면 돌아야 한다** —
 * 그래서 조각이 아니라 통째로 붙여 넣을 수 있는 파일을 보이고, 그 파일이 이 페이지에서도 돈다
 * (`?raw` 로 같은 소스를 읽는다 — 보이는 코드와 도는 코드가 어긋날 수 없다).
 */

const NEXT_PACKAGES = [
  {
    name: "@txstack/route-meta",
    what: "라우트 트리 하나에서 라우터 · 메뉴 · 브레드크럼",
    peer: "react-router-dom",
    code: `import { buildRouteObjects, getNavigableRoutes } from "@txstack/route-meta";`,
    to: "/api/route-meta"
  },
  {
    name: "@txstack/hooks",
    what: "객체 상태 · URL 쿼리 상태. 훅마다 경로가 따로다",
    peer: "react-router-dom (useUrlQuery 만)",
    code: `import { useUrlQuery } from "@txstack/hooks/useUrlQuery";`,
    to: "/api/hooks"
  },
  {
    name: "@txstack/axios",
    what: "토큰 · 401 · 응답 봉투를 앱이 주입하는 HTTP 클라이언트",
    peer: "axios",
    code: `import { createHttpClient } from "@txstack/axios";`,
    to: "/api/axios"
  }
];

const muted = "text-slate-600 dark:text-slate-300";

export function Start() {
  return (
    <Page title="Getting Started" lead="빈 폴더에서 시작해 txstack 으로 만든 첫 화면이 뜨기까지. 5분이면 된다.">
      <Block title="준비물">
        <ul className={`flex list-inside list-disc flex-col gap-1 ${muted}`}>
          <li>
            <strong>Node 20 이상</strong> · <strong>pnpm</strong> (npm · yarn 도 되지만 이 문서는 pnpm 으로 적는다)
          </li>
          <li>
            <strong>React 18 이상</strong> 앱. 없으면 아래 1 단계에서 만든다
          </li>
        </ul>
        <CodeBlock language="bash" title="확인">{`node -v     # v20 이상
pnpm -v     # 없으면: npm i -g pnpm`}</CodeBlock>
      </Block>

      <Block title="1. 앱 만들기">
        <p className={muted}>이미 React 앱이 있으면 건너뛴다. 없으면 Vite 로 하나 만든다.</p>
        <CodeBlock language="bash" title="sh">{`pnpm create vite my-app --template react-ts
cd my-app
pnpm install`}</CodeBlock>
        <p className={muted}>
          Vite 가 넣어 둔 <strong>예시 스타일은 비운다.</strong> 시스템이 다크 모드면 그 스타일이 바탕을 어둡게 칠해서, 부품의 글자가 바탕에 묻힌다.
        </p>
        <CodeBlock language="bash" title="sh">{`: > src/index.css     # 내용만 비운다 — main.tsx 의 import 는 그대로 둬도 된다
rm src/App.css`}</CodeBlock>
      </Block>

      <Block title="2. 설치">
        <TxAlert variant="warning" title="아직 npm 에 올라가지 않았다">
          지금은 저장소에서 직접 빌드해 묶음 파일(<code>.tgz</code>)로 설치한다. npm 에 올라가면 아래 상자의 한 줄로 바뀐다 — 그 뒤의 단계는 똑같다.
        </TxAlert>

        <CodeBlock language="bash" title="지금 — 저장소에서 빌드해 설치">{`# my-app 옆에 txstack 을 받아 빌드하고 묶는다
cd ..
git clone https://github.com/code7004/txstack.git
cd txstack
pnpm install && pnpm build
pnpm -r --filter "./packages/*" exec pnpm pack --pack-destination "$PWD/.pack"

# 앱으로 돌아와 설치한다
cd ../my-app
pnpm add ../txstack/.pack/txstack-ui-0.1.0.tgz`}</CodeBlock>

        <CodeBlock language="bash" title="npm 배포 후">{`pnpm add @txstack/ui`}</CodeBlock>

        <p className={muted}>
          <code>react</code> · <code>react-dom</code> 은 peer 라 앱이 이미 가진 것을 쓴다. 표(<code>ag-grid</code>) · 달력(<code>react-day-picker</code>)은 쓸 때만 따로 설치한다.
        </p>
      </Block>

      <Block title="3. 스타일시트 연결">
        <p className={muted}>
          앱의 진입점에서 <strong>한 번만</strong> 불러온다. 이 줄이 없으면 부품이 맨 HTML 로 보인다.
        </p>
        <CodeBlock title="src/main.tsx">{`import "@txstack/ui/styles.css";`}</CodeBlock>
      </Block>

      <Block title="4. 첫 화면">
        <p className={muted}>
          아래 파일을 그대로 <code>src/SignUp.tsx</code> 로 만든다. 아래 판은 그 코드가 지금 이 페이지에서 실제로 도는 모습이다 — 칸을 비운 채 <strong>가입</strong>을 눌러 보라.
        </p>

        {/* 결과를 먼저, 코드를 아래에. 통째 파일이라 나란히 두면 긴 줄이 잘린다 */}
        <Demo>
          <div className="w-full max-w-sm">
            <SignUp />
          </div>
        </Demo>
        <CodeBlock title="src/SignUp.tsx">{SIGN_UP_SOURCE}</CodeBlock>

        <p className={muted}>
          그리고 <code>App.tsx</code> 가 이 화면을 그리게 한다.
        </p>
        <CodeBlock title="src/App.tsx">{`import { SignUp } from "./SignUp";

export default function App() {
  return (
    <main style={{ maxWidth: 420, margin: "4rem auto" }}>
      <SignUp />
    </main>
  );
}`}</CodeBlock>
      </Block>

      <Block title="5. 띄워 보기">
        <CodeBlock language="bash" title="sh">{`pnpm dev`}</CodeBlock>
        <p className={muted}>
          주소(<code>http://localhost:5173</code>)를 열어 위 판과 같은 폼이 보이면 끝이다. 오류 문구가 칸 아래에 붙고, 다 채우면 오른쪽 위에 알림이 뜬다.
        </p>
        <TxAlert variant="success" title="여기까지 왔으면 쓸 수 있다">
          <code>TxToast</code> · <code>TxDialog</code> 는 부를 때 스스로 자리를 만든다 — Provider 를 심지 않아도 된다.
        </TxAlert>
      </Block>

      <Block title="Tailwind 와 함께 쓴다면">
        <p className={muted}>
          Tailwind v4 를 쓰는 앱이면 3 단계 대신 CSS 에서 불러오고 <strong>레이어 순서를 한 줄</strong> 정한다. 그래야 <code>className</code> 으로 준 유틸리티가 부품 스타일을 이긴다.
        </p>
        <CodeBlock language="css" title="src/index.css">{`@layer theme, base, tx, components, utilities;

@import "tailwindcss";
@import "@txstack/ui/styles.css";`}</CodeBlock>
        <TxAlert variant="info" title="순서가 중요하다">
          <code>tx</code> 는 preflight(<code>base</code>) 뒤, 유틸리티 앞이어야 한다. 앞에 두면 preflight 가 버튼의 배경과 여백을 지우고, 뒤에 두면 <code>className</code> 이 안 먹는다.
        </TxAlert>
      </Block>

      <Block title="나머지 패키지">
        <p className={muted}>
          넷은 따로 설치한다 — 필요한 것만 고른다. 설치는 2 단계와 같고 이름만 바뀐다(<code>txstack-route-meta-0.1.0.tgz</code> 처럼).
        </p>

        <div className="flex flex-col gap-4">
          {NEXT_PACKAGES.map((item) => (
            <div key={item.name} className="flex flex-col gap-2">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <Link to={item.to} className="font-mono text-sm font-semibold underline">
                  {item.name}
                </Link>
                <span className={`text-sm ${muted}`}>{item.what}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">peer: {item.peer}</span>
              </div>
              <CodeBlock title="import">{item.code}</CodeBlock>
            </div>
          ))}
        </div>
      </Block>

      <Block title="막혔을 때">
        <dl className={`flex flex-col gap-4 ${muted}`}>
          <div>
            <dt className="font-semibold text-[color:var(--tx-color-text)]">부품이 맨 HTML 처럼 보인다</dt>
            <dd>
              <code>@txstack/ui/styles.css</code> 를 불러왔는지 본다. Tailwind 를 쓴다면 위의 레이어 순서 줄이 <strong>맨 위</strong>에 있어야 한다.
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-[color:var(--tx-color-text)]">글자가 바탕에 묻혀 안 보인다</dt>
            <dd>
              앱의 전역 CSS 가 바탕을 어둡게 칠했는데 부품은 밝은 모드인 경우다. 1 단계처럼 템플릿 스타일을 비우거나, 다크 모드를 쓰려면{" "}
              <Link to="/docs/guide/dark-mode" className="underline">
                Dark mode
              </Link>{" "}
              를 따라 <code>&lt;html class=&quot;dark&quot;&gt;</code> 로 부품도 함께 바꾼다.
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-[color:var(--tx-color-text)]">
              <code>Invalid hook call</code> 이 난다
            </dt>
            <dd>
              React 가 두 벌 잡힌 것이다. <code>link:</code> 로 저장소를 직접 이었을 때 생긴다 — <code>vite.config.ts</code> 에 <code>{`resolve: { dedupe: ["react", "react-dom", "react-router-dom"] }`}</code> 를 준다. <code>.tgz</code> 나 npm 으로
              설치했다면 생기지 않는다.
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-[color:var(--tx-color-text)]">
              <code>@txstack/hooks</code> 를 import 할 수 없다
            </dt>
            <dd>
              루트 진입점이 없다. 훅 이름까지 경로로 쓴다 — <code>@txstack/hooks/useUrlQuery</code>.
            </dd>
          </div>
        </dl>
      </Block>
    </Page>
  );
}
