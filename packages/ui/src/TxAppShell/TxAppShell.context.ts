import { createContext } from "react";

/**
 * **내부 전용.** 접어도 남는 패널(`collapsedSize`)이 안의 내용에게 알려 주는 것.
 *
 * 셸은 안에 무엇이 오는지 모른다 — 이 상태를 내려 줄 뿐이고, 읽는 쪽(`TxSideNav`)이 제 모습을 정한다.
 * 그래서 의존은 **내용 → 셸** 한 방향이다. `collapsedSize` 가 없는 패널은 내려 주지 않는다.
 */
export interface TxAppShellPanelShared {
  /** 지금 접혀서 `collapsedSize` 만큼만 남았는가. */
  collapsed: boolean;
  /** 패널을 편다. 접힌 채로는 할 수 없는 일(하위메뉴 열기)을 하려 할 때 부른다. */
  expand: () => void;
}

export const TxAppShellPanelContext = createContext<TxAppShellPanelShared | null>(null);
