import { Link } from "react-router-dom";
import { LinkCard, LinkCardGrid } from "../../components/LinkCard";
import { Block, Page } from "../../components/Page";
import { muted } from "./ExampleParts";

/** `/example` 의 인덱스 화면. */
export function ExampleHome() {
  return (
    <Page title="Example" lead="txstack으로 끝까지 만든 화면입니다. 모두 이 페이지 안에서 실제로 동작하고, 화면을 그리는 코드 전체를 함께 보여 줍니다.">
      <Block title="An admin app in three screens">
        <p className={muted}>세 화면은 작은 운영 관리 앱 하나를 이루는 화면입니다. 각 페이지에서 화면 하나씩 직접 써 볼 수 있습니다.</p>
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
          <LinkCard to="/example/app" title="App">
            세 화면을 앱 하나로 묶는 App.tsx(TxAppShell)와 routes.tsx(RouteTree)
          </LinkCard>
        </LinkCardGrid>
      </Block>

      <Block title="Built with TanStack Query">
        <p className={muted}>
          세 화면은 txstack과 <strong>TanStack Query</strong>를 함께 씁니다. 조건은 <code>useUrlQuery</code>로 주소에, 요청은 <code>createHttpClient</code>로, 캐시와 다시 부르기는 TanStack Query로 나눕니다. txstack 패키지는 TanStack에 의존하지
          않으므로, 다른 데이터 라이브러리를 써도 됩니다. 설정은{" "}
          <Link to="/example/app" className="underline">
            App
          </Link>
          의 <code>App.tsx</code>에 있습니다.
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
