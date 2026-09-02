import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const pkg = (path: string) => fileURLToPath(new URL(`../../packages/${path}`, import.meta.url));

/**
 * txstack 을 소개하는 사이트. **이 앱은 배포 패키지가 아니라 첫 소비자다** —
 * 네 패키지를 진짜로 써 보는 자리이므로, 소스에 별칭을 걸어 고친 것이 바로 반영되게 한다.
 *
 * 스토리북과 같은 방식이다(`apps/storybook/.storybook/main.ts`).
 */
export default defineConfig({
  // GitHub Pages 하위 경로에 올릴 수 있게 열어 둔다. 루트 도메인이면 "/" 로 준다
  base: process.env.SITE_BASE ?? "/",
  plugins: [react(), tailwindcss()],
  server: { open: false },
  resolve: {
    /**
     * **React 사본이 둘이 되면 훅이 터진다.** 패키지를 소스로 잇는 순간 그 소스의 `react` 는
     * pnpm 이 패키지 쪽 `node_modules` 에서 찾아 준다 — 앱이 쓰는 것과 다른 사본이다.
     */
    dedupe: ["react", "react-dom", "react-router-dom"],
    alias: [
      { find: /^@txstack\/ui\/aggrid$/, replacement: pkg("ui/src/aggrid.ts") },
      { find: /^@txstack\/ui\/daypicker$/, replacement: pkg("ui/src/daypicker.ts") },
      { find: /^@txstack\/ui$/, replacement: pkg("ui/src/index.ts") },
      { find: /^@txstack\/route-meta$/, replacement: pkg("route-meta/src/index.ts") },
      { find: /^@txstack\/hooks\/router$/, replacement: pkg("hooks/src/router.ts") },
      { find: /^@txstack\/hooks$/, replacement: pkg("hooks/src/index.ts") },
      { find: /^@txstack\/axios$/, replacement: pkg("axios/src/index.ts") }
    ]
  }
});
