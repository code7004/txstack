import { TxAlert, TxButton, TxForm, TxGrid, TxNumberInput, TxSwitch, TxToast } from "@txstack/ui";
import { useState } from "react";
import { Link } from "react-router-dom";
import { CodeBlock } from "../../components/CodeBlock";
import { Block, Demo, Page } from "../../components/Page";

const muted = "text-slate-600 dark:text-slate-300";

interface Draft {
  name: string;
  email: string;
  password: string;
  plan: string | undefined;
  seats: number | undefined;
  agree: boolean;
}

type Errors = Partial<Record<keyof Draft, string>>;

/** 검사 규칙은 앱이 정한다. TxForm 은 결과(문구)를 받아 입력란과 이어 줄 뿐이다 */
function validate(draft: Draft): Errors {
  return {
    name: draft.name.trim() ? undefined : "이름을 입력해 주세요",
    email: /^\S+@\S+\.\S+$/.test(draft.email) ? undefined : "올바른 메일 형식이 아닙니다",
    password: draft.password.length >= 8 ? undefined : "8자 이상 입력해 주세요",
    plan: draft.plan ? undefined : "요금제를 골라 주세요",
    agree: draft.agree ? undefined : "약관에 동의해야 가입할 수 있습니다"
  };
}

/** 가입 폼. 저장을 누르면 검사하고, 고치는 동안에는 그 칸의 오류만 다시 본다 */
function SignUpDemo() {
  const [draft, setDraft] = useState<Draft>({ name: "", email: "", password: "", plan: undefined, seats: 5, agree: false });
  const [errors, setErrors] = useState<Errors>({});
  const [side, setSide] = useState(true);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    const next = { ...draft, [key]: value };
    setDraft(next);
    // 한 번 오류가 난 칸은 고치는 즉시 다시 검사한다
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: validate(next)[key] }));
  };

  const weak = draft.password.length >= 8 && !/\d/.test(draft.password) ? "숫자를 섞으면 더 안전합니다" : undefined;

  return (
    <div className="flex flex-col gap-4">
      <TxSwitch label="캡션을 왼쪽에 (labelWidth)" checked={side} onChangeBool={setSide} />

      <TxForm
        noValidate
        labelWidth={side ? "5.5rem" : undefined}
        onSubmit={() => {
          const found = validate(draft);
          setErrors(found);
          if (Object.values(found).some(Boolean)) return;
          TxToast.show({ variant: "success", title: "가입했습니다", message: draft.email });
        }}
      >
        <TxGrid columns={2}>
          <TxForm.Input caption="이름" value={draft.name} onChangeText={(value) => set("name", value)} error={errors.name} required />
          <TxForm.Input caption="메일" type="email" value={draft.email} onChangeText={(value) => set("email", value)} error={errors.email} required />
          <TxForm.Input caption="비밀번호" type="password" value={draft.password} onChangeText={(value) => set("password", value)} error={errors.password} warning={weak} required />
          <TxForm.Dropdown caption="요금제" data={["Free", "Team", "Enterprise"]} value={draft.plan} onChangeText={(value) => set("plan", value)} placeholder="고르세요" error={errors.plan} />
          <TxForm.Field caption="좌석" htmlFor="signup-seats">
            <TxNumberInput id="signup-seats" value={draft.seats} onChange={(value) => set("seats", value)} min={1} max={100} suffix="석" />
          </TxForm.Field>
          <TxForm.CheckBox caption="약관" label="이용약관에 동의합니다" checked={draft.agree} onChangeBool={(value) => set("agree", value)} error={errors.agree} />
        </TxGrid>

        <TxForm.Flex>
          <TxButton
            type="button"
            label="지우기"
            variant="secondary"
            onClick={() => {
              setDraft({ name: "", email: "", password: "", plan: undefined, seats: 5, agree: false });
              setErrors({});
            }}
          />
          <TxButton type="submit" label="가입" />
        </TxForm.Flex>
      </TxForm>
    </div>
  );
}

