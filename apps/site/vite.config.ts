import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite";
import { buildAiGuide } from "../../scripts/ai-guide.mjs";

const pkg = (path: string) => fileURLToPath(new URL(`../../packages/${path}`, import.meta.url));

/**
 * **AI 가이드를 사이트에 싣는다** — `/llms.txt` · `/llms-full.txt` 와 `/ai/…`(규칙 · 문서 한 장씩).
 * 원본은 `docs/` 이고 만드는 일은 `scripts/ai-guide.mjs` 가 한다. `@txstack/ui` 의 tarball 에 실리는 것과 같은 내용이다.
 *
 * 개발 서버는 요청마다 새로 만들어 문서를 고치면 바로 보이고, 빌드는 파일로 낸다. 파일을 `public/` 에 두지 않는 것은
 * 생성물을 저장소에 들이지 않기 위해서다.
 */
function aiGuide(): Plugin {
  const type = (path: string) => (path.endsWith(".md") ? "text/markdown; charset=utf-8" : "text/plain; charset=utf-8");
  let base = "/";

  return {
    name: "txstack-ai-guide",
    configResolved(config) {
      base = config.base;
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const path = decodeURIComponent((req.url ?? "").split("?")[0]);
        if (!path.startsWith(base)) return next();

        const body = buildAiGuide({ layout: "site" }).get(path.slice(base.length));
        if (body === undefined) return next();
        res.setHeader("Content-Type", type(path));
        res.end(body);
      });
    },
    generateBundle() {
      for (const [fileName, source] of buildAiGuide({ layout: "site" })) this.emitFile({ type: "asset", fileName, source });
    }
  };
}

/**
 * txstack 을 소개하는 사이트. **이 앱은 배포 패키지가 아니라 첫 소비자다** —
 * 다섯 패키지를 진짜로 써 보는 자리이므로, 소스에 별칭을 걸어 고친 것이 바로 반영되게 한다.
 *
 * 스토리북과 같은 방식이다(`apps/storybook/.storybook/main.ts`).
 */
export default defineConfig({
  // GitHub Pages 하위 경로에 올릴 수 있게 열어 둔다. 루트 도메인이면 "/" 로 준다
  base: process.env.SITE_BASE ?? "/",
  plugins: [react(), tailwindcss(), aiGuide()],
  server: { open: false },
  resolve: {
    /**
     * **React 사본이 둘이 되면 훅이 터진다.** 패키지를 소스로 잇는 순간 그 소스의 `react` 는
     * pnpm 이 패키지 쪽 `node_modules` 에서 찾아 준다 — 앱이 쓰는 것과 다른 사본이다.
     */
    dedupe: ["react", "react-dom", "react-router-dom", "ag-grid-community", "ag-grid-react", "react-day-picker", "@tanstack/react-query"],
    alias: [
      { find: /^@txstack\/ui\/aggrid$/, replacement: pkg("ui/src/aggrid.ts") },
      { find: /^@txstack\/ui\/daypicker$/, replacement: pkg("ui/src/daypicker.ts") },
      { find: /^@txstack\/ui$/, replacement: pkg("ui/src/index.ts") },
      { find: /^@txstack\/route-meta$/, replacement: pkg("route-meta/src/index.ts") },
      { find: /^@txstack\/hooks\/useUrlQuery$/, replacement: pkg("hooks/src/useUrlQuery.ts") },
      { find: /^@txstack\/hooks\/useObjectState$/, replacement: pkg("hooks/src/useObjectState.ts") },
      { find: /^@txstack\/axios$/, replacement: pkg("axios/src/index.ts") },
      // fns 는 루트와 그룹 진입점 — "@txstack/fns/browser/cookie" → src/browser/cookie.ts
      { find: /^@txstack\/fns$/, replacement: pkg("fns/src/index.ts") },
      { find: /^@txstack\/fns\/(.+)$/, replacement: pkg("fns/src/$1.ts") }
    ]
  }
});
