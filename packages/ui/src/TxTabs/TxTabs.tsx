import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react";
import { cm, themeMerge } from "..";
import { TxTabsTheme } from "./TxTabs.theme";
import type { ITxTabRenderHeadProps, ITxTabs } from "./TxTabs.types";

function resolveTabTitle(title: React.ReactNode, locale: (key: string) => string) {
  if (typeof title === "string") return locale(title);
  return title;
}

export const TxTabs = forwardRef(({ tabs, locale = (k: string) => k, className, theme, value, renderHead, renderBody, onChange }: ITxTabs, ref) => {
  const stableTheme = useMemo(() => themeMerge(TxTabsTheme, theme, "override"), [theme]);
  const [activeIdx, _activeIdx] = useState(value || 0);

  useEffect(() => {
    if (value != null) _activeIdx(value);
  }, [value]);

  const changeTab = (idx: number) => _activeIdx(idx);
  useImperativeHandle(ref, () => ({ changeTab }), []);

  // 문자열 탭은 locale을 적용하고, 아이콘 같은 ReactNode는 그대로 렌더링한다.
  const defaultRenderHead = ({ title, isActive, theme, onClick }: ITxTabRenderHeadProps) => {
    return (
      <button role="tab" onClick={onClick} className={`${stableTheme.headBase} ${isActive ? theme?.headActive : theme?.headInner}`}>
        {resolveTabTitle(title, locale)}
      </button>
    );
  };

  function hdChange(next: number) {
    if (activeIdx == next) return;
    _activeIdx(next);
    onChange?.(next);
  }

  return (
    <div className={cm(stableTheme.wrapper, className)} data-tag="TxTabs">
      <div className={stableTheme.headWrapper} role="tablist">
        {tabs.map((tab, idx) => {
          const Head = renderHead || defaultRenderHead;
          return <React.Fragment key={idx}>{Head({ title: tab, theme: stableTheme, isActive: activeIdx === idx, onClick: () => hdChange(idx) })}</React.Fragment>;
        })}
      </div>

      {renderBody && <div className={stableTheme.body}>{renderBody({ name: tabs[activeIdx], index: activeIdx })}</div>}
    </div>
  );
});

TxTabs.displayName = "TxTabs";
