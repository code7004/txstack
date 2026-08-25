import { createContext, useContext, useMemo, type ReactNode } from "react";
import { themeMerge, type DeepPartial } from "../tx-ui.utils";
import type { TxButtonThemeOverride } from "../TxButton/TxButton.theme";

/**
 * 전역 테마 덮어쓰기 목록.
 *
 * **타입 전용 import 로 각 컴포넌트의 덮어쓰기 타입을 가져온다.** 런타임에는 지워지므로
 * `TxTheme → TxButton.theme → TxTheme` 순환이 생기지 않는다.
 *
 * 컴포넌트가 `useTxTheme` 를 쓰기 시작할 때 여기에 한 줄씩 추가한다.
 * **인스턴스 `theme` prop 도 같은 타입을 쓴다** — 전역과 인스턴스의 모양이 갈리면 소비자가 두 번 배운다.
 */
export interface TxThemeOverrides {
  TxButton?: TxButtonThemeOverride;
}

const TxThemeContext = createContext<TxThemeOverrides>({});

export interface TxThemeProviderProps {
  /** 컴포넌트 이름을 키로 하는 부분 테마. 준 키만 덮어쓴다 */
  theme?: TxThemeOverrides;
  children?: ReactNode;
}

/**
 * 앱 전체의 `Tx*` 기본 스타일을 한 곳에서 바꾼다.
 *
 * 이게 없으면 소비자는 브랜드 색 하나를 입히려고 호출마다 `theme` 을 넘기거나
 * 래퍼 컴포넌트를 26개 만들어야 한다. **"포크하지 않고 커스터마이징" 이 성립하려면 이 경로가 필요하다.**
 *
 * **감싸지 않아도 동작한다.** 기본값이 빈 객체라 Provider 없이도 라이브러리 기본 테마가 그대로 쓰인다.
 *
 * @example
 * ```tsx
 * <TxThemeProvider theme={{ TxButton: { variants: { primary: "bg-violet-600 text-white hover:bg-violet-700" } } }}>
 *   <App />
 * </TxThemeProvider>
 * ```
 */
export const TxThemeProvider = ({ theme, children }: TxThemeProviderProps) => {
  // theme 객체를 인라인으로 넘기는 게 흔한 사용법이라, 참조가 매번 바뀌어도
  // 하위가 통째로 리렌더되지 않도록 값을 고정한다.
  const value = useMemo(() => theme ?? {}, [theme]);

  return <TxThemeContext.Provider value={value}>{children}</TxThemeContext.Provider>;
};

/**
 * 3단으로 테마를 합친다 — **라이브러리 기본 → Provider 전역 → 인스턴스 `theme` prop.**
 * 뒤쪽이 이긴다.
 *
 * 병합 정책은 `"override"` 다. 소비자가 `theme={{ base: "" }}` 로 **기본 스타일을 끄는 것**이
 * 실사용 주력이라, 문자열은 합치지 않고 교체해야 한다.
 *
 * @param name  `TxThemeOverrides` 의 키. 컴포넌트 export 이름과 일치시킨다
 * @param base  그 컴포넌트의 기본 테마 객체
 * @param local 인스턴스가 받은 `theme` prop
 */
export function useTxTheme<K extends keyof TxThemeOverrides, T>(name: K, base: T, local?: TxThemeOverrides[K]): T {
  const global = useContext(TxThemeContext)[name];

  return useMemo(() => themeMerge(themeMerge(base, global as DeepPartial<T>, "override"), local as DeepPartial<T>, "override"), [base, global, local]);
}
