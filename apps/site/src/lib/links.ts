/**
 * 라우터 밖으로 나가는 주소.
 *
 * Storybook 은 이 앱의 라우트가 아니라 **같은 도메인에 함께 올린 별개의 정적 사이트**다.
 * 그래서 `<Link>` 가 아니라 `<a>` 로 가고, `basename` 이 붙지 않으므로 `BASE_URL` 을 직접 앞에 붙인다.
 * 하위 경로(`/txstack/`)에 배포하면 `/storybook/` 은 저장소 밖을 가리킨다.
 *
 * 로컬(`pnpm site:dev`)에서는 Storybook 이 따로 떠 있으므로 그쪽 포트로 보낸다.
 */
export const STORYBOOK_URL = import.meta.env.DEV ? "http://localhost:6310/" : `${import.meta.env.BASE_URL}storybook/`;
