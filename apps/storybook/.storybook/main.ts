import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";
import type { StorybookConfig } from "@storybook/react-vite";

const pkg = (path: string) => fileURLToPath(new URL(`../../../packages/${path}`, import.meta.url));

/**
 * **Storybook 은 사용자가 직접 만져보고 확인하는 자리다.** 자동 검증은 vitest 가 맡는다.
 * 그래서 여기 실리는 것은 "무엇이 존재하는가"가 아니라 **"무엇이 확인받을 준비가 됐는가"** 다.
 *
 * 아래 목록에 이름을 올리는 것이 곧 **"이제 사용자가 볼 차례"** 라는 신호다.
 * 올라오지 않은 컴포넌트의 스토리 파일은 저장소에 남아 있지만 싣지 않는다 —
 * 아직 감사(S1)를 안 거친 것을 카탈로그에 섞으면 무엇이 검증된 것인지 구분이 사라진다.
 *
 * 스토리는 컴포넌트 옆(`packages/ui/src/<Name>/`)에 둔다. 카탈로그가 컴포넌트와 같이
 * 움직여야 수정할 때 함께 갱신된다. Storybook 앱은 도구만 담고 배포되지 않는다.
 */
const READY = ["TxSpinner"];

const config: StorybookConfig = {
  stories: READY.map((name) => `../../../packages/ui/src/${name}/*.stories.tsx`),
  // autodocs(타입에서 props 표 자동 생성)는 이 애드온이 있어야 동작한다. Storybook 10 에서 docs 는 별도 패키지다.
  addons: ["@storybook/addon-docs"],
  docs: { defaultName: "문서" },
  framework: { name: "@storybook/react-vite", options: {} },
  viteFinal: async (viteConfig) => {
    viteConfig.plugins = [...(viteConfig.plugins ?? []), tailwindcss()];
    viteConfig.resolve = {
      ...viteConfig.resolve,
      alias: [
        // playground 와 같은 이유로 소스에 붙인다 — 컴포넌트 수정이 즉시 HMR 로 반영되게.
        { find: /^@txstack\/ui\/aggrid$/, replacement: pkg("ui/src/aggrid.ts") },
        { find: /^@txstack\/ui\/daypicker$/, replacement: pkg("ui/src/daypicker.ts") },
        { find: /^@txstack\/ui$/, replacement: pkg("ui/src/index.ts") }
      ]
    };
    return viteConfig;
  }
};

export default config;
