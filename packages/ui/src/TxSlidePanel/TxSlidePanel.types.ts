import type { ReactNode } from "react";
import type { DeepPartial } from "../tx-ui.utils";
import type { TxSlidePanelTheme } from "./TxSlidePanel.theme";

export type TTxSlidePanelSide = "left" | "right" | "top" | "bottom";

export interface ITxSlidePanel {
  open: boolean;
  side?: TTxSlidePanelSide;
  title?: ReactNode;
  children: ReactNode;
  className?: string;
  overlayClassName?: string;
  panelClassName?: string;
  headerClassName?: string;
  bodyClassName?: string;
  showCloseButton?: boolean;
  showOverlay?: boolean;
  closeOnEscape?: boolean;
  closeOnBackdrop?: boolean;
  lockScroll?: boolean;
  onClose?: () => void;
  theme?: DeepPartial<typeof TxSlidePanelTheme>;
}
