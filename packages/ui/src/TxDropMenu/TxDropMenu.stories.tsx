import type { Meta, StoryObj } from "@storybook/react-vite";
import { MemoryRouter } from "react-router-dom";
import { TxDropMenu } from "./TxDropMenu";

// decorators 가 있으면 satisfies 로는 타입이 비이식적이 되어 TS2742 가 난다. 명시 주석을 쓴다.
const meta: Meta<typeof TxDropMenu> = {
  title: "Overlay/TxDropMenu",
  component: TxDropMenu,
  tags: ["autodocs"],
  decorators: [
    // LinkItem 이 NavLink 를 쓰므로 Router 컨텍스트가 필요하다.
    (Story) => (
      <MemoryRouter>
        <div className="pb-40">
          <Story />
        </div>
      </MemoryRouter>
    )
  ],
  parameters: {
    docs: {
      description: {
        component: [
          "라벨을 누르거나 올리면 펼쳐지는 메뉴. 헤더 GNB 에 쓴다.",
          "",
          "- `trigger` 가 `hover`(기본) 또는 `click`. 터치 기기에서는 `click` 이 낫다.",
          "- `direction` 이 `vertical`(아래로) 또는 `horizontal`(옆으로). 다단 메뉴에 쓴다.",
          "- 하위 컴포넌트: `TxDropMenu.Item` · `TxDropMenu.LinkItem` · `TxDropMenu.Divider`.",
          "- **`LinkItem` 은 `react-router-dom` 의 `NavLink` 를 쓴다.** Router 밖에서 렌더하면 죽는다."
        ].join("\n")
      }
    }
  },
  args: { label: "메뉴", children: null },
  argTypes: {
    label: { control: "text" },
    trigger: { control: "inline-radio", options: ["hover", "click"] },
    direction: { control: "inline-radio", options: ["vertical", "horizontal"] },
    theme: { control: false },
    children: { control: false }
  }
};

export default meta;
type Story = StoryObj<typeof TxDropMenu>;

/** 기본형(hover). 상단 컨트롤로 `trigger` 를 바꿔볼 수 있다. */
export const 기본: Story = {
  render: (args) => (
    <TxDropMenu {...args}>
      <TxDropMenu.Item>새로 만들기</TxDropMenu.Item>
      <TxDropMenu.Item>열기</TxDropMenu.Item>
      <TxDropMenu.Divider />
      <TxDropMenu.Item>설정</TxDropMenu.Item>
    </TxDropMenu>
  )
};

/** `trigger` 비교. 터치 기기에서는 hover 가 동작하지 않으므로 click 을 쓴다. */
export const Trigger: Story = {
  render: (args) => (
    <div className="flex gap-6">
      {(["hover", "click"] as const).map((t) => (
        <TxDropMenu key={t} {...args} label={t} trigger={t}>
          <TxDropMenu.Item>항목 1</TxDropMenu.Item>
          <TxDropMenu.Item>항목 2</TxDropMenu.Item>
        </TxDropMenu>
      ))}
    </div>
  )
};

/** `LinkItem` 은 라우터 링크다. Router 컨텍스트가 필요하다. */
export const 링크_항목: Story = {
  render: (args) => (
    <TxDropMenu {...args} label="이동">
      <TxDropMenu.LinkItem to="/">홈</TxDropMenu.LinkItem>
      <TxDropMenu.LinkItem to="/settings">설정</TxDropMenu.LinkItem>
      <TxDropMenu.Divider />
      <TxDropMenu.Item>일반 항목(링크 아님)</TxDropMenu.Item>
    </TxDropMenu>
  )
};

/** `theme` 으로 기본 클래스를 부분 교체한다. */
export const 테마_덮어쓰기: Story = {
  args: { theme: { item: "px-4 py-2 text-purple-600 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-950" } },
  render: (args) => (
    <TxDropMenu {...args}>
      <TxDropMenu.Item>보라 항목</TxDropMenu.Item>
      <TxDropMenu.Item>또 하나</TxDropMenu.Item>
    </TxDropMenu>
  )
};
