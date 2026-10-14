import { Link } from "react-router-dom";
import { TxEmptyState } from "@txstack/ui";

/**
 * 없는 주소. 트리에서 `hidden` 이라 메뉴에는 없고 주소로만 닿는다.
 *
 * 돌아갈 길은 버튼 모양의 링크다. `TxButton` 에 `as` 가 없어 클래스를 빌려 쓴다 —
 * Home 의 "Getting Started" 와 같은 방식이다(docs/005_site.md 의 "만들며 드러난 것").
 */
export function NotFound() {
  return (
    <div className="py-16">
      <TxEmptyState variant="no-result" title="페이지를 찾을 수 없습니다" description="주소가 바뀌었거나 잘못 입력되었을 수 있습니다. 홈으로 이동하거나 문서에서 찾아보세요.">
        <div className="flex flex-wrap justify-center gap-2">
          <Link to="/" className="tx-button" data-variant="primary">
            <span className="tx-button__label">Home</span>
          </Link>
          <Link to="/docs" className="tx-button" data-variant="secondary">
            <span className="tx-button__label">Documents</span>
          </Link>
        </div>
      </TxEmptyState>
    </div>
  );
}
