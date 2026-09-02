import type { ReactNode } from "react";

/**
 * 문서 한 장의 골격. **제목 · 한 줄 설명 · 본문**의 리듬을 한 곳에서 정한다 —
 * 페이지마다 여백이 다르면 사이트가 흔들려 보인다.
 */
export function Page({ title, lead, children }: { title: string; lead?: ReactNode; children: ReactNode }) {
  return (
    <article className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">{title}</h1>
        {lead && <p className="text-slate-600 dark:text-slate-300">{lead}</p>}
      </header>

      {children}
    </article>
  );
}

/** 본문 속 한 덩어리. 제목과 내용 사이 간격을 여기서 정한다. */
export function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}

/** 코드와 그 결과를 나란히. 넓으면 두 칸, 좁으면 위아래로 쌓인다. */
export function SideBySide({ children }: { children: ReactNode }) {
  return <div className="grid items-start gap-4 lg:grid-cols-2">{children}</div>;
}

/**
 * 살아 있는 예제가 놓이는 판. **부품이 실제로 도는 자리**라 바탕을 표면색으로 두어
 * 코드 판과 구분한다.
 */
export function Demo({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border p-5" style={{ borderColor: "var(--tx-color-border)", backgroundColor: "var(--tx-color-surface)" }}>
      {children}
    </div>
  );
}
