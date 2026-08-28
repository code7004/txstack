import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type CSSProperties } from "react";
import { TxPagination } from "./TxPagination";

/** CSS 변수를 인라인 스타일로 주려면 타입을 넓혀야 한다. 스토리에서만 쓴다. */
const vars = (v: Record<`--${string}`, string>) => v as CSSProperties;

const meta = {
  title: "Data/TxPagination",
  component: TxPagination,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "쪽 번호. **표든 카드 목록이든 서버가 `offset`·`total` 로 주는 자리면 쓴다.**",
          "",
          "```tsx",
          'import { TxPagination } from "@txstack/ui";',
          'import "@txstack/ui/styles.css"; // 앱에서 한 번',
          "",
          "<TxPagination currentPage={page} totalRows={total} pageSize={50} onChangePage={setPage} />;",
          "```",
          "",
          "- `currentPage` 는 **1부터** 센다",
          "- **쪽이 하나뿐이면 아무것도 그리지 않는다** — 고를 것이 없는 자리를 채우지 않는다",
          "- 번호는 `pageButtonCount` 개씩 묶여 나오고 `«` `»` 가 묶음째 옮긴다",
          "- 같은 쪽을 다시 눌러도 `onChangePage` 는 오지 않는다",
          "",
          "**마지막 쪽의 상한은 소비자가 준다**(`maxPage`). 서버가 결과를 1만 건까지만 돌려준다면",
          "`maxPage={Math.floor(10000 / pageSize)}` 다 — 그 사정은 소비자만 안다.",
          "",
          "`TxAgGrid` 는 `pagination` prop 을 받으면 이걸 아래에 붙인다.",
          "",
          "컨트롤 패널은 `Playground` 에서만 동작한다."
        ].join("\n")
      }
    }
  },
  // 필수 prop 이 둘이라 meta 에서 기본값을 준다. 각 스토리가 render 로 덮어쓴다
  args: { currentPage: 1, totalRows: 250 },
  argTypes: {
    currentPage: { control: { type: "number", min: 1 } },
    totalRows: { control: { type: "number", min: 0 } },
    pageSize: { control: { type: "number", min: 1 } },
    pageButtonCount: { control: { type: "number", min: 1 } },
    maxPage: { control: "number", description: "마지막 쪽의 상한. 서버가 더 못 주는 자리에만 준다" },
    hideStepButtons: { control: "boolean" },
    hideGroupButtons: { control: "boolean" },
    className: { control: "text", description: "`.tx-pagination` 에 덧붙는다 (교체 아님)" },
    labels: { control: false },
    onChangePage: { control: false }
  }
} satisfies Meta<typeof TxPagination>;

export default meta;
type Story = StoryObj<typeof meta>;

const noControls = { controls: { disable: true } };

export const Playground: Story = {
  args: { totalRows: 1250, pageSize: 50, pageButtonCount: 10, hideStepButtons: false, hideGroupButtons: false },
  render: function PlaygroundStory(args) {
    const [page, setPage] = useState(args.currentPage);
    return <TxPagination {...args} currentPage={page} onChangePage={setPage} />;
  }
};

/** 실제로 눌러 보라. 묶음 끝에서 `»` 를 누르면 다음 묶음으로 넘어간다. */
export const Interactive: Story = {
  parameters: noControls,
  render: function InteractiveStory() {
    const [page, setPage] = useState(1);

    return (
      <div className="flex flex-col items-center gap-3">
        <TxPagination currentPage={page} totalRows={1250} pageSize={50} onChangePage={setPage} />
        <div className="font-mono text-sm text-slate-500 dark:text-slate-400">currentPage = {page}</div>
      </div>
    );
  }
};

/** 쪽수에 따라 모양이 달라진다. **하나뿐이면 아예 그리지 않는다.** */
export const Sizes: Story = {
  parameters: noControls,
  render: () => (
    <div className="flex flex-col gap-6">
      {[
        { label: "쪽이 하나 — 아무것도 그리지 않는다", totalRows: 7 },
        { label: "세 쪽", totalRows: 25 },
        { label: "묶음을 넘는다 (125쪽)", totalRows: 1250 }
      ].map(({ label, totalRows }) => (
        <div key={label} className="flex flex-col gap-2">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400">{label}</div>
          <TxPagination currentPage={1} totalRows={totalRows} pageSize={10} />
        </div>
      ))}
    </div>
  )
};

/**
 * 서버가 돌려주는 결과에 한계가 있으면 `maxPage` 로 알린다.
 *
 * 아래 둘은 전체 행 수가 같지만, 오른쪽은 **3쪽까지만** 갈 수 있다.
 */
export const MaxPage: Story = {
  parameters: noControls,
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="text-xs font-bold text-slate-500 dark:text-slate-400">상한 없음</div>
        <TxPagination currentPage={1} totalRows={100000} pageSize={10} pageButtonCount={5} />
      </div>
      <div className="flex flex-col gap-2">
        <div className="text-xs font-bold text-slate-500 dark:text-slate-400">maxPage = 3</div>
        <TxPagination currentPage={1} totalRows={100000} pageSize={10} pageButtonCount={5} maxPage={3} />
      </div>
    </div>
  )
};

/** 화살표를 숨겨 번호만 남길 수 있다. */
export const WithoutArrows: Story = {
  parameters: noControls,
  render: () => (
    <div className="flex flex-col gap-6">
      <TxPagination currentPage={12} totalRows={1250} pageSize={50} hideGroupButtons />
      <TxPagination currentPage={12} totalRows={1250} pageSize={50} hideStepButtons hideGroupButtons />
    </div>
  )
};

/**
 * 스크린리더가 읽는 문구는 **번역된 글자를 그대로** 준다.
 * 키를 주고 안에서 번역하는 이중 경로를 만들지 않는다.
 */
export const Labels: Story = {
  parameters: noControls,
  render: () => <TxPagination currentPage={2} totalRows={250} pageSize={50} labels={{ nav: "Pagination", prevGroup: "Previous 10", prev: "Previous", next: "Next", nextGroup: "Next 10", page: (page) => `Page ${page}` }} />
};

/**
 * 겉모습은 CSS 변수로 바꾼다. 크기를 키워도 **번호와 화살표가 같이 따라온다.**
 *
 * 색은 `TxButton` 이 그리므로 `--tx-color-primary` 한 줄이면 지금 쪽 표시까지 바뀐다.
 */
export const Tokens: Story = {
  parameters: noControls,
  render: () => (
    <div className="flex flex-col gap-6">
      <TxPagination currentPage={3} totalRows={250} pageSize={50} style={vars({ "--tx-pagination-size": "2.5rem", "--tx-pagination-font-size": "0.875rem", "--tx-pagination-gap": "0.5rem" })} />
      <TxPagination currentPage={3} totalRows={250} pageSize={50} style={vars({ "--tx-color-primary": "#7c3aed", "--tx-radius": "9999px" })} />
    </div>
  )
};
