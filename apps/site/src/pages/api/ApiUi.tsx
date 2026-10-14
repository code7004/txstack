import { TxAlert } from "@txstack/ui";
import { CodeBlock } from "../../components/CodeBlock";
import { Block, Page } from "../../components/Page";
import { STORYBOOK_URL } from "../../lib/links";
import { CATALOG, storyUrl } from "./data";

export function ApiUi() {
  return (
    <Page title="@txstack/ui" lead="UI를 위한 Tx* 컴포넌트 49종입니다. 스타일시트 한 줄로 적용하고, 디자인은 CSS 변수로 바꿉니다.">
      <Block title="Entry points">
        <CodeBlock title="import">{`// 루트 — 추가로 설치할 것이 없습니다
import { TxButton, TxForm, TxAppShell } from "@txstack/ui";
import "@txstack/ui/styles.css";   // 앱에서 한 번만

// 무거운 컴포넌트는 서브패스에 있습니다 (쓰는 경우에만 peer를 설치)
import { TxAgGrid } from "@txstack/ui/aggrid";      // peer: ag-grid-community, ag-grid-react
import { TxDayPicker } from "@txstack/ui/daypicker"; // peer: react-day-picker`}</CodeBlock>

        <TxAlert variant="info" title="루트를 import해도 서브패스는 딸려 오지 않습니다">
          루트 진입점은 서브패스를 <strong>참조하지 않습니다.</strong> 그래서 ag-grid를 설치하지 않아도 나머지 컴포넌트는 모두 동작합니다. 런타임 의존성은 <code>clsx</code> 하나뿐입니다.
        </TxAlert>
      </Block>

      <Block title="Components by category">
        <p className="text-slate-600 dark:text-slate-300">props, 디자인 토큰, 예제는 Storybook에 정리되어 있습니다. 같은 내용을 두 곳에서 관리하면 어긋나기 쉬워서 여기에는 목록만 두고, 이름을 누르면 해당 컴포넌트의 Storybook 문서가 열립니다.</p>
        {CATALOG.map(([category, items]) => (
          <div key={category} className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">{category}</h3>
            <div className="overflow-x-auto rounded-lg border" style={{ borderColor: "var(--tx-color-border)" }}>
              <table className="w-full text-sm">
                <tbody>
                  {items.map((item) => (
                    <tr key={item.name} className="border-t align-top first:border-t-0" style={{ borderColor: "var(--tx-color-border)" }}>
                      <td className="w-56 px-3 py-2 whitespace-nowrap">
                        <a href={storyUrl(category, item)} target="_blank" rel="noreferrer" className="font-mono text-xs font-semibold underline">
                          {item.name}
                        </a>
                        {item.sub && <span className="ms-2 font-mono text-xs text-slate-500 dark:text-slate-400">/{item.sub}</span>}
                      </td>
                      <td className="px-3 py-2 text-slate-600 dark:text-slate-300">
                        {item.desc}
                        {item.also && <span className="mt-0.5 block font-mono text-xs text-slate-500 dark:text-slate-400">{item.also.join(" · ")}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
        <a href={STORYBOOK_URL} className="tx-button self-start" data-variant="primary" target="_blank" rel="noreferrer">
          <span className="tx-button__label">Storybook 열기</span>
        </a>
      </Block>

      <Block title="Common rules">
        <div className="flex flex-col gap-2 text-slate-600 dark:text-slate-300">
          <p>
            <strong>
              <code>className</code>은 덧붙습니다
            </strong>{" "}
            — 기본 클래스를 대체하지 않습니다. 위치와 여백은 사용하는 쪽에서 정합니다.
          </p>
          <p>
            <strong>문구는 번역된 텍스트로 넘깁니다</strong> — 번역 키를 넘겨 컴포넌트 안에서 번역하는 방식이 아닙니다(<code>labels</code> prop).
          </p>
          <p>
            <strong>controlled · uncontrolled 모두 지원합니다</strong> — <code>value</code>를 넘기면 앱이 값을 관리하고, <code>defaultValue</code>를 넘기면 컴포넌트가 관리합니다.
          </p>
          <p>
            <strong>
              모든 컴포넌트에 <code>data-tag</code>가 붙습니다
            </strong>{" "}
            — 테스트에서 <code>[data-tag=&quot;TxButton&quot;]</code>처럼 찾을 수 있습니다.
          </p>
        </div>
      </Block>
    </Page>
  );
}
