import { TxButton, TxCard, TxContextMenu, TxDropMenu, TxFlex, TxModal, TxSlidePanel, TxTabs } from "@txstack/ui";
import { useState } from "react";
import { StateBox } from "./StateBox";

const TABS = ["첫번째", "두번째", "세번째"];

export const UiOverlayPage = () => {
  const [modalVisible, _modalVisible] = useState(false);
  const [panelOpen, _panelOpen] = useState(false);
  const [tab, _tab] = useState(0);
  const [lastMenu, _lastMenu] = useState("");

  return (
    <TxFlex className="flex-col gap-4">
      <TxCard caption="TxTabs">
        <TxCard.Content>
          <TxTabs tabs={TABS} value={tab} onChange={_tab} />
          <div className="pt-3 text-sm">선택된 탭: {TABS[tab]}</div>
        </TxCard.Content>
      </TxCard>

      <TxCard caption="TxDropMenu — hover 로 열고, 패널까지 마우스를 옮겨도 닫히지 않는다">
        <TxCard.Content className="flex flex-wrap items-center gap-2">
          <TxDropMenu label={<TxButton label="hover 메뉴" variant="secondary" />}>
            <TxDropMenu.Item onClick={() => _lastMenu("첫번째 항목")}>첫번째 항목</TxDropMenu.Item>
            <TxDropMenu.Item onClick={() => _lastMenu("두번째 항목")}>두번째 항목</TxDropMenu.Item>
            <TxDropMenu.Divider />
            <TxDropMenu.Item onClick={() => _lastMenu("마지막 항목")}>마지막 항목</TxDropMenu.Item>
          </TxDropMenu>
          <TxDropMenu trigger="click" label={<TxButton label="click 메뉴" variant="secondary" />}>
            <TxDropMenu.Item onClick={() => _lastMenu("click 항목")}>click 으로 열린 항목</TxDropMenu.Item>
            <TxDropMenu.LinkItem to="/route-meta">route-meta 로 이동</TxDropMenu.LinkItem>
          </TxDropMenu>
          <span className="text-xs text-slate-500 dark:text-slate-400">트리거에서 패널로 마우스를 옮기는 동안 닫히지 않는 것이 usertics 에서 가져온 개선점이다.</span>
        </TxCard.Content>
      </TxCard>

      <TxCard caption="TxContextMenu — 아래 영역에서 우클릭">
        <TxCard.Content>
          <TxContextMenu
            options={[{ label: "복사", onClick: () => _lastMenu("컨텍스트: 복사") }, { label: "붙여넣기", onClick: () => _lastMenu("컨텍스트: 붙여넣기") }, { type: "divider" }, { label: "삭제", onClick: () => _lastMenu("컨텍스트: 삭제") }]}
          >
            <div className="grid h-24 place-items-center rounded border border-dashed border-slate-300 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">여기서 우클릭</div>
          </TxContextMenu>
        </TxCard.Content>
      </TxCard>

      <TxCard caption="TxModal · TxSlidePanel">
        <TxCard.Content className="flex flex-wrap gap-2">
          <TxButton label="모달 열기" onClick={() => _modalVisible(true)} />
          <TxButton label="슬라이드 패널 열기" variant="secondary" onClick={() => _panelOpen(true)} />
        </TxCard.Content>
      </TxCard>

      <StateBox value={{ tab, lastMenu }} />

      <TxModal title="TxModal" visible={modalVisible} onExit={() => _modalVisible(false)}>
        <TxFlex className="flex-col gap-4">
          <p className="text-sm">모달 본문 영역이다. 바깥을 클릭하거나 닫기 버튼으로 닫힌다.</p>
          <TxButton label="닫기" variant="secondary" onClick={() => _modalVisible(false)} />
        </TxFlex>
      </TxModal>

      <TxSlidePanel open={panelOpen} side="right" title="TxSlidePanel" onClose={() => _panelOpen(false)}>
        <div className="flex flex-col gap-4 p-4">
          <p className="text-sm">오른쪽에서 밀려 나오는 패널이다. ESC 나 배경 클릭으로도 닫힌다.</p>
          <TxButton label="닫기" variant="secondary" onClick={() => _panelOpen(false)} />
        </div>
      </TxSlidePanel>
    </TxFlex>
  );
};
