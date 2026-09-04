import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties, ReactNode } from "react";
import { TxBreadcrumb } from "./TxBreadcrumb";

/** CSS 변수를 인라인 스타일로 주려면 타입을 넓혀야 한다. 스토리에서만 쓴다. */
const vars = (v: Record<`--${string}`, string>) => v as CSSProperties;

/** 라우터를 안 쓰는 스토리라 평범한 `<a>` 로 대신한다. 실제로는 `NavLink` 를 넘긴다. */
const DemoLink = ({ to, children, ...props }: { to: string; children?: ReactNode }) => (
  <a href={to} onClick={(event) => event.preventDefault()} {...props}>
    {children}
  </a>
);

const meta = {
  title: "Layout/TxBreadcrumb",
  component: TxBreadcrumb,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "여기까지 온 길.",
          "",
          "```tsx",
          'import { TxBreadcrumb } from "@txstack/ui";',
          'import "@txstack/ui/styles.css"; // 앱에서 한 번',
          "",
          "<TxBreadcrumb>",
          '  <TxBreadcrumb.Item as={NavLink} to="/">홈</TxBreadcrumb.Item>',
          '  <TxBreadcrumb.Item as={NavLink} to="/orders">주문</TxBreadcrumb.Item>',
          "  <TxBreadcrumb.Item>8213</TxBreadcrumb.Item>",
          "</TxBreadcrumb>;",
          "```",
          "",
          "### 마지막 칸은 링크가 아니다",
          "",
          "**`as` 로 링크를 줘도 마지막이면 글자로 그린다.** 지금 있는 자리를 다시 누르게 두면",
          '어디로 가는지 알 수 없다. 대신 `aria-current="page"` 가 붙어 **스크린리더가',
          '"지금 여기" 를 안다.**',
          "",
          "### 가르는 `/` 는 CSS 가 그린다",
          "",
          '글자로 넣으면 스크린리더가 칸마다 "슬래시" 를 읽어 **정작 경로가 안 읽힌다.**',
          "다른 것으로 바꾸려면 `separator` 를, 글자만 바꾸려면 `--tx-breadcrumb-separator` 를 준다.",
          "",
          "### `<nav>` 안의 `<ol>` 이다",
          "",
          '순서가 뜻을 갖는 목록이라 `<ul>` 이 아니다. 스크린리더가 **"경로, 목록, 3개 항목"**',
          "으로 읽는다.",
          "",
          "라우터는 `as` 로 갈아끼운다 — `TxDropMenu.Item` 과 같은 규약이라 **패키지가 라우터를",
          "알지 못한다.**",
          "",
          "컨트롤 패널은 `Playground` 에서만 동작한다."
        ].join("\n")
      }
    }
  },
  args: { label: "경로" },
  argTypes: {
    maxItems: { control: { type: "number", min: 2 } },
    itemsAfterCollapse: { control: { type: "number", min: 1 } },
    separator: { control: "text" },
    label: { control: "text", description: "스크린리더가 읽을 이름" },
    children: { control: false },
    classNames: { control: false },
    className: { control: "text", description: "`.tx-breadcrumb` 에 덧붙는다 (교체 아님)" }
  }
} satisfies Meta<typeof TxBreadcrumb>;

export default meta;
type Story = StoryObj<typeof meta>;

const noControls = { controls: { disable: true } };

const PATH = (
  <>
    <TxBreadcrumb.Item as={DemoLink} to="/">
      홈
    </TxBreadcrumb.Item>
    <TxBreadcrumb.Item as={DemoLink} to="/orders">
      주문
    </TxBreadcrumb.Item>
    <TxBreadcrumb.Item as={DemoLink} to="/orders/2026">
      2026
    </TxBreadcrumb.Item>
    <TxBreadcrumb.Item>8213</TxBreadcrumb.Item>
  </>
);

