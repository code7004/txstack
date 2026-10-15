import { lazy, type ComponentType, type LazyExoticComponent } from "react";

/** 라우트의 화면. 처음 그릴 때 받아 온다. `source` 는 그 화면의 소스 파일(`pages/…`) — 사이트 검색이 섹션 제목을 읽는 자리다 */
export type Page = LazyExoticComponent<ComponentType> & { source: string };

/**
 * **화면을 그 주소에 처음 들어올 때 받는다.** 모든 화면을 첫 번들에 실으면 Home 을 보려고 Example 의 표 코드까지 받는다.
 *
 * ```ts
 * const Start = page(() => import("./pages/Start"), "Start", "pages/Start.tsx");
 * ```
 *
 * 화면이 이름 있는 export 라 `name` 으로 꺼낸다. `source` 는 import 경로와 같은 파일을 가리켜야 한다 —
 * 바로 옆에 적어 어긋나기 어렵게 했다.
 */
export function page<M extends Record<string, unknown>>(load: () => Promise<M>, name: keyof M & string, source: string): Page {
  const component = lazy(async () => ({ default: (await load())[name] as ComponentType }));
  return Object.assign(component, { source });
}
