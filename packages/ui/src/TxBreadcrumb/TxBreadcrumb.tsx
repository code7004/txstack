import { Children, Fragment, isValidElement, type ReactElement, type ReactNode } from "react";
import { cm } from "../tx-ui.utils";
import type { TxBreadcrumbProps } from "./TxBreadcrumb.types";
import { TxBreadcrumbCurrentContext, TxBreadcrumbItem } from "./TxBreadcrumbItem";

/**
 * 여기까지 온 길.
 *
 * @example
 * ```tsx
 * <TxBreadcrumb>
 *   <TxBreadcrumb.Item as={NavLink} to="/">홈</TxBreadcrumb.Item>
 *   <TxBreadcrumb.Item as={NavLink} to="/orders">주문</TxBreadcrumb.Item>
 *   <TxBreadcrumb.Item>8213</TxBreadcrumb.Item>
 * </TxBreadcrumb>
 * ```
 *
 * **`<nav>` 안의 `<ol>` 이다.** 순서가 뜻을 갖는 목록이므로 `<ul>` 이 아니고,
 * 스크린리더가 "경로, 목록, 3개 항목" 으로 읽는다. **마지막 칸은 링크가 아니라 글자**이고
 * `aria-current="page"` 가 붙는다 — 지금 있는 자리를 다시 누르게 두면 어디로 가는지 알 수 없다.
 *
 * 가르는 `/` 는 **CSS 가 그린다.** 글자로 넣으면 스크린리더가 칸마다 "슬래시" 를 읽는다.
 *
 * 라우터는 `as` 로 갈아끼운다 — `TxDropMenu.Item` 과 같은 규약이다.
 *
 * 명세: `docs/001_ui.md`
 */
/**
 * 칸을 하나씩 펴낸다.
 *
 * **`Children.toArray` 는 조각(`<>…</>`)을 한 개로 센다.** 소비자가 칸을 조각으로 묶거나
 * `map` 으로 만들어 넣는 일이 흔한데, 그대로 두면 **경로 전체가 한 칸이 되어** 가름표도
 * 안 생기고 "지금 자리" 도 엉뚱한 데 붙는다.
 */
const flatten = (nodes: ReactNode): ReactElement[] =>
  Children.toArray(nodes).flatMap((node) => {
    if (!isValidElement(node)) return [];
    if (node.type === Fragment) return flatten((node.props as { children?: ReactNode }).children);
    return [node];
  });

export const TxBreadcrumbBase = ({ children, maxItems, itemsAfterCollapse = 2, separator, label = "경로", className, classNames, ...props }: TxBreadcrumbProps) => {
  const items = flatten(children);

  /**
   * 가운데를 접는다. **첫 칸과 끝 몇 개는 남긴다** — 어디서 왔고 지금 어디인지가
   * 경로의 요점이라, 그 둘을 지우면 접는 뜻이 없다.
   */
  const collapsed = maxItems != null && items.length > maxItems;
  const shown: (ReactNode | "gap")[] = collapsed ? [items[0], "gap", ...items.slice(Math.max(1, items.length - itemsAfterCollapse))] : items;

  return (
    <nav {...props} data-tag="TxBreadcrumb" aria-label={label} className={cm("tx-breadcrumb", className)}>
      <ol className={cm("tx-breadcrumb__list", classNames?.list)}>
        {shown.map((node, index) => (
          <li key={index} className={cm("tx-breadcrumb__cell", classNames?.item)}>
            {/* 가르는 표시는 장식이다. 스크린리더가 칸마다 읽으면 경로가 안 읽힌다 */}
            {index > 0 && <span className="tx-breadcrumb__separator" aria-hidden>{separator}</span>}

            {node === "gap" ? (
              <span className="tx-breadcrumb__gap" aria-hidden>
                …
              </span>
            ) : (
              // 마지막 칸만 "지금 자리" 다. 접었어도 마지막은 늘 마지막이다
              <TxBreadcrumbCurrentContext.Provider value={index === shown.length - 1}>{node}</TxBreadcrumbCurrentContext.Provider>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export const TxBreadcrumb = Object.assign(TxBreadcrumbBase, { Item: TxBreadcrumbItem });
