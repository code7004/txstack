import { TxCard, TxCoolTable, TxFlex, TxJsonTree } from "@txstack/ui";
import { useState } from "react";
import { StateBox } from "./StateBox";

// 정렬 검증용이라 일부러 섞어 둔다. `amount` 에 undefined 를 하나 넣어 null 정렬 위치까지 본다.
const ROWS: { id: number; name: string; amount?: number; active: boolean }[] = [
  { id: 2, name: "mika", amount: 840000, active: true },
  { id: 4, name: "toby", amount: undefined, active: false },
  { id: 3, name: "june", amount: 3120000, active: false },
  { id: 1, name: "alex", amount: 1250000, active: true }
];

export const UiDataPage = () => {
  const [lastEvent, _lastEvent] = useState("");

  return (
    <TxFlex className="flex-col gap-4">
      <TxCard caption="TxCard" header="header 슬롯" footer="footer 슬롯">
        <TxCard.Content>
          <p className="text-sm">TxCard 는 caption / header / content / footer 슬롯을 가진다.</p>
        </TxCard.Content>
      </TxCard>

      <TxCard caption="TxJsonTree">
        <TxCard.Content>
          <TxJsonTree
            data={{ id: 0, ok: false, empty: "", list: [true, null, 3], nested: { status: "active", count: 3 } }}
            isRootType
            onClick={(path, value) => _lastEvent(`click ${path} = ${JSON.stringify(value)}`)}
            onEdit={(path, next, prev) => _lastEvent(`edit ${path}: ${JSON.stringify(prev)} → ${JSON.stringify(next)}`)}
          />
          <p className="pt-2 text-xs text-slate-500 dark:text-slate-400">
            <code>id: 0</code> / <code>ok: false</code> / <code>empty: &quot;&quot;</code> 같은 falsy 값도 그대로 보여야 한다. (원본 저장소 중 하나에는 이걸 숨기는 가드가 있었고, 이관하면서 제외했다)
          </p>
        </TxCard.Content>
      </TxCard>

      <TxCard caption="TxCoolTable (deprecated — 정렬 동작 확인용)">
        <TxCard.Content>
          <TxCoolTable data={ROWS} options={{ sortColumns: "*" }} />
          <p className="pt-2 text-xs text-slate-500 dark:text-slate-400">
            헤더를 클릭하면 클라이언트에서 정렬된다. lodash <code>orderBy</code> 를 걷어낸 자리라, 값이 없는 <code>toby</code> 행이 오름차순에서 맨 뒤로 가는지까지 확인하는 화면이다. (<code>onClickHeader</code> 를 주면 클라이언트 정렬 대신 이벤트만
            올라간다 — 서버 정렬용 모드)
          </p>
        </TxCard.Content>
      </TxCard>

      <StateBox caption="마지막 이벤트" value={{ lastEvent }} />
    </TxFlex>
  );
};
