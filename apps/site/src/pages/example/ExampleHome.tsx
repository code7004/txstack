import { LinkCard, LinkCardGrid } from "../../components/LinkCard";
import { Page } from "../../components/Page";

/** `/example` 의 인덱스 화면. */
export function ExampleHome() {
  return (
    <Page title="Example" lead="txstack으로 끝까지 만든 화면입니다. 모두 이 페이지 안에서 실제로 동작하고, 화면을 그리는 코드 전체를 함께 보여 줍니다.">
      <LinkCardGrid>
        <LinkCard to="/example/accounts" title="Accounts">
          계정 목록과 옆 패널 편집, 여러 개 한꺼번에 지우기
        </LinkCard>
        <LinkCard to="/example/github" title="GitHub Search">
          GitHub 검색 API를 실제로 호출하는 검색 화면
        </LinkCard>
      </LinkCardGrid>
    </Page>
  );
}
