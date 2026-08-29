import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type CSSProperties } from "react";
import { TxButton } from "../TxButton";
import { TxCard } from "../TxCard";
import { TxFlex } from "../TxFlex";
import { TxSkeleton } from "./TxSkeleton";

/** CSS 변수를 인라인 스타일로 주려면 타입을 넓혀야 한다. 스토리에서만 쓴다. */
const vars = (v: Record<`--${string}`, string>) => v as CSSProperties;

const meta = {
  title: "Feedback/TxSkeleton",
  component: TxSkeleton,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "내용이 올 자리를 미리 잡아 두는 회색 덩이.",
          "",
          "```tsx",
          'import { TxSkeleton } from "@txstack/ui";',
          'import "@txstack/ui/styles.css"; // 앱에서 한 번',
          "",
          "<TxSkeleton loading={loading} lines={3}>",
          "  <p>{user?.name}</p>",
          "  <p>{user?.email}</p>",
          "</TxSkeleton>;",
          "```",
          "",
          "### 분기까지 맡는다",
          "",
          "`loading` 이 `false` 가 되면 **`children` 을 그대로 낸다** — 껍데기를 남기지 않아서",
          "밖에서 삼항으로 가르던 것과 결과가 같다.",
          "",
          "다만 **JSX 는 삼항과 달리 먼저 평가된다.** 불러오는 동안에도 안전한 값이어야 한다 —",
          "`user.name` 이 아니라 `user?.name` 이다. 값을 좁혀 쓰던 코드라면 밖에서 삼항으로",
          "가르는 편이 낫다.",
          "",
          "### 모양도 자식에서 가져온다 — 이쪽이 기본이다",
          "",
          "**`lines` · `variant` · `width` · `height` 중 하나라도 주면 그 모양을 그리고,**",
          "**아무것도 안 주면 `children` 에서 가져온다.**",
          "",
          "```tsx",
          "// 줄 수도 크기도 안 적었다",
          "<TxSkeleton loading={loading}>",
          '  <div style={{ fontSize: "0.875rem", lineHeight: "1.25rem" }}>',
          "    <p>{user?.name}</p>",
          "    <p>{user?.email}</p>",
          "  </div>",
          "</TxSkeleton>",
          "```",
          "",
          "값이 안 왔으면 그 요소는 **비어 있고**, 붙박이 글이 든 요소는 비어 있지 않다 —",
          "그 둘을 갈라 **값이 올 자리만** 칠한다. 그래서 `이름:` 같은 붙박이 글은 그대로 보이고,",
          "크기는 **진짜 배치에서** 나온다. 자식을 훑거나 재지 않는 순수 CSS 라 값이 싸다.",
          "",
          "**걸리는 데가 셋 있다. 셋 다 회색 막대가 안 나올 뿐 배치는 멀쩡하다.**",
          "",
          '- `{user?.name ?? "—"}` 처럼 **대체값을 넣으면** 비어 있지 않아 안 칠해진다',
          "- `<p> {name} </p>` 처럼 **공백이 끼면** 비어 있지 않아 안 칠해진다",
          "- 한 요소당 **한 줄**이다. 여러 줄로 감길 글에는 `lines` 를 쓴다",
          "",
          "### 모양을 직접 줘야 하는 자리는 둘뿐이다",
          "",
          "**목록도 자식에서 가져온다** — 행 컴포넌트를 그대로 쓰고 값만 비워 넘기면 된다.",
          "그러면 스켈레톤이 실제와 어긋날 수가 없다. 직접 줘야 하는 것은 이 둘이다.",
          "",
          "1. **여러 줄로 감기는 글** — 빈 문단은 언제나 한 줄이라 세 줄 자리에 한 줄만 잡힌다",
          "2. **미러링할 마크업이 아예 없는 자리** — 차트나 지도가 들어올 상자",
          "",
          "### `TxLoading` 과 하는 말이 다르다",
          "",
          "| | `TxSkeleton` | `TxSpinner` · `TxLoading` |",
          "| --- | --- | --- |",
          "| 하는 말 | **여기 이런 모양의 것이 올 것이다** | **기다려라** |",
          "| 자리 | 미리 잡아 둔다 — 내용이 와도 안 흔들린다 | 잡지 않는다 |",
          "| 맞는 자리 | 목록 · 카드처럼 **모양이 미리 정해진 것** | 무엇이 올지 모르거나 화면을 덮어야 할 때 |",
          "",
          "### 빈 상자를 읽어 주지 않는다",
          "",
          "우리가 그린 막대는 `aria-hidden` 이라 스크린리더가 세지 않고, 바깥이",
          "**`aria-busy`** 로 \"지금 이 자리를 채우는 중\" 을 한 번만 알린다.",
          "",
          "자식에서 가져올 때는 **`inert`** 로 그 가지를 통째로 뺀다 — 값이 없는 동안에는",
          "빈 버튼·입력이 남아 있는데, **이름도 내용도 없는 것에 Tab 이 멈추면 막다른 길**이다.",
          "",
          "### 회색을 값으로 박지 않았다",
          "",
          "본문 색을 옅게 섞어 만든다. 그래서 **라이트에서는 어두운 회색, 다크에서는 밝은 회색**이",
          "저절로 된다 — 값으로 박으면 다크에서 바탕보다 어두워져 자리가 아예 안 보인다.",
          "",
          "빛이 지나가는 것을 멈추려면 `--tx-skeleton-duration: 0s` 다. 움직임을 원치 않는다고",
          "밝힌 사람에게는 알아서 멈춘다.",
          "",
          "### 줄 수만큼의 자리를 정확히 차지한다",
          "",
          "`lines={3}` 은 **글 세 줄과 같은 높이**를 잡는다. 막대 사이에만 간격을 두면 간격",
          "하나만큼 짧아져서 내용이 도착할 때 자리가 튄다 — 자리를 잡아 두는 것이 이 컴포넌트가",
          "하는 일의 전부이므로 그러면 안 된다.",
          "",
          "글자 크기가 다르면 **`--tx-skeleton-line-height` 를 그 줄 높이로 맞춘다** (기본 `1.25rem`).",
          "",
          "컨트롤 패널은 `Playground` 에서만 동작한다."
        ].join("\n")
      }
    }
  },
  args: { variant: "text", lines: 3 },
  argTypes: {
    variant: { control: "inline-radio", options: ["text", "circle", "rect"] },
    lines: { control: { type: "number", min: 1, max: 8 }, description: "`text` 일 때만 쓴다" },
    width: { control: "text" },
    height: { control: "text" },
    className: { control: "text", description: "`.tx-skeleton` 에 덧붙는다 (교체 아님)" }
  }
} satisfies Meta<typeof TxSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

