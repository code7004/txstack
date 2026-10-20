/**
 * 사이트 검색의 순위. **아무것도 import 하지 않는다** — 색인(`searchIndex.ts`)은 사이트 전체를
 * 끌어오지만, 순위는 글자만 다루므로 따로 떼어 테스트한다.
 */

export type SearchKind = "page" | "section" | "api" | "component";

export interface SearchEntry {
  /** 결과의 이름 — 이것과 맞을수록 위로 온다 */
  title: string;
  /** 위치. "API › axios › HttpClientOptions" */
  trail: string[];
  /** 누르면 갈 곳. 앵커까지 */
  to: string;
  kind: SearchKind;
  /** 결과 옆에 붙는 한 줄 */
  summary?: string;
  /** 소문자로 합쳐 둔 찾을 거리 */
  haystack: string;
}

export const entry = (title: string, trail: string[], to: string, kind: SearchKind, summary?: string): SearchEntry => ({
  title,
  trail,
  to,
  kind,
  summary,
  haystack: [title, ...trail, summary ?? ""].join(" ").toLowerCase()
});

/**
 * 한국어로 찾을 때 걸리지 않는 말만 보탠다. 대부분은 설명 문장에 이미 들어 있어서 거기서 걸린다.
 * 찾는 말에 왼쪽이 있으면 오른쪽 낱말도 함께 찾는다.
 */
const SYNONYMS: Record<string, string[]> = {
  토큰: ["token"],
  스타일: ["styling", "style"],
  다크: ["dark"],
  권한: ["permission"],
  메뉴: ["menu", "nav"],
  라우트: ["route"],
  라우팅: ["route", "routing"],
  주소: ["url", "query"],
  오류: ["error"],
  에러: ["error"],
  로그: ["log"],
  폼: ["form"],
  표: ["table", "grid"],
  날짜: ["date", "daypicker"],
  버튼: ["button"],
  알림: ["toast", "alert"],
  확인창: ["dialog", "confirm"],
  모달: ["modal"],
  탭: ["tabs"],
  업로드: ["upload"],
  설치: ["install"],
  모드: ["mode"],
  브레드크럼: ["breadcrumb"],
  경로: ["breadcrumb", "path", "route"],
  레이아웃: ["layout", "shell"],
  시작: ["start", "getting"],
  튜토리얼: ["tutorial"],
  컴포넌트: ["component"],
  검색: ["search"],
  디자인: ["design", "token", "theme"],
  클라이언트: ["client"],

  /**
   * **다른 라이브러리에서 쓰는 이름.** 같은 부품을 그쪽 이름으로 찾아도 걸리게 한다.
   * 켜고 끄는 부품은 `TxSwitch` 다 — ARIA(`role="switch"`) · MUI · Ant Design · Radix · Mantine 이 모두
   * Switch 라 부른다. Toggle 은 여러 곳에서 "눌린 채로 남는 버튼"(`aria-pressed`)을 뜻해 이름으로 쓰지 않았다.
   */
  toggle: ["switch"],
  txtoggle: ["txswitch"],
  토글: ["toggle", "switch"],
  스위치: ["switch"]
};

const KIND_BONUS: Record<SearchKind, number> = { page: 4, section: 2, api: 3, component: 3 };

/**
 * 순위. **이름이 맞는 것이 먼저**다 — `maskFields` 를 치면 그 옵션이, `Tokens` 를 치면 그 페이지가 맨 위.
 * 그다음은 낱말이 전부 들어 있는 것.
 */
export function search(keyword: string, limit: number, from: SearchEntry[]): SearchEntry[] {
  const query = keyword.trim().toLowerCase();
  if (!query) return [];

  const words = query.split(/\s+/);
  const alternatives = words.map((word) => [word, ...(SYNONYMS[word] ?? [])]);

  const scored = from.flatMap((item) => {
    const title = item.title.toLowerCase();
    if (!alternatives.every((options) => options.some((option) => item.haystack.includes(option)))) return [];

    const score = (title === query ? 100 : title.startsWith(query) ? 60 : title.includes(query) ? 40 : 10) + KIND_BONUS[item.kind];
    return [{ item, score }];
  });

  return scored
    .sort((a, b) => b.score - a.score || a.item.title.length - b.item.title.length)
    .slice(0, limit)
    .map(({ item }) => item);
}
