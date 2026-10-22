import { LinkCard, LinkCardGrid } from "../../components/LinkCard";
import { Block, Page } from "../../components/Page";

/** 두 묶음 — ui 로 화면을 짜는 일, 나머지 세 패키지로 앱의 뼈대를 세우는 일 */
const DESIGN = [
  { to: "/docs/guide/styling", title: "Styling", what: "색, 모서리, 간격은 CSS 변수로, 위치와 여백은 className으로 바꿉니다. 값을 직접 바꿔 볼 수 있습니다" },
  { to: "/docs/guide/dark-mode", title: "Dark mode", what: "클래스 하나로 모든 컴포넌트가 다크 모드로 바뀝니다" },
  { to: "/docs/guide/layout", title: "Layout", what: "헤더, 메뉴, 본문 자리를 잡는 화면 틀과 좁은 화면 대응" },
  { to: "/docs/guide/forms", title: "Forms", what: "캡션 · 오류를 입력란과 잇고, 검사하고, 두 칸으로 배치하는 입력 폼" },
  { to: "/docs/guide/dialogs", title: "Dialogs & Toasts", what: "await로 답을 기다리는 확인 창, 어디서든 띄우는 알림, 모달과 옆 패널" },
  { to: "/docs/guide/tables", title: "Tables & Lists", what: "목록 방식 고르기, TxAgGrid의 정렬 · 페이지 · 편집을 서버와 주소에 맞물리기" }
];

const APP = [
  { to: "/docs/guide/routing", title: "Routing & Menu", pkg: "route-meta", what: "라우트를 한 곳에 선언하고 GNB · 사이드바 · 브레드크럼 · 권한별 메뉴를 만듭니다" },
  { to: "/docs/guide/url-state", title: "URL State", pkg: "hooks", what: "검색어, 필터, 페이지 같은 목록 조건을 주소에 담습니다" },
  { to: "/docs/guide/http-client", title: "HTTP Client", pkg: "axios", what: "토큰, 401 처리, 오류 메시지를 한 곳에 모은 API 클라이언트를 만듭니다" }
];

export function GuideHome() {
  return (
    <Page title="Guide" lead="네 패키지로 무엇을 만드는지 주제별로 정리했습니다. 각 장의 예제는 페이지 안에서 실제로 동작합니다.">
      <Block title="UI — @txstack/ui">
        <LinkCardGrid>
          {DESIGN.map((item) => (
            <LinkCard key={item.to} to={item.to} title={item.title}>
              {item.what}
            </LinkCard>
          ))}
        </LinkCardGrid>
      </Block>

      <Block title="App structure — route-meta · hooks · axios">
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
