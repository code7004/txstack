import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type CSSProperties } from "react";
import { TxButton } from "../TxButton";
import { TxCapsLockCheck } from "../TxCapsLockCheck";
import { TxInput } from "../TxInput";
import { TxForm } from "./TxForm";

/** CSS 변수를 인라인 스타일로 주려면 타입을 넓혀야 한다. 스토리에서만 쓴다. */
const vars = (v: Record<`--${string}`, string>) => v as CSSProperties;

const AGES = Array.from({ length: 60 }, (_, i) => i + 20);
const CITIES = ["서울", "부산", "대구", "인천", "광주", "대전", "울산", "세종"];
const TAGS = ["신규", "휴면", "VIP", "블랙"];

/**
 * 검사 규칙을 한곳에 모아 둔다. **정규식과 문구가 짝이다** — 규칙을 고치면 문구도 같이 간다.
 */
const RULES = {
  username: {
    reg: /^[a-zA-Z0-9]{8,20}$/,
    empty: "아이디를 입력하세요",
    message: "아이디는 영문+숫자 8~20자여야 합니다 (특수기호 불가)"
  },
  password: {
    reg: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^\w\s]).{10,}$/,
    empty: "비밀번호를 입력하세요",
    message: "비밀번호는 영문+숫자+특수문자를 포함해 10자 이상이어야 합니다"
  },
  nickname: {
    reg: /^[a-zA-Z0-9가-힣]{2,}$/,
    empty: "닉네임을 입력하세요",
    message: "닉네임은 영문/숫자/한글 2자 이상이어야 합니다 (특수기호 불가)"
  }
} as const;

type SignInForm = Record<keyof typeof RULES, string>;

/** 빈 칸이 먼저고 그다음이 형식이다. 통과한 칸은 키 자체를 만들지 않는다. */
const validate = (form: SignInForm) =>
  Object.fromEntries(
    (Object.keys(RULES) as (keyof SignInForm)[]).map((key) => [key, form[key] === "" ? RULES[key].empty : RULES[key].reg.test(form[key]) ? undefined : RULES[key].message]).filter(([, message]) => message !== undefined)
  ) as Partial<SignInForm>;

const meta = {
  title: "Form/TxForm",
  component: TxForm,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "폼 한 벌. **필드마다 이름과 메시지 자리를 대신 그려 준다.**",
          "",
          "```tsx",
          'import { TxForm } from "@txstack/ui";',
          'import "@txstack/ui/styles.css"; // 앱에서 한 번',
          "",
          '<TxForm labelWidth="6rem" onSubmit={() => save(form)}>',
          '  <TxForm.Input caption="이름" value={name} onChangeText={setName} error={nameError} />',
          '  <TxForm.Dropdown caption="나이" data={AGES} value={age} onChangeNumber={setAge} />',
          "  <TxForm.Flex>",
          '    <TxButton type="submit" label="저장" />',
          '    <TxButton type="reset" label="초기화" variant="secondary" />',
          "  </TxForm.Flex>",
          "</TxForm>;",
          "```",
          "",
          "필드는 열 개다.",
          "",
          "```tsx",
          "<TxForm.Input />  <TxForm.SearchInput />  <TxForm.Textarea />  <TxForm.Combobox />",
          "<TxForm.Dropdown />  <TxForm.DropdownMulti />  <TxForm.CheckBox />",
          "<TxForm.Field />  <TxForm.Flex />  <TxForm.Label />",
          "```",
          "",
          "- **`caption` 은 진짜 이름이다.** 눌러도 컨트롤로 포커스가 가고, 스크린리더가 그 이름으로 읽는다",
          "- `error` 를 주면 컨트롤이 **잘못된 값**으로 표시되고 메시지가 그 컨트롤의 설명으로 이어진다",
          "- `warning` 과 `error` 는 **자리가 하나다.** 둘 다 주면 `error` 가 보인다",
          "- 메시지 자리는 비어 있어도 잡아 둔다. 에러가 떴다 사라져도 아래 줄이 밀리지 않는다",
          "- `onSubmit` 은 `preventDefault` 가 이미 걸려 있다",
          "- **감싼 컴포넌트의 props 를 전부 그대로 받는다.** `className` 만 필드 상자가 가져간다",
          "",
          "> **날짜 필드는 여기 없다.** `react-day-picker` 를 설치하지 않은 소비자도 이 배럴을",
          "> 쓸 수 있어야 하므로 `TxFormDayPicker` · `TxFormDayPickerRange` 는",
          "> `@txstack/ui/daypicker` 가 가져간다.",
          "",
          "컨트롤 패널은 `Playground` 에서만 동작한다."
        ].join("\n")
      }
    }
  },
  argTypes: {
    labelWidth: { control: "text", description: "캡션 너비. **CSS 길이**를 준다 — 주면 캡션이 왼쪽으로 간다" },
    className: { control: "text", description: "`.tx-form` 에 덧붙는다 (교체 아님)" },
    onSubmit: { control: false }
  }
} satisfies Meta<typeof TxForm>;

