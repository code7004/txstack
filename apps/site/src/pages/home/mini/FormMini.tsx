import { TxForm } from "@txstack/ui";
import { useState } from "react";

export function FormMini() {
  const [email, setEmail] = useState("kim@");
  const error = email && !/^\S+@\S+\.\S+$/.test(email) ? "메일 형식이 아닙니다" : undefined;

  return (
    <TxForm noValidate onSubmit={() => undefined}>
      <TxForm.Input caption="메일" value={email} onChangeText={setEmail} error={error} />
      <TxForm.CheckBox caption="약관" label="이용약관에 동의합니다" />
    </TxForm>
  );
}
