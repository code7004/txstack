import { TxCard, TxDropdown, TxDropdownMulti, TxFlex, TxForm } from "@txstack/ui";
import { useState } from "react";
import { StateBox } from "./StateBox";

const TEXT_OPTIONS = ["data1", "data2", "data3", "data4", "data5"];
const NUMBER_OPTIONS = Array.from({ length: 10 }, (_, i) => i);

export const UiDropdownPage = () => {
  const [textValue, _textValue] = useState<string | undefined>("data1");
  const [numberValue, _numberValue] = useState<number | undefined>(1);
  const [textValues, _textValues] = useState<string[]>(["data2", "data4"]);
  const [numberValues, _numberValues] = useState<number[]>([2, 4]);
  const [lastEvent, _lastEvent] = useState("");

  return (
    <TxFlex className="flex-col gap-4">
      <TxCard caption="TxDropdown (단일 선택)">
        <TxCard.Content className="grid gap-3 md:grid-cols-2">
          <TxForm.Dropdown caption={`single text: ${textValue ?? "none"}`} data={TEXT_OPTIONS} value={textValue} addNoChoiceItem onChangeText={_textValue} />
          <TxForm.Dropdown caption={`single number: ${numberValue ?? "none"}`} data={NUMBER_OPTIONS} value={numberValue} addNoChoiceItem onChangeNumb={_numberValue} />
          <TxDropdown data={TEXT_OPTIONS} value={textValue} onChangeText={_textValue} />
          <TxDropdown data={NUMBER_OPTIONS} value={numberValue} addNoChoiceItem onChangeValue={(item) => _lastEvent(JSON.stringify(item))} />
        </TxCard.Content>
      </TxCard>

      <TxCard caption="TxDropdownMulti (다중 선택)">
        <TxCard.Content className="grid gap-3 md:grid-cols-2">
          <TxForm.DropdownMulti caption={`multi text: ${textValues.join(", ")}`} data={TEXT_OPTIONS} value={textValues} onChangeText={_textValues} />
          <TxForm.DropdownMulti caption={`multi number: ${numberValues.join(", ")}`} data={NUMBER_OPTIONS} value={numberValues} onChangeNumb={_numberValues} />
          <TxDropdownMulti data={TEXT_OPTIONS} defaultAllCheck onChangeText={_textValues} />
          <TxDropdownMulti data={NUMBER_OPTIONS} defaultAllCheck onChangeValue={(items) => _lastEvent(JSON.stringify(items))} />
        </TxCard.Content>
      </TxCard>

      <StateBox value={{ textValue, numberValue, textValues, numberValues, lastEvent }} />
    </TxFlex>
  );
};
