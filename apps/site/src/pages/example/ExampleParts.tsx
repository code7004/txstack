import { Fragment } from "react";
import { Link } from "react-router-dom";
import { TxSpinner, TxTabs } from "@txstack/ui";
import { CodeBlock } from "../../components/CodeBlock";

/** 예제 페이지들이 함께 쓰는 조각 — 불러오는 중 표시 · 함께 쓴 패키지 · 소스 탭 */

export const muted = "text-slate-600 dark:text-slate-300";

export function DemoLoading() {
  return (
    <span className={`inline-flex items-center gap-2 text-sm ${muted}`}>
      <TxSpinner decorative /> 화면을 불러오는 중…
    </span>
  );
}

/** ui 밖의 패키지에서 쓴 것. 누르면 API 의 그 항목으로 간다 */
export function Packages({ items }: { items: [name: string, to: string][] }) {
  return (
    <p className="text-xs text-slate-500 dark:text-slate-400">
      함께 쓴 패키지 ·{" "}
      {items.map(([name, to], index) => (
        <Fragment key={name}>
          {index > 0 && " · "}
          <Link to={to} className="underline">
            {name}
          </Link>
        </Fragment>
      ))}
    </p>
  );
}

/** 화면에서 돌아가는 파일을 그대로(`?raw`) 탭으로 */
export function SourceTabs({ files }: { files: { name: string; path: string; source: string }[] }) {
  return (
    <TxTabs
      aria-label="소스 파일"
      tabs={files.map((file) => ({
        label: file.name,
        content: <CodeBlock title={file.path}>{file.source}</CodeBlock>
      }))}
    />
  );
}
