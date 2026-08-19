import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";
import type { StorybookConfig } from "@storybook/react-vite";

const pkg = (path: string) => fileURLToPath(new URL(`../../../packages/${path}`, import.meta.url));

/**
 * 스토리는 컴포넌트 옆(`packages/ui/src/**`)에 둔다. 카탈로그가 컴포넌트와 같이 움직여야
 * 수정할 때 함께 갱신된다. Storybook 앱은 도구만 담고 배포되지 않는다.
 */
const config: StorybookConfig = {
  stories: ["../../../packages/ui/src/**/*.stories.tsx"],
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
