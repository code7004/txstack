/**
 * 비동기 흐름.
 *
 * ```ts
 * import { sleep, withLoading } from "@txstack/fns/async";
 * ```
 */

/** `ms` 밀리초 뒤에 풀리는 Promise. 기본 1초 */
export function sleep(ms: number = 1000): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface WithLoadingOptions {
  /** 시작할 때 `true`, 끝나면(성공이든 실패든) `false` */
  onLoading?: (loading: boolean) => void;
  /**
   * 실패했을 때. **주면 오류를 여기서 끝내고** 감싼 함수는 `undefined` 로 끝난다.
   * 주지 않으면 오류를 그대로 다시 던진다 — 알림을 띄울지는 패키지가 정하지 않는다.
   */
  onError?: (error: unknown) => void;
}

/**
 * 비동기 함수를 감싸 로딩 상태와 오류 처리를 붙인다. 화면의 "저장" 버튼 같은 자리에 쓴다.
 *
 * @example
 * const save = withLoading(api.save, {
 *   onLoading: setSaving,
 *   onError: (error) => toast.error(String(error))
 * });
 * await save(form);
 */
export function withLoading<A extends unknown[], R>(fn: (...args: A) => Promise<R>, options: WithLoadingOptions = {}): (...args: A) => Promise<R | undefined> {
  const { onLoading, onError } = options;

  return async (...args: A) => {
    onLoading?.(true);
    try {
      return await fn(...args);
    } catch (error) {
      if (!onError) throw error;
      onError(error);
      return undefined;
    } finally {
      onLoading?.(false);
    }
  };
}
