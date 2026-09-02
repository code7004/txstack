import { Link } from "react-router-dom";
import { TxEmptyState } from "@txstack/ui";

/** 없는 주소. 트리에서 `hidden` 이라 메뉴에는 없고 주소로만 닿는다. */
export function NotFound() {
  return (
    <TxEmptyState variant="no-result" title="여기에는 아무것도 없다" description="주소를 다시 확인하거나 처음으로 돌아간다">
      <Link to="/" className="underline">
        Home 으로
      </Link>
    </TxEmptyState>
  );
}
