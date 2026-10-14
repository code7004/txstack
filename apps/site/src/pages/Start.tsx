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

/** 무엇을 하려는지로 고른다. 넷은 따로 설치되고, 서로 없어도 동작한다 */
const PACKAGES = [
  { name: "@txstack/ui", when: "버튼, 폼, 표, 확인 창 같은 화면 컴포넌트가 필요할 때", peer: "react", guide: "/docs/tutorial", guideLabel: "Tutorial" },
  { name: "@txstack/route-meta", when: "라우트와 메뉴, 현재 위치 표시를 한 곳에서 관리하고 싶을 때", peer: "react-router-dom", guide: "/docs/guide/routing", guideLabel: "Routing & Menu" },
  { name: "@txstack/hooks", when: "목록의 검색 조건을 주소에 담거나, 객체 상태를 편하게 다루고 싶을 때", peer: "react-router-dom", guide: "/docs/guide/url-state", guideLabel: "URL State" },
  { name: "@txstack/axios", when: "토큰, 401 처리, 오류 메시지를 한 곳에 모은 API 클라이언트가 필요할 때", peer: "axios", guide: "/docs/guide/http-client", guideLabel: "HTTP Client" }
];

const muted = "text-slate-600 dark:text-slate-300";

export function Start() {
  return (
    <Page title="Getting Started" lead="필요한 패키지를 고르고, 설치해서 첫 화면을 띄우기까지 안내합니다. 5분이면 충분합니다.">
      <Block title="Which packages do you need">
        <p className={muted}>
          txstack은 네 개의 패키지로 나뉘어 있고, 각각 따로 설치합니다. 하려는 일에 맞는 것만 고르면 됩니다. 처음이라면 <code>@txstack/ui</code>부터 시작하세요.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-start" style={{ borderColor: "var(--tx-color-border)" }}>
                <th className="py-2 pe-4 text-start font-semibold">패키지</th>
                <th className="py-2 pe-4 text-start font-semibold">이럴 때 씁니다</th>
                <th className="py-2 pe-4 text-start font-semibold">함께 설치</th>
                <th className="py-2 text-start font-semibold">가이드</th>
              </tr>
            </thead>
            <tbody className={muted}>
              {PACKAGES.map((item) => (
                <tr key={item.name} className="border-b align-top" style={{ borderColor: "var(--tx-color-border)" }}>
                  <td className="py-2 pe-4 font-mono text-xs whitespace-nowrap text-[color:var(--tx-color-text)]">{item.name}</td>
                  <td className="py-2 pe-4">{item.when}</td>
                  <td className="py-2 pe-4 font-mono text-xs">{item.peer}</td>
                  <td className="py-2 whitespace-nowrap">
                    <Link to={item.guide} className="underline">
                      {item.guideLabel}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">&quot;함께 설치&quot;는 peer 의존성입니다. 앱에 이미 있다면 따로 설치하지 않아도 됩니다.</p>
      </Block>

      <Block title="Prerequisites">
        <ul className={`flex list-inside list-disc flex-col gap-1 ${muted}`}>
          <li>
            <strong>Node 20 이상</strong>, <strong>pnpm</strong> (npm·yarn도 쓸 수 있지만 이 문서는 pnpm 기준으로 설명합니다)
          </li>
          <li>
            <strong>React 18 이상</strong> 앱. 없다면 아래 1단계에서 만듭니다
          </li>
        </ul>
        <CodeBlock language="bash" title="버전 확인">{`node -v     # v20 이상
pnpm -v     # 없다면: npm i -g pnpm`}</CodeBlock>
      </Block>

      <Block title="1. Create an app">
        <p className={muted}>이미 React 앱이 있다면 건너뛰세요. 없다면 Vite로 새로 만듭니다.</p>
        <CodeBlock language="bash" title="sh">{`pnpm create vite my-app --template react-ts
cd my-app
pnpm install`}</CodeBlock>
        <p className={muted}>
          Vite가 기본으로 넣어 둔 <strong>예시 스타일은 비워 주세요.</strong> 시스템이 다크 모드일 때 이 스타일이 배경을 어둡게 칠해서 컴포넌트 글자가 잘 보이지 않습니다.
        </p>
        <CodeBlock language="bash" title="sh">{`: > src/index.css     # 내용만 비웁니다. main.tsx의 import는 그대로 둬도 됩니다
rm src/App.css`}</CodeBlock>
      </Block>

      <Block title="2. Install">
        <TxAlert variant="warning" title="아직 npm에 배포되지 않았습니다">
          지금은 저장소에서 직접 빌드한 패키지 파일(<code>.tgz</code>)로 설치합니다. npm에 배포된 뒤에는 아래의 한 줄로 바뀌고, 이후 단계는 같습니다.
        </TxAlert>

        <CodeBlock language="bash" title="지금 — 저장소에서 빌드해 설치">{`# my-app 옆에 txstack을 받아 빌드하고 패키지 파일로 묶습니다
cd ..
git clone https://github.com/code7004/txstack.git
cd txstack
pnpm install && pnpm build
pnpm -r --filter "./packages/*" exec pnpm pack --pack-destination "$PWD/.pack"

# 앱으로 돌아와 필요한 패키지를 설치합니다 (예: ui와 axios)
cd ../my-app
pnpm add ../txstack/.pack/txstack-ui-0.1.0.tgz
pnpm add ../txstack/.pack/txstack-axios-0.1.0.tgz axios`}</CodeBlock>

        <CodeBlock language="bash" title="npm 배포 후">{`pnpm add @txstack/ui
pnpm add @txstack/axios axios`}</CodeBlock>

        <p className={muted}>
          <code>react</code>와 <code>react-dom</code>은 peer 의존성이라 앱에 이미 설치된 버전을 사용합니다. 표(<code>ag-grid</code>)와 달력(<code>react-day-picker</code>)은 쓸 때만 따로 설치하면 됩니다.
        </p>
      </Block>

      <Block title="3. Import the stylesheet (ui)">
        <p className={muted}>
          앱 진입점에서 <strong>한 번만</strong> 불러옵니다. 이 줄이 없으면 컴포넌트에 스타일이 적용되지 않습니다.
        </p>
        <CodeBlock title="src/main.tsx">{`import "@txstack/ui/styles.css";`}</CodeBlock>
      </Block>

      <Block title="4. Your first screen (ui)">
        <p className={muted}>
          아래 코드를 그대로 <code>src/SignUp.tsx</code>로 저장합니다. 바로 아래 예제는 이 코드가 지금 이 페이지에서 실제로 동작하는 모습입니다. 입력란을 비워 둔 채 <strong>가입</strong>을 눌러 보세요.
        </p>

        {/* 결과를 먼저, 코드를 아래에. 통째 파일이라 나란히 두면 긴 줄이 잘린다 */}
        <Demo>
          <div className="w-full max-w-sm">
            <SignUp />
          </div>
        </Demo>
        <CodeBlock title="src/SignUp.tsx">{SIGN_UP_SOURCE}</CodeBlock>

        <p className={muted}>
          그리고 <code>App.tsx</code>에서 이 화면을 렌더링합니다.
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

      <Block title="5. Run it">
        <CodeBlock language="bash" title="sh">{`pnpm dev`}</CodeBlock>
        <p className={muted}>
          <code>http://localhost:5173</code>을 열어 위 예제와 같은 폼이 보이면 완료입니다. 오류 메시지는 입력란 아래에 나타나고, 모두 채워서 제출하면 화면 오른쪽 위에 알림이 뜹니다.
        </p>
        <TxAlert variant="success" title="이제 바로 쓸 수 있습니다">
          <code>TxToast</code>와 <code>TxDialog</code>는 호출하면 스스로 화면에 자리를 만듭니다. Provider를 따로 감쌀 필요가 없습니다.
        </TxAlert>
      </Block>

      <Block title="Using with Tailwind">
        <p className={muted}>
          Tailwind v4를 쓰는 앱이라면 3단계 대신 CSS 파일에서 불러오고, <strong>레이어 순서를 한 줄</strong> 지정합니다. 그래야 <code>className</code>으로 준 유틸리티 클래스가 컴포넌트 스타일보다 우선 적용됩니다.
        </p>
        <CodeBlock language="css" title="src/index.css">{`@layer theme, base, tx, components, utilities;

@import "tailwindcss";
@import "@txstack/ui/styles.css";`}</CodeBlock>
        <TxAlert variant="info" title="순서가 중요합니다">
          <code>tx</code>는 preflight(<code>base</code>)보다 뒤, <code>utilities</code>보다 앞이어야 합니다. 더 앞에 두면 preflight가 버튼의 배경과 여백을 지우고, 더 뒤에 두면 <code>className</code>이 적용되지 않습니다.
        </TxAlert>
      </Block>

      <Block title="Next steps">
        <p className={muted}>
          첫 화면이 떴다면{" "}
          <Link to="/docs/tutorial" className="underline">
            Tutorial
          </Link>
          에서 네 패키지를 모두 써서 목록 화면 하나를 끝까지 만들어 봅니다. 패키지 하나만 필요하다면 위 표의 가이드로 바로 가도 됩니다.
        </p>
      </Block>

      <Block title="Troubleshooting">
        <dl className={`flex flex-col gap-4 ${muted}`}>
          <div>
            <dt className="font-semibold text-[color:var(--tx-color-text)]">컴포넌트에 스타일이 적용되지 않습니다</dt>
            <dd>
              <code>@txstack/ui/styles.css</code>를 불러왔는지 확인하세요. Tailwind를 쓴다면 위의 레이어 순서 지정이 CSS 파일 <strong>맨 위</strong>에 있어야 합니다.
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-[color:var(--tx-color-text)]">글자가 배경에 묻혀 보이지 않습니다</dt>
            <dd>
              앱의 전역 CSS가 배경을 어둡게 칠했는데 컴포넌트는 라이트 모드인 경우입니다. 1단계처럼 템플릿 스타일을 비우거나, 다크 모드를 쓰려면{" "}
              <Link to="/docs/guide/dark-mode" className="underline">
                Dark mode
              </Link>{" "}
              문서를 참고해 <code>&lt;html class=&quot;dark&quot;&gt;</code>로 컴포넌트도 함께 다크 모드로 바꿔 주세요.
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-[color:var(--tx-color-text)]">
              <code>Invalid hook call</code> 오류가 납니다
            </dt>
            <dd>
              React가 두 벌 로드된 경우입니다. <code>link:</code>로 저장소를 직접 연결했을 때 생기며, <code>vite.config.ts</code>에 <code>{`resolve: { dedupe: ["react", "react-dom", "react-router-dom"] }`}</code>를 추가하면 해결됩니다.{" "}
              <code>.tgz</code>나 npm으로 설치했다면 생기지 않습니다.
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-[color:var(--tx-color-text)]">
              <code>@txstack/hooks</code>를 import할 수 없습니다
            </dt>
            <dd>
              이 패키지에는 루트 진입점이 없습니다. <code>@txstack/hooks/useUrlQuery</code>처럼 훅 이름까지 경로에 적어 주세요.
            </dd>
          </div>
        </dl>
      </Block>
    </Page>
  );
}
