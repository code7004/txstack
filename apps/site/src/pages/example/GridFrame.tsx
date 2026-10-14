import { TxAgGridProvider } from "@txstack/ui/aggrid";
import { AllCommunityModule, ModuleRegistry, colorSchemeDarkBlue, themeQuartz } from "ag-grid-community";
import { useSyncExternalStore, type ReactNode } from "react";

/**
 * 표를 쓰는 예제의 바깥 틀. **실제 앱이라면 진입점(`main.tsx` · `App.tsx`)에서 한 번 하는 일**이다 —
 * ag-grid 모듈 등록과 테마. 화면 코드에는 그런 것이 없도록 여기로 뗐다.
 *
 * 이 파일을 import 하는 쪽은 `React.lazy` 로 불러온다. ag-grid 가 무거워서 그 예제를 열 때만 받는다.
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

export function GridFrame({ children }: { children: ReactNode }) {
  const dark = useDark();
  return <TxAgGridProvider theme={dark ? themeQuartz.withPart(colorSchemeDarkBlue) : themeQuartz}>{children}</TxAgGridProvider>;
}
