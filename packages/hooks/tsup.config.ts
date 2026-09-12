import { defineConfig } from "tsup";

export default defineConfig({
  // 훅마다 진입점 하나. 배럴이 없으므로 경로가 곧 훅 이름이다.
  entry: ["src/useObjectState.ts", "src/useUrlQuery.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  sourcemap: true,
  treeshake: true,
  splitting: true,
  external: ["react", "react-router-dom"]
});
