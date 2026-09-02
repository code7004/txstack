import { useState, type CSSProperties } from "react";
import { TxAlert, TxButton, TxCard, TxCheckBox, TxInput, TxTag } from "@txstack/ui";
import { CodeBlock } from "../../components/CodeBlock";
import { Block, Demo, Page, SideBySide } from "../../components/Page";

const GLOBAL_TOKENS = [
  ["--tx-color-primary", "주 동작 · 포커스 링이 이 색을 따라간다"],
  ["--tx-color-danger", "되돌릴 수 없는 동작"],
  ["--tx-color-warning", "막지는 않지만 알려야 하는 자리"],
  ["--tx-color-success", "잘 됐음을 알리는 자리"],
  ["--tx-color-surface", "카드 · 입력창처럼 바탕에서 떠 보이는 면"],
  ["--tx-color-muted", "보조 버튼처럼 바탕에 눌러앉는 면"],
  ["--tx-color-border", "표면의 테두리"],
  ["--tx-color-text", "글자"],
  ["--tx-color-on-accent", "강조색 위에 얹히는 글자"],
  ["--tx-color-state", "hover · pressed 로 섞이는 색"],
  ["--tx-state-hover / --tx-state-pressed", "그 섞는 비율 (16% / 28%)"],
  ["--tx-radius", "모서리"],
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

      {/* 변수를 얹은 판. 이 안의 부품만 값을 따라간다 */}
      <div style={{ ...style, borderColor: "var(--tx-color-border)", backgroundColor: "var(--tx-color-surface)" }} className="flex flex-col gap-4 rounded-lg border p-5">
        <div className="flex flex-wrap items-center gap-2">
          <TxButton label="저장" />
          <TxButton label="취소" variant="secondary" />
          <TxButton label="삭제" variant="danger" />
          <TxTag>태그</TxTag>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <TxInput placeholder="눌러서 포커스 링을 보라" className="w-64" />
          <TxCheckBox label="동의합니다" defaultChecked />
        </div>

        <TxAlert variant="info" title="같은 색을 따라간다">
          버튼 · 포커스 링 · 체크박스가 <strong>토큰 하나</strong>에서 색을 받는다. 짝이 되는 hover 색을 따로 주지 않았는데도 얹으면 진해진다.
        </TxAlert>
      </div>
    </div>
  );
}

export function GuideTokens() {
  return (
    <Page title="Tokens" lead="겉모습은 CSS 를 덮어써서 바꾸지 않는다. 토큰을 다시 정의한다.">
      <Block title="세 층으로 좁혀 간다">
        <p className="text-slate-600 dark:text-slate-300">아래로 갈수록 범위가 좁다. 앱 전체 → 부품 한 종류 → 한 자리.</p>

        <CodeBlock language="css" title="app.css">{`/* ① 앱 전체 */
:root {
  --tx-color-primary: #2dd4bf;
  --tx-color-on-accent: #04231f;   /* 밝은 색을 채우면 글자는 어둡게 */
  --tx-radius: 0.375rem;
}

/* ② 부품 한 종류 — 그 부품이 내보내는 토큰 */
.tx-button {
  --tx-button-padding: 0.5rem 1.25rem;
}`}</CodeBlock>

        <CodeBlock title="Screen.tsx">{`{/* ③ 한 자리만 */}
<TxTable style={{ "--tx-table-max-height": "20rem" }} />`}</CodeBlock>

        <TxAlert variant="info" title="부품 클래스에 손대고 싶어지면">
          그건 <strong>토큰이 부족하다는 신호</strong>다. <code>.tx-button</code> 의 규칙을 덮어쓰기 시작하면 다음 버전에서 조용히 깨진다 — 대신 그 토큰을 열어 달라고 하는 편이 낫다.
        </TxAlert>
      </Block>

      <Block title="직접 돌려 보기">
        <p className="text-slate-600 dark:text-slate-300">
          값을 바꾸면 아래 부품이 전부 따라온다. <strong>이 판에만 변수를 얹었으므로</strong> 사이트의 나머지는 그대로다 — 화면 한 구석만 다른 테마로 두는 것도 같은 방법이다.
        </p>

        <Playground />
      </Block>

      <Block title="상태색은 비율로 정한다">
        <p className="text-slate-600 dark:text-slate-300">
          hover · pressed 를 <strong>색이 아니라 비율</strong>로 둔다. 그래서 강조색 하나만 바꿔도 얹었을 때의 색이 거기서 다시 파생된다 — 짝이 되는 <code>-hover</code> 토큰을 따로 챙길 필요가 없다.
        </p>

        <CodeBlock language="css" title="어떻게 섞이나">{`background-color: color-mix(
  in oklab,
  var(--tx-color-state) var(--tx-state-hover),
  transparent
);`}</CodeBlock>

        <p className="text-slate-600 dark:text-slate-300">
          섞는 색(<code>--tx-color-state</code>)이 라이트에서는 어둡고 다크에서는 밝다. 그래서 <strong>같은 비율로 두 모드에서 각각 "눌린 느낌"</strong>이 난다.
        </p>
      </Block>

      <Block title="전역 토큰">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: "var(--tx-color-border)" }}>
                <th className="py-2 pe-4 text-start font-semibold">토큰</th>
                <th className="py-2 text-start font-semibold">무엇</th>
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
          부품마다 자기 토큰이 더 있다(<code>--tx-button-*</code> · <code>--tx-side-nav-*</code> …). 무엇이 있는지는 <strong>카탈로그의 각 부품 문서</strong>에 적혀 있다.
        </p>

        <TxAlert variant="warning" title="밝은 브랜드색을 쓸 때 한 가지">
          <code>--tx-color-primary</code> 는 <strong>채우는 색과 글자로 쓰는 색을 겸한다.</strong> 밝은 색을 넣으면 버튼은 살아나지만 글자·선으로 쓰는 자리(현재 메뉴 표시 · 포커스 링)가 흰 바탕에서 안 읽힌다. 이 사이트는 진한 쪽을 따로
          두고 <strong>그 자리의 부품 토큰만</strong> 그쪽으로 돌렸다.
        </TxAlert>
      </Block>

      <Block title="이 사이트가 그렇게 만들어졌다">
        <SideBySide>
          <CodeBlock language="css" title="apps/site/src/theme.css">{`:root {
  --tx-color-primary: #2dd4bf;      /* 채움 — 두 모드가 같다 */
  --tx-color-on-accent: #04231f;
  --site-accent-strong: #0f766e;    /* 글자·선 자리 */
}

/* 글자로 쓰는 부품 토큰만 그쪽으로 돌린다 */
.tx-side-nav {
  --tx-side-nav-accent: var(--site-accent-strong);
}`}</CodeBlock>

          <Demo>
            <TxCard title="부품 CSS 는 한 줄도 안 덮었다">
              <p className="text-sm text-slate-600 dark:text-slate-300">지금 보고 있는 색 · 모서리 · 포커스 링이 전부 저 파일에서 나온다. 덮어쓴 규칙이 하나라도 있으면 다음 버전에서 깨질 자리가 된다.</p>
            </TxCard>
          </Demo>
        </SideBySide>
      </Block>
    </Page>
  );
}
