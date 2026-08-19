import React from "react";
import { TxInputTheme, TxSearchInputTheme } from ".";
import { cm } from "../tx-ui.utils";
import { IconClose } from "../TxIcons";

export interface ITxInputLikeProps {
  value?: string;
  placeholder?: string;
  className?: string;
  onClick?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  ariaLabel?: string;
  onClear?: () => void;
}

const TxInputLike: React.FC<ITxInputLikeProps> = ({ value, placeholder = "", className, onClick, onClear, onKeyDown, ariaLabel = "select input" }) => {
  function hdClear(event: React.MouseEvent<SVGSVGElement, MouseEvent>): void {
    event.stopPropagation();
    onClear?.();
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={onKeyDown}
      aria-haspopup="dialog"
      aria-expanded={false}
      aria-label={ariaLabel}
      className={cm(TxInputTheme.input, "relative min-w-[8em] cursor-text select-none px-2 py-1.75 text-left truncate", onClear && value && "pr-8", className)}
    >
      {value || <span className="text-gray-400">{placeholder}</span>}
      {onClear && value && <IconClose className={cm(TxSearchInputTheme.icon, "absolute right-2 top-1/2 -translate-y-1/2")} onClick={hdClear} />}
    </div>
  );
};

export default TxInputLike;
