import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties } from "react";
import { TxBadge } from "../TxBadge";
import { TxFlex } from "../TxFlex";
import { TxAvatar } from "./TxAvatar";
import { TxAvatarGroup } from "./TxAvatarGroup";

/** CSS 변수를 인라인 스타일로 주려면 타입을 넓혀야 한다. 스토리에서만 쓴다. */
const vars = (v: Record<`--${string}`, string>) => v as CSSProperties;

/**
 * 사진이 있는 자리를 보여 줄 그림. **바깥에서 받아오지 않는다** —
 * 카탈로그는 네트워크 없이도 같은 모습이어야 한다.
 */
const PHOTO = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" fill="#7dd3fc"/><circle cx="40" cy="31" r="14" fill="#0369a1"/><path d="M8 80c0-18 14-28 32-28s32 10 32 28z" fill="#0369a1"/></svg>'
)}`;

const meta = {
  title: "Data/TxAvatar",
  component: TxAvatar,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "사람 한 명을 나타내는 동그란 칸.",
          "",
          "```tsx",
          'import { TxAvatar, TxAvatarGroup } from "@txstack/ui";',
          'import "@txstack/ui/styles.css"; // 앱에서 한 번',
          "",
          "<TxAvatar src={user.photo} name=\"김재훈\" />   // 사진",
          '<TxAvatar name="김재훈" />                    // 이니셜 — "재훈"',
          "<TxAvatar />                                  // 사람 아이콘",
          "```",
          "",
          "### 사진 → 이니셜 → 아이콘 순으로 떨어진다",
          "",
          "사진 주소를 줬는데 **못 불러와도 빈칸이 남지 않는다.** 이니셜로 떨어지고,",
          "이름조차 없으면 사람 모양을 그린다. 주소가 바뀌면 다시 시도한다 —",
          "목록에서 자리를 돌려 써도 남의 실패를 물려받지 않는다.",
          "",
          "### 이니셜은 이름에서 만든다",
          "",
          "**띄어 쓴 이름은 덩어리마다 첫 글자**(`\"Jaehoon Kim\"` → `\"JK\"`),",
          "**붙여 쓴 한글 이름은 뒤 두 글자**(`\"김재훈\"` → `\"재훈\"`)다.",
          "마음에 안 들면 `initials` 로 직접 준다.",
          "",
          "### `name` 하나가 이름이다",
          "",
          "`alt` 를 따로 받지 않는다. **사진이 떨어져도 읽히는 것이 바뀌지 않아야** 하고,",
          "안쪽(사진 · 이니셜 · 아이콘)은 읽히지 않으므로 **같은 사람이 두 번 불리지 않는다.**",
          "`name` 을 안 주면 장식으로 보아 스크린리더가 지나간다.",
          "",
          "### 크기는 토큰 하나에서 나온다",
          "",
          "`size` 셋(`sm` · `md` · `lg`) 말고 다른 크기가 필요하면 토큰을 준다 —",
          "`<TxAvatar style={{ \"--tx-avatar-size\": \"5rem\" }} />`. 글자 크기도 겹침도",
          "그 값에 비례하므로 하나만 바꾸면 속까지 따라온다.",
          "",
          "### 접속 중 표시는 `TxBadge` 로 얹는다",
          "",
          "점을 찍는 일은 **`TxBadge`** 가 이미 한다 — `dot` 과 `placement` 를 그대로 쓴다.",
          "아바타가 같은 것을 또 가지면 소비자가 무엇을 골라야 하는지 모른다.",
          "",
          "컨트롤 패널은 `Playground` 에서만 동작한다."
        ].join("\n")
      }
    }
  },
  args: { name: "김재훈", size: "md", shape: "circle" },
  argTypes: {
    name: { control: "text" },
    initials: { control: "text" },
    src: { control: "text" },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    shape: { control: "inline-radio", options: ["circle", "square"] },
    className: { control: "text", description: "`.tx-avatar` 에 덧붙는다 (교체 아님)" }
  }
} satisfies Meta<typeof TxAvatar>;

export default meta;
type Story = StoryObj<typeof meta>;

const noControls = { controls: { disable: true } };

export const Playground: Story = {};

/** **사진 → 이니셜 → 아이콘.** 가진 것 중 가장 앞의 것을 그린다. */
export const Fallback: Story = {
  parameters: noControls,
  render: () => (
    <TxFlex className="items-center gap-4">
      <TxAvatar src={PHOTO} name="김재훈" />
      <TxAvatar name="김재훈" />
      <TxAvatar />
      <TxAvatar icon={<span aria-hidden>🐙</span>} />
    </TxFlex>
  )
};

