import { Link } from "react-router-dom";
import { CodeBlock } from "../../components/CodeBlock";
import { LinkCard, LinkCardGrid } from "../../components/LinkCard";
import { Block, Page } from "../../components/Page";
import { DEMO_REPO_URL } from "../../lib/links";
import APP_SOURCE from "@demo/App.tsx?raw";
import CSS_SOURCE from "@demo/index.css?raw";
import API_SOURCE from "@demo/lib/api.ts?raw";
import MAIN_SOURCE from "@demo/main.tsx?raw";
import MOCK_SOURCE from "@demo/mock/server.ts?raw";
import ROUTES_SOURCE from "@demo/routes.tsx?raw";
import { SourceTabs, muted } from "./ExampleParts";

/** `/example` 의 인덱스 화면. */
export function ExampleHome() {
  return (
    <Page title="Example" lead="txstack으로 끝까지 만든 화면입니다. 모두 이 페이지 안에서 실제로 동작하고, 화면을 그리는 코드 전체를 함께 보여 줍니다.">
      <Block title="An admin app in three screens">
        <p className={muted}>
          세 화면은 작은 운영 관리 앱 하나(<code>apps/demo</code>)의 화면입니다. 이 사이트는 그 앱의 코드를 그대로 가져다 보여 주고, 앱은 사이트 없이 따로 실행됩니다.
        </p>
        <LinkCardGrid>
          <LinkCard to="/example/dashboard" title="Dashboard">
            운영 상태 요약. 숫자를 누르면 걸러진 오류 로그로 이어집니다
          </LinkCard>
          <LinkCard to="/example/accounts" title="Accounts">
            검색 · 필터 · 정렬 · 등록 · 수정 · 선택 삭제
          </LinkCard>
          <LinkCard to="/example/error-logs" title="Error Logs">
            오류 조회 · 기간 필터 · 표 안 상태 변경 · 상세 보기
          </LinkCard>
        </LinkCardGrid>
      </Block>

      <Block title="Run the whole app">
        <p className={muted}>
          메뉴 · 레이아웃 · 다크 모드 · 가짜 API까지 갖춘 전체 프로젝트입니다. 외부 서버 없이 동작합니다. 저장소 안에서는 아래 명령으로 띄웁니다(
          <code>http://localhost:6420</code>).
        </p>
        <CodeBlock language="bash" title="sh">{`git clone https://github.com/code7004/txstack.git
cd txstack
pnpm install && pnpm build
pnpm --filter @txstack/demo dev`}</CodeBlock>
        <p className={muted}>
          저장소 밖으로 가져가 실행하는 방법(npm 배포 전이라 패키지 파일로 설치)과 실제 서버로 바꾸는 방법은{" "}
          <a href={`${DEMO_REPO_URL}#readme`} className="underline" target="_blank" rel="noreferrer">
            apps/demo/README
          </a>
          에 있습니다. 아래는 화면 말고 앱의 나머지입니다 — 진입점과 Provider, 레이아웃, 라우트, 스타일, API 클라이언트, 가짜 서버.
        </p>
        <SourceTabs
          files={[
            { name: "main.tsx", path: "apps/demo/src/main.tsx", source: MAIN_SOURCE },
            { name: "App.tsx", path: "apps/demo/src/App.tsx", source: APP_SOURCE },
            { name: "routes.tsx", path: "apps/demo/src/routes.tsx", source: ROUTES_SOURCE },
            { name: "index.css", path: "apps/demo/src/index.css", source: CSS_SOURCE },
            { name: "lib/api.ts", path: "apps/demo/src/lib/api.ts", source: API_SOURCE },
            { name: "mock/server.ts", path: "apps/demo/src/mock/server.ts", source: MOCK_SOURCE }
          ]}
        />
      </Block>

      <Block title="Built with TanStack Query">
        <p className={muted}>
          세 화면은 txstack과 <strong>TanStack Query</strong>를 함께 씁니다. 조건은 <code>useUrlQuery</code>로 주소에, 요청은 <code>createHttpClient</code>로, 캐시와 다시 부르기는 TanStack Query로 나눕니다. txstack 패키지는 TanStack에 의존하지
          않으므로, 다른 데이터 라이브러리를 써도 됩니다. 설정은 위 <code>main.tsx</code>에 있습니다.
        </p>
      </Block>

      <Block title="More">
        <LinkCardGrid>
          <LinkCard to="/example/github" title="GitHub Search">
            GitHub 검색 API를 실제로 호출하는 검색 화면 — 진짜 요청 · 지연 · 403까지
          </LinkCard>
          <LinkCard to="/docs/tutorial" title="Tutorial">
            화면 하나를 처음부터 만들어 앱으로 띄우기까지
          </LinkCard>
        </LinkCardGrid>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          컴포넌트의 props 전체는{" "}
          <Link to="/api/ui#components-by-category" className="underline">
            API › ui
          </Link>
          에서 각 컴포넌트의 Storybook 문서로 이어집니다.
        </p>
      </Block>
    </Page>
  );
}
