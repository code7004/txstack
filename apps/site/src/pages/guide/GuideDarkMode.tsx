import { TxAlert, TxButton, TxCard, TxForm, TxTag } from "@txstack/ui";
import { CodeBlock } from "../../components/CodeBlock";
import { Block, Page, SideBySide } from "../../components/Page";

/** 두 모드를 한 화면에 나란히 놓는다. 오른쪽 판에만 `.dark` 를 걸었다. */
function Panel({ dark = false }: { dark?: boolean }) {
  return (
    <div className={dark ? "dark" : undefined}>
      <div className="flex flex-col gap-3 rounded-lg border p-5" style={{ borderColor: "var(--tx-color-border)", backgroundColor: "var(--tx-color-surface)", color: "var(--tx-color-text)" }}>
        <div className="flex items-center gap-2">
          <TxTag>{dark ? "dark" : "light"}</TxTag>
          <span className="font-mono text-xs text-slate-500 dark:text-slate-400">{dark ? '<div class="dark">' : ":root"}</span>
        </div>

        <TxForm labelWidth="3.5rem">
          <TxForm.Input caption="이름" placeholder="홍길동" />
          <TxForm.Input caption="메일" error="메일 형식이 올바르지 않습니다" defaultValue="hong" />
        </TxForm>

        <div className="flex gap-2">
          <TxButton label="저장" />
          <TxButton label="취소" variant="secondary" />
        </div>
      </div>
    </div>
  );
}

export function GuideDarkMode() {
  return (
    <Page title="Dark mode" lead="컴포넌트에는 다크 모드용 코드가 따로 없습니다. 토큰(디자인 값을 담은 CSS 변수)의 값이 바뀌고, 컴포넌트는 그 값을 따라갑니다.">
      <Block title="Turn it on with one class">
        <CodeBlock title="theme.ts">{`document.documentElement.classList.toggle("dark", isDark);`}</CodeBlock>

        <p className="text-slate-600 dark:text-slate-300">
          <strong>언제 켤지는 앱이 정합니다.</strong> 시스템 설정을 따를지, 사용자가 고른 값을 기억할지, 시간대에 따라 바꿀지는 앱마다 다르기 때문에 라이브러리가 대신 정하지 않습니다. 이 사이트는 저장된 값이 있으면 그 값을, 없으면{" "}
          <code>prefers-color-scheme</code>을 따릅니다.
        </p>
      </Block>

      <Block title="Redefine tokens in one place">
        <SideBySide>
          <CodeBlock language="css" title="토큰 재정의">{`:root {
  --tx-color-surface: #ffffff;
  --tx-color-text: #14202b;
  --tx-color-state: #14202b;
}

.dark {
  --tx-color-surface: #131b24;
  --tx-color-text: #e6edf3;
  /* 섞는 색만 바뀌고 비율은 그대로 */
  --tx-color-state: #e6edf3;
}`}</CodeBlock>

          <div className="flex flex-col gap-3">
            <p className="text-slate-600 dark:text-slate-300">
              컴포넌트 CSS 곳곳에 <code>.dark</code> 규칙을 두지 않습니다. 그러면 색 하나를 바꿀 때마다 라이트와 다크를 따로 찾아 고쳐야 하기 때문입니다. <strong>이 규칙은 테스트로 확인합니다</strong>(컴포넌트 CSS에 <code>.dark</code>가 있으면
              테스트가 실패합니다).
            </p>

            <TxAlert variant="warning" title="ag-grid는 예외입니다">
              표 안쪽의 디자인은 ag-grid 테마가 담당합니다. <code>--tx-*</code> 값을 바꿔도 따라오지 않으므로 <code>TxAgGridProvider</code>에 앱의 테마 상태를 넘겨 주세요.
            </TxAlert>
          </div>
        </SideBySide>
      </Block>

      <Block title="Same markup, two modes">
        <p className="text-slate-600 dark:text-slate-300">
          아래 두 예제는 <strong>완전히 같은 코드</strong>입니다. 오른쪽 예제를 감싼 <code>div</code>에만 <code>class=&quot;dark&quot;</code>를 붙였습니다. 화면 일부만 반대 모드로 보여 줄 때도 이렇게 하면 됩니다.
        </p>

        <div className="grid gap-4 lg:grid-cols-2">
          <Panel />
          <Panel dark />
        </div>
      </Block>

      <Block title="The app sets the page background">
        <p className="text-slate-600 dark:text-slate-300">
          라이브러리는 컴포넌트의 면 색(<code>--tx-color-surface</code>)만 제공하고 <strong>페이지 배경 토큰은 제공하지 않습니다.</strong> 배경을 지정하지 않으면 브라우저의 기본 배경이 그대로 보여서, 시스템이 다크 모드인 상태에서 사이트를 라이트
          모드로 바꾸면 <strong>본문 배경만 검게 남습니다.</strong>
        </p>

        <CodeBlock language="css" title="app.css">{`html {
  color-scheme: light;
  background-color: #f7f8f9;
  color: var(--tx-color-text);
}

html.dark {
  color-scheme: dark;
  background-color: #0c1219;
}`}</CodeBlock>

        <p className="text-slate-600 dark:text-slate-300">
          <code>color-scheme</code>도 함께 맞춰 주세요. 스크롤바와 브라우저 기본 폼 컨트롤이 반대 테마로 남지 않게 해 줍니다.
        </p>
      </Block>

      <Block title="Contrast through token values">
        <SideBySide>
          <TxCard title="어두운 배경에서는 강조색을 밝게">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              같은 청록색을 두 모드에서 그대로 쓰면 한쪽에서는 잘 읽히지 않습니다. 라이트 모드는 <code>#0f766e</code>, 다크 모드는 <code>#2dd4bf</code>로 나눠 지정하세요. 채우는 색이 밝다면 그 위의 글자색(<code>--tx-color-on-accent</code>)도 어둡게
              맞춰야 합니다.
            </p>
          </TxCard>

          <TxCard title="노랑, 초록도 마찬가지입니다">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              흰 배경에서 <code>yellow-400</code>은 대비가 1.53:1이라 작은 글씨로는 읽기 어렵습니다. 그래서 기본 경고색은 라이트 모드에서 어두운 노랑을 쓰고, 다크 모드에서는 밝은 노랑으로 바뀝니다.
            </p>
          </TxCard>
        </SideBySide>
      </Block>
    </Page>
  );
}