/** 없는 주소를 줬다. **빈칸이 남지 않고 이니셜로 떨어진다.** */
export const BrokenImage: Story = {
  parameters: noControls,
  render: () => (
    <TxFlex className="items-center gap-4">
      <TxAvatar src="/없는-사진.png" name="김재훈" />
      <TxAvatar src="/없는-사진.png" />
    </TxFlex>
  )
};

/** 띄어 쓴 이름은 덩어리마다 첫 글자, 붙여 쓴 한글 이름은 뒤 두 글자다. */
export const Initials: Story = {
  parameters: noControls,
  render: () => (
    <TxFlex className="items-center gap-4">
      <TxAvatar name="김재훈" />
      <TxAvatar name="남궁민수" />
      <TxAvatar name="Jaehoon Kim" />
      <TxAvatar name="Ada" />
      <TxAvatar name="김재훈" initials="JH" />
    </TxFlex>
  )
};

/** 셋 말고 다른 크기는 **토큰 하나**로 준다. 글자도 따라 커진다. */
export const Sizes: Story = {
  parameters: noControls,
  render: () => (
    <TxFlex className="items-center gap-4">
      <TxAvatar name="김재훈" size="sm" />
      <TxAvatar name="김재훈" size="md" />
      <TxAvatar name="김재훈" size="lg" />
      <TxAvatar name="김재훈" style={vars({ "--tx-avatar-size": "5rem" })} />
    </TxFlex>
  )
};

/** 네모난 칸. 모서리는 `--tx-radius` 를 따른다. */
export const Square: Story = {
  parameters: noControls,
  render: () => (
    <TxFlex className="items-center gap-4">
      <TxAvatar src={PHOTO} name="김재훈" shape="square" />
      <TxAvatar name="김재훈" shape="square" />
      <TxAvatar shape="square" />
    </TxFlex>
  )
};

/** `onClick` 을 주면 `<button>` 이 된다. 이름은 그대로 읽힌다. */
export const Clickable: Story = {
  parameters: noControls,
  render: () => (
    <TxFlex className="items-center gap-4">
      <TxAvatar src={PHOTO} name="김재훈" onClick={() => alert("프로필")} />
      <TxAvatar name="김재훈" onClick={() => alert("프로필")} />
    </TxFlex>
  )
};

/** **`max` 를 넘으면 뒤에 `+2` 한 칸이 붙는다.** 그 칸도 "외 2명" 으로 읽힌다. */
export const Group: StoryObj = {
  parameters: noControls,
  render: () => {
    const members = ["김재훈", "남궁민수", "Jaehoon Kim", "Ada Lovelace", "박서준", "최유리"];

    return (
      <div className="flex flex-col gap-4">
        <TxAvatarGroup>
          {members.slice(0, 3).map((name) => (
            <TxAvatar key={name} name={name} />
          ))}
        </TxAvatarGroup>

        <TxAvatarGroup max={3}>
          {members.map((name) => (
            <TxAvatar key={name} name={name} />
          ))}
        </TxAvatarGroup>

        <TxAvatarGroup max={4} size="lg" shape="square">
          {members.map((name) => (
            <TxAvatar key={name} size="lg" shape="square" name={name} />
          ))}
        </TxAvatarGroup>
      </div>
    );
  }
};

/** 겹치는 정도도 토큰이다. `0` 이면 나란히 서고, 크게 주면 더 파고든다. */
export const GroupOverlap: StoryObj = {
  parameters: noControls,
  render: () => (
    <div className="flex flex-col gap-4">
      {["0", "0.2", "0.35", "0.5"].map((overlap) => (
        <TxAvatarGroup key={overlap} style={vars({ "--tx-avatar-overlap": overlap })}>
          {["김재훈", "남궁민수", "박서준"].map((name) => (
            <TxAvatar key={name} name={name} />
          ))}
        </TxAvatarGroup>
      ))}
    </div>
  )
};

/** 접속 중 표시는 아바타가 아니라 **`TxBadge`** 가 얹는다. */
export const WithBadge: StoryObj = {
  parameters: noControls,
  render: () => (
    <TxFlex className="items-center gap-4">
      <TxBadge dot variant="success" label="접속 중" placement="bottom-right">
        <TxAvatar src={PHOTO} name="김재훈" />
      </TxBadge>

      <TxBadge count={3} label="읽지 않은 쪽지 3개">
        <TxAvatar name="남궁민수" />
      </TxBadge>
    </TxFlex>
  )
};