const noControls = { controls: { disable: true } };

export const Playground: Story = {
  render: (args) => (
    <div className="max-w-md">
      <TxSkeleton {...args} />
    </div>
  )
};

/** 세 모양. **여러 줄이면 마지막 줄이 짧다** — 문단은 원래 그렇게 끝난다. */
export const Variants: Story = {
  parameters: noControls,
  render: () => (
    <div className="flex max-w-md flex-col gap-6">
      <TxSkeleton lines={3} />
      <TxSkeleton variant="circle" />
      <TxSkeleton variant="rect" />
    </div>
  )
};

/** 크기는 `width` · `height` 로 준다. 안 주면 글과 사각형은 꽉 차고 동그라미는 정해진 크기다. */
export const Sizes: Story = {
  parameters: noControls,
  render: () => (
    <TxFlex>
      <TxSkeleton variant="circle" width="1.75rem" />
      <TxSkeleton variant="circle" />
      <TxSkeleton variant="circle" width="4rem" />
      <TxSkeleton variant="rect" width="10rem" height="4rem" />
    </TxFlex>
  )
};

/**
 * **흔한 쓰임.** `loading` 만 주고 모양은 안 준다 — **자식에서 가져온다.**
 * 줄 수도 동그라미 크기도 적지 않았는데, 값이 아직 없는 자리가 그 자리 그대로 회색이 된다.
 *
 * 눌러 보면 **카드 높이가 그대로인 것**을 볼 수 있다. 진짜 배치를 쓰기 때문이다.
 *
 * `children` 은 먼저 평가되므로 `user?.name` 처럼 **불러오는 동안에도 안전한 값**이어야 한다.
 */
export const Swap: Story = {
  parameters: noControls,
  render: function SwapStory() {
    const [loading, setLoading] = useState(true);

    // 불러오는 동안에는 값이 없다. children 은 먼저 평가되므로 `?.` 로 읽는다
    const user = loading ? undefined : { name: "홍길동", email: "hong@example.com", address: "서울시 강남구" };

    return (
      <div className="flex max-w-md flex-col gap-3">
        <TxFlex>
          <TxButton label={loading ? "불러온 것으로 바꾸기" : "다시 불러오기"} onClick={() => setLoading((current) => !current)} />
        </TxFlex>

        <TxCard title="파트너">
          <TxSkeleton loading={loading}>
            <div className="flex gap-3">
              <div style={{ width: "2.5rem", height: "2.5rem", flex: "none", borderRadius: "50%", backgroundColor: user ? "var(--tx-color-primary)" : undefined }} />

              <div className="flex-1" style={{ fontSize: "0.875rem", lineHeight: "1.25rem" }}>
                <p className="font-semibold">{user?.name}</p>
                <p className="text-slate-600 dark:text-slate-300">{user?.email}</p>
                <p className="text-slate-600 dark:text-slate-300">{user?.address}</p>
              </div>
            </div>
          </TxSkeleton>
        </TxCard>
      </div>
    );
  }
};

