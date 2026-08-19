import { defineConfig } from "vitest/config";

/**
 * 회귀 테스트 설정.
 *
 * 패키지별로 필요한 환경이 다르다. `@txstack/hooks` 만 React 렌더가 필요하므로 jsdom 을 쓰고,
 * 나머지는 순수 로직이라 node 에서 돌린다. 환경을 한쪽으로 통일하면 network 가 React 비의존이라는
 * 사실이 테스트에서 드러나지 않는다.
 */
export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "node",
          environment: "node",
          include: ["packages/{ui,network,route-meta}/src/**/*.test.{ts,tsx}"]
        }
      },
      {
        test: {
          name: "dom",
          environment: "jsdom",
          include: ["packages/hooks/src/**/*.test.{ts,tsx}"]
        }
      }
    ]
  }
});
