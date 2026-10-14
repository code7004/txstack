import { TxAlert } from "@txstack/ui";
import { CodeBlock } from "../../components/CodeBlock";
import { Block, Page } from "../../components/Page";
import { STORYBOOK_URL } from "../../lib/links";

/**
 * **컴포넌트 목록.** props 는 Storybook 이 갖고, 여기는 "무엇이 있는가" 와 그리로 가는 길만 둔다.
 * 분류는 Storybook 의 제목(`Form/TxButton`)과 같다 — 링크 주소가 거기서 나온다.
 *
 * `also` 는 같은 문서에서 함께 다루는 export 다. 빠짐 검사(`api.test.ts`)가 이 페이지에
 * `@txstack/ui` 의 export 가 전부 나오는지 본다.
 */
interface Item {
  name: string;
  desc: string;
  also?: string[];
  sub?: "aggrid" | "daypicker";
  /** autodocs 페이지가 없는 것은 첫 이야기로 보낸다 */
  story?: string;
}

const CATALOG: [category: string, items: Item[]][] = [
  [
    "Form",
    [
      { name: "TxButton", desc: "버튼. 비동기 작업 중에는 잠기고 스피너가 붙습니다" },
      { name: "TxInput", desc: "한 줄 입력. 문자열과 숫자를 함께 다룹니다" },
      { name: "TxSearchInput", desc: "검색용 입력. 입력할 때와 Enter를 눌렀을 때를 나눠 알려 줍니다" },
      { name: "TxTextarea", desc: "여러 줄 입력" },
      { name: "TxNumberInput", desc: "숫자 입력과 올리기 · 내리기 버튼" },
      { name: "TxDropdown", desc: "하나를 고르는 드롭다운" },
      { name: "TxDropdownMulti", desc: "여러 개를 고르는 드롭다운" },
      { name: "TxCombobox", desc: "입력하면서 후보를 고르는 입력창" },
      { name: "TxCheckBox", desc: "체크박스" },
      { name: "TxRadioGroup", desc: "여러 개 중 하나를 고르는 라디오 버튼", also: ["TxRadio"] },
      { name: "TxSwitch", desc: "바로 켜고 끄는 스위치" },
      { name: "TxSlider", desc: "끌어서 값을 고르는 슬라이더" },
      { name: "TxFileUpload", desc: "파일을 끌어 놓거나 골라서 올리고, 진행 상태를 보여 줍니다" },
      { name: "TxCapsLockCheck", desc: "비밀번호 입력 중 Caps Lock이 켜져 있으면 알려 줍니다" },
      { name: "TxForm", desc: "폼. 필드마다 라벨과 오류 메시지 자리를 그리고 서로 연결합니다", also: ["TxFormField"] },
      { name: "TxDayPicker", desc: "날짜 선택과 기간 선택. 폼용 필드도 있습니다", also: ["TxDayPickerRange", "TxFormDayPicker", "TxFormDayPickerRange"], sub: "daypicker" }
    ]
  ],
  [
    "Data",
    [
      { name: "TxAgGrid", desc: "ag-grid 기반 표. 목록 화면에서 자주 하는 일을 미리 넣었습니다", also: ["TxAgGridProvider"], sub: "aggrid" },
      { name: "TxPagination", desc: "페이지 번호. 표든 카드 목록이든 함께 씁니다" },
      { name: "TxAvatar", desc: "사람을 나타내는 프로필 이미지 · 이니셜", also: ["TxAvatarGroup"] },
      { name: "TxCarousel", desc: "옆으로 넘겨 보는 슬라이드" },
      { name: "TxJsonTree", desc: "객체를 접을 수 있는 트리로 보여 주고, 값을 고칠 수도 있습니다" }
    ]
  ],
  [
    "Layout",
    [
      { name: "TxAppShell", desc: "헤더 · 메뉴 · 본문 · 하단을 잡는 화면 틀. 좁은 화면에서는 메뉴가 서랍으로 들어갑니다" },
      { name: "TxNavBar", desc: "가로 메뉴. 항목별 패널이나 메뉴 전체를 펼치는 패널을 둘 수 있습니다" },
      { name: "TxSideNav", desc: "세로 메뉴. 아이콘만 남기고 접히고, 하위 메뉴는 트리로 펼쳐집니다" },
      { name: "TxBreadcrumb", desc: "현재 위치까지의 경로" },
      { name: "TxTabs", desc: "탭과 그 아래 내용" },
      { name: "TxCard", desc: "내용을 담는 카드. 테두리 · 모서리 · 그림자 · 여백을 한 곳에서 정합니다" },
      { name: "TxAccordion", desc: "여러 항목 중 하나씩만 펼쳐지는 목록" },
      { name: "TxCollapsible", desc: "눌러서 접고 펴는 영역" },
      { name: "TxFlex", desc: "가로로 늘어놓는 배치" },
      { name: "TxGrid", desc: "칸을 나누는 배치. 폼을 2단 · 3단으로 놓을 때 씁니다" },
      { name: "TxDivider", desc: "구분선" },
      { name: "TxScrollArea", desc: "넘치는 내용을 스크롤하는 영역. 양 끝이 흐려져 내용이 더 있음을 알립니다" }
    ]
  ],
  [
    "Overlay",
    [
      { name: "TxDialog", desc: "확인 · 알림 창. await로 사용자의 선택을 기다립니다" },
      { name: "TxModal", desc: "화면을 덮고 뜨는 창" },
      { name: "TxSlidePanel", desc: "화면 가장자리에서 나오는 패널. 상세 보기나 필터에 씁니다" },
      { name: "TxDropMenu", desc: "눌러서 펼치는 메뉴와 오른쪽 클릭 메뉴", also: ["TxContextMenu"] },
      { name: "TxTooltip", desc: "마우스를 올리면 뜨는 짧은 설명" }
    ]
  ],
  [
    "Feedback",
    [
      { name: "TxToast", desc: "떴다 사라지는 알림. 컴포넌트 밖에서도 호출할 수 있습니다", story: "variants" },
      { name: "TxAlert", desc: "페이지 안에 놓는 안내 상자" },
      { name: "TxEmptyState", desc: "보여 줄 내용이 없을 때의 안내" },
      { name: "TxLoading", desc: "문구가 붙은 로딩 표시. 화면 전체를 덮을 수도 있습니다" },
      { name: "TxSpinner", desc: "회전하는 로딩 아이콘" },
      { name: "TxProgress", desc: "진행률 막대" },
      { name: "TxSkeleton", desc: "내용이 올 자리를 미리 잡아 두는 회색 영역" },
      { name: "TxTag", desc: "상태 · 분류를 표시하는 작은 이름표" },
      { name: "TxBadge", desc: "알림 점 · 개수 표시" },
      { name: "TxTicker", desc: "흘러가는 공지 줄" }
    ]
  ],
  ["Action", [{ name: "TxCopyButton", desc: "눌러서 글자를 복사하는 버튼" }]]
];

/** Storybook 의 문서 주소. 제목 `Form/TxButton` 이 id `form-txbutton` 이 된다 */
const storyUrl = (category: string, item: Item) => {
  const id = `${category}-${item.name}`.toLowerCase();
  return `${STORYBOOK_URL}?path=${item.story ? `/story/${id}--${item.story}` : `/docs/${id}--docs`}`;
};

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
