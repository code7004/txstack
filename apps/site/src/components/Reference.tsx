import type { ReactNode } from "react";
import { CodeBlock } from "./CodeBlock";

/**
 * API 페이지의 골격. **Guide 는 "어떻게 쓰나", API 는 "찾아보는 표"** 다 —
 * 그래서 문장보다 시그니처와 표가 앞에 온다.
 */

/** 함수 · 타입의 모양 한 줄(또는 몇 줄). 복사할 일이 드물어 복사 버튼을 뺀다 */
export function Signature({ children }: { children: string }) {
  return (
    <CodeBlock language="ts" title="signature" hideCopy>
      {children}
    </CodeBlock>
  );
}

/** 표 한 줄 — 이름 · 타입 · 기본값 · 설명. 기본값이 없으면 `—` */
export type Row = [name: string, type: string, fallback: string, description: ReactNode];

/** 옵션 · 필드 · 메서드 표. 좁은 화면에서는 옆으로 굴린다. `anchor` 를 주면 줄마다 앵커가 붙는다(검색 결과가 그 줄로 온다) */
export function RefTable({ rows, head = ["Name", "Type", "Default", "Description"], anchor }: { rows: Row[]; head?: [string, string, string, string]; anchor?: (name: string) => string }) {
  return (
    <div className="overflow-x-auto rounded-lg border" style={{ borderColor: "var(--tx-color-border)" }}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ backgroundColor: "var(--tx-color-muted)" }}>
            {head.map((cell) => (
              <th key={cell} className="px-3 py-2 text-start font-semibold whitespace-nowrap">
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(([name, type, fallback, description]) => (
            <tr key={name} id={anchor?.(name)} className="site-anchor border-t align-top" style={{ borderColor: "var(--tx-color-border)" }}>
              <td className="px-3 py-2 font-mono text-xs font-semibold whitespace-nowrap">{name}</td>
              <td className="max-w-48 px-3 py-2 font-mono text-xs break-words text-slate-600 dark:text-slate-300">{type}</td>
              <td className="max-w-40 px-3 py-2 font-mono text-xs break-words text-slate-500 dark:text-slate-400">{fallback}</td>
              <td className="min-w-72 px-3 py-2 text-slate-600 dark:text-slate-300">{description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** 표 위의 작은 제목 — 옵션 · 반환값 · 필드 구분 */
export function RefLabel({ children }: { children: ReactNode }) {
  return <h3 className="text-sm font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">{children}</h3>;
}
