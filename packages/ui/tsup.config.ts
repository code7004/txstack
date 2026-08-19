import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/aggrid.ts", "src/daypicker.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  sourcemap: true,
  treeshake: true,
  // 세 엔트리가 공유하는 코드(tx-ui.utils, TxInput 등)를 공용 청크로 뽑는다.
  // 끄면 aggrid.js / daypicker.js 가 코어 코드를 각자 복제한다.
  splitting: true,
  external: ["react", "react-dom", "react-router-dom", "framer-motion", "ag-grid-community", "ag-grid-react", "react-day-picker", "dayjs"]
});
