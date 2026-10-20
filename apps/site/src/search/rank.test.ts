import { describe, expect, it } from "vitest";
import { entry, search } from "./rank";

/**
 * 순위의 약속. **이름이 맞는 것이 먼저**이고, 낱말은 전부 들어 있어야 걸린다.
 * 한국어로 찾을 때는 동의어 표가 영어 낱말을 보탠다.
 */
const INDEX = [
  entry("Tokens", ["Documents", "Guide"], "/docs/guide/tokens", "page", "색, 모서리, 간격 같은 디자인 값을 CSS 변수로 바꿉니다"),
  entry("timeout", ["API", "axios", "HttpClientOptions"], "/api/axios#createhttpclient", "api", "응답을 기다리는 최대 시간(ms)"),
  entry("maskFields", ["API", "axios", "HttpClientOptions"], "/api/axios#createhttpclient", "api", "로그에서 값을 가릴 필드 이름"),
  entry("data", ["API", "axios", "RequestLog"], "/api/axios#types", "api", "본문. maskFields가 가려진 값입니다"),
  entry("Dark mode", ["Documents", "Guide"], "/docs/guide/dark-mode", "page", "클래스 하나로 모든 컴포넌트가 다크 모드로 바뀝니다"),
  entry("5. Filter the menu by permission", ["Documents", "Guide", "Routing & Menu"], "/docs/guide/routing#5-filter-the-menu-by-permission", "section"),
  entry("permissions", ["API", "route-meta", "RouteMeta"], "/api/route-meta#routetree", "api", "접근 권한"),
  entry("TxSwitch", ["API", "ui", "Form"], "/api/ui#component-txswitch", "component", "바로 켜고 끄는 스위치(토글)")
];

const titles = (keyword: string) => search(keyword, 10, INDEX).map((item) => item.title);

describe("사이트 검색 — 순위", () => {
  it("이름이 똑같은 것이 맨 위다 — 설명에만 나오는 것보다 먼저", () => {
    expect(titles("maskFields")).toEqual(["maskFields", "data"]);
  });

  it("대소문자를 가리지 않는다", () => {
    expect(titles("TOKENS")[0]).toBe("Tokens");
  });

  it("이름의 앞부분이 맞으면 중간이 맞는 것보다 먼저다", () => {
    const index = [entry("useUrlQuery", [], "/a", "api"), entry("@txstack/hooks/useUrlQuery", [], "/b", "api")];
    expect(search("useurl", 10, index).map((item) => item.title)).toEqual(["useUrlQuery", "@txstack/hooks/useUrlQuery"]);
  });

  it("낱말이 여럿이면 전부 들어 있어야 걸린다", () => {
    expect(titles("filter permission")).toEqual(["5. Filter the menu by permission"]);
    expect(titles("filter timeout")).toEqual([]);
  });

  it("한국어로 찾으면 동의어가 영어 낱말을 보탠다", () => {
    expect(titles("다크 모드")).toContain("Dark mode");
    expect(titles("권한")).toEqual(expect.arrayContaining(["permissions", "5. Filter the menu by permission"]));
  });

  /** 켜고 끄는 부품의 이름은 Switch 다. 다른 라이브러리의 Toggle 로 찾아도 닿아야 한다 */
  it("다른 이름으로 찾아도 걸린다 — TxToggle · toggle · 토글 → TxSwitch", () => {
    expect(titles("TxToggle")).toEqual(["TxSwitch"]);
    expect(titles("toggle")).toContain("TxSwitch");
    expect(titles("토글")).toContain("TxSwitch");
    expect(titles("스위치")).toContain("TxSwitch");
  });

  it("빈 검색어는 아무것도 주지 않는다", () => {
    expect(search("   ", 10, INDEX)).toEqual([]);
  });

  it("개수를 넘기지 않는다", () => {
    expect(search("a", 2, INDEX)).toHaveLength(2);
  });
});
