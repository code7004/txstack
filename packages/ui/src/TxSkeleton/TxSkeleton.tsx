import { cm } from "../tx-ui.utils";
import type { TxSkeletonProps } from "./TxSkeleton.types";

/**
 * 내용이 올 자리를 미리 잡아 두는 회색 덩이. **분기와 모양까지 맡는다.**
 *
 * @example
 * ```tsx
 * // 자식에서 모양을 가져온다 — 값이 아직 없는 자리만 칠한다
 * <TxSkeleton loading={loading}>
 *   <p>{user?.name}</p>
 *   <p>{user?.email}</p>
 * </TxSkeleton>
 *
 * // 모양을 직접 준다 — 여러 줄로 감길 글이 올 자리
 * <TxSkeleton loading={loading} lines={3} />
 * ```
 *
 * **`lines` · `variant` · `width` · `height` 중 하나라도 주면 그 모양을 그리고,
 * 아무것도 안 주면 `children` 에서 가져온다.**
 *
 * `loading` 이 `false` 가 되면 `children` 을 그대로 낸다 — 껍데기를 남기지 않아서
 * 밖에서 삼항으로 가르던 것과 결과가 같다. 다만 **JSX 는 삼항과 달리 먼저 평가되므로**
 * 불러오는 동안에도 안전한 값이어야 한다 (`user?.name`).
 *
 * **`TxSpinner` · `TxLoading` 과 하는 말이 다르다.** 그쪽은 "기다려라" 이고 이쪽은
 * **"여기 이런 모양의 것이 올 것이다"** 이다.
 *
 * 겉모습은 CSS 변수로 바꾼다 — `.tx-skeleton { --tx-skeleton-duration: 0s }` 로 멈춘다.
 *
 * 명세: `docs/001_ui.md`
 */
export const TxSkeleton = ({ variant, lines, width, height, loading = true, className, style, children, ...props }: TxSkeletonProps) => {
  // 껍데기를 남기지 않는다. 남기면 소비자가 준 className·flex 자리가 한 겹 더 생겨 놀란다
  if (!loading) return children;

  const shaped = variant != null || lines != null || width != null || height != null;

  /**
   * **자식에서 모양을 가져온다.**
   *
   * 값이 아직 없는 자리는 빈 요소로 남으므로, CSS 가 `:empty` 인 것만 칠한다 —
   * 붙박이 글은 그대로 보이고 값이 올 자리만 회색이 된다. **자식을 훑거나 재지 않는다.**
   *
   * `display: contents` 라 자리를 차지하지 않는다. 다 불러오면 이 껍데기가 사라지는데,
   * 그때 배치가 달라지면 안 되기 때문이다.
   *
   * `inert` 는 **빈 버튼·입력에 초점이 들어가는 것**을 막는다. 이름도 내용도 없는 것에
   * Tab 이 멈추면 키보드로 쓰는 사람에게는 막다른 길이다. (그래서 이쪽은 `aria-busy` 를
   * 달지 않는다 — `inert` 가 이미 "여기는 없는 셈 치라" 이고, 둘을 겹치면 뒤가 묻힌다.)
   */
  if (!shaped && children != null) {
    return (
      <div {...props} data-tag="TxSkeleton" data-auto className={cm("tx-skeleton", className)} style={style} inert>
        {children}
      </div>
    );
  }

  const shape = variant ?? "text";
  // 줄 수는 글에만 뜻이 있다. 동그라미가 세 개로 늘어나면 놀란다
  const count = shape === "text" ? Math.max(1, lines ?? 1) : 1;

  return (
    <div
      {...props}
      data-tag="TxSkeleton"
      data-variant={shape}
      className={cm("tx-skeleton", className)}
      style={{ width, height, ...style }}
      // 지금 이 자리를 채우는 중이라고 알린다. 읽을 것이 없는 막대는 아래에서 감춘다
      aria-busy
    >
      {Array.from({ length: count }, (_, index) => (
        // 빈 상자를 여러 개 읽어 주는 것은 안내가 아니다
        <span key={index} className="tx-skeleton__bar" aria-hidden />
      ))}
    </div>
  );
};
