import { describe, expect, it } from "vitest";
import { orderByKey } from "./TxCoolTable/TxCoolTable.utils";
import { cm, themeMerge } from "./tx-ui.utils";

/**
 * 1차 검증에서 lodash 와 대조했던 두 함수의 회귀 테스트.
 *
 * 당시 검증은 일회성 스크립트로 수행해 저장소에 남지 않았고, 그래서 회귀를 잡을 수 없었다.
 * lodash 는 이 저장소의 의존이 아니므로, 대조로 확인된 **동작을 값으로 고정**한다.
 * 원본: 001 검증 문서 §2-3.
 */

describe("themeMerge", () => {
  const base = { wrapper: "p-2 text-sm", label: "font-bold", nested: { item: "gap-1" } };

  it("custom 이 없으면 base 를 그대로 돌려준다", () => {
    expect(themeMerge(base)).toBe(base);
  });

  it("merge: 문자열 className 을 cm 으로 합친다", () => {
    const r = themeMerge(base, { wrapper: "p-4" }, "merge");
    // tailwind-merge 가 같은 계열(p-*)의 앞 값을 지운다
    expect(r.wrapper).toBe("text-sm p-4");
    expect(r.label).toBe("font-bold");
  });

  it("override: 문자열을 합치지 않고 교체한다", () => {
    const r = themeMerge(base, { wrapper: "p-4" }, "override");
    expect(r.wrapper).toBe("p-4");
    expect(r.label).toBe("font-bold");
  });

  it("중첩 객체를 재귀적으로 병합한다", () => {
    const r = themeMerge(base, { nested: { item: "gap-2" } }, "override");
    expect(r.nested.item).toBe("gap-2");
  });

  it("policy 기본값은 merge 다", () => {
    expect(themeMerge(base, { wrapper: "p-4" })).toEqual(themeMerge(base, { wrapper: "p-4" }, "merge"));
  });

  it("base 를 변형하지 않는다", () => {
    themeMerge(base, { wrapper: "p-4" }, "override");
    expect(base.wrapper).toBe("p-2 text-sm");
  });
});

describe("orderByKey", () => {
  const rows = [{ v: 1250000 }, { v: undefined }, { v: 840000 }, { v: 3120000 }];

  it("asc — nil 은 뒤로 간다 (lodash orderBy 동치)", () => {
    expect(orderByKey(rows, "v", "asc").map((r) => r.v)).toEqual([840000, 1250000, 3120000, undefined]);
  });

  it("desc — nil 은 앞으로 간다", () => {
    expect(orderByKey(rows, "v", "desc").map((r) => r.v)).toEqual([undefined, 3120000, 1250000, 840000]);
  });

  it("원본 배열을 변형하지 않는다", () => {
    const before = rows.map((r) => r.v);
    orderByKey(rows, "v", "desc");
    expect(rows.map((r) => r.v)).toEqual(before);
  });

  it("null 도 nil 로 취급한다", () => {
    const withNull = [{ v: 2 }, { v: null }, { v: 1 }];
    expect(orderByKey(withNull, "v", "asc").map((r) => r.v)).toEqual([1, 2, null]);
  });
});

describe("cm", () => {
  it("Tailwind 충돌 클래스는 뒤의 것이 이긴다", () => {
    expect(cm("p-2", "p-4")).toBe("p-4");
  });

  it("falsy 값을 무시한다", () => {
    expect(cm("p-2", false, undefined, null, "text-sm")).toBe("p-2 text-sm");
  });
});
