import { createContext, useContext } from "react";
import { getAgGridTheme } from "./TxAgGrid.utils";
import type { AGGrid_Theme_TYPE } from "./TxAgGrid.types";

export type TTxAgGridContextValue = {
  themeId?: AGGrid_Theme_TYPE;
  theme: ReturnType<typeof getAgGridTheme>;
};

export const TxAgGridContext = createContext<TTxAgGridContextValue>({
  theme: getAgGridTheme()
});

export function useTxAgGridContext() {
  return useContext(TxAgGridContext);
}
