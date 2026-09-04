import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { TxCard } from "@txstack/ui";
import { MemberForm } from "./recipes/MemberForm";
import { EMPTY_MEMBER, type Member } from "./recipes/members";

const meta = {
  title: "Recipes/RegisterForm",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "**등록 화면 한 장.** 배치 · 잘못 넣은 값 · 저장 흐름을 한자리에서 본다.",
          "",
          "폼의 소스는 [`recipes/MemberForm.tsx`](https://github.com/code7004/txstack/blob/main/apps/storybook/src/recipes/MemberForm.tsx) 에 있고,",
          "**슬라이드 편집 레시피가 같은 폼을 그대로 재사용한다** — 등록과 수정을 두 번 짜지 않는다.",
          "",
          "### 어디까지가 라이브러리인가",
          "",
          "| | |",
          "| --- | --- |",
          "| `TxForm` 이 하는 것 | 캡션·메시지를 컨트롤과 **잇는 배선**(`<label for>` · `aria-describedby` · `aria-invalid`), 메시지 자리 잡기, 라벨 폭 맞추기 |",
          "| 앱이 하는 것 | **무엇이 잘못인지 판정**하고 `error` · `warning` 에 글자를 넣는 것 |",
          "",
          "그래서 검증 라이브러리를 쓰든 손으로 짜든 폼 컴포넌트는 상관하지 않는다. 이 레시피는",
          "의존을 늘리지 않으려고 손으로 짰다.",
          "",
          "### 에러와 경고는 다르다",
          "",
          "**한 자리를 나눠 쓰고 에러가 이긴다.** 에러는 저장을 막고, 경고는 알리기만 한다 —",
          "메일에 `you@gmail.com` 을 넣어 보라. 노란 글자가 뜨지만 저장은 된다.",
          "",
          "```tsx",
          '<TxForm.Input caption="메일" error={errors.email} warning={warnings.email} />',
          "```",
          "",
          "메시지가 없어도 **그 자리는 잡혀 있다.** 에러가 떴다 사라져도 아래 줄이 밀려나지",
          "않는다 — 자리를 안 잡고 싶으면 `--tx-form-message-reserve: 0` 이다.",
          "",
          "### 배치",
          "",
          "`TxForm` 은 세로 한 줄이 기본이고, **`className` 은 교체가 아니라 덧붙는다** —",
          "그래서 그리드를 주면 그대로 따른다. 묶음 사이는 `TxDivider` 다.",
          "",
          "```tsx",
          '<TxForm noValidate labelWidth="5rem" className="grid gap-x-6 sm:grid-cols-2">',
          '  <TxForm.Input caption="이름" />',
          '  <TxForm.Input caption="메일" />',
          '  <TxDivider className="sm:col-span-2">추가 정보</TxDivider>',
          '  <div className="flex justify-end gap-2 sm:col-span-2">…버튼…</div>',
          "</TxForm>",
          "```",
          "",
          "**버튼 줄에 `TxForm.Flex` 를 쓰지 않았다.** 그건 한 줄에 여러 *칸*을 놓는 자리라",
          "자식이 폭을 똑같이 나눠 갖는다 — 버튼까지 줄 전체로 늘어나면 눌러야 할 곳이 흐려진다.",
          "",
          "좁은 자리(모달 · 슬라이드 패널)에서는 `labelWidth` 를 주지 않는다. 그러면 캡션이",
          "위로 간다 — `Narrow` 이야기가 그것이다. **빈 문자열로는 못 끈다**(그것도 값이다).",
          "",
          "**필수 표시는 앱이 그린다.** 별표를 붙일지 `(필수)` 로 쓸지가 화면마다 달라서,",
          "캡션에 직접 넣고 컨트롤에는 `required` 를 준다.",
          "",
          "**폼에 `noValidate` 를 준다.** 안 주면 브라우저가 먼저 나서서 `required` 인 칸에 자기",
          "말풍선을 띄우고 제출을 막는다 — 우리 메시지는 뜨지도 않고, 그 말풍선은 문구도 겉모습도",
          '손댈 수 없다. `required` 자체는 남긴다: 스크린리더에 "필수" 로 전달된다.',
          "",
          "### 저장 흐름",
          "",
          "제출하면 버튼이 잠기고, 끝나면 `TxToast` 가 알린다. **서버가 필드 단위로 돌려준 에러는",
          "그 칸에 다시 칠한다** — 메일에 `dup@example.com` 을 넣고 저장해 보라.",
          "",
          "고친 것이 있는 채로 취소하면 `TxDialog.confirm` 이 막아선다. `TxToast` · `TxDialog` 는",
          "**부를 때 스스로 자리를 만든다** — 앱에 Provider 를 심을 필요가 없다."
        ].join("\n")
      }
    }
  }
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** 저장된 것을 보여 주는 자리. 실제 앱이라면 목록으로 돌아가거나 상세로 간다. */
const Result = ({ saved }: { saved?: Member }) => <p className="text-sm text-slate-500 dark:text-slate-400">{saved ? `저장됨 — ${saved.id} · ${saved.name} · ${saved.email}` : "아직 저장하지 않았다."}</p>;

/** **기본 배치.** 넓으면 두 칸, 좁아지면 한 칸으로 접힌다(모서리를 끌어 좁혀 보라). */
export const Default: Story = {
  render: function DefaultStory() {
    const [saved, setSaved] = useState<Member>();

    return (
      <div className="flex flex-col gap-4 p-4" style={{ resize: "horizontal", overflow: "auto", maxWidth: "56rem" }}>
        <h1 className="text-lg font-semibold">회원 등록</h1>
        <MemberForm onDone={setSaved} onCancel={() => setSaved(undefined)} />
        <Result saved={saved} />
      </div>
    );
  }
};

/**
 * **서버가 돌려준 에러.** 메일이 이미 채워져 있다 — 그대로 저장하면 그 칸이 빨개지고
 * 알림이 뜬다. 화면에만 뜨는 것이 아니라 **스크린리더에도 "잘못된 값" 으로 전달된다**
 * (`aria-invalid` · `aria-describedby` 를 `TxForm` 이 잇는다).
 */
export const ServerError: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-4" style={{ maxWidth: "56rem" }}>
      <h1 className="text-lg font-semibold">회원 등록</h1>
      <MemberForm value={{ ...EMPTY_MEMBER, name: "김하늘", email: "dup@example.com" }} />
    </div>
  )
};

/**
 * **좁은 자리.** 슬라이드 패널이나 모달에 넣을 때는 캡션을 위로 올리고 한 칸씩 쌓는다 —
 * 같은 폼에 `single` 만 켠 것이다(그러면 `labelWidth` 를 주지 않는다).
 */
export const Narrow: Story = {
  render: () => (
    <div className="p-4" style={{ maxWidth: "22rem" }}>
      <TxCard title="회원 등록">
        <MemberForm single />
      </TxCard>
    </div>
  )
};
