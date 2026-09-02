import { Outlet } from "react-router-dom";

/**
 * 묶음의 껍데기. **자기 화면을 갖지 않는다** — `/docs` 로 들어오면 트리의 `index: true`
 * 자식이, 하위를 고르면 그 자식이 이 자리에 들어온다.
 *
 * 한때 부모가 `useLocation` 으로 "지금 내 자리인가" 를 따져 안내를 그렸다.
 * 인덱스 라우트를 트리에 선언하면 그 분기가 필요 없다.
 */
export function SectionLayout() {
  return (
    <article className="flex max-w-3xl flex-col gap-6">
      <Outlet />
    </article>
  );
}
