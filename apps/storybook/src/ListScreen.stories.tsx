import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { TxButton } from "@txstack/ui";
import { MemberList } from "./recipes/MemberList";
import type { Member } from "./recipes/members";

const meta = {
  title: "Recipes/ListScreen",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: [
          "**목록 화면 한 장.** 솔루션 화면의 태반이 이 모양이다 —",
          "조건을 걸어 찾고, 표로 보고, 쪽을 넘기고, 한 줄을 골라 들어간다.",
          "",
          "소스는 [`recipes/MemberList.tsx`](https://github.com/code7004/txstack/blob/main/apps/storybook/src/recipes/MemberList.tsx) 하나이고,",
          "**슬라이드 편집 레시피가 같은 목록을 그대로 재사용한다.**",
          "",
          "### 섞이는 부품",
          "",
          "| 자리 | 부품 |",
          "| --- | --- |",
          "| 검색 | `TxSearchInput` — Enter 로 찾고 × 로 지운다 |",
          "| 필터 | `TxDropdown` |",
          "| 표 | `TxAgGrid` (`@txstack/ui/aggrid`) — 순번 열 · 브라우저 정렬 |",
          "| 쪽 번호 | 표의 `pagination` 이 `TxPagination` 을 그린다 |",
          "| 빈 결과 | `TxEmptyState` |",
          "",
          "### 이 화면이 늘 틀리는 자리 셋",
          "",
          "**① 조건이 바뀌면 1쪽으로 돌아간다.** 3쪽을 보다가 검색어를 바꿨는데 쪽이 그대로면",
          "결과가 둘뿐일 때 빈 화면이 나온다. 조건과 쪽을 **한 함수에서** 바꾼다.",
          "",
          "```tsx",
          "const search = (next) => {",
          "  setCondition((prev) => ({ ...prev, ...next }));",
          "  setPage(1);            // 늘 함께",
          "};",
          "```",
          "",
          "**② 글자마다 서버를 부르지 않는다.** `TxSearchInput` 은 `onChangeText`(칠 때마다)와",
          "`onSubmitText`(Enter)를 갈라 준다 — 조회는 Enter 쪽에 붙인다.",
          "",
          "**③ 빈 결과는 표 대신 안내로 바꾼다.** 머리글만 남은 표는 *조회가 안 된 것*인지",
          "*결과가 없는 것*인지 알려 주지 않는다.",
          "",
          "### 불러오는 동안",
          "",
          "`isLoading` 은 표 위에 덮개를 씌운다 — **화면을 비우지 않아** 자리가 흔들리지 않는다.",
          "여기서는 가짜 서버가 450ms 늦게 답한다."
        ].join("\n")
      }
    }
  }
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** 표는 남는 높이를 채운다. 스토리에서는 이 상자가 높이를 정한다. */
const Frame = ({ children }: { children: React.ReactNode }) => <div className="flex h-[32rem] flex-col p-4">{children}</div>;

/**
 * **골라 보는 목록.** 행을 누르면 아래에 그 사람이 찍힌다 — 실제 앱이라면 상세로 가거나
 * 옆에서 패널이 열린다(`Recipes/EditInPanel`).
 *
 * 검색어를 넣고 Enter, 권한을 바꿔 보라. 조건이 바뀌면 쪽이 1로 돌아간다.
 */
export const Default: Story = {
  render: function DefaultStory() {
    const [picked, setPicked] = useState<Member>();

    return (
      <Frame>
        <MemberList onPick={setPicked} actions={<TxButton label="회원 등록" />} />
        <p className="pt-3 text-sm text-slate-500 dark:text-slate-400">{picked ? `고른 사람 — ${picked.id} · ${picked.name}` : "행을 눌러 보라."}</p>
      </Frame>
    );
  }
};

/** 행을 누를 일이 없는 목록. `onPick` 을 주지 않으면 행은 그냥 읽는 자리다. */
export const ReadOnly: Story = {
  render: () => (
    <Frame>
      <MemberList />
    </Frame>
  )
};
