import { TxAgGridProvider } from "@txstack/ui/aggrid";
import { AllCommunityModule, ModuleRegistry, colorSchemeDarkBlue, themeQuartz } from "ag-grid-community";
import { useSyncExternalStore } from "react";
import { AccountsScreen } from "./AccountsScreen";

/**
 * **이 파일은 따로 불러온다**(`React.lazy`). ag-grid 가 무거워서 이 예제를 열 때만 받는다.
 *
 * 모듈 등록과 테마는 실제 앱이라면 진입점(`main.tsx` · `App.tsx`)에서 한 번 하는 일이다.
 * 화면 코드(`AccountsScreen`)에는 그런 것이 없도록 여기로 뗐다.
 */
ModuleRegistry.registerModules([AllCommunityModule]);

/** 사이트의 다크 모드(`<html class="dark">`)를 따라간다. 표 안쪽은 ag-grid 테마가 그린다 */
function useDark() {
  return useSyncExternalStore(
    (notify) => {
      const observer = new MutationObserver(notify);
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
      return () => observer.disconnect();
    },
    () => document.documentElement.classList.contains("dark")
  );
}

export default function AccountsDemo() {
  const dark = useDark();

  return (
    <TxAgGridProvider theme={dark ? themeQuartz.withPart(colorSchemeDarkBlue) : themeQuartz}>
      <AccountsScreen />
    </TxAgGridProvider>
  );
}
