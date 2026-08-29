import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type CSSProperties, type ReactNode } from "react";
import { TxButton } from "../TxButton";
import { TxDropdown } from "../TxDropdown";
import { TxFlex } from "../TxFlex";
import { TxContextMenu } from "./TxContextMenu";
import { TxDropMenu } from "./TxDropMenu";

/** CSS 변수를 인라인 스타일로 주려면 타입을 넓혀야 한다. 스토리에서만 쓴다. */
const vars = (v: Record<`--${string}`, string>) => v as CSSProperties;

/** 라우터를 안 쓰는 스토리라 평범한 `<a>` 로 대신한다. 실제로는 `NavLink` 를 넘긴다. */
const DemoLink = ({ to, children, ...props }: { to: string; children?: ReactNode }) => (
  <a href={to} onClick={(event) => event.preventDefault()} {...props}>
    {children}
  </a>
);

const meta = {
  title: "Overlay/TxDropMenu",
  component: TxDropMenu,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "눌러서 아래로 펼쳐지는 메뉴. **오른쪽 버튼으로 여는 `TxContextMenu` 와 속이 같다.**",
          "",
          "```tsx",
          'import { TxDropMenu } from "@txstack/ui";',
          'import "@txstack/ui/styles.css"; // 앱에서 한 번',
          "",
          "<TxDropMenu",
          "  menu={",
          "    <>",
          "      <TxDropMenu.Item onClick={changePassword}>비밀번호 변경</TxDropMenu.Item>",
          "      <TxDropMenu.Divider />",
          '      <TxDropMenu.Item as={NavLink} to="/settings">설정</TxDropMenu.Item>',
          "    </>",
          "  }",
          ">",
          "  👤 {username}",
          "</TxDropMenu>;",
          "```",
          "",
          "**`children` 은 손대는 대상, `menu` 는 떠오르는 것이다** — `TxTooltip` 의 `tip` 과 같은 규칙이라",
          "셋을 같은 모양으로 쓴다.",
          "",
          "### 라우터를 알지 못한다",
          "",
          "줄은 기본이 `<button>` 이고 링크는 `as` 로 갈아끼운다 — `as={NavLink}` · `as={Link}` · `as=\"a\"`.",
          "그래서 이 패키지의 peer 에 라우터가 없고, **Next.js 든 TanStack Router 든 그대로 쓴다.**",
          "",
          "### 키보드",
          "",
          "- ↓ 로도 열린다. **열면 첫 줄로 포커스가 들어간다**",
          "- ↑↓ 로 옮기고 양 끝에서 감긴다. Home · End 로 양 끝",
          "- **Escape 로 닫으면 포커스가 트리거로 돌아온다**",
          "- 메뉴에서 Tab 은 빠져나가는 것이 아니라 **닫는 것**이다 (메뉴 규약)",
          "- 줄마다 탭 정거장을 만들지 않는다 — 열 줄이어도 Tab 은 한 번이다",
          "",
          "뜨는 층은 `TxPopup` 이 그린다 — 포털 · 자리 뒤집기 · 바깥 클릭 · Escape · `--tx-popup-z`.",
          "`TxTooltip` · `TxDropdown` 과 같은 바탕이라 그 성질이 똑같이 온다.",
          "",
          "컨트롤 패널은 `Playground` 에서만 동작한다."
        ].join("\n")
      }
    }
  },
  args: { menu: null, children: "메뉴" },
  argTypes: {
    menu: { control: false },
    children: { control: false },
    trigger: { control: "inline-radio", options: ["click", "hover"] },
    maxHeight: { control: "text" },
    menuLabel: { control: "text", description: "스크린리더가 읽을 메뉴의 이름" },
    onOpenChange: { control: false },
    classNames: { control: false },
    className: { control: "text", description: "`.tx-drop-menu` 에 덧붙는다 (교체 아님)" }
  }
} satisfies Meta<typeof TxDropMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

const noControls = { controls: { disable: true } };

const BASIC_MENU = (
  <>
    <TxDropMenu.Item onClick={() => {}}>프로필</TxDropMenu.Item>
    <TxDropMenu.Item onClick={() => {}}>비밀번호 변경</TxDropMenu.Item>
    <TxDropMenu.Divider />
    <TxDropMenu.Item onClick={() => {}}>로그아웃</TxDropMenu.Item>
  </>
);

