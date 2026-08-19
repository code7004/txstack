import { useMemo, type ReactNode } from "react";
import { TxAgGridContext } from "./TxAgGrid.context";
import type { AGGrid_Theme_TYPE } from "./TxAgGrid.types";
import { getAgGridTheme } from "./TxAgGrid.utils";

export interface ITxAgGridProviderProps {
  children: ReactNode;
  themeId?: AGGrid_Theme_TYPE;
}

export function TxAgGridProvider({ children, themeId }: ITxAgGridProviderProps) {
  const value = useMemo(
    () => ({
      themeId,
      theme: getAgGridTheme(themeId)
    }),
    [themeId]
  );

  return <TxAgGridContext.Provider value={value}>{children}</TxAgGridContext.Provider>;
}
