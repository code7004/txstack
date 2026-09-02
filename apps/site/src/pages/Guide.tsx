import { Outlet } from "react-router-dom";

/** 하위 항목(Tokens · Dark mode · Layout)이 이 자리에 들어온다. */
export function Guide() {
  return (
    <article className="flex max-w-3xl flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Guide</h1>
        <p className="text-slate-600 dark:text-slate-300">겉모습을 바꾸고, 다크모드를 켜고, 화면 골격을 세우는 법. 왼쪽 항목을 고른다.</p>
      </header>

      <Outlet />
    </article>
  );
}
