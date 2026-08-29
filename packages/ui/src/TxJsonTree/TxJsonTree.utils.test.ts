import { describe, expect, it } from "vitest";
import { diffPaths, emptyOf, getIn, getJsonType, isBranch, pathKey, removeIn, setIn } from "./TxJsonTree.utils";

describe("getJsonType — 값의 타입을 가른다", () => {
  it.each([
    ["문자열", "a", "string"],
    ["숫자", 1, "number"],
    ["0", 0, "number"],
    ["참거짓", false, "boolean"],
    ["null", null, "null"],
    ["객체", {}, "object"],
    ["배열", [], "array"]
  ] as const)("%s", (_name, value, expected) => {
    expect(getJsonType(value)).toBe(expected);
  });

  /** `typeof null` 이 `"object"` 라서 먼저 걸러야 한다. 원본도 이 순서를 지켰다. */
  it("null 을 객체로 보지 않는다", () => {
    expect(getJsonType(null)).toBe("null");
  });

  /** 소비자가 넘기는 것은 응답 객체지 검증된 JSON 이 아니다. */
  it("JSON 이 아닌 것이 와도 그리기를 포기하지 않는다", () => {
    expect(getJsonType(undefined)).toBe("string");
    expect(getJsonType(() => {})).toBe("string");
  });

  it("Date 는 객체다", () => {
    expect(getJsonType(new Date())).toBe("object");
  });
});

describe("isBranch — 안에 줄을 품는가", () => {
  it("객체와 배열만 참이다", () => {
    expect(isBranch({})).toBe(true);
    expect(isBranch([])).toBe(true);
    expect(isBranch(null)).toBe(false);
    expect(isBranch("a")).toBe(false);
    expect(isBranch(0)).toBe(false);
  });
});

describe("pathKey — 경로를 하나의 이름으로", () => {
  it("객체 키와 배열 인덱스를 구분한다", () => {
    expect(pathKey(["a", 0])).not.toBe(pathKey(["a", "0"]));
  });

  it("같은 경로는 같은 이름이다", () => {
    expect(pathKey(["a", "b"])).toBe(pathKey(["a", "b"]));
  });

  it("점이 든 키에도 흔들리지 않는다", () => {
    expect(pathKey(["a.b"])).not.toBe(pathKey(["a", "b"]));
  });
});

describe("emptyOf — 그 타입의 빈 값", () => {
  it.each([
    ["string", ""],
    ["number", 0],
    ["boolean", false],
    ["null", null]
  ] as const)("%s", (type, expected) => {
    expect(emptyOf(type)).toBe(expected);
  });

  it("객체와 배열은 새 것을 낸다", () => {
    expect(emptyOf("object")).toEqual({});
    expect(emptyOf("array")).toEqual([]);
    expect(emptyOf("object")).not.toBe(emptyOf("object"));
  });
});

describe("getIn — 경로가 가리키는 값", () => {
  const data = { a: { b: [10, 20] }, c: null };

  it("깊은 값을 읽는다", () => {
    expect(getIn(data, ["a", "b", 1])).toBe(20);
  });

  it("빈 경로는 뿌리다", () => {
    expect(getIn(data, [])).toBe(data);
  });

  it("없는 길에서 터지지 않는다", () => {
    expect(getIn(data, ["c", "d", "e"])).toBeUndefined();
    expect(getIn(data, ["없음"])).toBeUndefined();
  });
});

describe("setIn — 원본을 건드리지 않는다", () => {
  it("깊은 값을 바꾼다", () => {
    const data = { a: { b: { c: 1 } } };
    const next = setIn(data, ["a", "b", "c"], 2);

    expect(getIn(next, ["a", "b", "c"])).toBe(2);
  });

  it("원본은 그대로다", () => {
    const data = { a: { b: { c: 1 } } };
    setIn(data, ["a", "b", "c"], 2);

    expect(data.a.b.c).toBe(1);
  });

  /** 지나온 길만 복사한다. 손대지 않은 가지는 참조가 유지돼야 큰 객체에서도 싸다. */
  it("손대지 않은 가지는 그대로 물려준다", () => {
    const data = { touched: { v: 1 }, untouched: { v: 2 } };
    const next = setIn(data, ["touched", "v"], 9) as typeof data;

    expect(next.untouched).toBe(data.untouched);
    expect(next.touched).not.toBe(data.touched);
  });

  it("배열의 자리를 바꾼다", () => {
    const next = setIn({ list: [1, 2, 3] }, ["list", 1], 9);

    expect(getIn(next, ["list"])).toEqual([1, 9, 3]);
    expect(Array.isArray(getIn(next, ["list"]))).toBe(true);
  });

  it("없던 키를 만든다", () => {
    const next = setIn({ a: 1 }, ["b"], 2);
    expect(next).toEqual({ a: 1, b: 2 });
  });

  it("빈 경로는 통째로 바꾼다", () => {
    expect(setIn({ a: 1 }, [], "새것")).toBe("새것");
  });
});

