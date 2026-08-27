import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties } from "react";
import { TxButton } from "../TxButton";
import { TxFlex } from "../TxFlex";
import { TxInput } from "../TxInput";
import { TxCapsLockCheck } from "./TxCapsLockCheck";

/** CSS 변수를 인라인 스타일로 주려면 타입을 넓혀야 한다. 스토리에서만 쓴다. */
const vars = (v: Record<`--${string}`, string>) => v as CSSProperties;

const meta = {
  title: "Form/TxCapsLockCheck",
  component: TxCapsLockCheck,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "비밀번호를 칠 때 Caps Lock 이 켜져 있으면 알려 준다.",
          "",
          "```tsx",
          'import { TxCapsLockCheck, TxInput } from "@txstack/ui";',
          'import "@txstack/ui/styles.css"; // 앱에서 한 번',
          "",
          "<TxCapsLockCheck>",
          '  <TxInput type="password" placeholder="비밀번호" />',
          "</TxCapsLockCheck>;",
          "```",
          "",
          "**감싼 입력창 안에서 키를 누를 때만 반응한다.** 화면 다른 곳에서 타이핑하다 Caps Lock 을 켜도",
          "손대지 않은 칸에 경고가 뜨지 않는다. 포커스가 빠지거나 다른 창으로 넘어가면 경고를 내린다.",
          "",
          "경고가 뜨면 입력창과 이어 준다(`aria-describedby`) — 스크린리더가 그 칸에서 바로 안내한다.",
          "",
          "**한 가지 한계.** 브라우저는 키를 누를 때만 Caps Lock 상태를 알려 준다.",
          "그래서 마우스로 칸을 눌러 들어온 직후에는 알 수 없고, 첫 글자를 칠 때 알게 된다.",
          "",
          "아래 스토리는 **직접 Caps Lock 을 켜고 입력창에 타이핑해야** 동작한다."
        ].join("\n")
      }
    }
  },
  /** `children` 이 필수라 여기서 기본을 준다. `render` 를 쓰는 스토리는 이 값을 쓰지 않는다. */
  args: { children: <TxInput type="password" placeholder="Caps Lock 을 켜고 타이핑해 보세요" /> },
  argTypes: {
    text: { control: "text" },
    preserveSpace: { control: "boolean", description: "경고가 없을 때도 한 줄 높이를 잡아 둔다" },
    className: { control: "text", description: "`.tx-capslock` 에 덧붙는다 (교체 아님)" },
    children: { control: false },
    icon: { control: false }
  }
} satisfies Meta<typeof TxCapsLockCheck>;

export default meta;
type Story = StoryObj<typeof meta>;

const noControls = { controls: { disable: true } };

export const Playground: Story = {
  args: { text: "Caps Lock 이 켜져 있습니다.", preserveSpace: true, className: "w-80" }
};

/**
 * **다른 칸에서 친 키에는 반응하지 않는다.**
 *
 * 위 칸에서 Caps Lock 을 켜고 타이핑해도 아래 비밀번호 칸에는 경고가 뜨지 않는다.
 * 아래 칸에 커서를 놓고 쳐야 뜬다.
 */
export const OnlyWatchesItsOwnField: Story = {
  parameters: noControls,
  render: () => (
    <TxFlex className="w-80 flex-col items-stretch gap-3">
      <TxInput placeholder="여기서 쳐도 아래는 조용하다" />
      <TxCapsLockCheck>
        <TxInput type="password" placeholder="여기서 쳐야 경고가 뜬다" />
      </TxCapsLockCheck>
    </TxFlex>
  )
};

/**
 * **`preserveSpace` 는 경고가 없을 때도 한 줄 높이를 잡아 둔다.**
 *
 * 왼쪽은 경고가 떠도 아래 버튼이 그대로 있고, 오른쪽은 버튼이 밀린다.
 * 두 칸에 각각 Caps Lock 을 켜고 타이핑해 보라.
 */
export const PreserveSpace: Story = {
  parameters: noControls,
  render: () => (
    <TxFlex className="items-start gap-8">
      <TxFlex className="w-64 flex-col items-stretch">
        <TxCapsLockCheck>
          <TxInput type="password" placeholder="공간을 잡는다 (기본)" />
        </TxCapsLockCheck>
        <TxButton label="로그인" />
      </TxFlex>

      <TxFlex className="w-64 flex-col items-stretch">
        <TxCapsLockCheck preserveSpace={false}>
          <TxInput type="password" placeholder="공간을 안 잡는다" />
        </TxCapsLockCheck>
        <TxButton label="로그인" />
      </TxFlex>
    </TxFlex>
  )
};

/** 문구와 표시를 바꾼다. `icon={null}` 이면 표시가 빠진다. */
export const Message: Story = {
  parameters: noControls,
  render: () => (
    <TxFlex className="w-80 flex-col items-stretch gap-4">
      <TxCapsLockCheck>
        <TxInput type="password" placeholder="기본 문구" />
      </TxCapsLockCheck>

      <TxCapsLockCheck text="CAPS LOCK IS ON">
        <TxInput type="password" placeholder="text 로 바꾼 문구" />
      </TxCapsLockCheck>

      <TxCapsLockCheck icon="🔒" text="대문자로 입력되고 있습니다">
        <TxInput type="password" placeholder="표시를 바꾼 것" />
      </TxCapsLockCheck>

      <TxCapsLockCheck icon={null}>
        <TxInput type="password" placeholder="표시 없이 글자만" />
      </TxCapsLockCheck>
    </TxFlex>
  )
};

/** 로그인 폼에 놓았을 때. 경고가 떠도 버튼 자리가 흔들리지 않는다. */
export const InLoginForm: Story = {
  parameters: noControls,
  render: () => (
    <form className="w-80" onSubmit={(e) => e.preventDefault()}>
      <TxFlex className="flex-col items-stretch gap-3">
        <TxInput name="id" placeholder="아이디" autoComplete="username" />
        <TxCapsLockCheck>
          <TxInput name="password" type="password" placeholder="비밀번호" autoComplete="current-password" />
        </TxCapsLockCheck>
        <TxButton type="submit" label="로그인" />
      </TxFlex>
    </form>
  )
};

/** 색과 글자 크기를 토큰으로 바꾼다. 빈 줄 높이는 글자 크기에서 계산되므로 함께 맞는다. */
export const CustomizingTokens: Story = {
  parameters: noControls,
  render: () => (
    <TxFlex className="w-80 flex-col items-stretch gap-4">
      <TxCapsLockCheck>
        <TxInput type="password" placeholder="기본" />
      </TxCapsLockCheck>

      <TxCapsLockCheck style={vars({ "--tx-capslock-color": "var(--tx-color-primary)" })}>
        <TxInput type="password" placeholder="--tx-capslock-color: 강조색" />
      </TxCapsLockCheck>

      <TxCapsLockCheck style={vars({ "--tx-capslock-font-size": "1rem" })}>
        <TxInput type="password" placeholder="--tx-capslock-font-size: 1rem" />
      </TxCapsLockCheck>
    </TxFlex>
  )
};
