import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const pkg = (path: string) => fileURLToPath(new URL(`../../packages/${path}`, import.meta.url));

/**
 * 런타임만 패키지 소스로 alias 한다.
 *
 * 이유: alias 가 없으면 playground 가 `dist` 를 소비하므로, 라이브러리를 한 줄 고칠 때마다
 * `pnpm build` + dev 서버 재시작이 필요하다 (tsup 이 청크 해시를 바꿔 Vite 모듈 그래프가 깨진다).
 * 소스로 붙이면 컴포넌트 수정이 즉시 HMR 로 반영된다.
 *
 * 그래도 배포 계약(exports 맵)은 계속 검증된다 — `tsc` 는 이 alias 를 쓰지 않고
 * package.json 의 `exports` → `dist/*.d.ts` 로 해석하기 때문에, 서브패스나 타입이 깨지면
 * `pnpm typecheck` 에서 잡힌다. 번들 산출물의 optional peer 격리는 `pnpm build` 후 dist 를 직접 검사한다.
 */
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      { find: /^@txstack\/ui\/aggrid$/, replacement: pkg("ui/src/aggrid.ts") },
      { find: /^@txstack\/ui\/daypicker$/, replacement: pkg("ui/src/daypicker.ts") },
      { find: /^@txstack\/ui$/, replacement: pkg("ui/src/index.ts") },
      { find: /^@txstack\/hooks\/router$/, replacement: pkg("hooks/src/router.ts") },
      { find: /^@txstack\/hooks$/, replacement: pkg("hooks/src/index.ts") },
      { find: /^@txstack\/route-meta$/, replacement: pkg("route-meta/src/index.ts") },
      { find: /^@txstack\/network$/, replacement: pkg("network/src/index.ts") }
    ]
  },
  server: {
    port: 5310,
    host: "localhost"
  }
});
