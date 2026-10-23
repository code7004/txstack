import { createContext } from "react";
import type { TxFormCaptionPlacement } from "./TxForm.types";

/**
 * **내부 전용.** 캡션을 어디에 놓을지 — `TxForm` · `TxForm.Flex` 가 내려 주고 필드가 읽는다.
 *
 * CSS 의 자손 선택자로 하지 않는 이유는 **가까운 쪽이 이겨야 해서**다. 선택자는 바깥 폼의 속성도
 * 안쪽 필드까지 똑같이 짚어 바깥이 이길 수 있다. 컨텍스트는 가장 가까운 공급자 값만 닿는다.
 * 안 준 곳은 공급하지 않으므로 바깥 값이 그대로 흘러든다.
 */
export const TxFormCaptionContext = createContext<TxFormCaptionPlacement | undefined>(undefined);
