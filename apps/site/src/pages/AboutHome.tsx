import { LinkCard, LinkCardGrid } from "../components/LinkCard";
import { Page } from "../components/Page";

/** `/about` 의 인덱스 화면. */
export function AboutHome() {
  return (
    <Page title="About" lead="만든 사람과, 묻고 답하는 자리.">
      <LinkCardGrid>
        <LinkCard to="/about/profile" title="Profile">
          만든 사람과 만든 이유
        </LinkCard>
        <LinkCard to="/about/contact" title="Contact">
          질문 · 제안 · 버그
        </LinkCard>
      </LinkCardGrid>
    </Page>
  );
}
