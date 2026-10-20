import { defineConfig } from "tsup";

export default defineConfig({
  // 루트(전부) + 그룹마다 진입점 하나. 함수 이름이 패키지 안에서 겹치지 않아 루트 하나로 충분하고, 그룹 진입점은 범위를 좁혀 쓰고 싶을 때다.
  entry: ["src/index.ts", "src/num.ts", "src/rand.ts", "src/date.ts", "src/obj.ts", "src/arr.ts", "src/str.ts", "src/form.ts", "src/async.ts", "src/math.ts", "src/phone-kr.ts", "src/browser/cookie.ts", "src/browser/css.ts", "src/browser/file.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  sourcemap: true,
  treeshake: true,
  splitting: true
});
