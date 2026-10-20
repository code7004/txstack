import { defineConfig } from "tsup";

export default defineConfig({
  // 그룹마다 진입점 하나. 배럴이 없으므로 경로가 곧 네임스페이스 이름이다 (`import * as num from "@txstack/fns/num"`).
  entry: ["src/num.ts", "src/rand.ts", "src/date.ts", "src/obj.ts", "src/arr.ts", "src/str.ts", "src/form.ts", "src/async.ts", "src/math.ts", "src/phone-kr.ts", "src/browser/cookie.ts", "src/browser/css.ts", "src/browser/file.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  sourcemap: true,
  treeshake: true,
  splitting: true
});
