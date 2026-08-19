import type { FC, ReactNode } from "react";
import type { DeepPartial } from "../tx-ui.utils";
import type { TxLayoutTheme } from "./TxLayout.theme";

export type TTxLayoutSlot = "top" | "left" | "middle" | "right" | "bottom";
export type TTxLayoutSize = number | string;
export type TTxLayoutResizableSlot = "left" | "right" | "bottom";

export interface ITxLayout {
  children: ReactNode;
  className?: string;
  theme?: DeepPartial<typeof TxLayoutTheme>;
}

export interface ITxLayoutBaseSlotProps {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  visible?: boolean;
  animated?: boolean;
  keepMounted?: boolean;
}

export interface ITxLayoutPanelSlotProps extends ITxLayoutBaseSlotProps {
  size: TTxLayoutSize;
  resizable?: boolean;
  minSize?: number;
  maxSize?: number;
  resizeHandleClassName?: string;
  onResize?: (size: number) => void;
  onResizeEnd?: (size: number) => void;
}

export interface ITxLayoutMiddleProps {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

export type TLayoutSlotPropsMap = {
  top?: ITxLayoutPanelSlotProps;
  left?: ITxLayoutPanelSlotProps;
  middle?: ITxLayoutMiddleProps;
  right?: ITxLayoutPanelSlotProps;
  bottom?: ITxLayoutPanelSlotProps;
};

export type TResolvedLayoutSlots = TLayoutSlotPropsMap & {
  middle: ITxLayoutMiddleProps;
};

export type TLayoutSlotComponent<P> = FC<P> & {
  txLayoutSlot: TTxLayoutSlot;
};

export type TLayoutPanelProps = {
  slot: "top" | "left" | "right" | "bottom";
  props: ITxLayoutPanelSlotProps | undefined;
  theme: typeof TxLayoutTheme;
};

export type TResizeSession = {
  startClientX: number;
  startClientY: number;
  startSize: number;
  currentSize: number;
  userSelect: string;
};
