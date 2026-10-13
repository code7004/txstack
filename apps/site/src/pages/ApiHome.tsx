import { TxTag } from "@txstack/ui";
import { LinkCard, LinkCardGrid } from "../components/LinkCard";
import { Page } from "../components/Page";

const PACKAGES = [
  { to: "/api/ui", name: "@txstack/ui", what: "Tx* 컴포넌트 49종", peer: "react" },
  { to: "/api/route-meta", name: "@txstack/route-meta", what: "라우트를 메타데이터 트리 하나로", peer: "react-router-dom" },
  { to: "/api/hooks", name: "@txstack/hooks", what: "범용 훅과 URL 쿼리 상태", peer: "react" },
  { to: "/api/axios", name: "@txstack/axios", what: "정책 주입식 HTTP 클라이언트", peer: "axios" }
];

/** `/api` 의 인덱스 화면. */
export function ApiHome() {
  return (
    <Page title="API" lead="각 패키지가 무엇을 내보내는지. 넷은 따로 설치하고, 필요한 것만 고른다.">
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
