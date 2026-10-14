import { CodeBlock } from "../../components/CodeBlock";
import { LinkCard, LinkCardGrid } from "../../components/LinkCard";
import { Block, Page } from "../../components/Page";
import { muted } from "./ExampleParts";

/** `/example` 의 인덱스 화면. */
export function ExampleHome() {
  return (
    <Page title="Example" lead="txstack으로 끝까지 만든 화면입니다. 모두 이 페이지 안에서 실제로 동작하고, 화면을 그리는 코드 전체를 함께 보여 줍니다.">
      <LinkCardGrid>
        <LinkCard to="/example/accounts" title="Accounts">
          계정 목록과 옆 패널 편집, 여러 개 한꺼번에 지우기
        </LinkCard>
        <LinkCard to="/example/error-logs" title="Error Logs">
          주소에 담긴 필터와 기간, 표 안에서 상태 바꾸기, 상세 모달
        </LinkCard>
        <LinkCard to="/example/dashboard" title="Dashboard">
          숫자 카드와 막대를 누르면 걸러진 목록으로 이어지는 첫 화면
        </LinkCard>
        <LinkCard to="/example/github" title="GitHub Search">
          GitHub 검색 API를 실제로 호출하는 검색 화면
        </LinkCard>
      </LinkCardGrid>

      <Block title="Built with TanStack Query">
        <p className={muted}>
          GitHub Search를 뺀 세 예제는 txstack과 <strong>TanStack Query</strong>를 함께 씁니다. 조건은 <code>useUrlQuery</code>로 주소에, 요청은 <code>createHttpClient</code>로, 캐시와 다시 부르기는 TanStack Query로 나눕니다. txstack 패키지는
          TanStack에 의존하지 않으므로, 다른 데이터 라이브러리를 써도 됩니다.
        </p>
        <CodeBlock language="bash" title="sh">{`pnpm add @tanstack/react-query`}</CodeBlock>
        <CodeBlock title="src/main.tsx">{`const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);`}</CodeBlock>
      </Block>
    </Page>
  );
}
