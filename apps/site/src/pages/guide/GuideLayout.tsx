import { useState, type CSSProperties } from "react";
import { TxAlert, TxAppShell, TxButton, TxCard, TxFlex, TxGrid, TxNavBar, TxSideNav, type TxAppShellProps } from "@txstack/ui";
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

const PANEL_OPTIONS = [
  ["resize", "끌어서 크기를 바꿉니다. true면 기본 한계로, { min, max }로 한계를 직접 정할 수도 있습니다"],
  ["collapse", "경계선 가운데에 접기 스위치를 둡니다. 접으면 패널이 완전히 사라집니다"],
  ["collapsedSize", "접어도 이만큼(px) 남깁니다. 남는 동안에도 내용을 그리고, 안의 TxSideNav는 아이콘 줄이 됩니다"],
  ["defaultSize", "처음 크기(px). 주지 않으면 CSS 기본값을 씁니다"],
  ["defaultCollapsed", "처음부터 접힌 채로 시작합니다"],
  ["size · collapsed", "크기와 접힘을 앱이 직접 쥡니다. 주면 셸은 기억하지 않고 이 값을 따릅니다"]
];

type PanelChange = Parameters<NonNullable<TxAppShellProps["onPanelChange"]>>;

/** 좌 · 우 · 아래 패널을 모두 켠 셸. 끌고 접어 보면 마지막으로 온 onPanelChange 가 아래에 찍힌다. */
function PanelsDemo() {
  const [span, setSpan] = useState<"main" | "screen">("main");
  const [last, setLast] = useState<{ slot: PanelChange[0] } & PanelChange[1]>();

  return (
    <div className="flex flex-col gap-2">
      <TxFlex className="items-center text-sm">
        <span className="text-slate-600 dark:text-slate-300">bottomSpan</span>
        {(["main", "screen"] as const).map((value) => (
          <TxButton key={value} label={`"${value}"`} variant={span === value ? "primary" : "secondary"} aria-pressed={span === value} onClick={() => setSpan(value)} />
        ))}
      </TxFlex>

      {/* 패널 셋에 본문까지 들어가야 하므로 좁은 화면에서는 상자 안에서 가로로 굴린다 */}
      <div className="overflow-x-auto rounded-lg border" style={{ borderColor: "var(--tx-color-border)" }}>
        <TxAppShell
          panelSticky={false}
          breakpoint={360}
          bottomSpan={span}
          className="min-w-[36rem]"
          header={<strong className="px-1 text-sm">Console</strong>}
          left={<div className="p-3 text-sm">left</div>}
          right={<div className="p-3 text-sm">right</div>}
          bottom={<div className="p-3 font-mono text-xs">bottom — 로그 · 콘솔 자리</div>}
          panels={{
            left: { resize: true, collapse: true, defaultSize: 160 },
            right: { resize: { min: 120, max: 260 }, collapse: true, defaultSize: 140 },
            bottom: { resize: { min: 60 }, collapse: true, defaultSize: 90 }
          }}
          onPanelChange={(slot, change) => change.settled && setLast({ slot, ...change })}
          style={{ minBlockSize: 0, blockSize: "24rem" }}
        >
          <div className="p-4 text-sm text-slate-600 dark:text-slate-300">경계선을 끌어 크기를 바꾸고, 경계선 가운데의 스위치로 접어 보세요. 본문은 남는 만큼을 갖습니다.</div>
        </TxAppShell>
      </div>

      <code className="text-xs text-slate-500 dark:text-slate-400">{last ? `onPanelChange("${last.slot}", { size: ${last.size ?? "undefined"}, collapsed: ${last.collapsed}, settled: true })` : "onPanelChange — 끌거나 접으면 여기에 찍힙니다"}</code>
    </div>
  );
}

