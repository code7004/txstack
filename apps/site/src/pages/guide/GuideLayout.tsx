import { useState, type CSSProperties } from "react";
import { TxAlert, TxAppShell, TxButton, TxCard, TxFlex, TxGrid, TxNavBar, TxSideNav } from "@txstack/ui";
import { CodeBlock } from "../../components/CodeBlock";
import { Block, Demo, Page, SideBySide } from "../../components/Page";

const SLOTS = [
  ["header", "맨 위 영역. 로고, 계정, 검색이 들어갑니다. 스크롤해도 위에 고정됩니다"],
  ["top", "헤더 바로 아래의 메뉴 바. 헤더와 함께 고정되며, 주 메뉴가 들어갑니다"],
  ["left / right", "양옆 패널. panels로 크기 조절과 접기를 켤 수 있습니다"],
  ["bottom", "아래쪽 패널. 콘솔, 로그, 미리보기 등이 들어갑니다. 폭은 bottomSpan으로 정합니다"],
  ["footer", "맨 아래 영역"],
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
            <TxButton label="☰" aria-label="왼쪽 메뉴 접기" variant="ghost" className="ms-auto" onClick={() => setRail((prev) => !prev)} />
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
        footer={<div className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">footer 영역</div>}
        breakpoint={360}
        style={{ minBlockSize: "22rem", "--tx-app-shell-left-width": "fit-content" } as CSSProperties}
      >
        <div className="flex flex-col gap-2 p-4">
          <h3 className="font-semibold">본문</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            헤더의 ☰를 눌러 보세요. 왼쪽 메뉴가 아이콘만 남기고 접히면서 <strong>차지하던 폭도 함께 줄어듭니다.</strong>
          </p>
        </div>
      </TxAppShell>
    </div>
  );
}

export function GuideLayout() {
  return (
    <Page title="Layout" lead="화면 틀은 TxAppShell이 잡고, 각 영역에 무엇을 넣을지는 앱이 정합니다.">
      <Block title="Fill areas with slots">
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

        <TxAlert variant="info" title="랜드마크는 TxAppShell이 붙입니다">
          <code>top</code>과 <code>left</code>는 TxAppShell이 <code>&lt;nav&gt;</code>로 감쌉니다. 그러니 그 안에 넣는 내비게이션 컴포넌트에는 <code>label</code>을 주지 마세요. 주면 스크린 리더가 랜드마크를 두 번 읽습니다.
        </TxAlert>
      </Block>

      <Block title="Try it">
        <ShellDemo />
      </Block>

      <Block title="Drawer menu on narrow screens">
        <p className="text-slate-600 dark:text-slate-300">
          화면이 <code>breakpoint</code>(기본 960px)보다 좁아지면 헤더에 햄버거 버튼이 생기고 <code>left</code>가 서랍 메뉴로 들어갑니다.{" "}
          <strong>
            서랍 안에 들어가는 것은 <code>TxSideNav</code>
          </strong>
          이므로, 메뉴 바(<code>TxNavBar</code>)는 스스로 접히지 않습니다. 좁은 화면을 처리하는 곳이 한 군데로 정리됩니다.
        </p>

        <p className="text-slate-600 dark:text-slate-300">
          <strong>접는 방법은 두 가지이고 동작이 다릅니다.</strong> TxAppShell의 <code>left.collapse</code>는 패널을 폭 0으로 감추고, <code>TxSideNav</code>의 <code>collapsed</code>는 아이콘만 남깁니다. 둘 중 하나만 사용하세요.
        </p>

        <CodeBlock language="css" title="메뉴를 접을 때 패널 폭도 줄이려면">{`/* 왼쪽 패널 폭을 내용에 맞추면, 메뉴를 접을 때 패널도 함께 줄어듭니다 */
.tx-app-shell { --tx-app-shell-left-width: fit-content; }`}</CodeBlock>
      </Block>

      <Block title="Horizontal and vertical menus">
        <SideBySide>
          <TxCard title="TxNavBar: 가로 메뉴">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              항목에 <code>panel</code>을 주면 메가메뉴가 됩니다. <code>as</code>를 함께 주면 항목 이름은 링크가 되고, 옆의 <code>▾</code>가 패널을 엽니다.
            </p>
          </TxCard>

          <TxCard title="TxSideNav: 세로 메뉴">
            <p className="text-sm text-slate-600 dark:text-slate-300">아이콘만 남기고 접을 수 있고, 하위 메뉴는 트리 형태로 펼치고 접습니다. 이 사이트의 왼쪽 메뉴가 TxSideNav입니다.</p>
          </TxCard>
        </SideBySide>

        <p className="text-slate-600 dark:text-slate-300">
          <strong>이름은 위치(GNB, SNB)가 아니라 방향을 나타냅니다.</strong> 주 메뉴를 세로로 두는 화면도 흔하므로, 이름 때문에 쓰임새가 제한되지 않도록 했습니다.
        </p>
      </Block>

      <Block title="Simple layouts with TxFlex and TxGrid">
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
          <code>TxFlex</code>와 <code>TxGrid</code>는 <strong>기본 간격만</strong> 정해 둡니다. 방향과 정렬은 <code>className</code>으로 직접 지정하세요. 넘긴 클래스는 기본 클래스를 대체하지 않고 덧붙습니다.
        </p>
      </Block>
    </Page>
  );
}
