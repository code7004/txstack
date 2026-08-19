import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useObjectChanged } from "./useObjectChanged";
import { useSafePolling } from "./useSafePolling";
import { useStateForObject } from "./useStateForObject";
import { useUrlQuery } from "./useUrlQuery";

describe("useStateForObject", () => {
  it("patch 한 키만 바꾸고 나머지는 유지한다", () => {
    const { result } = renderHook(() => useStateForObject({ keyword: "", page: 1 }));

    act(() => result.current[1]({ page: 2 }));
    expect(result.current[0]).toEqual({ keyword: "", page: 2 });
  });

  it("함수형 patch 는 이전 상태를 받는다", () => {
    const { result } = renderHook(() => useStateForObject({ page: 1 }));

    act(() => result.current[1]((prev) => ({ page: prev.page + 10 })));
    expect(result.current[0].page).toBe(11);
  });

  it("결과가 같으면 상태 참조를 유지한다 (불필요한 리렌더 방지)", () => {
    const { result } = renderHook(() => useStateForObject({ page: 1 }));
    const first = result.current[0];

    act(() => result.current[1]({ page: 1 }));
    expect(result.current[0]).toBe(first);
  });

  it("postParse 가 초기값과 갱신값 모두에 적용된다", () => {
    const { result } = renderHook(() => useStateForObject({ page: 0 }, (next) => ({ page: Math.max(1, next.page) })));
    expect(result.current[0].page).toBe(1);

    act(() => result.current[1]({ page: -5 }));
    expect(result.current[0].page).toBe(1);
  });
});

describe("useObjectChanged", () => {
  it("마운트 시에는 콜백을 부르지 않는다", () => {
    const spy = vi.fn();
    renderHook(() => useObjectChanged({ a: 1 }, spy));
    expect(spy).not.toHaveBeenCalled();
  });

  it("바뀐 키만 diff 로 넘긴다", () => {
    const spy = vi.fn();
    const { rerender } = renderHook(({ value }) => useObjectChanged(value, spy), {
      initialProps: { value: { a: 1, b: 2 } as Record<string, unknown> }
    });

    rerender({ value: { a: 1, b: 3 } });
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith({ b: 3 });
  });

  it("값이 같으면 참조가 달라도 콜백을 부르지 않는다", () => {
    const spy = vi.fn();
    const { rerender } = renderHook(({ value }) => useObjectChanged(value, spy), {
      initialProps: { value: { a: 1 } as Record<string, unknown> }
    });

    rerender({ value: { a: 1 } });
    expect(spy).not.toHaveBeenCalled();
  });
});

describe("useSafePolling", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("start 전에는 돌지 않는다", () => {
    const job = vi.fn(async () => {});
    renderHook(() => useSafePolling(job, 1000));

    vi.advanceTimersByTime(5000);
    expect(job).not.toHaveBeenCalled();
  });

  /**
   * tick 을 1000ms 씩 나눠 감는 이유 — `advanceTimersByTime(3000)` 으로 한 번에 감으면 세 번의 tick 이
   * **동기적으로** 몰아서 발생한다. 그 사이에 마이크로태스크가 flush 되지 않으므로 첫 실행의
   * `running` 플래그가 아직 내려가지 않고, 2·3번째 tick 이 스킵 가드에 걸려 1회만 실행된다.
   * 즉 아래 루프는 "인터벌보다 빠르게 끝나는 작업" 을 재현하기 위한 것이다.
   */
  it("start 후 interval 마다 실행한다", async () => {
    const job = vi.fn(async () => {});
    const { result } = renderHook(() => useSafePolling(job, 1000));

    act(() => result.current.start());
    for (let i = 0; i < 3; i++) {
      await act(async () => void vi.advanceTimersByTime(1000));
    }
    expect(job).toHaveBeenCalledTimes(3);
  });

  it("이전 실행이 끝나지 않았으면 다음 tick 을 건너뛴다", async () => {
    let resolveJob: (() => void) | undefined;
    const job = vi.fn(() => new Promise<void>((resolve) => (resolveJob = resolve)));
    const { result } = renderHook(() => useSafePolling(job, 1000));

    act(() => result.current.start());
    await act(async () => void vi.advanceTimersByTime(3000));

    // 첫 실행이 아직 pending 이므로 2·3번째 tick 은 건너뛴다
    expect(job).toHaveBeenCalledTimes(1);

    await act(async () => resolveJob?.());
    await act(async () => void vi.advanceTimersByTime(1000));
    expect(job).toHaveBeenCalledTimes(2);
  });

  it("stop 하면 멈춘다", async () => {
    const job = vi.fn(async () => {});
    const { result } = renderHook(() => useSafePolling(job, 1000));

    act(() => result.current.start());
    await act(async () => void vi.advanceTimersByTime(1000));
    act(() => result.current.stop());
    await act(async () => void vi.advanceTimersByTime(5000));

    expect(job).toHaveBeenCalledTimes(1);
  });

  it("언마운트되면 인터벌을 정리한다", async () => {
    const job = vi.fn(async () => {});
    const { result, unmount } = renderHook(() => useSafePolling(job, 1000));

    act(() => result.current.start());
    unmount();
    await act(async () => void vi.advanceTimersByTime(5000));

    expect(job).not.toHaveBeenCalled();
  });
});