export default meta;
type Story = StoryObj<typeof meta>;

const noControls = { controls: { disable: true } };

export const Playground: Story = {
  args: { labelWidth: "", className: "" },
  render: (args) => (
    <TxForm {...args} labelWidth={args.labelWidth || undefined}>
      <TxForm.Input caption="이름" placeholder="홍길동" />
      <TxForm.Dropdown caption="나이" data={AGES} placeholder="고르세요" />
      <TxForm.Textarea caption="메모" rows={3} placeholder="자유롭게" />
    </TxForm>
  )
};

/** 필드 일곱 종류. 전부 같은 자리에 이름과 메시지를 그린다. */
export const Fields: Story = {
  parameters: noControls,
  render: () => (
    <TxForm className="max-w-md">
      <TxForm.Input caption="이름" placeholder="홍길동" />
      <TxForm.SearchInput caption="키워드" placeholder="검색어를 넣고 Enter" />
      <TxForm.Textarea caption="메모" rows={3} autoGrow placeholder="줄을 늘리면 따라 커집니다" />
      <TxForm.Dropdown caption="나이" data={AGES} placeholder="고르세요" />
      <TxForm.DropdownMulti caption="태그" data={TAGS} placeholder="여러 개" />
      <TxForm.Combobox caption="도시" data={CITIES} placeholder="목록에 없는 곳도 됩니다" />
      <TxForm.CheckBox caption="약관" label="이용약관에 동의합니다" />
    </TxForm>
  )
};

/**
 * **`error` 가 `warning` 을 가린다.** 자리가 하나다.
 *
 * `error` 가 있는 칸은 스크린리더에도 "잘못된 값" 으로 전달되고, 메시지가 그 칸의 설명으로 붙는다.
 * 아무 메시지가 없는 칸도 **자리는 잡고 있다** — 그래서 에러가 떴다 사라져도 줄이 흔들리지 않는다.
 */
export const Messages: Story = {
  parameters: noControls,
  render: () => (
    <TxForm className="max-w-md">
      <TxForm.Input caption="정상" placeholder="메시지 없음" />
      <TxForm.Input caption="경고" warning="곧 사용할 수 없는 형식입니다" placeholder="warning" />
      <TxForm.Input caption="에러" error="필수 항목입니다" placeholder="error" />
      <TxForm.Input caption="둘 다" warning="경고" error="에러가 자리를 가져간다" placeholder="warning + error" />
    </TxForm>
  )
};

/** 메시지가 떴다 사라져도 **아래 줄이 밀리지 않는다.** 버튼으로 켜고 꺼 보라. */
export const MessageDoesNotPush: Story = {
  parameters: noControls,
  render: function MessageStory() {
    const [invalid, setInvalid] = useState(false);

    return (
      <TxForm className="max-w-md">
        <TxForm.Input caption="아이디" error={invalid ? "이미 쓰는 아이디입니다" : undefined} placeholder="영문 소문자" />
        <TxForm.Input caption="이름" placeholder="아래 칸은 그대로 있어야 한다" />
        <TxButton label={invalid ? "에러 지우기" : "에러 띄우기"} variant="secondary" onClick={() => setInvalid((prev) => !prev)} />
      </TxForm>
    );
  }
};

/**
 * `labelWidth` 를 주면 **캡션이 왼쪽으로 가고** 그 너비로 정렬된다. 안 주면 위에 쌓인다.
 *
 * CSS 길이를 준다 — `"6rem"` · `"120px"`. 필드마다 지정하지 않는다.
 */
export const LabelWidth: Story = {
  parameters: noControls,
  render: () => (
    <div className="flex flex-col gap-8">
      {[undefined, "5rem", "9rem"].map((width) => (
        <TxForm key={width ?? "stack"} labelWidth={width} className="max-w-md">
          <TxForm.Input caption={width ? `labelWidth="${width}"` : "labelWidth 없음"} placeholder="첫 칸" />
          <TxForm.Dropdown caption="나이" data={AGES} placeholder="같은 너비로 정렬된다" />
        </TxForm>
      ))}
    </div>
  )
};

/**
 * **밀도는 배치가 정한다. 새 prop 은 없다.**
 *
 * 세로로 쌓으면 캡션이 한 줄을 차지하고, `labelWidth` 를 주면 그 줄이 통째로 사라진다.
 * 메시지 자리까지 안 잡으면 가장 조밀해진다 — 대신 메시지가 뜰 때 아래 줄이 밀린다.
 *
 * 아래 세 폼은 **같은 필드**다. 한 행이 차지하는 높이만 다르다.
 */
