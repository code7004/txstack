import { defineConfig } from "vitest/config";

/**
 * 회귀 테스트 설정.
 *
 * 패키지별로 필요한 환경이 다르다. React 렌더가 필요한 것만 jsdom 을 쓰고 나머지는 node 에서
 * 돌린다. 환경을 한쪽으로 통일하면 network 가 React 비의존이라는 사실이 테스트에서 드러나지 않는다.
 *
 * `ui` 는 한 패키지 안에 두 종류가 섞여 있어 **확장자로 가른다.**
 * - `*.test.ts`  → 순수 로직 (유틸·헬퍼). node 에서 돈다. DOM 없이도 동작한다는 게 증명된다
 * - `*.test.tsx` → 컴포넌트 렌더. jsdom 이 필요하다
 *
 * ui 전체를 jsdom 으로 옮기면 유틸이 DOM 에 기대는지 아닌지가 가려진다. 그래서 나눈다.
 */
export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "node",
          environment: "node",
          include: ["packages/{network,route-meta}/src/**/*.test.{ts,tsx}", "packages/ui/src/**/*.test.ts"]
        }
      },
      {
        test: {
          name: "dom",
          environment: "jsdom",
          include: ["packages/hooks/src/**/*.test.{ts,tsx}", "packages/ui/src/**/*.test.tsx"]
        }
      }
    ]
  }
});
