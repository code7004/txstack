import { useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { TxAlert, TxButton, TxCard, TxCheckBox, TxInput, TxTag } from "@txstack/ui";
import { CodeBlock } from "../../components/CodeBlock";
import { Block, Demo, Page, SideBySide } from "../../components/Page";

/**
 * **토큰을 손으로 돌려 보는 자리.** 값을 바꾸면 아래 부품이 전부 따라온다 —
 * 이 판(`div`)에만 변수를 얹었으므로 사이트의 나머지는 그대로다.
 */
function Playground() {
  const [primary, setPrimary] = useState("#2dd4bf");
  const [radius, setRadius] = useState(6);
  const [hover, setHover] = useState(16);

  const style = {
    "--tx-color-primary": primary,
    "--tx-radius": `${radius}px`,
    "--tx-state-hover": `${hover}%`
  } as CSSProperties;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-mono text-xs text-slate-500 dark:text-slate-400">--tx-color-primary</span>
          <input type="color" value={primary} onChange={(event) => setPrimary(event.target.value)} className="h-9 w-20 cursor-pointer rounded border" style={{ borderColor: "var(--tx-color-border)" }} />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-mono text-xs text-slate-500 dark:text-slate-400">--tx-radius: {radius}px</span>
          <input type="range" min={0} max={20} value={radius} onChange={(event) => setRadius(Number(event.target.value))} className="w-40" />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-mono text-xs text-slate-500 dark:text-slate-400">--tx-state-hover: {hover}%</span>
          <input type="range" min={0} max={40} value={hover} onChange={(event) => setHover(Number(event.target.value))} className="w-40" />
        </label>
      </div>

      {/* 변수를 지정한 영역. 이 안의 컴포넌트만 값을 따라갑니다 */}
      <div style={{ ...style, borderColor: "var(--tx-color-border)", backgroundColor: "var(--tx-color-surface)" }} className="flex flex-col gap-4 rounded-lg border p-5">
        <div className="flex flex-wrap items-center gap-2">
          <TxButton label="저장" />
          <TxButton label="취소" variant="secondary" />
          <TxButton label="삭제" variant="danger" />
          <TxTag>태그</TxTag>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <TxInput placeholder="클릭해서 포커스 링 확인" className="w-64" />
          <TxCheckBox label="동의합니다" defaultChecked />
        </div>

        <TxAlert variant="info" title="모두 같은 색을 따라갑니다">
          버튼, 포커스 링, 체크박스가 <strong>토큰 하나</strong>에서 색을 가져옵니다. hover 색을 따로 지정하지 않아도 마우스를 올리면 알아서 진해집니다.
        </TxAlert>
      </div>
    </div>
  );
}