export const Density: Story = {
  parameters: noControls,
  render: () => (
    <div className="flex flex-col gap-8">
      {(
        [
          { label: "기본 — 세로 쌓기", labelWidth: undefined, tight: false },
          { label: "labelWidth — 캡션이 왼쪽으로", labelWidth: "5rem", tight: false },
          { label: "labelWidth + 메시지 자리 안 잡기", labelWidth: "5rem", tight: true }
        ] as const
      ).map(({ label, labelWidth, tight }) => (
        <div key={label} className="flex flex-col gap-2">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400">{label}</div>
          <TxForm labelWidth={labelWidth} className="max-w-md" style={tight ? vars({ "--tx-form-message-reserve": "0" }) : undefined}>
            <TxForm.Input caption="이름" placeholder="홍길동" />
            <TxForm.Input caption="연락처" placeholder="010-0000-0000" />
            <TxForm.Dropdown caption="나이" data={AGES} placeholder="고르세요" />
          </TxForm>
        </div>
      ))}
    </div>
  )
};

/**
 * `TxForm` 은 세로 한 줄이 기본이다. **`className` 으로 그리드를 주면 그대로 따른다** —
 * 기본 클래스를 교체하는 게 아니라 덧붙는다.
 *
 * `TxForm.Flex` 는 한 줄에 여럿을 놓는 자리다. **자식이 남는 폭을 똑같이 나눠 갖는다.**
 */
export const Layout: Story = {
  parameters: noControls,
  render: () => (
    <TxForm className="grid max-w-2xl grid-cols-2 gap-3">
      <TxForm.Input caption="이름" placeholder="한 칸" />
      <TxForm.Input caption="연락처" placeholder="한 칸" />
      <TxForm.Textarea caption="메모" rows={2} className="col-span-2" placeholder="className 은 필드 상자로 간다" />
      <TxForm.Flex className="col-span-2">
        <TxButton type="submit" label="저장" />
        <TxButton type="reset" label="초기화" variant="secondary" />
      </TxForm.Flex>
    </TxForm>
  )
};

/** 제출하면 아래에 값이 찍힌다. `onSubmit` 은 `preventDefault` 가 이미 걸려 있다. */
export const Submit: Story = {
  parameters: noControls,
  render: function SubmitStory() {
    const [result, setResult] = useState("—");

    return (
      <TxForm
        labelWidth="5rem"
        className="max-w-md"
        onSubmit={(e) => {
          const data = [...new FormData(e.currentTarget).entries()];
          setResult(data.length === 0 ? "(빈 폼)" : data.map(([k, v]) => `${k}=${v}`).join(" · "));
        }}
        onReset={() => setResult("—")}
      >
        <TxForm.Input caption="이름" name="name" placeholder="홍길동" />
        <TxForm.Combobox caption="도시" name="city" data={CITIES} placeholder="골라도 되고 쳐도 된다" />
        <TxForm.CheckBox label="소식 받기" name="news" value="on" />
        <TxForm.Flex>
          <TxButton type="submit" label="제출" />
          <TxButton type="reset" label="초기화" variant="secondary" />
        </TxForm.Flex>
        <div className="font-mono text-sm text-slate-500 dark:text-slate-400">제출된 값: {result}</div>
      </TxForm>
    );
  }
};

/**
 * **실제로 쓰는 모양.** 정규식으로 검사하고 결과를 그 칸의 `error` 로 돌려준다.
 *
 * - **제출하기 전에는 조용하다.** 한 번 제출한 뒤부터는 고칠 때마다 바로 다시 검사한다 —
 *   아직 다 치지도 않았는데 빨간 글씨가 뜨는 것을 막는다
 * - 규칙은 통과했지만 더 나은 값이 있으면 `warning` 으로 알린다. **막지는 않는다**
 * - 비밀번호 칸은 `TxCapsLockCheck` 로 감쌌다. **그 안에서 누른 키만 본다**
 *
 * 아무 값이나 넣고 **sign in** 을 눌러 보라. 스크린리더를 켜면 잘못된 칸이
 * "잘못된 값" 으로 읽히고 그 자리에서 이유까지 읽어 준다.
 */
