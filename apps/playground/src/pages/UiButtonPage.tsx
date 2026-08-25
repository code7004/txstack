import { TxButton, TxCapsLockCheck, TxCard, TxClipboardButton, TxFlex, TxLoading, TxSpinner, TxTooltip } from "@txstack/ui";
import { useState } from "react";

const wait = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

export const UiButtonPage = () => {
  const [loading, _loading] = useState(false);

  function hdShowLoading() {
    _loading(true);
    window.setTimeout(() => _loading(false), 3000);
  }

  return (
    <TxFlex className="flex-col gap-4">
      <TxCard caption="TxButton — variant">
        <TxCard.Content className="flex flex-wrap gap-2">
          <TxButton className="flex-1" label="primary" variant="primary" />
          <TxButton className="flex-1" label="secondary" variant="secondary" />
          <TxButton className="flex-1" label="danger" variant="danger" />
          <TxButton className="flex-1" label="ghost" variant="ghost" />
          <TxButton className="flex-1" label="text" variant="text" />
        </TxCard.Content>
      </TxCard>

      <TxCard caption="비동기 · 테마 재정의 · 툴팁 · 클립보드">
        <TxCard.Content className="flex flex-wrap items-center gap-2">
          <TxButton label="async (700ms)" onClick={() => wait(700)} />
          <TxButton label="테마 override" theme={{ variants: { primary: "bg-emerald-600 hover:bg-emerald-700" } }} />
          <TxTooltip tip="TxTooltip 내용">
            <TxButton label="hover 해보기" variant="secondary" />
          </TxTooltip>
          <TxClipboardButton text="clipboard 로 복사된 텍스트" />
        </TxCard.Content>
      </TxCard>

      <TxCard caption="TxSpinner · TxLoading · TxCapsLockCheck">
        <TxCard.Content className="flex flex-col gap-3">
          <TxFlex className="items-center gap-3">
            <TxSpinner size="1.5em" />
            <TxButton label={loading ? "로딩 중 (3초)" : "TxLoading 띄우기"} variant="secondary" onClick={hdShowLoading} />
          </TxFlex>
          <div className="text-xs text-slate-500 dark:text-slate-400">아래 입력에 CapsLock 을 켜고 입력해보면 경고가 뜬다.</div>
          <input className="w-64 rounded border border-slate-300 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900" placeholder="CapsLock 테스트" />
          <TxCapsLockCheck preserveSpace={false} />
        </TxCard.Content>
      </TxCard>

      <TxLoading visible={loading} fullScreen />
    </TxFlex>
  );
};