describe("removeIn — 줄을 지운다", () => {
  it("객체의 키를 지운다", () => {
    expect(removeIn({ a: 1, b: 2 }, ["b"])).toEqual({ a: 1 });
  });

  /** 배열은 자리가 당겨져야 한다. 구멍을 남기면 그 뒤로 전부 어긋난다. */
  it("배열은 자리가 당겨진다", () => {
    expect(removeIn({ list: [1, 2, 3] }, ["list", 1])).toEqual({ list: [1, 3] });
  });

  it("깊은 줄도 지운다", () => {
    expect(removeIn({ a: { b: 1, c: 2 } }, ["a", "b"])).toEqual({ a: { c: 2 } });
  });

  it("원본은 그대로다", () => {
    const data = { a: 1, b: 2 };
    removeIn(data, ["b"]);

    expect(data).toEqual({ a: 1, b: 2 });
  });
});

describe("diffPaths — 무엇이 달라졌나", () => {
  it("같은 것이면 아무것도 없다", () => {
    const data = { a: 1 };
    expect(diffPaths(data, data)).toEqual([]);
  });

  it("값이 같으면 새 객체여도 조용하다", () => {
    expect(diffPaths({ a: 1, b: { c: 2 } }, { a: 1, b: { c: 2 } })).toEqual([]);
  });

  it("바뀐 자리만 짚는다", () => {
    expect(diffPaths({ a: 1, b: 2 }, { a: 1, b: 3 })).toEqual([["b"]]);
  });

  it("깊은 자리도 짚는다", () => {
    expect(diffPaths({ a: { b: { c: 1 } } }, { a: { b: { c: 2 } } })).toEqual([["a", "b", "c"]]);
  });

  it("새로 생긴 키를 짚는다", () => {
    expect(diffPaths({ a: 1 }, { a: 1, b: 2 })).toEqual([["b"]]);
  });

  /** 사라진 줄은 반짝일 자리가 이미 없다. */
  it("사라진 키는 담지 않는다", () => {
    expect(diffPaths({ a: 1, b: 2 }, { a: 1 })).toEqual([]);
  });

  it("배열에서 늘어난 자리를 짚는다", () => {
    expect(diffPaths({ l: [1] }, { l: [1, 2] })).toEqual([["l", 1]]);
  });

  it("배열의 바뀐 자리를 짚는다", () => {
    expect(diffPaths([1, 2, 3], [1, 9, 3])).toEqual([[1]]);
  });

  /** 타입이 바뀌었으면 그 줄이 통째로 바뀐 것이다. 안쪽까지 파고들 이유가 없다. */
  it("타입이 바뀌면 그 줄 하나만 짚는다", () => {
    expect(diffPaths({ a: 1 }, { a: { b: 2 } })).toEqual([["a"]]);
  });

  it("여러 자리가 함께 바뀌어도 전부 짚는다", () => {
    expect(diffPaths({ a: 1, b: { c: 1 } }, { a: 2, b: { c: 2 } })).toEqual([["a"], ["b", "c"]]);
  });

  /** falsy 로 바뀐 것도 바뀐 것이다. 0·false·""·null 을 빠뜨리면 디버깅에 못 쓴다. */
  it("falsy 로 바뀐 것을 빠뜨리지 않는다", () => {
    expect(diffPaths({ a: 1 }, { a: 0 })).toEqual([["a"]]);
    expect(diffPaths({ a: true }, { a: false })).toEqual([["a"]]);
    expect(diffPaths({ a: "x" }, { a: "" })).toEqual([["a"]]);
  });

  it("null 로 바뀐 것도 짚는다", () => {
    expect(diffPaths({ a: 1 }, { a: null })).toEqual([["a"]]);
  });

  it("뿌리 자체가 바뀌면 빈 경로다", () => {
    expect(diffPaths(1, 2)).toEqual([[]]);
  });
});