/** 셸의 스위치로 아이콘 줄까지 접는 셸. 메뉴에는 collapsed 를 주지 않는다 — 셸을 따른다 */
function IconRailDemo() {
  const [picked, setPicked] = useState("Dashboard");
  const item = (icon: string, label: string) => <TxSideNav.Item icon={icon} label={label} as="button" type="button" aria-current={picked === label ? "page" : undefined} onClick={() => setPicked(label)} />;

  return (
    <div className="overflow-x-auto rounded-lg border" style={{ borderColor: "var(--tx-color-border)" }}>
      <TxAppShell
        panelSticky={false}
        breakpoint={360}
        className="min-w-[28rem]"
        header={<strong className="px-1 text-sm">Console</strong>}
        left={
          <TxSideNav className="p-2">
            {item("◧", "Dashboard")}
            {item("▤", "Reports")}
            <TxSideNav.Item icon="⚙" label="Settings">
              {item("", "Account")}
              {item("", "Alerts")}
            </TxSideNav.Item>
          </TxSideNav>
        }
        panels={{ left: { collapse: true, collapsedSize: 56 } }}
        style={{ minBlockSize: 0, blockSize: "20rem" }}
      >
        <div className="flex flex-col gap-2 p-4 text-sm text-slate-600 dark:text-slate-300">
          <strong className="text-base text-slate-900 dark:text-slate-100">{picked}</strong>
          <p>왼쪽 경계선 가운데의 스위치를 눌러 보세요. 메뉴가 아이콘 줄만 남기고 접힙니다. 접힌 채로 Settings를 누르면 패널이 먼저 펴집니다.</p>
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

      <Block title="Resize and collapse panels">
        <p className="text-slate-600 dark:text-slate-300">
          <code>left</code> · <code>right</code> · <code>bottom</code> 세 패널은 <code>panels</code> 하나로 <strong>끌어서 크기를 바꾸고, 접었다 펼 수 있습니다.</strong> 자리마다 켜고 싶은 것만 적으면 되고, 본문은 패널이 쓰고 남은 만큼을 갖습니다.
        </p>

        <SideBySide>
          <CodeBlock title="AppShell.tsx">{`<TxAppShell
  left={<SideNav />}
  right={<Inspector />}
  bottom={<Console />}
  panels={{
    left: { resize: true, collapse: true, defaultSize: 280 },
    right: { resize: { min: 200, max: 520 }, collapse: true, defaultCollapsed: true },
    bottom: { resize: { min: 100 }, collapse: true }
  }}
>
  <Outlet />
</TxAppShell>`}</CodeBlock>

          <div className="flex flex-col gap-2 text-sm">
            {PANEL_OPTIONS.map(([option, what]) => (
              <div key={option} className="flex gap-3">
                <code className="min-w-32 shrink-0 text-xs">{option}</code>
                <span className="text-slate-600 dark:text-slate-300">{what}</span>
              </div>
            ))}
          </div>
        </SideBySide>

        <PanelsDemo />

        <ul className="flex list-disc flex-col gap-1 ps-5 text-slate-600 dark:text-slate-300">
          <li>
            <strong>접으면 패널이 완전히 사라지고</strong> 스위치만 남습니다. 다시 펴면 접기 전 크기로 돌아옵니다. 접힌 패널의 내용은 그리지 않으므로, 보이지 않는 링크에 Tab이 닿지 않습니다.
          </li>
          <li>
            크기는 기본 <code>120px</code> 아래로 줄지 않습니다. <code>max</code>를 주지 않아도 본문이 가로 <code>240px</code>(아래 패널이면 세로 <code>160px</code>)은 남도록 셸이 조입니다.
          </li>
          <li>
            손잡이는 키보드로도 움직입니다. 포커스를 두고 화살표로 16px씩, <code>Home</code> · <code>End</code>로 끝까지 옮깁니다.
          </li>
          <li>
            아래 패널의 폭은 <code>bottomSpan</code>이 정합니다. <code>&quot;main&quot;</code>(기본)은 좌우 패널을 비켜 본문 폭만, <code>&quot;screen&quot;</code>은 좌우까지 덮는 전체 폭입니다.
          </li>
          <li>
            <code>resize</code>를 켜지 않은 패널의 크기는 CSS 변수로 정합니다 — <code>--tx-app-shell-left-width</code> · <code>--tx-app-shell-right-width</code> · <code>--tx-app-shell-bottom-height</code>.
          </li>
        </ul>

        <SideBySide>
          <CodeBlock title="크기와 접힘을 기억하려면">{`const saved = JSON.parse(localStorage.getItem("shell") ?? "{}");

<TxAppShell
  left={<SideNav />}
  panels={{ left: { resize: true, collapse: true, defaultSize: saved.size, defaultCollapsed: saved.collapsed } }}
  onPanelChange={(slot, { size, collapsed, settled }) => {
    // 끄는 동안에는 settled: false 로 계속 옵니다 — 손을 뗐을 때만 저장
    if (settled) localStorage.setItem("shell", JSON.stringify({ size, collapsed }));
  }}
/>`}</CodeBlock>
          <TxAlert variant="info" title="저장은 앱이 합니다">
            어디에 남길지(localStorage, 서버, 사용자 설정)는 앱마다 달라서 TxAppShell은 저장하지 않습니다. <code>onPanelChange</code>로 받아 두었다가 다음에 <code>defaultSize</code> · <code>defaultCollapsed</code>로 돌려주세요.
          </TxAlert>
        </SideBySide>

        <h3 className="mt-2 font-semibold">접어도 아이콘 줄은 남기기 — collapsedSize</h3>
        <p className="text-slate-600 dark:text-slate-300">
          <code>collapse</code>만 주면 접을 때 패널이 <strong>완전히 사라집니다.</strong> 메뉴처럼 아이콘은 남겨 두고 싶다면 <code>collapsedSize</code>(px)를 함께 주세요. 접어도 그 크기만큼 남고, 남는 동안에도 내용을 그리며 경계선도 남습니다.
        </p>
        <SideBySide>
          <CodeBlock title="AppShell.tsx">{`<TxAppShell
  left={
    // collapsed 를 주지 않는다 — 셸의 스위치를 따른다
    <TxSideNav>
      <TxSideNav.Item icon={<IconChart />} label="대시보드" as={NavLink} to="/" />
      <TxSideNav.Item icon={<IconCog />} label="설정">
        <TxSideNav.Item label="계정" as={NavLink} to="/settings/account" />
      </TxSideNav.Item>
    </TxSideNav>
  }
  panels={{ left: { collapse: true, collapsedSize: 56 } }}
>
  <Outlet />
</TxAppShell>`}</CodeBlock>
          <ul className="flex list-disc flex-col gap-1 ps-5 text-sm text-slate-600 dark:text-slate-300">
            <li>
              안에 둔 <code>TxSideNav</code>는 <strong>셸의 접힘을 따라 아이콘 줄이 됩니다.</strong> 메뉴에 <code>collapsed</code>를 따로 줄 필요가 없고, 메뉴 폭은 패널을 그대로 채웁니다.
            </li>
            <li>접힌 채로 하위 메뉴가 있는 항목을 누르면 패널이 먼저 펴집니다.</li>
            <li>
              <code>TxSideNav</code>에 <code>collapsed</code>를 주면 그쪽이 이깁니다. 셸과 따로 접고 싶을 때만 쓰세요.
            </li>
            <li>
              접힌 동안에는 크기 손잡이가 없습니다. <code>onPanelChange</code>는 완전히 감출 때와 똑같이 <code>collapsed: true</code>를 보내고, 다시 펴면 접기 전 크기로 돌아옵니다.
            </li>
            <li>아이콘으로 줄어들 줄 모르는 내용(평범한 목록 등)을 넣으면 그 폭에 눌려 잘립니다.</li>
          </ul>
        </SideBySide>
        <IconRailDemo />

        <TxAlert variant="info" title="스위치를 앱이 그리려면">
          <code>collapse</code> 없이 <code>collapsed</code>만 주면 경계선에 스위치가 생기지 않고, 접힘은 앱의 상태를 따릅니다. 헤더의 버튼처럼 다른 자리에서 패널을 여닫을 때 씁니다. 좁은 화면에서 서랍으로 들어간 <code>left</code>에는 손잡이도
          스위치도 없습니다.
        </TxAlert>
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
          <strong>왼쪽 메뉴를 접는 길은 세 가지입니다.</strong> 한 화면에서는 하나만 쓰세요.
        </p>
        <ul className="flex list-disc flex-col gap-1 ps-5 text-slate-600 dark:text-slate-300">
          <li>
            셸의 <code>collapse</code> — 경계선 스위치로 패널을 완전히 감춥니다.
          </li>
          <li>
            셸의 <code>collapse</code> + <code>collapsedSize</code> — 같은 스위치로 아이콘 줄만 남깁니다(위 「접어도 아이콘 줄은 남기기」).
          </li>
          <li>
            <code>TxSideNav</code>의 <code>collapsed</code> — 헤더의 ☰처럼 앱이 그린 버튼으로 아이콘 줄만 남깁니다. 이때는 아래처럼 패널 폭을 내용에 맞춥니다.
          </li>
        </ul>

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
