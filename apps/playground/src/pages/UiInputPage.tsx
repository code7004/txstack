import { TxCard, TxCheckBox, TxFlex, TxForm, TxInput, TxSearchInput, TxTextarea } from "@txstack/ui";
import { useState } from "react";
import { StateBox } from "./StateBox";

export const UiInputPage = () => {
  const [controlledText, _controlledText] = useState("controlled");
  const [submittedText, _submittedText] = useState("submit only");
  const [submittedNumber, _submittedNumber] = useState<number | undefined>(100000);
  const [memo, _memo] = useState("여러 줄 입력");
  const [checked, _checked] = useState(true);

  return (
    <TxFlex className="flex-col gap-4">
      <TxCard caption="TxInput">
        <TxCard.Content className="grid gap-3 md:grid-cols-2">
          <TxForm.Input caption="Controlled text" value={controlledText} onChangeText={_controlledText} />
          <TxForm.Input caption="Submit text (엔터/블러)" defaultValue={submittedText} onSubmitText={_submittedText} />
          <TxForm.Input caption="Submit number" defaultValue={submittedNumber} type="number" min={0} step={100000} onSubmitNumber={_submittedNumber} onBlurNumber={_submittedNumber} />
          <TxInput placeholder="Bare TxInput" onChangeText={_controlledText} />
        </TxCard.Content>
      </TxCard>

      <TxCard caption="TxSearchInput">
        <TxCard.Content className="grid gap-3 md:grid-cols-2">
          <TxForm.SearchInput caption="Form SearchInput" defaultValue={submittedText} onSubmitText={_submittedText} onClear={() => _submittedText("")} />
          <TxSearchInput defaultValue={submittedText} onSubmitText={_submittedText} onClear={() => _submittedText("")} />
        </TxCard.Content>
      </TxCard>

      <TxCard caption="TxTextarea · TxCheckBox">
        <TxCard.Content className="grid gap-3 md:grid-cols-2">
          <TxTextarea value={memo} onChangedText={_memo} />
          <TxCheckBox label="Active" value={checked} onChangeBool={_checked} />
        </TxCard.Content>
      </TxCard>

      <StateBox value={{ controlledText, submittedText, submittedNumber, memo, checked }} />
    </TxFlex>
  );
};
