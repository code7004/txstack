import type { ReactNode } from "react";
import { Link } from "react-router-dom";

/**
 * **카드 전체가 링크다.** 카드 안 구석의 "보기" 글자만 눌리면 눈은 카드를 보는데 손은
 * 작은 글자를 찾아야 한다. 묶음의 인덱스 화면 · Home 의 패키지 칸이 이것을 쓴다.
 */
export function LinkCard({ to, title, children, aside }: { to: string; title: ReactNode; children?: ReactNode; aside?: ReactNode }) {
  return (
    <Link to={to} className="site-card group flex h-full flex-col gap-2 rounded-lg border p-4">
      <span className="flex items-baseline gap-2">
        <span className="font-semibold">{title}</span>
        {aside}
        <span aria-hidden className="site-card__arrow ms-auto">
          →
        </span>
      </span>
      {children && <span className="text-sm text-slate-600 dark:text-slate-300">{children}</span>}
    </Link>
  );
}

/** 카드 여럿. 좁으면 한 줄에 하나, 넓으면 둘. */
export function LinkCardGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2">{children}</div>;
}