export const Playground: Story = {
  args: { trigger: "click", menuLabel: "사용자 메뉴" },
  render: (args) => (
    <TxDropMenu {...args} menu={BASIC_MENU}>
      👤 사용자
    </TxDropMenu>
  )
};

/**
 * **앱의 Topbar 가 쓰는 모양.** 메뉴 안에 항목만 오는 것이 아니라
 * 임의의 컴포넌트도 들어간다 — 여기서는 테마를 고르는 드롭다운이다.
 * **메뉴 위에 겹쳐 뜬 목록에서 값을 골라도 메뉴는 열린 채로 있고**,
 * Escape 는 위에서부터 하나씩 걷는다.
 *
 * 눌러도 닫히지 않아야 하는 줄에는 `keepOpen` 을 준다.
 */
export const UserMenu: Story = {
  parameters: noControls,
  render: function UserMenuStory() {
    const [theme, setTheme] = useState("Quartz");
    const [star, setStar] = useState(false);

    return (
      <TxDropMenu
        menuLabel="사용자 메뉴"
        menu={
          <>
            {/* 항목이 아니라 컨트롤이 든 묶음이다. 화살표는 드롭다운 자체에 닿는다 */}
            <div role="group" className="tx-menu__item">
              <TxDropdown data={["Quartz", "Balham", "Material"]} value={theme} onChangeText={(next) => setTheme(next ?? "Quartz")} />
            </div>
            <TxDropMenu.Item keepOpen onClick={() => setStar((on) => !on)}>
              {star ? "★" : "☆"} 즐겨찾기 (keepOpen — 눌러도 안 닫힌다)
            </TxDropMenu.Item>
            <TxDropMenu.Divider />
            <TxDropMenu.Item onClick={() => {}}>비밀번호 변경</TxDropMenu.Item>
            <TxDropMenu.Item as={DemoLink} to="/settings">
              설정
            </TxDropMenu.Item>
            <TxDropMenu.Divider />
            <TxDropMenu.Item onClick={() => {}}>로그아웃</TxDropMenu.Item>
          </>
        }
      >
        👤 kim
      </TxDropMenu>
    );
  }
};

/**
 * **키보드로 다뤄 보라.** Tab 으로 트리거에 와서 ↓ 를 누르면 열리며 첫 줄로 들어간다.
 * ↑↓ 로 옮기고 Escape 로 닫으면 **포커스가 트리거로 돌아온다.**
 *
 * 앞뒤 버튼으로 지나쳐 보면 **메뉴가 탭 순서를 어지럽히지 않는 것**을 볼 수 있다.
 */
export const Keyboard: Story = {
  parameters: noControls,
  render: () => (
    <TxFlex>
      <TxButton label="앞의 버튼" variant="secondary" />
      <TxDropMenu menu={BASIC_MENU} menuLabel="키보드 예제">
        <TxButton label="메뉴 열기" />
      </TxDropMenu>
      <TxButton label="뒤의 버튼" variant="secondary" />
    </TxFlex>
  )
};

/** `trigger="hover"` 는 GNB 처럼 훑어 보는 자리에 쓴다. **눌러서도 열린다** — 터치에는 hover 가 없다. */
export const Hover: Story = {
  parameters: noControls,
  render: () => (
    <TxFlex>
      {["파일", "편집", "보기"].map((label) => (
        <TxDropMenu
          key={label}
          trigger="hover"
          menuLabel={label}
          menu={
            <>
              <TxDropMenu.Item onClick={() => {}}>{label} 하나</TxDropMenu.Item>
              <TxDropMenu.Item onClick={() => {}}>{label} 둘</TxDropMenu.Item>
            </>
          }
        >
          <span className="px-2 py-1">{label}</span>
        </TxDropMenu>
      ))}
    </TxFlex>
  )
};

/**
 * 링크 줄은 `as` 로 만든다 — **패키지가 라우터를 알지 못한다.**
 *
 * ```tsx
 * <TxDropMenu.Item as={NavLink} to="/settings">설정</TxDropMenu.Item>
 * ```
 *
 * 원본은 `react-router-dom` 의 `NavLink` 를 직접 import 해서, 다른 라우터를 쓰는 소비자는
 * 이 컴포넌트를 아예 쓸 수 없었다.
 */
