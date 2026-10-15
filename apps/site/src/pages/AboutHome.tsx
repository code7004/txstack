import { LinkCard, LinkCardGrid } from "../components/LinkCard";
import { Page } from "../components/Page";

/** `/about` 의 인덱스 화면. */
export function AboutHome() {
  return (
    <Page title="About" lead="txstack을 어떻게 설계하고 검증했는지, 누가 만들었는지, 어디로 문의하는지 안내합니다.">
      <LinkCardGrid>
        <LinkCard to="/about/case-study" title="Case Study">
          무엇을 왜 나눴고, 어떻게 검증하나
        </LinkCard>
        <LinkCard to="/about/profile" title="Profile">
          만든 사람과 만든 이유
        </LinkCard>
        <LinkCard to="/about/contact" title="Contact">
          질문, 제안, 버그 제보
        </LinkCard>
      </LinkCardGrid>
    </Page>
  );
}