describe("useUrlQuery", () => {
  const wrapperFor = (entry: string) =>
    function Wrapper({ children }: { children: ReactNode }) {
      return <MemoryRouter initialEntries={[entry]}>{children}</MemoryRouter>;
    };

  it("URL 값을 queryTypes 대로 형변환한다", () => {
    const { result } = renderHook(
      () =>
        useUrlQuery({
          defaults: { keyword: "", page: 1, onlyActive: false },
          queryTypes: { page: "number", onlyActive: "boolean" }
        }),
      { wrapper: wrapperFor("/?keyword=abc&page=3&onlyActive=true") }
    );

    expect(result.current[0]).toEqual({ keyword: "abc", page: 3, onlyActive: true });
  });

  it("URL 에 없는 키는 defaults 로 채운다", () => {
    const { result } = renderHook(() => useUrlQuery({ defaults: { keyword: "", page: 1 }, queryTypes: { page: "number" } }), {
      wrapper: wrapperFor("/?page=7")
    });

    expect(result.current[0]).toEqual({ keyword: "", page: 7 });
  });

  it("setter 가 상태와 주소를 함께 갱신한다", () => {
    const { result } = renderHook(
      () => ({
        query: useUrlQuery({ defaults: { keyword: "", page: 1 }, queryTypes: { page: "number" } }),
        location: useLocation()
      }),
      { wrapper: wrapperFor("/?page=1") }
    );

    act(() => result.current.query[1]({ keyword: "kim", page: 2 }));

    expect(result.current.query[0]).toEqual({ keyword: "kim", page: 2 });
    expect(result.current.location.search).toContain("keyword=kim");
    expect(result.current.location.search).toContain("page=2");
  });

  it("postParse 로 파생값을 보정할 수 있다", () => {
    const { result } = renderHook(
      () =>
        useUrlQuery({
          defaults: { page: 1, offset: 0 },
          queryTypes: { page: "number", offset: "number" },
          postParse: (query) => ({ offset: ((query.page ?? 1) - 1) * 10 })
        }),
      { wrapper: wrapperFor("/?page=4") }
    );

    expect(result.current[0]).toEqual({ page: 4, offset: 30 });
  });

  /**
   * I1 회귀 방지 — **컴파일 타임 테스트**다.
   *
   * `queryTypes` 가 제네릭 T 의 추론 후보로 되돌아가면 T 가 `{ page: unknown; onlyActive: unknown }` 으로
   * 무너져 아래 `query.keyword` 가 `tsc` 에서 깨진다. 즉 이 테스트는 `pnpm typecheck` 가 지킨다.
   * 런타임 단언은 곁들여진 것이고, 본체는 타입 인자를 **생략했다는 사실** 자체다.
   */
  it("타입 인자를 생략해도 defaults 로부터 T 가 추론된다", () => {
    const { result } = renderHook(
      () =>
        useUrlQuery({
          defaults: { keyword: "", page: 1, onlyActive: false },
          queryTypes: { page: "number", onlyActive: "boolean" }
        }),
      { wrapper: wrapperFor("/?keyword=abc") }
    );

    const [query] = result.current;
    const keyword: string = query.keyword;
    const page: number = query.page;
    const onlyActive: boolean = query.onlyActive;

    expect([keyword, page, onlyActive]).toEqual(["abc", 1, false]);
  });
});
