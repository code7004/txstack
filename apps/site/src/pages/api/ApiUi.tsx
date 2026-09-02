import { TxAlert, TxCard, TxGrid } from "@txstack/ui";
import { CodeBlock } from "../../components/CodeBlock";
import { Block, Page } from "../../components/Page";

const GROUPS = [
  ["Form", "TxInput · TxTextarea · TxNumberInput · TxSearchInput · TxDropdown · TxDropdownMulti · TxCombobox · TxCheckBox · TxRadioGroup · TxSwitch · TxSlider · TxFileUpload · TxCapsLockCheck · TxForm"],
  ["Data", "TxAgGrid(서브패스) · TxPagination · TxAvatar · TxAvatarGroup · TxCarousel · TxJsonTree"],
  ["Layout", "TxAppShell · TxNavBar · TxSideNav · TxCard · TxTabs · TxAccordion · TxCollapsible · TxFlex · TxGrid · TxDivider · TxScrollArea · TxBreadcrumb"],
  ["Overlay", "TxModal · TxDialog · TxSlidePanel · TxDropMenu · TxMenu · TxTooltip"],
  ["Feedback", "TxAlert · TxToast · TxTag · TxBadge · TxProgress · TxSkeleton · TxSpinner · TxLoading · TxTicker · TxEmptyState"],
  ["Action", "TxButton · TxCopyButton"],
  ["Date", "TxDayPicker · TxDayPickerRange · TxFormDayPicker(서브패스)"]
];

export function ApiUi() {
  return (
    <Page title="@txstack/ui" lead="Tx* 컴포넌트 49종. 스타일시트는 한 줄이고 겉모습은 CSS 변수로 바꾼다.">
      <Block title="진입점">
        <CodeBlock title="import">{`// 루트 — 추가로 설치할 것이 없다
import { TxButton, TxForm, TxAppShell } from "@txstack/ui";
import "@txstack/ui/styles.css";   // 앱에서 한 번

// 무거운 것은 서브패스에 있다 (peer 를 쓰는 쪽만 설치)
import { TxAgGrid } from "@txstack/ui/aggrid";      // peer: ag-grid-community, ag-grid-react
import { TxDayPicker } from "@txstack/ui/daypicker"; // peer: react-day-picker`}</CodeBlock>

        <TxAlert variant="info" title="루트를 import 해도 딸려오지 않는다">
          루트 배럴은 서브패스를 <strong>참조하지 않는다.</strong> 그래서 ag-grid 를 안 깔아도 나머지 부품이 다 돈다 — 런타임 의존은 <code>clsx</code> 하나뿐이다.
        </TxAlert>
      </Block>

      <Block title="묶음별 부품">
        <TxGrid columns={2} className="gap-4">
          {GROUPS.map(([group, names]) => (
            <TxCard key={group} title={group}>
              <p className="font-mono text-xs leading-relaxed text-slate-600 dark:text-slate-300">{names}</p>
            </TxCard>
          ))}
        </TxGrid>
      </Block>

      <Block title="props 표는 카탈로그가 갖는다">
        <p className="text-slate-600 dark:text-slate-300">
          부품 하나하나의 props · 토큰 · 스토리는 <strong>Storybook</strong> 에 있다. 여기서 다시 쓰지 않는다 — 같은 내용을 두 곳에서 관리하면 반드시 어긋난다.
        </p>

        <a href="/storybook/" className="tx-button self-start" data-variant="primary" target="_blank" rel="noreferrer">
          <span className="tx-button__label">카탈로그 열기</span>
        </a>
      </Block>

      <Block title="공통 규약">
        <div className="flex flex-col gap-2 text-slate-600 dark:text-slate-300">
          <p>
            <strong>
              <code>className</code> 은 덧붙는다
            </strong>{" "}
            — 기본 클래스를 교체하지 않는다. 자리·여백은 소비자가 정한다.
          </p>
          <p>
            <strong>문구는 번역된 글자로 준다</strong> — 키를 넘기고 안에서 번역하지 않는다(<code>labels</code> prop).
          </p>
          <p>
            <strong>controlled · uncontrolled 둘 다 된다</strong> — <code>value</code> 를 주면 앱이 쥐고 <code>defaultValue</code> 를 주면 부품이 쥔다.
          </p>
          <p>
            <strong>
              모든 부품에 <code>data-tag</code> 가 붙는다
            </strong>{" "}
            — 테스트에서 <code>[data-tag=&quot;TxButton&quot;]</code> 으로 찾는다.
          </p>
        </div>
      </Block>
    </Page>
  );
}
