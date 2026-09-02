import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { TxButton, TxSlidePanel } from "@txstack/ui";
import { MemberForm } from "./recipes/MemberForm";
import { MemberList } from "./recipes/MemberList";
import type { Member } from "./recipes/members";

const meta = {
  title: "Recipes/EditInPanel",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: [
          "**목록에서 바로 고친다.** 행을 누르면 옆에서 패널이 열리고, 그 안에 **등록 화면과 똑같은 폼**이 선다.",
          "",
          "이 레시피의 요점은 하나다 — **등록과 수정을 두 번 짜지 않는다.**",
          "`Recipes/RegisterForm` 과 `Recipes/ListScreen` 이 쓰는 조각을 그대로 가져다 붙인 것이 전부다.",
          "",
          "```tsx",
          "<MemberList onPick={setEditing} />",
          "",
          "<TxSlidePanel open={!!editing} title=\"회원 수정\" onClose={() => setEditing(undefined)}>",
          "  <MemberForm value={editing} single onDone={close} onCancel={close} />",
          "</TxSlidePanel>",
          "```",
          "",
          "### 좁은 자리에서는 폼이 접힌다",
          "",
          "같은 폼에 `single` 만 켰다 — **캡션이 위로 가고 한 칸씩 쌓인다.** 라벨 폭을 잡아 두면",
          "패널 폭에서 글자가 들어갈 칸이 남지 않는다.",
          "",
          "### 닫는 길을 막지 않는다",
          "",
          "`TxSlidePanel` 은 **Escape · 바깥 클릭 · 닫기 버튼** 셋을 기본으로 준다.",
          "그런데 고치던 중이라면 그대로 닫히면 안 된다 — 폼의 취소가 `TxDialog.confirm` 으로",
          "막아서는 것과 같은 이유다. 여기서는 **패널의 바깥 클릭만 막고**(`closeOnBackdrop={false}`)",
          "Escape 와 닫기 버튼은 남겨 두었다.",
          "",
          "### 저장한 뒤",
          "",
          "폼이 `onDone` 으로 저장된 것을 돌려준다. 패널을 닫고 **목록을 다시 조회하는 것이**",
          "그다음이다 — 이 레시피는 가짜 서버라 화면에 찍는 것으로 대신한다."
        ].join("\n")
      }
    }
  }
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** 목록은 남는 높이를 채운다. 스토리에서는 이 상자가 높이를 정한다. */
const Frame = ({ children }: { children: React.ReactNode }) => <div className="flex h-[32rem] flex-col p-4">{children}</div>;

/** 행을 눌러 보라. 오른쪽에서 패널이 열리고 그 안에서 고친다. */
export const Default: Story = {
  render: function DefaultStory() {
    const [editing, setEditing] = useState<Member>();
    const [saved, setSaved] = useState<Member>();

    const close = () => setEditing(undefined);

    return (
      <Frame>
        <MemberList onPick={setEditing} actions={<TxButton label="회원 등록" />} />
        <p className="pt-3 text-sm text-slate-500 dark:text-slate-400">{saved ? `방금 저장 — ${saved.id} · ${saved.name} · ${saved.email}` : "행을 눌러 고쳐 보라."}</p>

        <TxSlidePanel
          open={!!editing}
          title={editing ? `회원 수정 — ${editing.name}` : ""}
          onClose={close}
          /* 고치던 중에 바깥을 잘못 눌러 닫히면 쓴 것이 사라진다. Escape·닫기 버튼은 남겨 둔다 */
          closeOnBackdrop={false}
        >
          {/* key 를 주어 다른 행을 고를 때마다 폼이 새 값으로 다시 선다 */}
          {editing && (
            <MemberForm
              key={editing.id}
              value={editing}
              single
              onDone={(member) => {
                setSaved(member);
                close();
              }}
              onCancel={close}
            />
          )}
        </TxSlidePanel>
      </Frame>
    );
  }
};
