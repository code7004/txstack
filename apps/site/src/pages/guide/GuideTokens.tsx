import { useState, type CSSProperties } from "react";
import { TxAlert, TxButton, TxCard, TxCheckBox, TxInput, TxTag } from "@txstack/ui";
import { CodeBlock } from "../../components/CodeBlock";
import { Block, Demo, Page, SideBySide } from "../../components/Page";

const GLOBAL_TOKENS = [
  ["--tx-color-primary", "채우는 색. 버튼 배경, 스위치, 체크박스"],
  ["--tx-color-primary-strong", "배경 위에서 글자로 읽히는 강조색. 현재 메뉴, 탭, 포커스 링"],
  ["--tx-color-danger", "되돌릴 수 없는 동작(삭제 등)"],
  ["--tx-color-warning", "막지는 않지만 주의를 줘야 하는 상황"],
  ["--tx-color-success", "성공을 알리는 상황"],
  ["--tx-color-surface", "카드, 입력창처럼 배경 위에 올라온 면"],
  ["--tx-color-muted", "보조 버튼처럼 배경에 가라앉은 면"],
  ["--tx-color-border", "테두리"],
  ["--tx-color-text", "글자색"],
  ["--tx-color-on-accent", "강조색 배경 위의 글자색"],
  ["--tx-color-state", "hover, pressed 상태에서 섞는 색"],
  ["--tx-state-hover / --tx-state-pressed", "섞는 비율(16% / 28%)"],
  ["--tx-radius", "모서리 둥글기"],
  ["--tx-focus-ring / --tx-focus-ring-offset", "키보드 포커스 표시"]
];

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

export function GuideTokens() {
  return (
    <Page title="Tokens" lead="디자인을 바꿀 때는 CSS를 덮어쓰지 말고 토큰(디자인 값을 담은 CSS 변수)을 다시 정의하세요.">
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
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: "var(--tx-color-border)" }}>
                <th className="py-2 pe-4 text-start font-semibold">토큰</th>
                <th className="py-2 text-start font-semibold">용도</th>
              </tr>
            </thead>
            <tbody>
              {GLOBAL_TOKENS.map(([name, what]) => (
                <tr key={name} className="border-b" style={{ borderColor: "var(--tx-color-border)" }}>
                  <td className="py-2 pe-4 align-top font-mono text-xs whitespace-nowrap">{name}</td>
                  <td className="py-2 align-top text-slate-600 dark:text-slate-300">{what}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-slate-600 dark:text-slate-300">
          컴포넌트마다 전용 토큰도 있습니다(<code>--tx-button-*</code>, <code>--tx-side-nav-*</code> 등). 어떤 토큰이 있는지는 <strong>카탈로그의 각 컴포넌트 문서</strong>에서 확인하세요.
        </p>

        <TxAlert variant="warning" title="강조색 토큰이 두 개인 이유">
          배경을 채우는 색과 글자로 쓰는 색은 <strong>요구 조건이 서로 다릅니다.</strong> 채우는 색은 그 위의 흰 글자가 읽히도록 어두워야 하고, 글자로 쓰는 색은 라이트 모드에서는 더 어둡게, 다크 모드에서는 밝게 바뀌어야 합니다. 그래서 민트나 파스텔
          같은 밝은 브랜드 색을 <code>--tx-color-primary</code>에만 넣으면 <strong>버튼은 잘 보이지만 현재 메뉴 표시가 잘 읽히지 않습니다.</strong> 이 사이트가 바로 그런 경우이고, 두 토큰을 각각 지정하는 것으로 해결했습니다.
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
