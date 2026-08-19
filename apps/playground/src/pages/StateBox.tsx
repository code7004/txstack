import { TxCard } from "@txstack/ui";

/** 각 페이지 하단에 현재 상태를 그대로 보여주는 공용 박스. */
export const StateBox = ({ caption = "현재 상태", value }: { caption?: string; value: unknown }) => (
  <TxCard caption={caption}>
    <TxCard.Content>
      <pre className="overflow-x-auto text-xs whitespace-pre-wrap">{JSON.stringify(value, null, 2)}</pre>
    </TxCard.Content>
  </TxCard>
);
