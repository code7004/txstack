import { LinkCard, LinkCardGrid } from "../../components/LinkCard";
import { Block, Page } from "../../components/Page";

/** 두 묶음 — ui 로 화면을 꾸미는 일, 나머지 세 패키지로 앱의 뼈대를 세우는 일 */
const DESIGN = [
  { to: "/docs/guide/tokens", title: "Tokens", what: "색, 모서리, 간격 같은 디자인 값을 CSS 변수로 바꿉니다. 값을 직접 바꿔 볼 수 있습니다" },
  { to: "/docs/guide/dark-mode", title: "Dark mode", what: "클래스 하나로 모든 컴포넌트가 다크 모드로 바뀝니다" },
  { to: "/docs/guide/layout", title: "Layout", what: "헤더, 메뉴, 본문 자리를 잡는 화면 틀과 좁은 화면 대응" }
];

const APP = [
  { to: "/docs/guide/routing", title: "Routing & Menu", pkg: "route-meta", what: "라우트를 한 곳에 선언하고 메뉴, 현재 위치, 권한별 메뉴를 만듭니다" },
  { to: "/docs/guide/url-state", title: "URL State", pkg: "hooks", what: "검색어, 필터, 페이지 같은 목록 조건을 주소에 담습니다" },
  { to: "/docs/guide/http-client", title: "HTTP Client", pkg: "axios", what: "토큰, 401 처리, 오류 메시지를 한 곳에 모은 API 클라이언트를 만듭니다" }
];

export function GuideHome() {
  return (
    <Page title="Guide" lead="네 패키지로 무엇을 만드는지 주제별로 정리했습니다. 각 장의 예제는 페이지 안에서 실제로 동작합니다.">
      <Block title="화면 디자인 — @txstack/ui">
        <LinkCardGrid>
          {DESIGN.map((item) => (
            <LinkCard key={item.to} to={item.to} title={item.title}>
              {item.what}
            </LinkCard>
          ))}
        </LinkCardGrid>
      </Block>

      <Block title="앱 구조 — route-meta · hooks · axios">
        <LinkCardGrid>
          {APP.map((item) => (
            <LinkCard key={item.to} to={item.to} title={item.title} aside={<span className="font-mono text-xs text-slate-500 dark:text-slate-400">{item.pkg}</span>}>
              {item.what}
            </LinkCard>
          ))}
        </LinkCardGrid>
      </Block>
    </Page>
  );
}