export function GuideStyling() {
  return (
    <Page title="Styling" lead="색 · 모서리 · 여백 같은 모양은 토큰(디자인 값을 담은 CSS 변수)으로, 화면에 놓이는 자리는 className으로 바꿉니다. 컴포넌트의 CSS는 덮어쓰지 않습니다.">
      <Block title="Three levels of scope">
        <p className="text-slate-600 dark:text-slate-300">토큰은 세 단계 범위로 지정할 수 있습니다. 앱 전체, 컴포넌트 한 종류, 특정 위치 한 곳 순으로 범위가 좁아집니다.</p>

        <CodeBlock language="css" title="app.css">{`/* ① 앱 전체 */
:root {
  --tx-color-primary: #2dd4bf;
  --tx-color-on-accent: #04231f;   /* 밝은 색을 채우면 글자는 어둡게 */
  --tx-radius: 0.375rem;
}

/* ② 컴포넌트 한 종류: 그 컴포넌트가 제공하는 토큰 */
.tx-button {
  --tx-button-padding: 0.5rem 1.25rem;
}`}</CodeBlock>

        <CodeBlock title="Screen.tsx">{`{/* ③ 특정 위치 한 곳 */}
<TxTable style={{ "--tx-table-max-height": "20rem" }} />`}</CodeBlock>

        <TxAlert variant="info" title="컴포넌트 클래스를 고치고 싶어진다면">
          <strong>필요한 토큰이 없다는 신호</strong>입니다. <code>.tx-button</code>의 규칙을 덮어쓰면 다음 버전에서 예고 없이 깨질 수 있습니다. 대신 필요한 토큰을 추가해 달라고 요청하세요.
        </TxAlert>
      </Block>

      <Block title="Try it">
        <p className="text-slate-600 dark:text-slate-300">
          값을 바꾸면 아래 컴포넌트가 모두 함께 바뀝니다. <strong>이 예제 영역에만 변수를 지정했기 때문에</strong> 사이트의 나머지 부분은 그대로입니다. 화면 일부에만 다른 테마를 적용할 때도 같은 방법을 씁니다.
        </p>

        <Playground />
      </Block>

      <Block title="State colors are ratios">
        <p className="text-slate-600 dark:text-slate-300">
          hover, pressed 상태는 <strong>색이 아니라 비율</strong>로 지정합니다. 그래서 강조색 하나만 바꿔도 마우스를 올렸을 때의 색이 자동으로 다시 계산됩니다. <code>-hover</code> 토큰을 따로 맞춰 둘 필요가 없습니다.
        </p>

        <CodeBlock language="css" title="색을 섞는 방식">{`background-color: color-mix(
  in oklab,
  var(--tx-color-state) var(--tx-state-hover),
  transparent
);`}</CodeBlock>

        <p className="text-slate-600 dark:text-slate-300">
          섞는 색(<code>--tx-color-state</code>)은 라이트 모드에서는 어둡고 다크 모드에서는 밝습니다. 그래서 <strong>같은 비율로도 두 모드 모두에서 자연스러운 "눌린 느낌"</strong>이 납니다.
        </p>
      </Block>

      <Block title="Global tokens">
        <p className="text-slate-600 dark:text-slate-300">
          모든 컴포넌트가 따르는 전역 토큰은 색, 상태 비율, 모서리, 포커스 표시를 합쳐 17개입니다. 이름 · 기본값 · 다크 모드 값은{" "}
          <Link to="/api/ui#design-tokens" className="underline">
            API › ui › Design tokens
          </Link>
          에 정리해 두었습니다. 컴포넌트마다 전용 토큰도 있습니다(<code>--tx-button-*</code>, <code>--tx-side-nav-*</code> 등).
        </p>

        <TxAlert variant="warning" title="강조색 토큰이 두 개인 이유">
          배경을 채우는 색과 글자로 쓰는 색은 <strong>요구 조건이 서로 다릅니다.</strong> 채우는 색은 그 위의 흰 글자가 읽히도록 어두워야 하고, 글자로 쓰는 색은 라이트 모드에서는 더 어둡게, 다크 모드에서는 밝게 바뀌어야 합니다. 그래서 민트나 파스텔
          같은 밝은 브랜드 색을 <code>--tx-color-primary</code>에만 넣으면 <strong>버튼은 잘 보이지만 현재 메뉴 표시가 잘 읽히지 않습니다.</strong> 이 사이트가 바로 그런 경우이고, 두 토큰을 각각 지정하는 것으로 해결했습니다.
        </TxAlert>
      </Block>

      <Block title="Classes">
        <p className="text-slate-600 dark:text-slate-300">
          토큰이 컴포넌트의 모양을 바꾼다면, <code>className</code>은 컴포넌트가 <strong>화면에 놓이는 자리</strong>(폭 · 바깥 여백 · 정렬)를 정합니다. <code>className</code>은 기본 클래스(<code>.tx-button</code>)를 대신하지 않고 뒤에 덧붙습니다.
        </p>

        <CodeBlock title="Screen.tsx">{`<TxButton label="저장" className="w-full sm:w-auto" />

{/* 안쪽 요소는 classNames로 */}
<TxCard title="회원" className="mt-6" classNames={{ body: "flex flex-col gap-3" }} />`}</CodeBlock>

        <p className="text-slate-600 dark:text-slate-300">
          <code>classNames</code>로 꾸밀 수 있는 안쪽 요소는 컴포넌트마다 정해져 있습니다. 예를 들어 <code>TxCard</code>는 <code>header</code> · <code>title</code> · <code>body</code>, <code>TxModal</code>은 <code>panel</code> · <code>header</code> ·{" "}
          <code>body</code>입니다. 각 컴포넌트의 이름은{" "}
          <Link to="/api/ui#components-by-category" className="underline">
            API › ui
          </Link>
          에서 Storybook 문서로 이어집니다.
        </p>

        <p className="text-slate-600 dark:text-slate-300">
          일반 CSS 파일에 쓴 클래스는 항상 컴포넌트 스타일보다 우선합니다. Tailwind를 쓴다면{" "}
          <Link to="/docs/start#using-with-tailwind" className="underline">
            Getting Started › Using with Tailwind
          </Link>
          의 레이어 순서 한 줄이 있어야 유틸리티 클래스가 우선합니다.
        </p>

        <TxAlert variant="warning" title="색은 className이 아니라 토큰으로">
          <code>className=&quot;bg-violet-600&quot;</code>처럼 색을 직접 칠하면 평소 색만 바뀌고, 마우스를 올리거나 눌렀을 때의 색은 따라오지 않습니다. 다크 모드에서도 그대로 남습니다. 색은 그 컴포넌트의 토큰을 바꾸세요.
        </TxAlert>

        <SideBySide>
          <CodeBlock language="css" title="app.css">{`.brand-button {
  --tx-button-bg: #7c3aed;
}`}</CodeBlock>
          <CodeBlock title="Screen.tsx">{`<TxButton label="시작하기" className="brand-button" />`}</CodeBlock>
        </SideBySide>
      </Block>

      <Block title="Where app settings live">
        <p className="text-slate-600 dark:text-slate-300">
          앱 전체에 적용할 설정은 <strong>txstack 전용 CSS 파일 하나</strong>에 모으는 것을 권합니다. 스타일시트 import, 전역 토큰, 컴포넌트 기본값 덮어쓰기가 한곳에 있으면 무엇을 바꿨는지 한눈에 보이고, Tailwind를 쓰든 안 쓰든 같은 파일을 그대로
          씁니다.
        </p>

        <SideBySide>
          <CodeBlock language="css" title="src/txstack.css">{`@import "@txstack/ui/styles.css";

/* ① 앱 전체 — 전역 토큰 */
:root {
  --tx-color-primary: #3176ec;
}

/* ② 컴포넌트 기본값 덮어쓰기 — 레이어 안에 */
@layer components {
  .tx-app-shell {
    --tx-app-shell-bar-padding: 0;
    --tx-app-shell-main-padding: 0;
  }
}`}</CodeBlock>
          <CodeBlock title="src/main.tsx">{`import "./index.css";     // Tailwind (쓰는 앱만) — 먼저
import "./txstack.css";   // txstack — 뒤에`}</CodeBlock>
        </SideBySide>

        <p className="text-slate-600 dark:text-slate-300">
          Tailwind를 쓰지 않는 앱은 <code>main.tsx</code>에서 <code>txstack.css</code>만 불러오면 됩니다. Tailwind를 쓰는 앱은{" "}
          <Link to="/docs/start#using-with-tailwind" className="underline">
            레이어 순서 한 줄
          </Link>
          이 있는 Tailwind 파일을 <strong>먼저</strong> 불러옵니다.
        </p>

        <TxAlert variant="warning" title="컴포넌트 기본값을 덮을 때는 @layer components 안에">
          레이어 밖에 쓴 규칙은 레이어 안의 규칙을 <strong>모두</strong> 이깁니다. 컴포넌트 스타일(<code>tx</code>)뿐 아니라 Tailwind 유틸리티(<code>utilities</code>)까지 이기기 때문에, 앱 전체에 준 값을 화면 하나에서 <code>className</code>으로 다시
          바꿀 수 없게 됩니다. <code>@layer components</code>에 넣으면 컴포넌트 기본값은 이기고 화면의 <code>className</code>에는 집니다. Tailwind를 쓰지 않는 앱에서도 <code>tx</code> 다음에 오는 레이어가 되어 똑같이 동작합니다. <code>:root</code>의
          전역 토큰은 요소에 붙는 클래스와 겹치지 않으므로 레이어 밖에 두어도 됩니다.
        </TxAlert>
      </Block>

      <Block title="This site's settings">
        <SideBySide>
          <CodeBlock language="css" title="apps/site/src/theme.css">{`:root {
  --tx-color-primary: #2dd4bf;         /* 채우는 색: 두 모드에서 같음 */
  --tx-color-on-accent: #04231f;       /* 밝은 배경 위에는 어두운 글자 */
  --tx-color-primary-strong: #0f766e;  /* 배경 위에서 글자로 읽히는 색 */
}

.dark {
  /* 어두운 배경에서는 민트도 글자로 잘 읽힘 */
  --tx-color-primary-strong: #2dd4bf;
}`}</CodeBlock>

          <Demo>
            <TxCard title="컴포넌트 CSS는 한 줄도 덮어쓰지 않았습니다">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                지금 보이는 색, 모서리, 포커스 링은 모두 <code>theme.css</code> 파일 하나에서 정합니다. 덮어쓴 규칙이 하나라도 있으면 다음 버전에서 깨질 수 있습니다.
              </p>
            </TxCard>
          </Demo>
        </SideBySide>
      </Block>
    </Page>
  );
}
