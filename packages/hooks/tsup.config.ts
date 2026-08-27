import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/router.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  sourcemap: true,
  treeshake: true,
  splitting: true,
  external: ["react", "react-router-dom"]
});
