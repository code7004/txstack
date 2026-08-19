/**
 * @txstack/hooks — React 만 있으면 되는 범용 훅.
 *
 * 라우터가 필요한 훅(`useUrlQuery`)은 `@txstack/hooks/router` 서브패스에 있다.
 * 루트 배럴을 react-router-dom 과 분리해, 다른 라우터(Next.js, TanStack Router)를 쓰는
 * 소비자도 이 패키지를 설치할 수 있게 한다.
 */
export * from "./useObjectChanged";
export * from "./useSafePolling";
export * from "./useStateForObject";