export const LinkItems: Story = {
  parameters: noControls,
  render: () => (
    <TxDropMenu
      menuLabel="바로가기"
      menu={
        <>
          <TxDropMenu.Item as={DemoLink} to="/dashboard">
            대시보드
          </TxDropMenu.Item>
          <TxDropMenu.Item as={DemoLink} to="/settings">
            설정
          </TxDropMenu.Item>
          <TxDropMenu.Divider />
          <TxDropMenu.Item onClick={() => {}}>로그아웃 (버튼)</TxDropMenu.Item>
        </>
      }
    >
      바로가기
    </TxDropMenu>
  )
};

/** 줄이 많으면 메뉴 안에서 스크롤된다. `maxHeight` 로 바꾼다. */
export const Scrollable: Story = {
  parameters: noControls,
  render: () => (
    <TxDropMenu
      maxHeight="12rem"
      menuLabel="긴 목록"
      menu={
        <>
          {Array.from({ length: 20 }, (_, index) => (
            <TxDropMenu.Item key={index} onClick={() => {}}>
              항목 {index + 1}
            </TxDropMenu.Item>
          ))}
        </>
      }
    >
      긴 목록 (maxHeight 12rem)
    </TxDropMenu>
  )
};

/** 겉모습은 CSS 변수로 바꾼다. **두 메뉴가 같은 토큰을 쓴다.** */
export const Tokens: Story = {
  parameters: noControls,
  render: () => (
    <TxFlex>
      <TxDropMenu menu={BASIC_MENU}>기본</TxDropMenu>
      <TxDropMenu menu={BASIC_MENU} style={vars({ "--tx-menu-min-width": "16rem", "--tx-menu-item-padding": "0.75rem 1rem", "--tx-menu-item-font-size": "1rem" })}>
        넓고 큰 메뉴
      </TxDropMenu>
    </TxFlex>
  )
};

/**
 * **오른쪽 버튼을 누르면 그 자리에 뜬다.** `TxDropMenu` 와 다른 것은 여는 방법과 뜨는 자리뿐이고,
 * 항목 · 키보드 · 포커스는 같은 속이 맡는다 — `TxContextMenu.Item` 은 `TxDropMenu.Item` 과 **같은 부품**이다.
 *
 * 아래 표 위에서 오른쪽 버튼을 눌러 보라. 브라우저 기본 메뉴는 뜨지 않는다.
 */
export const ContextMenu: Story = {
  parameters: noControls,
  render: function ContextMenuStory() {
    const [last, setLast] = useState("—");

    return (
      <div className="flex flex-col gap-3">
        <TxContextMenu
          menuLabel="행 메뉴"
          menu={
            <>
              <TxContextMenu.Item onClick={() => setLast("복사")}>복사</TxContextMenu.Item>
              <TxContextMenu.Item onClick={() => setLast("다시 보내기")}>다시 보내기</TxContextMenu.Item>
              <TxContextMenu.Divider />
              <TxContextMenu.Item as={DemoLink} to="/detail">
                상세로 이동
              </TxContextMenu.Item>
              <TxContextMenu.Item onClick={() => setLast("삭제")}>삭제</TxContextMenu.Item>
            </>
          }
        >
          <table className="w-full max-w-md border-collapse text-sm">
            <tbody>
              {["8213 · FAILED", "8214 · DONE", "8215 · PENDING"].map((row) => (
                <tr key={row} className="border-b">
                  <td className="px-3 py-2">{row}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TxContextMenu>

        <div className="font-mono text-sm text-slate-500 dark:text-slate-400">고른 것: {last}</div>
      </div>
    );
  }
};

/** `button="both"` 는 왼쪽 클릭으로도 연다 — 터치 화면을 함께 받을 때 쓴다. */
export const ContextMenuBothButtons: Story = {
  parameters: noControls,
  render: () => (
    <TxContextMenu
      button="both"
      menuLabel="아무 버튼"
      menu={
        <>
          <TxContextMenu.Item onClick={() => {}}>복사</TxContextMenu.Item>
          <TxContextMenu.Item onClick={() => {}}>삭제</TxContextMenu.Item>
        </>
      }
    >
      <div className="max-w-sm rounded border border-dashed p-6 text-center text-sm">왼쪽·오른쪽 아무 버튼이나 눌러 보라</div>
    </TxContextMenu>
  )
};
