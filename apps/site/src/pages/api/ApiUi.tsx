import { Link } from "react-router-dom";
import { TxAlert } from "@txstack/ui";
import { CodeBlock } from "../../components/CodeBlock";
import { Block, Page } from "../../components/Page";
import { RefTable } from "../../components/Reference";
import { STORYBOOK_TARGET, STORYBOOK_URL } from "../../lib/links";
import { CATALOG, TABLES, componentAnchor, storyUrl, tableAnchor } from "./data";

export function ApiUi() {
  return (
    <Page title="@txstack/ui" lead="버튼 · 입력 · 폼 · 표 · 모달부터 사이드 메뉴가 있는 앱 골격까지, 관리자 화면에 필요한 Tx* 컴포넌트를 모았습니다. props 몇 개로 바로 쓰고, CSS 변수 몇 줄로 우리 서비스의 모습으로 바꿀 수 있게 만들었습니다.">
      <Block title="Install">
        <CodeBlock language="bash" title="sh">{`pnpm add @txstack/ui`}</CodeBlock>
        <RefTable head={["Entry", "Exports", "Peer", "Description"]} rows={TABLES.ui.installEntry.rows} anchor={tableAnchor(TABLES.ui.installEntry)} />

        <TxAlert variant="info" title="표와 달력은 쓸 때만 설치합니다">
          <code>TxAgGrid</code>는 ag-grid를, <code>TxDayPicker</code>는 react-day-picker를 씁니다. 둘 다 무거워서 <code>@txstack/ui/aggrid</code> · <code>@txstack/ui/daypicker</code>로 따로 떼어 두었습니다. 루트(<code>@txstack/ui</code>)만 쓰는 앱은
          이 라이브러리들을 설치하지 않아도 모든 컴포넌트가 동작합니다.
        </TxAlert>
      </Block>

      <Block title="Components by category">
        <p className="text-slate-600 dark:text-slate-300">
          컴포넌트마다 props · 디자인 토큰 · 예제는 Storybook에서 직접 눌러 보며 확인할 수 있습니다. 여기에는 무엇이 있는지만 모아 두었습니다. 이름(↗)을 누르면 그 컴포넌트의 Storybook 문서가 새 탭에서 열립니다.
        </p>
        {CATALOG.map(([category, items]) => (
          <div key={category} className="flex flex-col gap-2">
            <h3 data-toc className="site-anchor text-sm font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
              {category}
            </h3>
            <div className="overflow-x-auto rounded-lg border" style={{ borderColor: "var(--tx-color-border)" }}>
              <table className="site-stack-table w-full text-sm">
                <tbody>
                  {items.map((item) => (
                    <tr key={item.name} id={componentAnchor(item.name)} className="site-anchor border-t align-top first:border-t-0" style={{ borderColor: "var(--tx-color-border)" }}>
                      <td className="px-3 py-2 whitespace-nowrap sm:w-56">
                        <a href={storyUrl(category, item)} target={STORYBOOK_TARGET} title={`${item.name}의 props와 예제를 Storybook에서 보기 (Storybook 창)`} className="font-mono text-xs font-semibold underline">
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
        <a href={STORYBOOK_URL} className="tx-button self-start" data-variant="primary" target={STORYBOOK_TARGET}>
          <span className="tx-button__label">Storybook에서 전체 props 보기 ↗</span>
        </a>
      </Block>

      <Block title="Design tokens">
        <p className="text-slate-600 dark:text-slate-300">
          모든 컴포넌트가 따르는 전역 CSS 변수입니다. <code>:root</code>에서 값 하나를 바꾸면 hover · focus · 다크 모드까지 모든 컴포넌트가 따라 바뀝니다. <code>.dark</code> 아래에는 다크 모드 값이 따로 있습니다. 자세한 방법은{" "}
          <Link to="/docs/guide/styling" className="underline">
            Guide › Styling
          </Link>
          에 있습니다.
        </p>
        <RefTable head={["Token", "Default", "Dark mode", "Description"]} rows={TABLES.ui.tokens.rows} anchor={tableAnchor(TABLES.ui.tokens)} />
        <p className="text-slate-600 dark:text-slate-300">
          컴포넌트 하나만 바꾸고 싶다면 그 컴포넌트의 토큰(<code>--tx-button-*</code>, <code>--tx-side-nav-*</code> 등)을 덮어쓰면 됩니다. 어떤 토큰이 있는지는 위 목록에서 이름을 눌러 Storybook 문서에서 볼 수 있습니다.
        </p>
      </Block>

      <Block title="Common rules">
        <div className="flex flex-col gap-2 text-slate-600 dark:text-slate-300">
          <p>
            <strong>
              <code>className</code>은 덧붙습니다
            </strong>{" "}
            — 기본 클래스를 지우지 않고 그 위에 더해집니다. 화면 안에서의 위치와 여백은 쓰는 쪽에서 정하면 됩니다.
          </p>
          <p>
            <strong>문구는 번역이 끝난 텍스트로 넘깁니다</strong> — 기본 문구를 가진 컴포넌트는 <code>labels</code> prop으로 그 문구를 바꿀 수 있습니다. 컴포넌트가 번역 키를 받아 직접 번역하지는 않습니다.
          </p>
          <p>
            <strong>값을 앱이 들고 있어도, 컴포넌트에 맡겨도 됩니다</strong> — <code>value</code>를 넘기면 앱이 값을 관리하고(controlled), <code>defaultValue</code>를 넘기면 컴포넌트가 관리합니다(uncontrolled).
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
