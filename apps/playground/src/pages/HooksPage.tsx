import { useSafePolling, useStateForObject } from "@txstack/hooks";
import { useUrlQuery } from "@txstack/hooks/router";
import { TxButton, TxCard, TxFlex, TxForm } from "@txstack/ui";
import { useState } from "react";
import { StateBox } from "./StateBox";

interface IDemoQuery {
  keyword: string;
  page: number;
  onlyActive: boolean;
}

export const HooksPage = () => {
  // 1) useUrlQuery — 상태가 URL 에 남는다. 새로고침·뒤로가기·링크공유가 그대로 동작한다.
  const [query, _query] = useUrlQuery<IDemoQuery>({
    defaults: { keyword: "", page: 1, onlyActive: false },
    queryTypes: { page: "number", onlyActive: "boolean" }
  });

  // 2) useStateForObject — 객체 부분 갱신
  const [filter, _filter] = useStateForObject({ from: "2026-01-01", to: "2026-12-31", limit: 50 });

  // 3) useSafePolling — 이전 실행이 안 끝났으면 다음 tick 을 건너뛴다
  const [ticks, _ticks] = useState(0);
  const [running, _running] = useState(false);
  const { start, stop } = useSafePolling(async () => {
    await new Promise((resolve) => setTimeout(resolve, 1500)); // 인터벌(1s)보다 느린 작업
    _ticks((prev) => prev + 1);
  }, 1000);

  return (
    <TxFlex className="flex-col gap-4">
      <TxCard caption="useUrlQuery — 주소창을 보면서 조작해보라">
        <TxCard.Content className="grid gap-3 md:grid-cols-3">
          <TxForm.Input caption="keyword" value={query.keyword} onChangeText={(keyword) => _query({ keyword })} />
          <TxForm.Input caption="page" type="number" value={query.page} onChangeNumber={(page) => _query({ page: page ?? 1 })} />
          <TxFlex className="items-end gap-2">
            <TxButton label={`onlyActive: ${query.onlyActive}`} variant="secondary" onClick={() => _query((prev) => ({ onlyActive: !prev.onlyActive }))} />
            <TxButton label="초기화" variant="ghost" onClick={() => _query({ keyword: "", page: 1, onlyActive: false })} />
          </TxFlex>
        </TxCard.Content>
      </TxCard>

      <TxCard caption="useStateForObject — 부분 갱신">
        <TxCard.Content className="flex flex-wrap gap-2">
          <TxButton label="limit = 100" variant="secondary" onClick={() => _filter({ limit: 100 })} />
          <TxButton label="from 만 변경" variant="secondary" onClick={() => _filter({ from: "2026-06-01" })} />
          <TxButton label="되돌리기" variant="ghost" onClick={() => _filter({ from: "2026-01-01", to: "2026-12-31", limit: 50 })} />
        </TxCard.Content>
      </TxCard>

      <TxCard caption="useSafePolling — 1초 간격 / 작업은 1.5초">
        <TxCard.Content className="flex flex-col gap-2">
          <TxFlex className="gap-2">
            <TxButton label="시작" onClick={() => (start(), _running(true))} />
            <TxButton label="정지" variant="secondary" onClick={() => (stop(), _running(false))} />
          </TxFlex>
          <p className="text-xs text-slate-500 dark:text-slate-400">인터벌보다 작업이 느린데도 실행이 겹치지 않는다. 카운트는 약 1.5초에 1씩만 올라간다 — 겹쳐 돌면 1초에 1씩 올라갔을 것이다.</p>
        </TxCard.Content>
      </TxCard>

      <StateBox value={{ urlQuery: query, filter, polling: { running, ticks } }} />
    </TxFlex>
  );
};
