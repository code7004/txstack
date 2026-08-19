import type { ReactNode } from "react";
import type { DeepPartial } from "../tx-ui.utils";
import type { TxContextMenuTheme } from "./TxContextMenu.theme";

export type TTxContextMenuItem = {
  type?: "item";
  label: ReactNode;
  hide?: boolean;
  disabled?: boolean;
  onClick?: () => Promise<void> | void;
  to?: string;
};

export type TTxContextMenuDivider = {
  type: "divider";
  hide?: boolean;
};

export type TTxContextMenuOption = TTxContextMenuItem | TTxContextMenuDivider;
export type TTxContextMenuTrigger = "right" | "left" | "both";

export interface ITxContextMenuProps {
  options: TTxContextMenuOption[];
  children?: ReactNode;
  comp?: ReactNode;
  label?: ReactNode;
  mouse?: TTxContextMenuTrigger;
  theme?: DeepPartial<typeof TxContextMenuTheme>;
  className?: string;
}
