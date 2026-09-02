import type { ReactNode } from "react";
import { Outlet } from "react-router-dom";

/**
 * 아직 내용이 없는 자리. **뼈대 단계에서 길이 이어지는지 보려고 둔다** —
 * 각 섹션이 자기 차례에 진짜 글로 바뀐다.
 */
export function Section({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <article className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">{title}</h1>
      {children ?? <p className="text-slate-500 dark:text-slate-400">준비 중이다.</p>}
      <Outlet />
    </article>
  );
}
