import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type CSSProperties } from "react";
import { TxButton } from "../TxButton";
import { TxCard } from "../TxCard";
import { TxEmptyState } from "./TxEmptyState";
import type { TxEmptyStateVariant } from "./TxEmptyState.types";

/** CSS 변수를 인라인 스타일로 주려면 타입을 넓혀야 한다. 스토리에서만 쓴다. */
const vars = (v: Record<`--${string}`, string>) => v as CSSProperties;

const VARIANTS: TxEmptyStateVariant[] = ["no-data", "no-result", "error", "no-permission"];

const meta = {
  title: "Feedback/TxEmptyState",
  component: TxEmptyState,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "보여 줄 것이 없을 때 그 자리에 놓는 안내.",
          "",
          "```tsx",
          'import { TxEmptyState } from "@txstack/ui";',
          'import "@txstack/ui/styles.css"; // 앱에서 한 번',
          "",
          "{rows.length === 0 && (",
          '  <TxEmptyState variant="no-result">',
          '    <TxButton label="조건 지우기" variant="secondary" onClick={reset} />',
          "  </TxEmptyState>",
          ")}",
          "```",
          "",
          "### 왜 비었는지를 넷으로 가른다",
          "",
          '**"없음" 이라고만 적으면 그 다음이 없다.** 넷은 사용자가 할 일이 서로 다르다.',
          "",
          "| 갈래 | 뜻 | 다음에 할 일 |",
          "| --- | --- | --- |",
          "| `no-data` | 아직 하나도 안 만들었다 | 만들라고 권한다 |",
          "| `no-result` | 찾았는데 안 나왔다 | 조건을 고치라고 한다 |",
          "| `error` | 불러오다 실패했다 | 다시 시도하게 한다 |",
          "| `no-permission` | 볼 권한이 없다 | 요청하거나 돌아가게 한다 |",
          "",
          "문구를 안 주면 갈래마다 정해진 것이 나온다. `title` · `description` 으로 덮고,",
          "**`null` 을 주면 그 줄이 아예 없어진다** — 안 준 것과 일부러 비운 것을 가른다.",
          "",
          "### 조용해야 한다",
          "",
          "바탕도 테두리도 칠하지 않는다. **`error` 만 갈래색을 쓴다** — 나머지 셋은",
          "잘못이 아니라 상태라, 붉히거나 노랗게 하면 **없는 문제를 있는 것처럼** 보이게 한다.",
          "눈에 띄어야 하는 것은 `TxAlert` 쪽이다.",
          "",
          "컨트롤 패널은 `Playground` 에서만 동작한다."
        ].join("\n")
      }
    }
  },
  args: { variant: "no-data" },
  argTypes: {
    variant: { control: "inline-radio", options: VARIANTS },
    title: { control: "text" },
    description: { control: "text" },
    icon: { control: false },
    children: { control: false },
    className: { control: "text", description: "`.tx-empty-state` 에 덧붙는다 (교체 아님)" }
  }
} satisfies Meta<typeof TxEmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

const noControls = { controls: { disable: true } };

export const Playground: Story = {
  render: (args) => (
    <div className="max-w-lg">
      <TxEmptyState {...args} />
    </div>
  )
};

/** 넷. **문구도 그림도 서로 다르다** — 같으면 가르는 뜻이 없다. */
export const Variants: Story = {
  parameters: noControls,
  render: () => (
    <div className="grid max-w-4xl gap-4 sm:grid-cols-2">
      {VARIANTS.map((variant) => (
        <TxCard key={variant} title={variant}>
          <TxEmptyState variant={variant} />
        </TxCard>
      ))}
    </div>
  )
};

/** 갈래마다 **다음에 할 일**이 다르다. 버튼도 그에 맞춰 둔다. */
export const WithActions: Story = {
  parameters: noControls,
  render: () => (
    <div className="grid max-w-4xl gap-4 sm:grid-cols-2">
      <TxCard title="아직 만든 것이 없을 때">
        <TxEmptyState variant="no-data">
          <TxButton label="첫 주문 만들기" />
        </TxEmptyState>
      </TxCard>

      <TxCard title="찾았는데 없을 때">
        <TxEmptyState variant="no-result">
          <TxButton label="조건 지우기" variant="secondary" />
        </TxEmptyState>
      </TxCard>

      <TxCard title="불러오다 실패했을 때">
        <TxEmptyState variant="error">
          <TxButton label="다시 시도" variant="danger" />
        </TxEmptyState>
      </TxCard>

      <TxCard title="권한이 없을 때">
        <TxEmptyState variant="no-permission">
          <TxButton label="권한 요청" variant="secondary" />
        </TxEmptyState>
      </TxCard>
    </div>
  )
};

/** **흔한 쓰임 — 검색 결과.** 조건을 지우면 목록이 돌아온다. */
export const InList: Story = {
  parameters: noControls,
  render: function InListStory() {
    const [filtered, setFiltered] = useState(true);
    const rows = filtered ? [] : ["8213 · 완료", "8214 · 대기", "8215 · 실패"];

    return (
      <TxCard title="주문" className="max-w-lg">
        {rows.length === 0 ? (
          <TxEmptyState variant="no-result" description="‘취소됨’ 조건에 맞는 주문이 없습니다.">
            <TxButton label="조건 지우기" variant="secondary" onClick={() => setFiltered(false)} />
          </TxEmptyState>
        ) : (
          <div className="flex flex-col gap-2 text-sm">
            {rows.map((row) => (
              <div key={row} className="border-b py-2 last:border-0">
                {row}
              </div>
            ))}
            <TxButton label="다시 걸러 보기" variant="secondary" onClick={() => setFiltered(true)} />
          </div>
        )}
      </TxCard>
    );
  }
};

/** 문구를 덮고, 필요 없는 줄은 `null` 로 없앤다. 그림도 갈아끼우거나 끌 수 있다. */
export const Custom: Story = {
  parameters: noControls,
  render: () => (
    <div className="grid max-w-4xl gap-4 sm:grid-cols-2">
      <TxCard title="문구를 덮는다">
        <TxEmptyState title="장바구니가 비었습니다" description="마음에 드는 것을 담아 보세요." icon={<span>🛒</span>} />
      </TxCard>

      <TxCard title="설명을 없앤다">
        <TxEmptyState title="첨부한 파일이 없습니다" description={null} />
      </TxCard>

      <TxCard title="그림을 끈다">
        <TxEmptyState variant="no-result" icon={false} />
      </TxCard>

      <TxCard title="좁은 자리">
        <TxEmptyState variant="no-data" description={null} icon={false} style={vars({ "--tx-empty-state-padding": "1.25rem 1rem" })} />
      </TxCard>
    </div>
  )
};
