import { createContext, useContext, type ElementType } from "react";
import { cm } from "../tx-ui.utils";
import type { TxMenuDividerProps, TxMenuItemProps } from "./TxMenu.types";

/** 항목이 눌렸을 때 메뉴를 닫는 길. 항목마다 콜백을 내려보내지 않으려고 둔다. */
export const TxMenuCloseContext = createContext<(() => void) | null>(null);

/**
 * 메뉴 한 줄.
 *
 * **기본은 `<button>` 이다.** 링크로 쓰려면 `as` 로 갈아끼운다 —
 * `as={NavLink}` · `as={Link}` · `as="a"`. 그래서 **패키지가 라우터를 알지 못한다.**
 * 원본은 `react-router-dom` 의 `NavLink` 를 직접 import 해서, 다른 라우터를 쓰는
 * 소비자는 이 컴포넌트를 쓸 수 없었다.
 *
 * @example
 * ```tsx
 * <TxDropMenu.Item onClick={signOut}>로그아웃</TxDropMenu.Item>
 * <TxDropMenu.Item as={NavLink} to="/settings">설정</TxDropMenu.Item>
 * ```
 */
export function TxMenuItem<E extends ElementType = "button">({ as, keepOpen = false, className, onClick, ...props }: TxMenuItemProps<E>) {
  const close = useContext(TxMenuCloseContext);
  const Component = (as ?? "button") as ElementType;

  return (
    <Component
      // 버튼일 때만 type 을 준다. 링크 컴포넌트에 type 이 가면 DOM 경고가 난다
      {...(Component === "button" ? { type: "button" } : {})}
      {...props}
      role="menuitem"
      // 포커스는 화살표가 옮긴다. 줄마다 탭 정거장을 만들면 열 줄에 Tab 열 번이다
      tabIndex={-1}
      className={cm("tx-menu__item", className)}
      onClick={(event: React.MouseEvent) => {
        (onClick as ((e: React.MouseEvent) => void) | undefined)?.(event);
        if (!keepOpen) close?.();
      }}
    />
  );
}

/** 묶음을 가르는 줄. 스크린리더에는 구분자로 읽힌다. */
export const TxMenuDivider = ({ className, ...props }: TxMenuDividerProps) => <div {...props} role="separator" className={cm("tx-menu__divider", className)} data-tag="TxMenu.Divider" />;
