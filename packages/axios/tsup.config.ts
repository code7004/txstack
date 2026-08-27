import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/singleton.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  sourcemap: true,
  treeshake: true,
  // 두 엔트리가 공유하는 코드(client, types)를 공용 청크로 뽑는다.
  splitting: true,
  external: ["axios"]
});