export const Playground: Story = {
  render: (args) => <TxBreadcrumb {...args}>{PATH}</TxBreadcrumb>
};

/** **마지막 칸만 링크가 아니다.** 앞의 것들은 밑줄이 뜨고 마지막은 안 뜬다. */
export const Basic: Story = {
  parameters: noControls,
  render: () => <TxBreadcrumb>{PATH}</TxBreadcrumb>
};

/**
 * 길어지면 가운데를 접는다. **어디서 왔고 지금 어디인지**가 경로의 요점이라
 * 첫 칸과 끝 몇 개는 남긴다.
 */
export const Collapsed: Story = {
  parameters: noControls,
  render: () => (
    <div className="flex flex-col gap-3">
      <TxBreadcrumb maxItems={4}>
        <TxBreadcrumb.Item as={DemoLink} to="/">
          홈
        </TxBreadcrumb.Item>
        <TxBreadcrumb.Item as={DemoLink} to="/a">
          파트너
        </TxBreadcrumb.Item>
        <TxBreadcrumb.Item as={DemoLink} to="/b">
          정산
        </TxBreadcrumb.Item>
        <TxBreadcrumb.Item as={DemoLink} to="/c">
          2026
        </TxBreadcrumb.Item>
        <TxBreadcrumb.Item as={DemoLink} to="/d">
          8월
        </TxBreadcrumb.Item>
        <TxBreadcrumb.Item>8213</TxBreadcrumb.Item>
      </TxBreadcrumb>

      <p className="text-xs text-slate-500 dark:text-slate-400">위: 넷을 넘으면 접는다 · 아래: 끝에서 하나만 남긴다</p>

      <TxBreadcrumb maxItems={3} itemsAfterCollapse={1}>
        <TxBreadcrumb.Item as={DemoLink} to="/">
          홈
        </TxBreadcrumb.Item>
        <TxBreadcrumb.Item as={DemoLink} to="/a">
          파트너
        </TxBreadcrumb.Item>
        <TxBreadcrumb.Item as={DemoLink} to="/b">
          정산
        </TxBreadcrumb.Item>
        <TxBreadcrumb.Item>8213</TxBreadcrumb.Item>
      </TxBreadcrumb>
    </div>
  )
};

/** 가르는 표시를 바꾼다. **글자든 요소든 스크린리더에는 읽히지 않는다.** */
export const Separator: Story = {
  parameters: noControls,
  render: () => (
    <div className="flex flex-col gap-3">
      <TxBreadcrumb>{PATH}</TxBreadcrumb>
      <TxBreadcrumb separator="›">{PATH}</TxBreadcrumb>
      <TxBreadcrumb style={vars({ "--tx-breadcrumb-separator": "'·'" })}>{PATH}</TxBreadcrumb>
    </div>
  )
};

/** 칸이 길면 끝을 자른다. 줄을 밀지 않는다. */
export const LongLabel: Story = {
  parameters: noControls,
  render: () => (
    <div style={{ maxInlineSize: "22rem" }}>
      <TxBreadcrumb>
        <TxBreadcrumb.Item as={DemoLink} to="/">
          홈
        </TxBreadcrumb.Item>
        <TxBreadcrumb.Item as={DemoLink} to="/a">
          아주 긴 이름을 가진 중간 단계입니다
        </TxBreadcrumb.Item>
        <TxBreadcrumb.Item>8213</TxBreadcrumb.Item>
      </TxBreadcrumb>
    </div>
  )
};

/** 겉모습은 CSS 변수로 바꾼다. */
export const Tokens: Story = {
  parameters: noControls,
  render: () => (
    <div className="flex flex-col gap-3">
      <TxBreadcrumb>{PATH}</TxBreadcrumb>
      <TxBreadcrumb style={vars({ "--tx-breadcrumb-font-size": "1rem", "--tx-breadcrumb-gap": "0.75rem" })}>{PATH}</TxBreadcrumb>
    </div>
  )
};
