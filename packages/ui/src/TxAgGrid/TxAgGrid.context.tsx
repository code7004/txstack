import { createContext, useContext, useMemo, type ReactNode } from "react";
import { themeQuartz, type Theme } from "ag-grid-community";

const TxAgGridContext = createContext<Theme | undefined>(undefined);

export interface TxAgGridProviderProps {
  children: ReactNode;
  /**
   * ag-grid 의 **Theme 객체 그대로**. `ag-grid-community` 가 내보내는 것을 쓴다.
   *
   * ```tsx
   * import { themeQuartz, colorSchemeDarkBlue } from "ag-grid-community";
   *
   * <TxAgGridProvider theme={themeQuartz.withPart(colorSchemeDarkBlue)}>
   * ```
   *
   * 이름을 우리가 다시 짓지 않는다. 원본에는 `AGGrid_Theme_TYPE` enum 이 있었는데
   * 하는 일이 ag-grid 의 테마를 우리 이름으로 되파는 것뿐이라, 소비자는 조합을 못 만들고
   * 우리는 ag-grid 가 테마를 늘릴 때마다 따라가야 했다.
   */
  theme?: Theme;
}

/**
 * 그리드 테마를 **앞에서 한 번** 정한다. 화면마다 그리드가 여럿이면 이쪽이 맞다.
 *
 * 감싸지 않으면 ag-grid 의 Quartz 다. 한 그리드만 다르게 하려면 그 그리드에 `theme` 을 준다.
 */
export function TxAgGridProvider({ children, theme }: TxAgGridProviderProps) {
  const value = useMemo(() => theme, [theme]);
  return <TxAgGridContext.Provider value={value}>{children}</TxAgGridContext.Provider>;
}

/** **내부 전용.** 그리드가 쓸 테마 — 자기 prop → Provider → Quartz 순이다. */
export function useTxAgGridTheme(own?: Theme) {
  const fromProvider = useContext(TxAgGridContext);
  return own ?? fromProvider ?? themeQuartz;
}
