import { useState, type CSSProperties } from "react";
import { TxAlert, TxAppShell, TxButton, TxCard, TxFlex, TxGrid, TxNavBar, TxSideNav } from "@txstack/ui";
import { CodeBlock } from "../../components/CodeBlock";
import { Block, Demo, Page, SideBySide } from "../../components/Page";

const SLOTS = [
  ["header", "맨 위 줄. 브랜드 · 계정 · 검색이 오는 자리. sticky 를 탄다"],
  ["top", "헤더 아래 줄. 헤더와 한 덩어리로 붙어 있는다 — 주 메뉴 자리다"],
  ["left / right", "옆 패널. 크기 조절 · 접기를 panels 로 켠다"],
  ["bottom", "아래 패널. 콘솔 · 로그 · 미리보기. 폭은 bottomSpan 이 정한다"],
  ["footer", "맨 아래 줄"],
  ["children", "본문"]
];

/** 진짜 셸 하나를 작게 넣는다. 좁은 화면 규칙을 보려면 `breakpoint` 를 낮춰야 한다. */
function ShellDemo() {
  const [rail, setRail] = useState(false);

  return (
    <div className="overflow-hidden rounded-lg border" style={{ borderColor: "var(--tx-color-border)" }}>
      <TxAppShell
        header={
          <div className="flex w-full items-center gap-2">
            <strong className="px-1 text-sm">Console</strong>
            <TxButton label="☰" aria-label="왼쪽 줄 접기" variant="ghost" className="ms-auto" onClick={() => setRail((prev) => !prev)} />
          </div>
        }
        top={
          <TxNavBar>
            <TxNavBar.Item label="Overview" as="button" type="button" aria-current="page" />
            <TxNavBar.Item label="Logs" as="button" type="button" />
          </TxNavBar>
        }
        left={
          <TxSideNav collapsed={rail} className="p-2">
            <TxSideNav.Item icon="◧" label="Dashboard" as="button" type="button" aria-current="page" />
            <TxSideNav.Item icon="▤" label="Reports" as="button" type="button" />
            <TxSideNav.Item icon="⚙" label="Settings" as="button" type="button" />
          </TxSideNav>
        }
        footer={<div className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">footer 자리</div>}
        breakpoint={360}
        style={{ minBlockSize: "22rem", "--tx-app-shell-left-width": "fit-content" } as CSSProperties}
      >
        <div className="flex flex-col gap-2 p-4">
          <h3 className="font-semibold">본문</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            헤더의 ☰ 를 눌러 보라 — 왼쪽 줄이 아이콘만 남고 <strong>자리도 함께 줄어든다.</strong>
          </p>
        </div>
      </TxAppShell>
    </div>
  );
}

export function GuideLayout() {
  return (
    <Page title="Layout" lead="화면 골격은 셸이 잡고, 그 안의 자리마다 무엇을 넣을지는 앱이 정한다.">
      <Block title="자리를 슬롯으로 준다">
        <SideBySide>
          <CodeBlock title="App.tsx">{`<TxAppShell
  header={<Brand />}
  top={<TxNavBar>{gnb}</TxNavBar>}
  left={<TxSideNav>{snb}</TxSideNav>}
  footer={<SiteFooter />}
  panels={{ left: { resize: true, collapse: true, defaultSize: 280 } }}
>
  <Outlet />
</TxAppShell>`}</CodeBlock>

          <div className="flex flex-col gap-2 text-sm">
            {SLOTS.map(([slot, what]) => (
              <div key={slot} className="flex gap-3">
                <code className="min-w-28 shrink-0 text-xs">{slot}</code>
                <span className="text-slate-600 dark:text-slate-300">{what.replace(/\*\*/g, "")}</span>
              </div>
            ))}
          </div>
        </SideBySide>

        <TxAlert variant="info" title="랜드마크는 셸이 붙인다">
          <code>top</code> · <code>left</code> 는 셸이 <code>&lt;nav&gt;</code> 로 감싼다. 그래서 그 안의 내비게이션 부품에는 <code>label</code> 을 주지 않는다 — 주면 랜드마크가 둘로 읽힌다.
        </TxAlert>
      </Block>

      <Block title="직접 만져 보기">
        <ShellDemo />
      </Block>

      <Block title="좁아지면 서랍으로 옮긴다">
        <p className="text-slate-600 dark:text-slate-300">
          <code>breakpoint</code>(기본 960px)보다 좁아지면 헤더에 햄버거가 생기고 <code>left</code> 가 서랍으로 들어간다.{" "}
          <strong>
            그 안에 서는 것이 <code>TxSideNav</code>
          </strong>{" "}
          라, 가로 줄(<code>TxNavBar</code>)은 스스로 접히지 않는다 — 상황이 하나만 남는다.
        </p>

        <p className="text-slate-600 dark:text-slate-300">
          <strong>접기는 두 가지가 있고 서로 다르다.</strong> 셸의 <code>left.collapse</code> 는 패널을 폭 0 으로 감추고, <code>TxSideNav</code> 의 <code>collapsed</code> 는 아이콘 줄로 남긴다. 둘 중 하나만 쓴다.
        </p>

        <CodeBlock language="css" title="자리가 줄에 맞춰 줄게 하려면">{`/* 셸이 내용에 맞춰 폭을 잡으면 rail 이 그대로 셸을 움직인다 */
.tx-app-shell { --tx-app-shell-left-width: fit-content; }`}</CodeBlock>
      </Block>

      <Block title="가로냐 세로냐로 갈랐다">
        <SideBySide>
          <TxCard title="TxNavBar — 가로">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              항목에 <code>panel</code> 을 주면 메가메뉴가 된다. <code>as</code> 를 함께 주면 제목이 링크가 되고 옆의 <code>▾</code> 가 패널을 연다.
            </p>
          </TxCard>

          <TxCard title="TxSideNav — 세로">
            <p className="text-sm text-slate-600 dark:text-slate-300">아이콘만 남기고 접히고, 하위메뉴는 트리로 접힌다. 이 사이트의 왼쪽 줄이 그것이다.</p>
          </TxCard>
        </SideBySide>

        <p className="text-slate-600 dark:text-slate-300">
          <strong>자리(GNB · SNB)를 주장하지 않고 방향만 주장한다.</strong> 1차 내비게이션을 세로로 두는 화면이 흔하므로, 이름이 쓰임을 막지 않게 했다.
        </p>
      </Block>

      <Block title="줄 세우기는 가벼운 것으로">
        <SideBySide>
          <CodeBlock title="Screen.tsx">{`<TxFlex className="items-center">
  <TxButton label="저장" />
  <TxButton label="취소" variant="secondary" />
</TxFlex>

<TxGrid columns={3} className="gap-4">
  {cards}
</TxGrid>`}</CodeBlock>

          <Demo>
            <TxFlex className="items-center">
              <TxButton label="저장" />
              <TxButton label="취소" variant="secondary" />
            </TxFlex>

            <TxGrid columns={3} className="gap-3">
              {["하나", "둘", "셋"].map((text) => (
                <div key={text} className="rounded border px-3 py-2 text-center text-sm" style={{ borderColor: "var(--tx-color-border)" }}>
                  {text}
                </div>
              ))}
            </TxGrid>
          </Demo>
        </SideBySide>

        <p className="text-slate-600 dark:text-slate-300">
          <code>TxFlex</code> · <code>TxGrid</code> 는 <strong>간격 기본값만</strong> 준다. 방향·정렬은 <code>className</code> 으로 소비자가 정한다 — 기본 클래스를 교체하지 않고 덧붙기 때문이다.
        </p>
      </Block>
    </Page>
  );
}
