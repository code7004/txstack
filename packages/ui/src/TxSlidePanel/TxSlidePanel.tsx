import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo } from "react";
import ReactDOM from "react-dom";
import { cm, themeMerge } from "../tx-ui.utils";
import { IconClose } from "../TxIcons";
import { type TTxSlidePanelSide } from "./TxSlidePanel.types";
import { TxSlidePanelTheme, type ITxSlidePanel } from ".";

function getSlidePanelMotion(side: TTxSlidePanelSide) {
  switch (side) {
    case "left":
      return { initial: { x: "-100%" }, animate: { x: 0 }, exit: { x: "-100%" } };
    case "right":
      return { initial: { x: "100%" }, animate: { x: 0 }, exit: { x: "100%" } };
    case "top":
      return { initial: { y: "-100%" }, animate: { y: 0 }, exit: { y: "-100%" } };
    case "bottom":
      return { initial: { y: "100%" }, animate: { y: 0 }, exit: { y: "100%" } };
  }
}

export function TxSlidePanel({
  open,
  side = "right",
  title,
  children,
  className,
  overlayClassName,
  panelClassName = "w-80 h-screen",
  headerClassName,
  bodyClassName,
  showCloseButton = true,
  showOverlay = true,
  closeOnEscape = true,
  closeOnBackdrop = true,
  lockScroll = true,
  onClose,
  theme
}: ITxSlidePanel) {
  const stableTheme = useMemo(() => themeMerge(TxSlidePanelTheme, theme, "override"), [theme]);
  const motionProps = getSlidePanelMotion(side);

  useEffect(() => {
    if (!open || !closeOnEscape) return;

    const hdKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", hdKeyDown);
    return () => window.removeEventListener("keydown", hdKeyDown);
  }, [closeOnEscape, onClose, open]);

  useEffect(() => {
    if (!open || !lockScroll) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [lockScroll, open]);

  return ReactDOM.createPortal(
    <AnimatePresence>
      {open && (
        <aside data-tag="TxSlidePanel" className={cm(stableTheme.root, className)} role="dialog" aria-modal="true">
          {showOverlay && (
            <motion.button
              data-tag="TxSlidePanel.Overlay"
              type="button"
              aria-label="Close panel"
              className={cm(stableTheme.overlay, overlayClassName)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => {
                if (closeOnBackdrop) onClose?.();
              }}
            />
          )}

          <motion.section
            data-tag="TxSlidePanel.Panel"
            className={cm(stableTheme.panel, stableTheme.positions[side], panelClassName)}
            initial={motionProps.initial}
            animate={motionProps.animate}
            exit={motionProps.exit}
            transition={{ type: "tween", duration: 0.24, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            {(title || showCloseButton) && (
              <header data-tag="TxSlidePanel.Header" className={cm(stableTheme.header, headerClassName)}>
                <div className={stableTheme.title}>{title}</div>
                {showCloseButton && <IconClose data-tag="TxSlidePanel.Close" className={stableTheme.closeButton} width="1.25em" height="1.25em" onClick={onClose} />}
              </header>
            )}

            <div data-tag="TxSlidePanel.Body" className={cm(stableTheme.body, bodyClassName)}>
              {children}
            </div>
          </motion.section>
        </aside>
      )}
    </AnimatePresence>,
    document.body
  );
}
