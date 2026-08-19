export const TxLayoutTheme = {
  // 슬롯에서 시각 스타일을 직접 정할 수 있도록 구조 클래스만 유지한다.
  root: "flex h-full min-h-0 min-w-0 flex-col",
  centerRow: "flex min-h-0 min-w-0 flex-1",
  panel: "min-h-0 min-w-0 overflow-hidden",
  middle: "min-h-0 min-w-0 flex-1 overflow-hidden",
  slotContent: "h-full min-h-0 min-w-0 w-full",
  resizeHandle: "absolute z-10 overflow-visible select-none touch-none bg-transparent",
  resizeHandleState: "hover:bg-gray-200/70 dark:hover:bg-gray-700/70",
  resizeHandleIcon: "pointer-events-none absolute text-gray-500/90 dark:text-gray-400/90"
};
