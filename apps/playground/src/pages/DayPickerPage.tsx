import { TxCard, TxFlex } from "@txstack/ui";
// ⬇ 서브패스. 이 import 가 있는 페이지에서만 react-day-picker / dayjs 가 로드된다.
import { TxDayPicker, TxDayPickerRange, TxFormDayPicker, TxFormDayPickerRange } from "@txstack/ui/daypicker";
import { useState } from "react";
import { StateBox } from "./StateBox";

export const DayPickerPage = () => {
  const [single, _single] = useState<Date | undefined>(new Date());
  const [range, _range] = useState<[Date | undefined, Date | undefined]>([undefined, undefined]);
  const [submitted, _submitted] = useState<[Date | undefined, Date | undefined]>([undefined, undefined]);

  return (
    <TxFlex className="flex-col gap-4">
      <TxCard caption="TxDayPicker · TxDayPickerRange">
        <TxCard.Content className="grid gap-3 md:grid-cols-2">
          <TxDayPicker value={single} onChange={_single} />
          <TxDayPickerRange value={range} onChange={_range} />
        </TxCard.Content>
      </TxCard>

      <TxCard caption="확정 플로우 (onSubmit)">
        <TxCard.Content className="grid gap-3 md:grid-cols-2">
          <TxDayPickerRange value={submitted} onSubmit={_submitted} placeholder="선택 후 확인을 눌러야 반영된다" />
          <div className="text-xs text-slate-500 dark:text-slate-400">
            <code>onSubmit</code> 을 주면 패널 안에서 초안(draft)으로 고르고 확인해야 값이 올라간다. 이 플로우는 usertics 판에만 있던 것으로, 이관하면서 채택했다.
          </div>
        </TxCard.Content>
      </TxCard>

      <TxCard caption="TxForm 날짜 필드 — 코어가 아니라 이 서브패스에 있다">
        <TxCard.Content className="grid gap-3 md:grid-cols-2">
          <TxFormDayPicker caption="단일 날짜" value={single} onChange={_single} />
          <TxFormDayPickerRange caption="기간" value={range} onChange={_range} />
        </TxCard.Content>
      </TxCard>

      <StateBox value={{ single, range, submitted }} />
    </TxFlex>
  );
};
