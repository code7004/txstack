/**
 * 배열.
 *
 * ```ts
 * import { sortByOrder } from "@txstack/fns";
 * sortByOrder(rows, ["high", "medium", "low"], "priority");
 * ```
 *
 * 숫자 정렬 · 키 정렬은 lodash(`_.sortBy` · `_.orderBy`)를 쓴다. 여기에는 lodash 에 없는 것만 둔다.
 */

/**
 * **정해 준 순서대로** 정렬한 새 배열. 원본은 그대로다.
 * 순서 목록에 없는 값은 뒤로 가고, 그들끼리는 글자 순이다.
 *
 * @param by 비교할 필드 이름, 또는 값을 꺼내는 함수
 * @example
 * sortByOrder([{ p: "low" }, { p: "high" }, { p: "x" }], ["high", "low"], "p")
 * // [{ p: "high" }, { p: "low" }, { p: "x" }]
 *
 * sortByOrder(menus, ["home", "docs"], (menu) => menu.name)
 */
export function sortByOrder<T>(items: readonly T[], order: readonly unknown[], by: keyof T | ((item: T) => unknown), direction: "asc" | "desc" = "asc"): T[] {
  const read = typeof by === "function" ? by : (item: T) => item[by];
  const rank = new Map(order.map((value, index) => [value, index]));
  const sign = direction === "asc" ? 1 : -1;

  return [...items].sort((a, b) => {
    const va = read(a);
    const vb = read(b);
    const ra = rank.get(va);
    const rb = rank.get(vb);

    if (ra !== undefined && rb !== undefined) return (ra - rb) * sign;
    if (ra !== undefined) return -1;
    if (rb !== undefined) return 1;
    return String(va).localeCompare(String(vb)) * sign;
  });
}
