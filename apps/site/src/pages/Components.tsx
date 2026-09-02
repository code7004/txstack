import { TxAlert } from "@txstack/ui";

/**
 * 부품 레퍼런스는 **스토리북이 갖는다.** 여기서 다시 쓰지 않는다 —
 * 같은 내용을 두 곳에서 관리하면 반드시 어긋난다.
 */
export function Components() {
  return (
    <article className="flex max-w-3xl flex-col gap-5">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Components</h1>
        <p className="text-slate-600 dark:text-slate-300">부품 하나하나의 props · 토큰 · 조립 예제는 카탈로그(Storybook)에 있다. 49종 전부 실제로 움직여 볼 수 있다.</p>
      </header>

      <div className="flex flex-wrap gap-3">
        <a href="/storybook/" className="tx-button" data-variant="primary" target="_blank" rel="noreferrer">
          <span className="tx-button__label">카탈로그 열기</span>
        </a>
      </div>

      <TxAlert variant="info" title="개발 중에는 따로 띄운다">
        <code>pnpm storybook:dev</code> 로 띄우면 <code>localhost:6310</code> 이다. 배포하면 이 사이트의 <code>/storybook/</code> 아래에 함께 올라간다.
      </TxAlert>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">카탈로그에 있는 것</h2>
        <ul className="list-inside list-disc text-slate-600 dark:text-slate-300">
          <li>묶음별 부품 — Form · Data · Layout · Overlay · Feedback · Action</li>
          <li>
            <strong>Recipes</strong> — 로그인 · 등록 · 목록 · 슬라이드 편집처럼 <strong>한 화면을 조립한 이야기</strong>
          </li>
          <li>Introduction — 설치 · 토큰 · 다크모드 · Tailwind 와 함께 쓰기</li>
        </ul>
      </section>
    </article>
  );
}
