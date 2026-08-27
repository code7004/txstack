import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { useStateForObject } from "./useStateForObject";
import { useUrlQuery, type UseUrlQueryOptions } from "./useUrlQuery";

describe("useStateForObject", () => {
  it("지정하지 않은 필드는 유지한 채 부분 병합한다", () => {
    const { result } = renderHook(() => useStateForObject({ keyword: "", page: 3 }));

    act(() => result.current[1]({ keyword: "kim" }));
    expect(result.current[0]).toEqual({ keyword: "kim", page: 3 });
  });

  it("함수형 업데이트를 받는다", () => {
    const { result } = renderHook(() => useStateForObject({ page: 1 }));

    act(() => result.current[1]((prev) => ({ page: prev.page + 1 })));
    expect(result.current[0]).toEqual({ page: 2 });
  });

  it("값이 그대로면 같은 참조를 돌려 리렌더를 막는다", () => {
    const { result } = renderHook(() => useStateForObject({ page: 1 }));
    const before = result.current[0];

    act(() => result.current[1]({ page: 1 }));
    expect(result.current[0]).toBe(before);
  });

  it("postParse 는 초기값에도 적용된다", () => {
    const { result } = renderHook(() => useStateForObject({ keyword: "kim", page: 5 }, (next) => (next.keyword ? { page: 1 } : {})));

    expect(result.current[0]).toEqual({ keyword: "kim", page: 1 });
  });

  it("postParse 는 병합 결과를 후보정한다", () => {
    const { result } = renderHook(() => useStateForObject({ keyword: "", page: 5 }, (next) => (next.keyword ? { page: 1 } : {})));

    act(() => result.current[1]({ keyword: "kim" }));
    expect(result.current[0]).toEqual({ keyword: "kim", page: 1 });
  });

  it("postParse 를 인라인으로 넘겨도 update 의 identity 가 고정이다", () => {
    const { result, rerender } = renderHook(() => useStateForObject({ page: 1 }, (next) => next));
    const first = result.current[1];

    rerender();
    expect(result.current[1]).toBe(first);
  });
});

function wrapper(initialEntry: string) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <MemoryRouter initialEntries={[initialEntry]}>{children}</MemoryRouter>;
  };
}

/** 훅의 반환값과 실제 주소를 함께 관찰한다. */
function useHarness<T extends object>(options: UseUrlQueryOptions<T>) {
  const [query, setQuery] = useUrlQuery(options);
  const { search } = useLocation();

  return { query, setQuery, search };
}

describe("useUrlQuery — URL 이 단일 출처", () => {
  it("URL 값을 defaults 의 타입으로 복원한다", () => {
    const { result } = renderHook(() => useHarness({ defaults: { a: 10, b: 20 } }), { wrapper: wrapper("/?a=1&b=2") });

    expect(result.current.query).toEqual({ a: 1, b: 2 });
  });

  it("URL 에 없는 키는 defaults 를 쓴다", () => {
    const { result } = renderHook(() => useHarness({ defaults: { a: 10, b: 20 } }), { wrapper: wrapper("/?a=1") });

    expect(result.current.query).toEqual({ a: 1, b: 20 });
  });

  it("마운트만으로 주소를 건드리지 않는다", () => {
    const { result } = renderHook(() => useHarness({ defaults: { a: 10, b: 20 } }), { wrapper: wrapper("/?a=1") });

    // defaults 가 주소에 써지지 않는다. 들어온 그대로다.
    expect(result.current.search).toBe("?a=1");
  });

  it("빈 주소로 들어와도 주소를 건드리지 않는다", () => {
    const { result } = renderHook(() => useHarness({ defaults: { a: 10, b: 20 } }), { wrapper: wrapper("/") });

    expect(result.current.search).toBe("");
    expect(result.current.query).toEqual({ a: 10, b: 20 });
  });

  it("setQuery 가 주소에 기재하고 상태를 함께 바꾼다", () => {
    const { result } = renderHook(() => useHarness({ defaults: { a: 10, b: 20 } }), { wrapper: wrapper("/") });

    act(() => result.current.setQuery({ a: 20 }));

    expect(result.current.search).toBe("?a=20&b=20");
    expect(result.current.query).toEqual({ a: 20, b: 20 });
  });

  it("같은 값으로 부르면 주소를 건드리지 않는다", () => {
    const { result } = renderHook(() => useHarness({ defaults: { a: 10, b: 20 } }), { wrapper: wrapper("/?a=1&b=2") });
    const before = result.current.query;

    act(() => result.current.setQuery({ a: 1 }));

    expect(result.current.search).toBe("?a=1&b=2");
    expect(result.current.query).toBe(before);
  });

  it("함수형 업데이트를 받는다", () => {
    const { result } = renderHook(() => useHarness({ defaults: { page: 1 } }), { wrapper: wrapper("/") });

    act(() => result.current.setQuery((prev) => ({ page: prev.page + 1 })));
    expect(result.current.query).toEqual({ page: 2 });
  });
});

