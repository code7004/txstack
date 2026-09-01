import { configDefaults, defineConfig } from "vitest/config";

/**
 * 회귀 테스트 설정.
 *
 * 패키지별로 필요한 환경이 다르다. React 렌더가 필요한 것만 jsdom 을 쓰고 나머지는 node 에서
 * 돌린다. 환경을 한쪽으로 통일하면 axios 패키지가 React 비의존이라는 사실이 테스트에서 드러나지 않는다.
 *
 * `ui` 와 `route-meta` 는 한 패키지 안에 두 종류가 섞여 있어 **확장자로 가른다.**
 * - `*.test.ts`  → 순수 로직 (유틸·헬퍼). node 에서 돈다. DOM 없이도 동작한다는 게 증명된다
 * - `*.test.tsx` → 컴포넌트 렌더. jsdom 이 필요하다
 *
 * 전체를 jsdom 으로 옮기면 유틸이 DOM 에 기대는지 아닌지가 가려진다. 그래서 나눈다.
 */
export default defineConfig({
  test: {
    // 아직 테스트가 없는 패키지가 있다. 첫 이식이 끝나면 이 줄을 뺀다.
    passWithNoTests: true,
    /**
     * macOS 는 확장속성을 못 싣는 볼륨(exFAT 등)에 `._파일명` 부산물을 만든다.
     * 소스 옆에 그대로 생기므로 `._TxForm.test.tsx` 가 테스트로 잡혀 파싱 에러가 났다.
     *
     * **projects 는 이 exclude 를 물려받지 않는다.** 여기에만 적어 두면 아무 일도 하지
     * 않아서, 실제로 `._TxDayPicker.test.tsx` 가 잡혀 깨졌다. 아래 둘에 각각 적는다.
     */
    exclude: [...configDefaults.exclude, "**/._*"],
    projects: [
      {
        test: {
          name: "node",
          environment: "node",
          exclude: [...configDefaults.exclude, "**/._*"],
          include: ["packages/axios/src/**/*.test.{ts,tsx}", "packages/{route-meta,ui}/src/**/*.test.ts"]
        }
      },
      {
        test: {
          name: "dom",
          environment: "jsdom",
          exclude: [...configDefaults.exclude, "**/._*"],
          include: ["packages/hooks/src/**/*.test.{ts,tsx}", "packages/{route-meta,ui}/src/**/*.test.tsx"]
        }
      }
    ]
  }
});
