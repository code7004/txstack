import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type ReactNode } from "react";
import { TxContextMenu } from "./TxContextMenu";

/** 라우터를 안 쓰는 스토리라 평범한 `<a>` 로 대신한다. 실제로는 `NavLink` 를 넘긴다. */
const DemoLink = ({ to, children, ...props }: { to: string; children?: ReactNode }) => (
  <a href={to} onClick={(event) => event.preventDefault()} {...props}>
    {children}
  </a>
);

const meta = {
  title: "Overlay/TxContextMenu",
  component: TxContextMenu,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "오른쪽 버튼을 누른 **그 자리에** 뜨는 메뉴. 표 · 그리드 · 카드처럼 이미 있는 것을 감싼다.",
          "",
          "```tsx",
          'import { TxContextMenu } from "@txstack/ui";',
          'import "@txstack/ui/styles.css"; // 앱에서 한 번',
          "",
          "<TxContextMenu",
          '  menuLabel="행 메뉴"',
          "  menu={",
          "    <>",
          "      <TxContextMenu.Item onClick={copy}>복사</TxContextMenu.Item>",
          "      <TxContextMenu.Divider />",
          '      <TxContextMenu.Item as={NavLink} to="/detail">상세로 이동</TxContextMenu.Item>',
          "    </>",
          "  }",
          ">",
          "  <TxAgGrid … />",
          "</TxContextMenu>;",
          "```",
          "",
          "**`children` 은 감싸는 대상, `menu` 는 떠오르는 것이다.** 이미 있는 것을 감싸는 부품이라",
          "`TxTooltip`(`tip`)과 같은 모양이다. 스스로 버튼을 만드는 `TxDropMenu` 는 반대로 children 이",
          "항목이고 누르는 것이 `label` 이다 — 기준은 하나, **children 은 그 부품이 품는 것**이다.",
          "",
          "### `TxDropMenu` 와 같은 것",
          "",
          "속(`TxMenuShell`)이 하나다. 항목은 `TxContextMenu.Item` · `TxContextMenu.Divider` 이고",
          "**`TxDropMenu.Item` 과 같은 부품**이다 — 링크는 `as` 로 갈아끼우고, 눌러도 안 닫혀야 하면 `keepOpen`.",
          "키보드(↑↓ · Home · End · Escape) · 겉모습 토큰(`--tx-menu-*`)도 같다 — `Overlay/TxDropMenu` 의 `Tokens`.",
          "",
          "### 다른 것",
          "",
          '- **여는 방법** — 오른쪽 버튼. `button` 으로 왼쪽(`"left"`) · 둘 다(`"both"`)를 고른다',
          "- **뜨는 자리** — 누른 마우스 좌표. 화면 끝이면 안쪽으로 뒤집힌다",
          "- **브라우저 기본 메뉴를 막는다** — 안 막으면 그 위에 겹쳐 뜬다",
          "",
          "컨트롤 패널은 `Playground` 에서만 동작한다."
        ].join("\n")
      }
    }
  },
  args: { menu: null, children: null, button: "right", menuLabel: "행 메뉴" },
  argTypes: {
    children: { control: false, description: "오른쪽 버튼을 누를 대상" },
    menu: { control: false, description: "떠오르는 메뉴 — `TxContextMenu.Item` · `TxContextMenu.Divider` 들" },
    button: { control: "inline-radio", options: ["right", "left", "both"] },
    maxHeight: { control: "text" },
    menuLabel: { control: "text", description: "스크린리더가 읽을 메뉴의 이름" },
    onOpenChange: { control: false },
    classNames: { control: false },
    className: { control: "text", description: "감싸는 겉(`.tx-context-menu`)에 덧붙는다 (교체 아님)" }
  }
} satisfies Meta<typeof TxContextMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

const noControls = { controls: { disable: true } };

const ROWS = ["8213 · FAILED", "8214 · DONE", "8215 · PENDING"];

/** `button` 을 바꿔 가며 아래 영역을 눌러 보라. */
export const Playground: Story = {
  render: function PlaygroundStory(args) {
    const [last, setLast] = useState("—");

    return (
      <div className="flex flex-col gap-3">
        <TxContextMenu
          {...args}
          menu={
            <>
              <TxContextMenu.Item onClick={() => setLast("복사")}>복사</TxContextMenu.Item>
              <TxContextMenu.Divider />
              <TxContextMenu.Item onClick={() => setLast("삭제")}>삭제</TxContextMenu.Item>
            </>
          }
        >
          <div className="max-w-sm rounded border border-dashed p-6 text-center text-sm">여기를 눌러 보라 (button: {args.button})</div>
        </TxContextMenu>
        <div className="font-mono text-sm text-slate-500 dark:text-slate-400">고른 것: {last}</div>
      </div>
    );
  }
};

/**
 * **표 위에서 오른쪽 버튼을 누르면 그 자리에 뜬다.** 브라우저 기본 메뉴는 뜨지 않는다.
 *
 * 대상이 크다 — 표나 그리드가 통째로 children 에 들어간다. 그래서 메뉴는 `menu` 로 따로 준다.
 */
export const OnTable: Story = {
  parameters: noControls,
  render: function OnTableStory() {
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
              {ROWS.map((row) => (
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
export const BothButtons: Story = {
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
