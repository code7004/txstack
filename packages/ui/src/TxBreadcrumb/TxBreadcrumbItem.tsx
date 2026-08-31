import { createContext, useContext, type ElementType } from "react";
import { cm } from "../tx-ui.utils";
import type { TxBreadcrumbItemProps } from "./TxBreadcrumb.types";

/** **내부 전용.** 마지막 칸인지를 부모가 알려 준다. */
export const TxBreadcrumbCurrentContext = createContext(false);

/**
 * 경로 한 칸.
 *
 * @example
 * ```tsx
 * <TxBreadcrumb.Item as={NavLink} to="/orders">주문</TxBreadcrumb.Item>
 * <TxBreadcrumb.Item>8213</TxBreadcrumb.Item>
 * ```
 *
 * **마지막 칸은 링크가 아니다.** 지금 있는 자리를 다시 누르게 두면 어디로 가는지
 * 알 수 없어서, 부모가 마지막을 알려 주면 `as` 를 무시하고 글자로 그린다.
 */
export function TxBreadcrumbItem<E extends ElementType = "span">({ as, current, className, ...props }: TxBreadcrumbItemProps<E>) {
  const isLast = useContext(TxBreadcrumbCurrentContext);
  const isCurrent = current ?? isLast;

  // 지금 자리는 누를 것이 없다. `as` 로 링크를 줬어도 글자로 그린다
  const Component = (isCurrent ? "span" : (as ?? "span")) as ElementType;

  return <Component {...props} data-tag="TxBreadcrumb.Item" className={cm("tx-breadcrumb__item", className)} aria-current={isCurrent ? "page" : undefined} />;
}
