import { GridFrame } from "./GridFrame";
import { AccountsScreen } from "@demo/features/accounts/AccountsScreen";

/** `React.lazy` 로 불러오는 묶음. 표 틀(모듈 등록 · 테마)과 화면을 함께 싣는다 */
export default function AccountsDemo() {
  return (
    <GridFrame>
      <AccountsScreen />
    </GridFrame>
  );
}
