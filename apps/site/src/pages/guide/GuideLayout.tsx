import { useState, type CSSProperties } from "react";
import { TxAlert, TxAppShell, TxButton, TxCard, TxFlex, TxGrid, TxNavBar, TxSideNav } from "@txstack/ui";
import { CodeBlock } from "../../components/CodeBlock";
import { Block, Demo, Page, SideBySide } from "../../components/Page";

const SLOTS = [
  ["header", "맨 위 영역. 로고, 계정, 검색이 들어갑니다. 스크롤해도 위에 고정됩니다"],
  ["top", "헤더 바로 아래의 메뉴 바. 헤더와 함께 고정되며, 주 메뉴가 들어갑니다"],
  ["left / right", "양옆 패널. 본문을 내려도 헤더 아래에 붙어 따라오고, panels로 크기 조절과 접기를 켤 수 있습니다"],
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
        panelSticky={false}
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

        <p className="text-slate-600 dark:text-slate-300">서랍 안의 링크를 누르면 서랍이 저절로 닫힙니다. 새 탭으로 열거나 ⌘ · Ctrl을 누른 채 누르면 열린 채로 남습니다. 이 사이트는 좁은 화면에서 메뉴 바를 내리고 서랍에 메뉴 전체를 넣습니다.</p>

        <p className="text-slate-600 dark:text-slate-300">
          <strong>접는 방법은 두 가지이고 동작이 다릅니다.</strong> TxAppShell의 <code>left.collapse</code>는 패널을 폭 0으로 감추고, <code>TxSideNav</code>의 <code>collapsed</code>는 아이콘만 남깁니다. 둘 중 하나만 사용하세요.
        </p>

        <CodeBlock language="css" title="메뉴를 접을 때 패널 폭도 줄이려면">{`/* 왼쪽 패널 폭을 내용에 맞추면, 메뉴를 접을 때 패널도 함께 줄어듭니다 */
.tx-app-shell { --tx-app-shell-left-width: fit-content; }`}</CodeBlock>
      </Block>

      <Block title="Side panels stay in view">
        <p className="text-slate-600 dark:text-slate-300">
          본문을 내려도 양옆 패널은 <strong>헤더 바로 아래에 붙어 따라옵니다</strong>(<code>panelSticky</code>, 기본 켜짐). 패널은 헤더 아래부터 화면 끝까지를 차지하고, 메뉴가 그보다 길면 패널 안에서만 스크롤됩니다. 헤더 높이는 셸이 직접 재고, 페이지
          맨 아래에서는 footer 앞에서 멈춥니다. 이 사이트의 왼쪽 메뉴가 그렇게 동작합니다.
        </p>
        <CodeBlock title="App.tsx">{`<TxAppShell header={<Brand />} left={<SideNav />}>…</TxAppShell>                     // 기본 — 패널이 붙어서 따라온다
<TxAppShell header={<Brand />} left={<SideNav />} panelSticky={false}>…</TxAppShell> // 본문과 같이 굴러간다`}</CodeBlock>
        <TxAlert variant="info" title="상자 안에 넣는 셸은 끄세요">
          패널이 화면 높이를 잡으므로, 위 예제처럼 셸을 페이지 안의 작은 상자에 넣을 때는 <code>panelSticky={"{false}"}</code>를 넘겨야 상자가 화면만큼 길어지지 않습니다. 화면 전체를 쓰는 앱 셸에서는 그대로 두면 됩니다.
        </TxAlert>
      </Block>

      <Block title="Fill the screen with the content">
        <p className="text-slate-600 dark:text-slate-300">
          TxAppShell은 기본적으로 <strong>문서 전체가 스크롤되는 페이지</strong>를 기준으로 합니다. 셸은 최소 화면 높이(<code>min-block-size: 100dvh</code>)만 갖고, 본문은 내용만큼 늘어납니다. 이 사이트처럼 글을 읽는 화면에는 이것이 맞습니다.
        </p>
        <p className="text-slate-600 dark:text-slate-300">
          관리 화면처럼 <strong>본문이 화면을 꽉 채우고 표 안에서만 스크롤</strong>되어야 한다면 두 가지를 정합니다. 셸의 높이를 화면 높이로 고정하고, 본문을 flex 컨테이너로 만듭니다.
        </p>
        <SideBySide>
          <CodeBlock title="AppShell.tsx">{`<TxAppShell
  className="h-dvh"                              // ① 셸을 화면 높이에 고정
  classNames={{ main: "flex overflow-hidden" }}  // ② 본문을 flex 로
  header={<Brand />}
  top={<MainNav />}
>
  <Outlet />
</TxAppShell>`}</CodeBlock>
          <CodeBlock title="MemberList.tsx">{`// 화면은 남는 높이를 채우고, 스크롤은 표가 맡는다
<div className="flex min-h-0 flex-1 flex-col gap-2">
  <SearchBar />
  <div className="min-h-0 flex-1">
    <TxAgGrid rowData={rows} columnDefs={columns} />
  </div>
</div>`}</CodeBlock>
        </SideBySide>
        <TxAlert variant="warning" title="둘 중 하나라도 빠지면 표의 높이가 0이 됩니다">
          본문은 기본이 flex가 아니므로, 화면의 <code>flex-1</code>이 아무 효과도 내지 못하고 화면 높이가 내용 높이가 됩니다. 그 안에서 <code>height: 100%</code>로 높이를 채우는 표는 기준이 될 높이가 없어 0이 됩니다. 셸 높이를 고정하지 않으면 본문이
          내용만큼 늘어나 표 대신 페이지 전체가 스크롤됩니다.
        </TxAlert>
        <p className="text-slate-600 dark:text-slate-300">
          셸 안의 본문 줄과 본문에는 이미 <code>min-block-size: 0</code>이 들어 있어서, 높이만 고정하면 헤더를 뺀 나머지를 본문이 그대로 나눠 갖습니다. 본문의 여백을 없애려면 <code>--tx-app-shell-main-padding: 0</code>을 지정합니다. Tailwind를 쓰지
          않는다면 같은 자리에 앱의 클래스를 주고 CSS로 정합니다.
        </p>
        <SideBySide>
          <CodeBlock title="AppShell.tsx">{`<TxAppShell className="app-shell" classNames={{ main: "app-main" }}>`}</CodeBlock>
          <CodeBlock language="css" title="app.css">{`.app-shell { block-size: 100dvh; }
.app-main { display: flex; overflow: hidden; }`}</CodeBlock>
        </SideBySide>
      </Block>

      <Block title="Horizontal and vertical menus">
        <SideBySide>
          <TxCard title="TxNavBar: 가로 메뉴">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              항목의 <code>children</code>으로 하위를 주면 그 항목의 메가메뉴가 됩니다. <code>as</code>를 함께 주면 항목 이름은 링크가 되고, 옆의 <code>▾</code>가 패널을 엽니다.
            </p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              <code>▾</code>는 키보드와 터치로 패널을 여는 길입니다. 마우스 위주의 화면이라 거슬린다면 <code>toggle=&quot;focus&quot;</code>로 평소에는 숨기고 키보드 포커스가 올 때만 보이게 할 수 있습니다. 이때 터치로는 패널을 열 수 없습니다.
            </p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              메뉴 바 자체에 <code>panel</code>을 주면 <strong>모든 항목이 패널 하나를 함께 씁니다</strong>. 어느 항목에 마우스를 올려도 메뉴 전체가 펼쳐집니다. 이 사이트의 위쪽 메뉴가 그렇게 동작합니다(마우스 전용이라, 패널 안의 링크는 각 항목의
              페이지에서도 닿아야 합니다).
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
