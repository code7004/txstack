import { Link } from "react-router-dom";
import { TxAlert } from "@txstack/ui";
import { CodeBlock } from "../../components/CodeBlock";
import { INSTALL_TITLE, PrePublishNote } from "../../components/PrePublish";
import { Block, Page } from "../../components/Page";
import { RefTable } from "../../components/Reference";
import { STORYBOOK_URL } from "../../lib/links";
import { CATALOG, TABLES, componentAnchor, storyUrl, tableAnchor } from "./data";

export function ApiUi() {
  return (
    <Page title="@txstack/ui" lead="UI를 위한 Tx* 컴포넌트 49종입니다. 스타일시트 한 줄로 적용하고, 디자인은 CSS 변수로 바꿉니다.">
      <Block title="Install">
        <CodeBlock language="bash" title={INSTALL_TITLE}>{`pnpm add @txstack/ui`}</CodeBlock>
        <PrePublishNote />
        <RefTable head={["Entry", "Exports", "Peer", "Description"]} rows={TABLES.ui.installEntry.rows} anchor={tableAnchor(TABLES.ui.installEntry)} />

        <TxAlert variant="info" title="루트를 import해도 서브패스는 딸려 오지 않습니다">
          루트 진입점은 서브패스를 <strong>참조하지 않습니다.</strong> 그래서 ag-grid나 react-day-picker를 설치하지 않아도 나머지 컴포넌트는 모두 동작합니다.
        </TxAlert>
      </Block>

      <Block title="Components by category">
        <p className="text-slate-600 dark:text-slate-300">
          props, 디자인 토큰, 예제는 Storybook에 정리되어 있습니다. 같은 내용을 두 곳에서 관리하면 어긋나기 쉬워서 여기에는 목록만 두고, 이름(↗)을 누르면 해당 컴포넌트의 props와 예제가 있는 Storybook 문서가 새 탭에서 열립니다.
        </p>
        {CATALOG.map(([category, items]) => (
          <div key={category} className="flex flex-col gap-2">
            <h3 data-toc className="site-anchor text-sm font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
              {category}
            </h3>
            <div className="overflow-x-auto rounded-lg border" style={{ borderColor: "var(--tx-color-border)" }}>
              <table className="w-full text-sm">
                <tbody>
                  {items.map((item) => (
                    <tr key={item.name} id={componentAnchor(item.name)} className="site-anchor border-t align-top first:border-t-0" style={{ borderColor: "var(--tx-color-border)" }}>
                      <td className="w-56 px-3 py-2 whitespace-nowrap">
                        <a href={storyUrl(category, item)} target="_blank" rel="noreferrer" title={`${item.name}의 props와 예제를 Storybook에서 보기 (새 탭)`} className="font-mono text-xs font-semibold underline">
                          {item.name}
                          <span aria-hidden className="ms-0.5 text-slate-400">
                            ↗
                          </span>
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
          <span className="tx-button__label">Storybook에서 전체 props 보기 ↗</span>
        </a>
      </Block>

      <Block title="Design tokens">
        <p className="text-slate-600 dark:text-slate-300">
          모든 컴포넌트가 따르는 전역 CSS 변수입니다. <code>:root</code>에서 값을 바꾸면 사이트 전체에 적용되고, <code>.dark</code>는 표의 다크 모드 값으로 바꿉니다. 바꾸는 방법은{" "}
          <Link to="/docs/guide/styling" className="underline">
            Guide › Styling
          </Link>
          에 있습니다.
        </p>
        <RefTable head={["Token", "Default", "Dark mode", "Description"]} rows={TABLES.ui.tokens.rows} anchor={tableAnchor(TABLES.ui.tokens)} />
        <p className="text-slate-600 dark:text-slate-300">
          컴포넌트마다 전용 토큰도 있습니다(<code>--tx-button-*</code>, <code>--tx-side-nav-*</code> 등). 컴포넌트별 토큰은 위 목록에서 이름을 눌러 Storybook 문서에서 확인하세요.
        </p>
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
