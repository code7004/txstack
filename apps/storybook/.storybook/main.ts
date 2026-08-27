import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";
import type { StorybookConfig } from "@storybook/react-vite";

const pkg = (path: string) => fileURLToPath(new URL(`../../../packages/${path}`, import.meta.url));

/**
 * **스토리가 있는 컴포넌트는 전부 싣는다.**
 *
 * 한때 `READY` 목록으로 "확인 준비가 된 것만" 골라 실었는데, 작업 중에 다른 컴포넌트를
 * 못 보는 불편이 더 컸다. 무엇이 검증됐는지는 **진행 보드**(`docs/README.md`)가 말해준다 —
 * 카탈로그가 그 역할까지 겸할 필요는 없다.
 *
 * 스토리는 컴포넌트 옆(`packages/ui/src/<Name>/`)에 둔다. 카탈로그가 컴포넌트와 같이
 * 움직여야 수정할 때 함께 갱신된다. Storybook 앱은 도구만 담고 배포되지 않는다.
 */
const config: StorybookConfig = {
  stories: ["../../../packages/ui/src/**/*.stories.tsx"],
  // autodocs(타입에서 props 표 자동 생성)는 이 애드온이 있어야 동작한다. Storybook 10 에서 docs 는 별도 패키지다.
  addons: ["@storybook/addon-docs"],
  // 문서 페이지 이름도 URL 에 들어간다(`--docs`). 스토리 이름 규약과 같은 이유로 영어다 → docs/001_ui.md
  docs: { defaultName: "Docs" },
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