export function GuideForms() {
  return (
    <Page
      title="Forms"
      lead={
        <>
          입력 폼을 만듭니다. <code>TxForm</code>은 캡션, 오류, 필수 여부를 입력란과 이어 주고 배치를 맞춰 줍니다. 무엇이 잘못됐는지 판단하는 검사 규칙은 앱이 정합니다.
        </>
      }
    >
      <Block title="Try it">
        <p className={muted}>
          아무것도 채우지 않고 <strong>가입</strong>을 눌러 보세요. 오류가 난 칸은 고치는 즉시 다시 검사합니다. 비밀번호를 숫자 없이 8자 이상 넣으면 오류 대신 알림이 뜹니다. 위 스위치로 캡션 위치를 바꿀 수 있고, 폭을 좁히면 두 칸이 한 칸으로
          접힙니다.
        </p>
        <Demo>
          <SignUpDemo />
        </Demo>
      </Block>

      <Block title="1. Pick the fields">
        <p className={muted}>
          <code>TxForm.*</code> 필드는 모두 <code>caption</code>, <code>error</code>, <code>warning</code>을 받습니다. 입력란 종류에 맞는 필드를 고르면, 캡션을 눌렀을 때 포커스가 가고 화면 낭독기가 오류까지 읽도록 연결이 저절로 됩니다.
        </p>
        <div className="overflow-x-auto rounded-lg border" style={{ borderColor: "var(--tx-color-border)" }}>
          <table className="w-full text-sm">
            <tbody className={muted}>
              {[
                ["TxForm.Input · Textarea · SearchInput", "한 줄 · 여러 줄 · 검색 입력"],
                ["TxForm.Dropdown · DropdownMulti", "하나 · 여러 개 고르기"],
                ["TxForm.Combobox", "입력하면서 후보 고르기(목록에 없는 값도 됩니다)"],
                ["TxForm.CheckBox", "동의 · 켜고 끄기"],
                ["TxForm.Field", "그 밖의 컨트롤을 캡션 · 오류와 묶는 칸(아래 5번)"],
                ["TxFormDayPicker · TxFormDayPickerRange", "날짜 · 기간. @txstack/ui/daypicker에서 가져옵니다"]
              ].map(([name, what]) => (
                <tr key={name} className="border-t first:border-t-0" style={{ borderColor: "var(--tx-color-border)" }}>
                  <td className="px-3 py-2 font-mono text-xs whitespace-nowrap text-[color:var(--tx-color-text)]">{name}</td>
                  <td className="px-3 py-2">{what}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Block>

      <Block title="2. Validate on submit">
        <p className={muted}>
          검사 함수는 앱에 둡니다. 저장할 때 한 번 검사해 오류 문구를 모으고, 각 필드의 <code>error</code>로 넘깁니다. <code>TxForm</code>의 <code>onSubmit</code>에는 <code>preventDefault</code>가 이미 걸려 있어서 따로 부를 필요가 없습니다.
        </p>
        <CodeBlock title="src/SignUp.tsx">{`const [errors, setErrors] = useState<Errors>({});

<TxForm
  noValidate
  onSubmit={() => {
    const found = validate(draft);       // { email: "올바른 메일 형식이 아닙니다", ... }
    setErrors(found);
    if (Object.values(found).some(Boolean)) return;
    save(draft);
  }}
>
  <TxForm.Input caption="메일" type="email" value={draft.email} onChangeText={setEmail} error={errors.email} required />
</TxForm>`}</CodeBlock>
        <TxAlert variant="warning" title="noValidate를 넣어 주세요">
          빼면 브라우저가 <code>required</code>나 <code>type=&quot;email&quot;</code>을 먼저 검사해 자체 말풍선을 띄우고 제출을 막습니다. 그러면 앱의 오류 문구가 나타나지 않습니다.
        </TxAlert>
      </Block>

      <Block title="3. Errors and warnings">
        <p className={muted}>
          <code>error</code>를 넘기면 문구가 입력란 아래에 나오고, 입력란에 <code>aria-invalid</code>와 <code>aria-describedby</code>가 붙어 화면 낭독기도 오류를 읽습니다. <code>warning</code>은 막지는 않지만 알려야 할 때 씁니다. 문구 자리는 하나라서
          둘 다 있으면 <code>error</code>가 보입니다.
        </p>
        <p className={muted}>
          <code>required</code>는 입력란으로 그대로 넘어가 화면 낭독기가 &quot;필수&quot;라고 읽게 합니다. 별표 같은 표시는 그리지 않으므로, 화면에 보여야 한다면 캡션에 직접 넣으세요(<code>caption=&quot;이름 *&quot;</code>).
        </p>
      </Block>

      <Block title="4. Layout">
        <p className={muted}>
          캡션은 기본으로 입력란 <strong>위</strong>에 쌓입니다. <code>labelWidth</code>를 주면 캡션이 <strong>왼쪽</strong>으로 가고 그 폭으로 줄이 맞습니다. 두 칸 · 세 칸으로 놓을 때는 <code>TxGrid</code>로 감싸고, 한 줄을 다 쓰는 칸은{" "}
          <code>TxGrid.Item span=&quot;full&quot;</code>로 넓힙니다.
        </p>
        <CodeBlock title="src/SignUp.tsx">{`<TxForm labelWidth="6rem" onSubmit={submit}>
  <TxGrid columns={2}>
    <TxForm.Input caption="이름" />
    <TxForm.Input caption="메일" />
    <TxGrid.Item span="full">
      <TxForm.Textarea caption="메모" rows={3} />
    </TxGrid.Item>
  </TxGrid>

  <TxForm.Flex>                         {/* 버튼이 남은 폭을 똑같이 나눠 갖습니다 */}
    <TxButton type="button" label="취소" variant="secondary" />
    <TxButton type="submit" label="저장" />
  </TxForm.Flex>
</TxForm>`}</CodeBlock>
        <p className={muted}>
          <code>TxGrid</code>는 화면 크기가 아니라 <strong>놓인 자리의 폭</strong>을 봅니다. 칸 하나가 너무 좁아질 상황이면 칸 수를 줄이므로, 옆 패널이나 모달 안에 넣어도 저절로 한 칸이 됩니다.
        </p>
      </Block>

      <Block title="5. Your own controls">
        <p className={muted}>
          <code>TxForm.*</code>에 없는 컨트롤은 <code>TxForm.Field</code>로 감쌉니다. 컨트롤의 <code>id</code>를 <code>htmlFor</code>로 넘기면 캡션이 진짜 <code>&lt;label&gt;</code>이 되어 눌렀을 때 포커스가 갑니다. 위 예제의 &quot;좌석&quot;이
          그렇게 만든 칸입니다.
        </p>
        <CodeBlock title="src/SignUp.tsx">{`<TxForm.Field caption="좌석" htmlFor="seats" error={errors.seats}>
  <TxNumberInput id="seats" value={seats} onChange={setSeats} min={1} suffix="석" />
</TxForm.Field>`}</CodeBlock>
        <p className={muted}>
          입력란이 아니라 <code>&lt;div&gt;</code>나 <code>&lt;button&gt;</code>으로 된 컨트롤은 <code>htmlFor</code> 대신 <code>captionId</code>를 주고 컨트롤에 <code>aria-labelledby</code>를 겁니다.
        </p>
      </Block>

      <Block title="6. Denser forms">
        <p className={muted}>오류 문구가 떴다 사라질 때 아래 줄이 밀리지 않도록, 필드는 문구 한 줄 높이를 미리 비워 둡니다. 관리자 화면처럼 빽빽해야 하면 그 자리를 없앨 수 있습니다. 대신 오류가 뜰 때 아래 줄이 밀립니다.</p>
        <CodeBlock language="css" title="app.css">{`.dense-form {
  --tx-form-message-reserve: 0;
}`}</CodeBlock>
        <p className={muted}>
          <code>labelWidth</code>와 이 한 줄을 함께 쓰면 한 줄의 높이가 절반 가까이 줄어듭니다. 같은 필드를 세 가지 밀도로 나란히 놓은 비교는 Storybook의 TxForm › Density에 있습니다.
        </p>
      </Block>

      <p className={muted}>
        필드별 props는{" "}
        <Link to="/api/ui#component-txform" className="underline">
          API › ui › TxForm
        </Link>
        에서 Storybook 문서로 이어집니다.
      </p>
    </Page>
  );
}