describe("useUrlQuery — 무한 반복 방지", () => {
  it("defaults 를 인라인으로 넘겨도 query 의 identity 가 유지된다", () => {
    // 소비자가 거의 항상 이렇게 쓴다. 매 렌더 새 객체가 만들어지면 소비자 useEffect 가 무한히 돈다.
    const { result, rerender } = renderHook(() => useHarness({ defaults: { a: 10, b: 20 } }), { wrapper: wrapper("/?a=1") });
    const first = result.current.query;

    rerender();
    rerender();

    expect(result.current.query).toBe(first);
  });

  it("setQuery 의 identity 는 항상 고정이다", () => {
    const { result, rerender } = renderHook(() => useHarness({ defaults: { a: 10 } }), { wrapper: wrapper("/") });
    const first = result.current.setQuery;

    rerender();
    act(() => result.current.setQuery({ a: 2 }));

    expect(result.current.setQuery).toBe(first);
  });

  it("주소가 바뀌었을 때만 새 query 객체를 만든다", () => {
    const { result, rerender } = renderHook(() => useHarness({ defaults: { a: 10 } }), { wrapper: wrapper("/") });
    const first = result.current.query;

    act(() => result.current.setQuery({ a: 2 }));
    const afterWrite = result.current.query;
    expect(afterWrite).not.toBe(first);

    rerender();
    expect(result.current.query).toBe(afterWrite);
  });
});

describe("useUrlQuery — 파싱 규칙", () => {
  it("urlKeys 로 defaults 에 없는 키도 읽는다", () => {
    const { result } = renderHook(() => useHarness({ defaults: { a: 1 }, urlKeys: ["extra"] as never[] }), { wrapper: wrapper("/?a=2&extra=hello") });

    expect(result.current.query).toEqual({ a: 2, extra: "hello" });
  });

  it("queryTypes 로 복원 규칙을 직접 준다", () => {
    const { result } = renderHook(() => useHarness({ defaults: { code: "" }, queryTypes: { code: "string" as const } }), { wrapper: wrapper("/?code=007") });

    // 규칙이 없으면 숫자 7 이 된다.
    expect(result.current.query.code).toBe("007");
  });

  it("boolean 을 복원한다", () => {
    const { result } = renderHook(() => useHarness({ defaults: { active: false } }), { wrapper: wrapper("/?active=true") });

    expect(result.current.query.active).toBe(true);
  });

  it("배열은 key[] 로 읽고 쓴다", () => {
    const { result } = renderHook(() => useHarness({ defaults: { ids: [] as number[] } }), { wrapper: wrapper("/?ids[]=1&ids[]=2") });

    expect(result.current.query.ids).toEqual([1, 2]);

    act(() => result.current.setQuery({ ids: [3, 4] }));
    expect(result.current.search).toBe("?ids%5B%5D=3&ids%5B%5D=4");
  });

  it("postParse 가 병합 결과를 후보정한다", () => {
    const { result } = renderHook(() => useHarness({ defaults: { keyword: "", page: 1 }, postParse: (q) => (q.keyword ? { page: 1 } : {}) }), { wrapper: wrapper("/?keyword=kim&page=7") });

    expect(result.current.query).toEqual({ keyword: "kim", page: 1 });
  });

  it("undefined 값은 주소에 쓰지 않는다", () => {
    const { result } = renderHook(() => useHarness({ defaults: { a: 1, b: undefined as number | undefined } }), { wrapper: wrapper("/") });

    act(() => result.current.setQuery({ a: 2 }));
    expect(result.current.search).toBe("?a=2");
  });
});

describe("useUrlQuery — encode", () => {
  it("쿼리 전체를 한 키에 감췄다가 그대로 복원한다", () => {
    const { result } = renderHook(() => useHarness({ defaults: { userId: 0, secret: false }, encode: true }), { wrapper: wrapper("/") });

    act(() => result.current.setQuery({ userId: 42, secret: true }));

    expect(result.current.search).toMatch(/^\?_q=/);
    expect(result.current.search).not.toContain("userId");
    expect(result.current.query).toEqual({ userId: 42, secret: true });
  });

  it("encodeKey 로 키 이름을 바꾼다", () => {
    const { result } = renderHook(() => useHarness({ defaults: { a: 0 }, encode: true, encodeKey: "payload" }), { wrapper: wrapper("/") });

    act(() => result.current.setQuery({ a: 7 }));
    expect(result.current.search).toMatch(/^\?payload=/);
  });

  it("깨진 encoded 값이면 콘솔을 더럽히지 않고 defaults 로 넘어간다", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const { result } = renderHook(() => useHarness({ defaults: { a: 10 }, encode: true }), { wrapper: wrapper("/?_q=!!!not-base64!!!") });

    expect(result.current.query).toEqual({ a: 10 });
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();

    error.mockRestore();
    warn.mockRestore();
  });
});
