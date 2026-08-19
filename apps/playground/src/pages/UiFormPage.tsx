import { TxButton, TxCard, TxCheckBox, TxFlex, TxForm } from "@txstack/ui";
import { useState } from "react";
import { StateBox } from "./StateBox";

const AGE_OPTIONS = Array.from({ length: 100 }, (_, i) => i);
const EMPTY = { id: "", name: "", age: 20, memo: "", active: false };

export const UiFormPage = () => {
  const [form, _form] = useState({ id: "", name: "", age: 20, memo: "memo", active: true });
  const [submitted, _submitted] = useState<unknown>(null);

  return (
    <TxFlex className="flex-col gap-4">
      <TxCard caption="TxForm">
        <TxCard.Content>
          <TxForm className="grid gap-3 md:grid-cols-2" labelWidth="w-24" onSubmit={() => _submitted(form)} onReset={() => (_form(EMPTY), _submitted(null))}>
            <TxForm.Input caption="ID" value={form.id} onChangeText={(id) => _form((prev) => ({ ...prev, id }))} />
            <TxForm.Input caption="Name" value={form.name} onChangeText={(name) => _form((prev) => ({ ...prev, name }))} />
            <TxForm.Dropdown caption="Age" data={AGE_OPTIONS} value={form.age} onChangeNumb={(age) => _form((prev) => ({ ...prev, age: age ?? 0 }))} />
            <TxForm.Textarea caption="Memo" value={form.memo} onChangedText={(memo) => _form((prev) => ({ ...prev, memo }))} />
            <TxCheckBox label="Active" value={form.active} onChangeBool={(active) => _form((prev) => ({ ...prev, active }))} />
            <TxFlex className="gap-2 md:col-span-2">
              <TxButton type="submit" label="Submit" className="flex-1" />
              <TxButton type="reset" label="Reset" variant="secondary" className="flex-1" />
            </TxFlex>
          </TxForm>
        </TxCard.Content>
      </TxCard>

      <TxCard caption="날짜 필드는 서브패스에 있다">
        <TxCard.Content className="text-sm text-slate-600 dark:text-slate-300">
          코어의 <code>TxForm</code> 에는 <code>.DayPicker</code> 가 붙어 있지 않다. <code>react-day-picker</code> 를 optional peer 로 두기 위해 <code>@txstack/ui/daypicker</code> 의 <code>TxFormDayPicker</code> 로 분리했다. 좌측 <b>DayPicker ↗</b>{" "}
          메뉴에서 확인할 수 있다.
        </TxCard.Content>
      </TxCard>

      <StateBox caption="폼 상태 / 제출 결과" value={{ form, submitted }} />
    </TxFlex>
  );
};
