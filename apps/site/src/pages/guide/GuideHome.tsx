import { LinkCard, LinkCardGrid } from "../../components/LinkCard";
import { Page } from "../../components/Page";

const TOPICS = [
  { to: "/docs/guide/tokens", title: "Tokens", what: "겉모습을 CSS 변수로 바꾼다. 값을 직접 돌려 볼 수 있다" },
  { to: "/docs/guide/dark-mode", title: "Dark mode", what: "클래스 하나로 토큰이 뒤집힌다. 부품에는 다크 분기가 없다" },
  { to: "/docs/guide/layout", title: "Layout", what: "셸의 슬롯 · 좁은 화면 · 가로와 세로 내비게이션" }
];

export function GuideHome() {
  return (
    <Page title="Guide" lead="부품을 어떻게 쓰는지가 아니라, 부품을 내 화면에 맞추는 법. 셋 다 예제가 실제로 돈다.">
      <LinkCardGrid>
        {TOPICS.map((item) => (
          <LinkCard key={item.to} to={item.to} title={item.title}>
            {item.what}
          </LinkCard>
        ))}
      </LinkCardGrid>
    </Page>
  );
}
