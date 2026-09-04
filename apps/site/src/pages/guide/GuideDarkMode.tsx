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
          <TxForm.Input caption="메일" error="메일 형태가 아니다" defaultValue="hong" />
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
    <Page title="Dark mode" lead="부품에는 다크 분기가 한 줄도 없다. 토큰이 뒤집히고 부품은 그것을 따라간다.">
      <Block title="켜는 방법은 클래스 하나">
        <CodeBlock title="theme.ts">{`document.documentElement.classList.toggle("dark", isDark);`}</CodeBlock>

        <p className="text-slate-600 dark:text-slate-300">
          <strong>언제 켜는지는 앱이 정한다.</strong> 시스템 설정을 따를지, 사용자가 고른 값을 기억할지, 시간대로 바꿀지 — 라이브러리가 정하면 그 판단을 뺏는다. 이 사이트는 저장된 값이 있으면 그것을, 없으면 <code>prefers-color-scheme</code> 을
          따른다.
        </p>
      </Block>

      <Block title="재정의는 한 곳에서만">
        <SideBySide>
          <CodeBlock language="css" title="tokens 재정의">{`:root {
  --tx-color-surface: #ffffff;
  --tx-color-text: #14202b;
  --tx-color-state: #14202b;
}

.dark {
  --tx-color-surface: #131b24;
  --tx-color-text: #e6edf3;
  /* 섞는 색이 뒤집힌다. 비율은 그대로다 */
  --tx-color-state: #e6edf3;
}`}</CodeBlock>

          <div className="flex flex-col gap-3">
            <p className="text-slate-600 dark:text-slate-300">
              부품 CSS 안에 <code>.dark</code> 분기를 흩뿌리지 않는다. 색 하나를 바꿀 때 라이트·다크를 따로 찾아다녀야 하기 때문이다 — <strong>그것을 테스트가 지킨다</strong>(부품 CSS 에 <code>.dark</code> 가 있으면 실패한다).
            </p>

            <TxAlert variant="warning" title="ag-grid 는 예외다">
              표 안쪽의 겉모습은 ag-grid 의 테마가 소유한다. <code>--tx-*</code> 를 뒤집어도 따라오지 않으므로 <code>TxAgGridProvider</code> 에 앱의 테마 상태를 물려야 한다.
            </TxAlert>
          </div>
        </SideBySide>
      </Block>

      <Block title="같은 마크업, 두 모드">
        <p className="text-slate-600 dark:text-slate-300">
          아래 두 판은 <strong>완전히 같은 코드</strong>다. 오른쪽 판을 감싼 <code>div</code> 에만 <code>class=&quot;dark&quot;</code> 를 걸었다 — 화면 한 구석만 반대 모드로 두는 것도 이렇게 한다.
        </p>

        <div className="grid gap-4 lg:grid-cols-2">
          <Panel />
          <Panel dark />
        </div>
      </Block>

      <Block title="페이지 바탕은 앱이 칠한다">
        <p className="text-slate-600 dark:text-slate-300">
          라이브러리는 부품의 면(<code>--tx-color-surface</code>)만 갖고 <strong>페이지 바탕 토큰은 내보내지 않는다.</strong> 안 칠하면 브라우저의 기본 캔버스가 그대로 보인다 — 시스템이 다크인 채로 라이트로 바꿨을 때{" "}
          <strong>본문만 검게 남는다.</strong>
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
          <code>color-scheme</code> 도 함께 맞춘다. 스크롤바와 기본 폼 컨트롤이 반대 테마로 남지 않게 하는 한 줄이다.
        </p>
      </Block>

      <Block title="대비는 값으로 지킨다">
        <SideBySide>
          <TxCard title="어두운 바탕에서는 강조색을 밝게">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              같은 청록을 두 모드에서 쓰면 한쪽이 반드시 읽히지 않는다. 라이트 <code>#0f766e</code> / 다크 <code>#2dd4bf</code> 로 뒤집고, 그 위에 얹는 글자색(<code>--tx-color-on-accent</code>)도 함께 바꾼다.
            </p>
          </TxCard>

          <TxCard title="노랑·초록도 그렇다">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              흰 바탕에서 <code>yellow-400</code> 은 대비가 1.53:1 이라 작은 글씨로 읽히지 않는다. 그래서 기본 토큰의 경고색은 어두운 노랑이고, 다크에서 밝은 쪽으로 뒤집힌다.
            </p>
          </TxCard>
        </SideBySide>
      </Block>
    </Page>
  );
}
