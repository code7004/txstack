import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type CSSProperties, type ReactNode } from "react";
import { TxButton } from "../TxButton";
import { TxDropdown } from "../TxDropdown";
import { TxFlex } from "../TxFlex";
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
          "눌러서 아래로 펼쳐지는 메뉴. **오른쪽 버튼으로 여는 `TxContextMenu` 와 속이 같다** —",
          "항목 · 키보드 · 닫힘 규약이 같고, 받는 모양만 다르다(`Overlay/TxContextMenu`).",
          "",
          "```tsx",
          'import { TxDropMenu } from "@txstack/ui";',
          'import "@txstack/ui/styles.css"; // 앱에서 한 번',
          "",
          '<TxDropMenu label={`👤 ${username}`} menuLabel="계정 메뉴">',
          "  <TxDropMenu.Item onClick={changePassword}>비밀번호 변경</TxDropMenu.Item>",
          "  <TxDropMenu.Divider />",
          '  <TxDropMenu.Item as={NavLink} to="/settings">설정</TxDropMenu.Item>',
          "</TxDropMenu>;",
          "```",
          "",
          "**`label` 은 누르는 것, `children` 은 펼쳐질 항목이다.** `TxNavBar.Item` 의 `label` 과 같은 자리이고,",
          "하위가 children 에 오는 것은 `TxSideNav.Item` · `TxNavBar.Item` 과 같다.",
          "",
          "### 라우터를 알지 못한다",
          "",
          '줄은 기본이 `<button>` 이고 링크는 `as` 로 갈아끼운다 — `as={NavLink}` · `as={Link}` · `as="a"`.',
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
  args: { label: "메뉴", children: null },
  argTypes: {
    label: { control: false },
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
    <TxDropMenu {...args} label="👤 사용자">
      {BASIC_MENU}
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
      <TxDropMenu menuLabel="사용자 메뉴" label="👤 kim">
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
      </TxDropMenu>
    );
  }
};

/**
 * 오른쪽에 붙은 트리거는 메뉴도 오른쪽 끝을 맞춘다 — `align="end"`. 헤더 오른쪽 끝의 계정 버튼이 그 자리다.
 * 화면 밖으로 나가면 어느 쪽이든 안으로 당긴다.
 */
export const AlignEnd: Story = {
  name: "오른쪽 끝에 맞추기",
  parameters: noControls,
  render: () => (
    <div className="flex w-[36rem] justify-between rounded border border-dashed p-2">
      <TxDropMenu label="왼쪽 (기본 start)">{BASIC_MENU}</TxDropMenu>
      <TxDropMenu label="👤 계정" align="end">
        {BASIC_MENU}
      </TxDropMenu>
    </div>
  )
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
      {/* label 은 트리거 버튼 **안에** 들어가는 내용이다. 버튼을 또 넣지 않는다 */}
      <TxDropMenu menuLabel="키보드 예제" label="메뉴 열기">
        {BASIC_MENU}
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
        <TxDropMenu key={label} trigger="hover" menuLabel={label} label={<span className="px-2 py-1">{label}</span>}>
          <TxDropMenu.Item onClick={() => {}}>{label} 하나</TxDropMenu.Item>
          <TxDropMenu.Item onClick={() => {}}>{label} 둘</TxDropMenu.Item>
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
    <TxDropMenu menuLabel="바로가기" label="바로가기">
      <TxDropMenu.Item as={DemoLink} to="/dashboard">
        대시보드
      </TxDropMenu.Item>
      <TxDropMenu.Item as={DemoLink} to="/settings">
        설정
      </TxDropMenu.Item>
      <TxDropMenu.Divider />
      <TxDropMenu.Item onClick={() => {}}>로그아웃 (버튼)</TxDropMenu.Item>
    </TxDropMenu>
  )
};

/** 줄이 많으면 메뉴 안에서 스크롤된다. `maxHeight` 로 바꾼다. */
export const Scrollable: Story = {
  parameters: noControls,
  render: () => (
    <TxDropMenu maxHeight="12rem" menuLabel="긴 목록" label="긴 목록 (maxHeight 12rem)">
      {Array.from({ length: 20 }, (_, index) => (
        <TxDropMenu.Item key={index} onClick={() => {}}>
          항목 {index + 1}
        </TxDropMenu.Item>
      ))}
    </TxDropMenu>
  )
};

/** 겉모습은 CSS 변수로 바꾼다. **`TxContextMenu` 도 같은 토큰을 쓴다** — 속(`TxMenuShell`)이 하나다. */
export const Tokens: Story = {
  parameters: noControls,
  render: () => (
    <TxFlex>
      <TxDropMenu label="기본">{BASIC_MENU}</TxDropMenu>
      <TxDropMenu style={vars({ "--tx-menu-min-width": "16rem", "--tx-menu-item-padding": "0.75rem 1rem", "--tx-menu-item-font-size": "1rem" })} label="넓고 큰 메뉴">
        {BASIC_MENU}
      </TxDropMenu>
    </TxFlex>
  )
};