/**
 * **붙박이 글은 그대로 보인다.** 값이 올 자리만 회색이 된다 —
 * `이름` · `메일` 같은 라벨은 비어 있지 않기 때문이다.
 *
 * `{user?.name ?? "—"}` 처럼 대체값을 넣으면 비어 있지 않아 안 칠해진다.
 */
export const AutoWithLabels: Story = {
  parameters: noControls,
  render: function AutoWithLabelsStory() {
    const [loading, setLoading] = useState(true);
    const user = loading ? undefined : { name: "홍길동", email: "hong@example.com" };

    return (
      <div className="flex max-w-md flex-col gap-3">
        <TxFlex>
          <TxButton label={loading ? "불러온 것으로 바꾸기" : "다시 불러오기"} onClick={() => setLoading((current) => !current)} />
        </TxFlex>

        <TxSkeleton loading={loading}>
          <dl className="grid grid-cols-[4rem_1fr] gap-x-3" style={{ fontSize: "0.875rem", lineHeight: "1.5rem" }}>
            <dt className="font-semibold">이름</dt>
            <dd>{user?.name}</dd>
            <dt className="font-semibold">메일</dt>
            <dd>{user?.email}</dd>
          </dl>
        </TxSkeleton>
      </div>
    );
  }
};

/**
 * **목록에서 값이 가장 크다.** 행 컴포넌트를 그대로 쓰고 값만 비워서 넘기면,
 * 스켈레톤이 실제와 어긋날 수가 없다 — 같은 마크업이기 때문이다.
 *
 * 불러오는 동안에는 행이 없으므로 **몇 줄을 보일지만 정해 준다.**
 */
export const List: Story = {
  parameters: noControls,
  render: function ListStory() {
    const [loading, setLoading] = useState(true);

    const users = loading ? undefined : [{ name: "홍길동", email: "hong@example.com" }, { name: "임꺽정", email: "im@example.com" }, { name: "장길산", email: "jang@example.com" }];

    // 불러오는 동안 보일 빈 줄. 값이 없는 행을 그리면 auto 가 그 자리를 칠한다
    const rows = users ?? Array.from({ length: 3 }, () => undefined);

    return (
      <div className="flex max-w-md flex-col gap-3">
        <TxFlex>
          <TxButton label={loading ? "불러온 것으로 바꾸기" : "다시 불러오기"} onClick={() => setLoading((current) => !current)} />
        </TxFlex>

        <TxSkeleton loading={loading}>
          <div className="flex flex-col gap-4">
            {rows.map((user, index) => (
              <div key={index} className="flex gap-3">
                <div style={{ width: "2rem", height: "2rem", flex: "none", borderRadius: "50%", backgroundColor: user ? "var(--tx-color-primary)" : undefined }} />
                <div className="flex-1" style={{ fontSize: "0.875rem", lineHeight: "1.25rem" }}>
                  <p className="font-semibold">{user?.name}</p>
                  <p className="text-slate-600 dark:text-slate-300">{user?.email}</p>
                </div>
              </div>
            ))}
          </div>
        </TxSkeleton>
      </div>
    );
  }
};

/**
 * **자식에서 가져오지 못하는 것이 둘 있다.**
 *
 * 하나는 **여러 줄로 감기는 글**이다. 빈 문단은 언제나 한 줄이라, 세 줄로 감길 글 자리에
 * 한 줄만 잡힌다 — 그럴 때 `lines` 를 준다. 다른 하나는 **미러링할 마크업이 아예 없는 자리**로,
 * 차트나 지도가 들어올 상자가 그렇다.
 */
export const Explicit: Story = {
  parameters: noControls,
  render: () => (
    <div className="flex max-w-md flex-col gap-6">
      <div>
        <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">여러 줄로 감길 글</p>
        <TxSkeleton lines={3} />
      </div>

      <div>
        <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">차트가 들어올 자리</p>
        <TxSkeleton variant="rect" height="6rem" />
      </div>
    </div>
  )
};

/** 겉모습은 CSS 변수로 바꾼다. `--tx-skeleton-duration: 0s` 면 빛이 지나가지 않는다. */
export const Tokens: Story = {
  parameters: noControls,
  render: () => (
    <div className="flex max-w-md flex-col gap-6">
      <TxSkeleton lines={2} />
      <TxSkeleton lines={2} style={vars({ "--tx-skeleton-duration": "0s" })} />
      <TxSkeleton lines={2} style={vars({ "--tx-skeleton-text-height": "1.25rem", "--tx-skeleton-line-height": "2rem", "--tx-skeleton-radius": "999px" })} />
    </div>
  )
};
