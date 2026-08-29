import { createRoot, type Root } from "react-dom/client";
import { add, configure, dismiss, dismissAll, toOptions } from "./TxToast.store";
import type { TxToastConfig, TxToastInput } from "./TxToast.types";
import { TxToastHost } from "./TxToastHost";

const ROOT_ATTR = "data-tx-toast-root";

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
  root.render(<TxToastHost />);
}

/**
 * 떴다 사라지는 알림. **어디서든 부른다** — 컴포넌트 안이든, axios 인터셉터든,
 * 그냥 유틸 함수든.
 *
 * ```ts
 * TxToast.show("저장했습니다");
 * TxToast.show({ variant: "danger", message: "저장하지 못했습니다" });
 *
 * // 놓치면 안 되는 것은 스스로 사라지지 않게 한다
 * const id = TxToast.show({ variant: "danger", message: "연결이 끊겼습니다", duration: 0 });
 * TxToast.dismiss(id);
 * ```
 *
 * 겉은 **`TxAlert`** 이 그린다 — `variant` 어휘(`info` · `success` · `warning` · `danger`)가
 * 같으니 하나를 익히면 둘에 통한다. 페이지에 박혀 있어야 하는 안내는 그쪽이다.
 *
 * **모달 위에도 뜬다.** `TxModal` 이 top layer 에 있어 `z-index` 로는 가릴 수 없으므로,
 * 이쪽도 같은 층(`popover`)을 쓴다.
 *
 * **마우스를 얹거나 키보드로 들어오면 시계가 멈춘다** — 읽는 속도는 사람마다 다르다.
 *
 * 명세: `docs/001_ui.md`
 */
export const TxToast = {
  /** 하나 띄우고 그 번호를 돌려준다. */
  show: (input: TxToastInput) => {
    ensureRoot();
    return add(toOptions(input));
  },

  /** 번호로 하나를 닫는다. */
  dismiss: (id: number) => dismiss(id),

  /** 떠 있는 것을 전부 닫는다. 화면을 옮길 때 쓴다. */
  dismissAll: () => dismissAll(),

  /**
   * 앱 전체의 기본값을 한 번에 바꾼다.
   *
   * ```ts
   * TxToast.configure({ position: "bottom-center", duration: 6000, max: 3 });
   * ```
   */
  configure: (config: TxToastConfig) => configure(config)
};
