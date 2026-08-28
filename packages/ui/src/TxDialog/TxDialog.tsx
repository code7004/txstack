import { createRoot, type Root } from "react-dom/client";
import { configure, enqueue, toOptions } from "./TxDialog.store";
import type { TxDialogConfig, TxDialogInput } from "./TxDialog.types";
import { TxDialogHost } from "./TxDialogHost";

const ROOT_ATTR = "data-tx-dialog-root";

let root: Root | null = null;

/**
 * 화면에 그릴 자리를 **처음 부를 때** 만든다.
 *
 * 모듈을 import 한 것만으로 DOM 을 건드리지 않는다 — 서버에서 import 해도 안전해야 하고,
 * 이 기능을 안 쓰는 소비자에게 빈 `<div>` 를 남기지도 않는다.
 */
function ensureRoot() {
  if (root || typeof document === "undefined") return;

  const host = document.createElement("div");
  host.setAttribute(ROOT_ATTR, "");
  document.body.append(host);

  root = createRoot(host);
  root.render(<TxDialogHost />);
}

function open(kind: "alert" | "confirm", input: TxDialogInput) {
  ensureRoot();
  return enqueue(kind, toOptions(input));
}

/**
 * 네이티브 `alert` · `confirm` 을 대신하는 확인창. **어디서든 부른다** —
 * 컴포넌트 안이든, axios 인터셉터든, 그냥 유틸 함수든.
 *
 * ```tsx
 * await TxDialog.alert("처리할 수 없습니다.");
 *
 * if (await TxDialog.confirm("로그아웃 하시겠습니까?")) signOut();
 *
 * const ok = await TxDialog.confirm({
 *   title: "콜백 재시도",
 *   message: "실패한 콜백 전체를 재시도합니다.",
 *   tone: "danger",
 *   confirmLabel: "재시도"
 * });
 * ```
 *
 * **네이티브와 다른 점은 하나, `await` 가 필요하다는 것이다.** 브라우저에서 자바스크립트를
 * 멈춰 세울 방법이 없다. 그래서 `if (!confirm(…)) return` 은 `if (!(await …)) return` 이 된다.
 *
 * 창은 `TxModal` 이 그린다 — 포커스 트랩·Escape·바깥 클릭이 거기서 해결돼 있다.
 * **`confirm` 에서 Escape 와 바깥 클릭은 취소로 친다.**
 *
 * 여러 번 연달아 불러도 **겹치지 않고 차례로** 뜬다.
 *
 * 명세: `docs/001_ui.md`
 */
export const TxDialog = {
  /** 알리고 확인만 받는다. */
  alert: (input: TxDialogInput) => open("alert", input).then(() => undefined),

  /** 예/아니오를 받는다. 취소·Escape·바깥 클릭은 전부 `false` 다. */
  confirm: (input: TxDialogInput) => open("confirm", input),

  /**
   * 앱 전체의 기본 문구를 한 번에 바꾼다.
   *
   * ```ts
   * TxDialog.configure({ labels: { confirm: "OK", cancel: "Cancel", close: "Close" } });
   * ```
   */
  configure: (config: TxDialogConfig) => configure(config)
};