export const Validation: Story = {
  parameters: noControls,
  render: function ValidationStory() {
    const [form, setForm] = useState<SignInForm>({ username: "", password: "", nickname: "" });
    const [checking, setChecking] = useState(false);
    const [done, setDone] = useState("");

    // 제출하기 전에는 검사하지 않는다.
    const errors = checking ? validate(form) : {};

    // 규칙은 통과했지만 권하고 싶은 것. 에러가 있으면 그쪽이 자리를 가져간다.
    const passwordWarning = !errors.password && form.password.length > 0 && form.password.length < 12 ? "12자 이상이면 더 안전합니다" : undefined;

    const patch = (next: Partial<SignInForm>) => {
      setForm((prev) => ({ ...prev, ...next }));
      setDone("");
    };

    return (
      <TxForm
        labelWidth="5rem"
        className="max-w-md"
        onSubmit={() => {
          setChecking(true);
          setDone(Object.keys(validate(form)).length === 0 ? "통과 — 이제 서버로 보내면 된다" : "");
        }}
      >
        <TxForm.Input caption="아이디" name="username" autoComplete="off" value={form.username} onChangeText={(username) => patch({ username })} error={errors.username} />

        <TxCapsLockCheck text="Caps Lock 이 켜져 있습니다">
          <TxForm.Input caption="비밀번호" name="password" type="password" autoComplete="off" value={form.password} onChangeText={(password) => patch({ password })} error={errors.password} warning={passwordWarning} />
        </TxCapsLockCheck>

        <TxForm.Input caption="닉네임" name="nickname" value={form.nickname} onChangeText={(nickname) => patch({ nickname })} error={errors.nickname} />

        <TxForm.Flex>
          <TxButton type="submit" label="sign in" />
        </TxForm.Flex>

        {done && <div className="text-sm text-slate-500 dark:text-slate-400">{done}</div>}
      </TxForm>
    );
  }
};

/**
 * **손수 짠 컨트롤도 같은 줄맞춤에 들어간다.**
 *
 * `htmlFor` 를 주면 캡션이 그 컨트롤의 이름이 되고, 메시지 요소의 `id` 는
 * `` `${htmlFor}-message` `` 로 정해진다 — 그것만 알면 `aria-describedby` 를 직접 걸 수 있다.
 */
export const CustomField: Story = {
  parameters: noControls,
  render: () => (
    <TxForm className="max-w-md">
      <TxForm.Field caption="색" htmlFor="pick-color" warning="브라우저 기본 색 선택기를 씁니다">
        <input id="pick-color" type="color" defaultValue="#3b82f6" aria-describedby="pick-color-message" className="h-10 w-full" />
      </TxForm.Field>

      <TxForm.Flex>
        <TxForm.Label htmlFor="port">포트</TxForm.Label>
        <TxInput id="port" type="number" defaultValue={6310} />
      </TxForm.Flex>
    </TxForm>
  )
};

/**
 * 겉모습은 **CSS 변수**로 바꾼다. 앱 전체는 `:root`, 이 폼만은 `.tx-form` 에 준다.
 *
 * 메시지 자리를 안 쓰는 폼은 `--tx-form-message-reserve: 0` 한 줄로 되돌린다.
 */
export const Tokens: Story = {
  parameters: noControls,
  render: () => (
    <div className="flex flex-col gap-8">
      <TxForm className="max-w-md" style={vars({ "--tx-form-gap": "1.25rem", "--tx-form-caption-font-size": "1rem", "--tx-form-caption-color": "var(--tx-color-primary)" })}>
        <TxForm.Input caption="캡션이 크고 파랗다" placeholder="--tx-form-caption-*" />
        <TxForm.Input caption="줄 간격도 넓다" placeholder="--tx-form-gap" />
      </TxForm>

      <TxForm className="max-w-md" style={vars({ "--tx-form-message-reserve": "0", "--tx-form-gap": "0.5rem" })}>
        <TxForm.CheckBox label="메시지 자리를 안 잡는다" />
        <TxForm.CheckBox label="촘촘한 목록에 쓴다" />
        <TxForm.CheckBox label="--tx-form-message-reserve: 0" />
      </TxForm>
    </div>
  )
};

/**
 * **키보드로만 다뤄 보라.**
 *
 * Tab 이 캡션을 건너뛰고 컨트롤만 지난다. 드롭다운은 Enter·↓ 로 열리고 Tab 으로 빠져나온다.
 * 스크린리더를 켜면 각 칸이 캡션 이름으로 읽히고, 에러가 있는 칸은 "잘못된 값" 과 함께 메시지까지 읽어 준다.
 */
export const Keyboard: Story = {
  parameters: noControls,
  render: () => (
    <TxForm labelWidth="5rem" className="max-w-md">
      <TxForm.Input caption="이름" placeholder="Tab 으로 여기부터" />
      <TxForm.Dropdown caption="나이" data={AGES} placeholder="Enter 로 연다" />
      <TxForm.Combobox caption="도시" data={CITIES} error="목록에 없는 값입니다" />
      <TxForm.CheckBox label="Space 로 켠다" />
    </TxForm>
  )
};
