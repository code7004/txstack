/**
 * 보간 · 각도 · 2D 회전. 애니메이션이나 캔버스 · SVG 좌표 계산에 쓴다.
 *
 * ```ts
 * import * as math from "@txstack/fns/math";
 * math.rotate({ x: 10, y: 0 }, { x: 0, y: 0 }, 90); // ≈ { x: 0, y: 10 }
 * ```
 *
 * 각도는 모두 **도(degree)** 단위로 받는다. 범위 · 경계(`clamp` · `inRange`)는 lodash 를 쓴다.
 */

/** 2D 좌표 */
export interface Vector2 {
  x: number;
  y: number;
}

/**
 * 선형 보간 — `t` 가 0 이면 `start`, 1 이면 `end`. 0~1 밖도 그대로 늘려 계산한다.
 *
 * @example
 * lerp(0, 10, 0.5) // 5
 */
export function lerp(start: number, end: number, t: number): number {
  return (1 - t) * start + t * end;
}

/** 좌표의 선형 보간 */
export function lerpVector(start: Vector2, end: Vector2, t: number): Vector2 {
  return { x: lerp(start.x, end.x, t), y: lerp(start.y, end.y, t) };
}

/** 도 → 라디안 */
export function toRadians(degree: number): number {
  return (degree * Math.PI) / 180;
}

/** 라디안 → 도 */
export function toDegrees(radian: number): number {
  return (radian * 180) / Math.PI;
}

/**
 * `point` 를 `center` 를 축으로 `degree` 만큼 돌린 좌표. 양수는 x 축에서 y 축 쪽으로 돈다
 * (화면 좌표계는 y 가 아래로 커지므로 시계 방향).
 *
 * 부동소수 오차로 0 이어야 할 자리가 `6e-16` 처럼 나올 수 있다. 비교할 때는 근삿값으로 한다.
 */
export function rotate(point: Vector2, center: Vector2, degree: number): Vector2 {
  const rad = toRadians(degree);
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const dx = point.x - center.x;
  const dy = point.y - center.y;
  return { x: center.x + dx * cos - dy * sin, y: center.y + dx * sin + dy * cos };
}
