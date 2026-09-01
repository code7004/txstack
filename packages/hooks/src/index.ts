/**
 * `@txstack/hooks` — `react` 만 있으면 되는 범용 훅.
 *
 * **라우터가 필요한 훅은 여기 두지 않는다.** `@txstack/hooks/router` 서브패스가 가져간다.
 * 루트 배럴을 react-router-dom 과 분리해야 다른 라우터(Next.js, TanStack Router)를 쓰는
 * 소비자도 이 패키지를 설치할 수 있다.
 *
 * 설계: docs/003_hooks/001_useStateForObject.md
 */
export { useStateForObject } from "./useStateForObject";
