import { Fragment, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { TxSpinner, TxTabs } from "@txstack/ui";
import { CodeBlock } from "../../components/CodeBlock";

/** 예제 페이지들이 함께 쓰는 조각 — 짧은 안내 · 불러오는 중 · 함께 쓴 패키지 · 소스 탭 */

export const muted = "text-slate-600 dark:text-slate-300";

/**
 * **데모 앞의 설명은 한 줄이다.** 좁은 화면에서 데모가 두세 화면 아래로 밀리지 않게, 자세한 조작 안내는
 * 접어 두고 필요할 때 펼친다.
 */
export function QuickGuide({ children, more }: { children: ReactNode; more: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <p className={muted}>{children}</p>
      <details className="group text-sm">
        <summary className="cursor-pointer text-slate-500 select-none hover:underline dark:text-slate-400">자세한 조작 안내</summary>
        <div className={`mt-2 flex flex-col gap-1 ${muted}`}>{more}</div>
      </details>
    </div>
  );
}

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

/** 화면에서 돌아가는 파일을 그대로(`?raw`) 탭으로. 긴 파일은 안에서 구른다 */
export function SourceTabs({ files }: { files: { name: string; path: string; source: string }[] }) {
  return (
    <TxTabs
      aria-label="소스 파일"
      classNames={{ list: "overflow-x-auto" }}
      tabs={files.map((file) => ({
        label: file.name,
        content: (
          <CodeBlock title={file.path} maxHeight="32rem">
            {file.source}
          </CodeBlock>
        )
      }))}
    />
  );
}

/** 화면 코드 말고 앱의 나머지(레이아웃 · 라우트 · Provider)가 어디 있는지 */
export function WholeAppNote() {
  return (
    <p className={muted}>
      세 화면을 앱 하나로 묶는{" "}
      <Link to="/example/app" className="underline">
        App.tsx
      </Link>
      (TxAppShell · Provider)와{" "}
      <Link to="/example/routes" className="underline">
        routes.tsx
      </Link>
      (RouteTree)는 Example 메뉴의 App · Routes에 있습니다.
    </p>
  );
}
