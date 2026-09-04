import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type FormEvent } from "react";
import { TxAlert, TxButton, TxCapsLockCheck, TxCard, TxCheckBox, TxForm } from "@txstack/ui";

const meta = {
  title: "Recipes/LoginForm",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "**로그인 한 장.** 늘 처음 만드는 화면인데 늘 같은 것을 빠뜨린다.",
          "",
          "### 빠뜨리기 쉬운 것 다섯",
          "",
          "**① 비밀번호 칸에 `TxCapsLockCheck`.** Caps Lock 이 켜진 줄 모르고 세 번 틀리면 계정이 잠긴다.",
          "글자가 뜰 자리를 미리 잡아 두므로(`preserveSpace`) 떴다 사라져도 화면이 흔들리지 않는다.",
          "",
          "**② 자동완성 속성.** `username` · `current-password` 를 주면 브라우저와 암호 관리자가",
          "제 일을 한다. 안 주면 사용자가 매번 손으로 친다.",
          "",
          "```tsx",
          '<TxForm.Input caption="아이디" autoComplete="username" />',
          '<TxForm.Input caption="비밀번호" type="password" autoComplete="current-password" />',
          "```",
          "",
          '**③ 서버 에러는 칸이 아니라 위에 붙인다.** "아이디 또는 비밀번호가 맞지 않다" 는',
          "어느 칸의 잘못인지 알려 주지 않는 것이 원칙이라(계정이 있는지 흘리지 않는다)",
          "`TxAlert` 한 줄이 맞다. 형식이 틀린 것은 그 칸의 `error` 다.",
          "",
          "**④ 제출 중에는 버튼을 잠근다.** 두 번 눌러 두 번 로그인되는 일을 막는다.",
          "",
          '**⑤ Enter 로 제출된다.** `<form>` 안에 `type="submit"` 버튼이 있으면 그냥 된다 —',
          "`onKeyDown` 을 달지 않는다.",
          "",
          "### 해 보기",
          "",
          "아무 아이디에 비밀번호 `1234` 를 넣으면 **로그인 실패**가 뜬다. 그 밖에는 성공한다."
        ].join("\n")
      }
    }
  }
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const Default: Story = {
  render: function DefaultStory() {
    const [id, setId] = useState("");
    const [password, setPassword] = useState("");
    const [failed, setFailed] = useState(false);
    const [busy, setBusy] = useState(false);
    const [done, setDone] = useState<string>();

    const hdSubmit = async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setFailed(false);
      setBusy(true);

      // 실제로는 이 자리에 요청이 온다
      await wait(600);
      setBusy(false);

      if (password === "1234") return setFailed(true);
      setDone(id || "(빈 아이디)");
    };

    if (done) {
      return (
        <div className="p-4">
          <TxAlert variant="success" title="들어왔다">
            {done} 으로 로그인했다.
          </TxAlert>
        </div>
      );
    }

    return (
      <div className="p-4">
        <TxCard title="로그인" className="mx-auto max-w-sm">
          {/* noValidate 로 우리 메시지만 쓴다 — 브라우저 말풍선은 문구도 겉모습도 손댈 수 없다 */}
          <TxForm noValidate onSubmit={hdSubmit}>
            {/* 어느 칸의 잘못인지 알리지 않는 것이 원칙이라 위에 한 줄로 붙인다 */}
            {failed && (
              <TxAlert variant="danger" className="mb-3">
                아이디 또는 비밀번호가 맞지 않다.
              </TxAlert>
            )}

            <TxForm.Input caption="아이디" placeholder="아이디" autoComplete="username" autoFocus value={id} onChangeText={setId} />

            <TxCapsLockCheck>
              <TxForm.Input caption="비밀번호" type="password" placeholder="비밀번호" autoComplete="current-password" value={password} onChangeText={setPassword} />
            </TxCapsLockCheck>

            <TxCheckBox label="로그인 상태 유지" className="mb-3" />

            <TxButton type="submit" label={busy ? "들어가는 중" : "로그인"} disabled={busy} className="w-full" />
          </TxForm>
        </TxCard>
      </div>
    );
  }
};
