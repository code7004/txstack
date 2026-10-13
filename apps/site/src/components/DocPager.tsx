import type { NavRoute } from "@txstack/route-meta";
import { Link, useLocation } from "react-router-dom";

/** 묶음 하나를 **읽는 순서대로** 편다. 자식이 있는 항목은 링크가 아니므로 그 자식들만 남긴다. */
const leaves = (items: NavRoute[]): NavRoute[] => items.flatMap((item) => (item.children ? leaves(item.children) : [item]));

/**
 * 장 끝의 "이전 · 다음". **순서는 트리가 정한다** — 메뉴에 놓인 차례가 곧 읽는 차례다.
 * 그래서 장을 옮기거나 더해도 여기는 손댈 것이 없다.
 *
 * 같은 묶음(`Documents` 면 `Documents` 안) 안에서만 잇는다. 묶음 끝에서 다른 묶음으로
 * 넘어가면 "다음" 이 무엇을 뜻하는지 흐려진다.
 */
export function DocPager({ menu }: { menu: NavRoute[] }) {
  const { pathname } = useLocation();

  const order = menu.map((section) => (section.children ? leaves(section.children) : [])).find((list) => list.some((item) => item.path === pathname));
  if (!order) return null;

  const at = order.findIndex((item) => item.path === pathname);
  const prev = order[at - 1];
  const next = order[at + 1];

  if (!prev && !next) return null;

  return (
    <nav aria-label="이전 · 다음 장" className="mt-16 grid gap-3 border-t pt-6 sm:grid-cols-2" style={{ borderColor: "var(--tx-color-border)" }}>
      {prev ? <PagerLink item={prev} dir="prev" /> : <span />}
      {next && <PagerLink item={next} dir="next" />}
    </nav>
  );
}

function PagerLink({ item, dir }: { item: NavRoute; dir: "prev" | "next" }) {
  const next = dir === "next";

  return (
    <Link to={item.path} rel={dir} className={`site-card flex flex-col gap-1 rounded-lg border px-4 py-3 ${next ? "items-end text-end sm:col-start-2" : "items-start"}`}>
      <span className="text-xs text-slate-500 dark:text-slate-400">{next ? "다음 →" : "← 이전"}</span>
      <span className="font-semibold">{item.meta?.label ?? item.key}</span>
    </Link>
  );
}
