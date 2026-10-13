import { useState, type FormEvent } from "react";
import { TxButton, TxForm, TxToast } from "@txstack/ui";

export function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  const submit = (event: FormEvent) => {
    event.preventDefault();

    const next = {
      name: name.trim() ? undefined : "이름을 넣어 주세요",
      email: email.includes("@") ? undefined : "메일 형식이 아닙니다"
    };
    setErrors(next);

    if (!next.name && !next.email) TxToast.show({ variant: "success", title: "가입했습니다", message: email });
  };

  return (
    <TxForm noValidate labelWidth="4rem" onSubmit={submit}>
      <TxForm.Input caption="이름" placeholder="홍길동" value={name} onChangeText={setName} error={errors.name} required />
      <TxForm.Input caption="메일" type="email" placeholder="you@company.com" value={email} onChangeText={setEmail} error={errors.email} required />
      <TxButton type="submit" label="가입" />
    </TxForm>
  );
}
