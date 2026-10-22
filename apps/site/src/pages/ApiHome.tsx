import { TxTag } from "@txstack/ui";
import { LinkCard, LinkCardGrid } from "../components/LinkCard";
import { Page } from "../components/Page";

const PACKAGES = [
  { to: "/api/ui", name: "@txstack/ui", what: "UI를 위한 다양한 Tx* 컴포넌트", peer: "react" },
  { to: "/api/route-meta", name: "@txstack/route-meta", what: "라우트 트리 하나로 라우터 · GNB · 사이드바 · 브레드크럼", peer: "react-router-dom" },
  { to: "/api/hooks", name: "@txstack/hooks", what: "범용 훅과 URL 쿼리 상태 관리", peer: "react" },
  { to: "/api/axios", name: "@txstack/axios", what: "정책을 주입받는 HTTP 클라이언트", peer: "axios" },
  { to: "/api/fns", name: "@txstack/fns", what: "숫자 포맷 · 날짜 · 폼 검사 · 전화번호 같은 작은 함수", peer: "의존 없음" }
];

/** `/api` 의 인덱스 화면. */
export function ApiHome() {
  return (
    <Page title="API" lead="각 패키지가 내보내는 함수와 옵션, 지켜야 할 규칙을 정리했습니다. 다섯 패키지는 따로 설치하므로 필요한 것만 골라 쓰면 됩니다.">
      <LinkCardGrid>
        {PACKAGES.map((item) => (
          <LinkCard key={item.to} to={item.to} title={<span className="font-mono text-sm">{item.name}</span>} aside={<TxTag>{item.peer}</TxTag>}>
            {item.what}
          </LinkCard>
        ))}
      </LinkCardGrid>
    </Page>
  );
}
